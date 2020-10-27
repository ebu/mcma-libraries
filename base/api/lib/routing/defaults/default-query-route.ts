import { McmaResource } from "@mcma/core";
import { CustomQuery, DocumentDatabaseTableProvider, getFilterExpressionFromKeyValuePairs, getTableName, isCustomQuery, Query, QueryResults } from "@mcma/data";

import { McmaApiRequestContext } from "../../http";
import { McmaApiRoute } from "../route";

interface CustomQueryFactory<T> {
    isMatch(requestContext: McmaApiRequestContext): boolean;
    create(requestContext: McmaApiRequestContext): CustomQuery<T>;
}

export class DefaultQueryRoute<T extends McmaResource> extends McmaApiRoute {
    public onStarted: (requestContext: McmaApiRequestContext) => Promise<boolean>;
    public buildQuery: (requestContext: McmaApiRequestContext) => Query<T> | CustomQuery<T>;
    public onCompleted: (requestContext: McmaApiRequestContext, queryResults: QueryResults<T>) => Promise<void>;
    public handleRequest: (requestContext: McmaApiRequestContext) => Promise<void>;

    private customQueryFactories: CustomQueryFactory<T>[] = [];

    constructor(private dbTableProvider: DocumentDatabaseTableProvider, public readonly root: string) {
        super("GET", root, requestContext => this.handleRequest(requestContext));
        this.buildQuery = reqCtx => this.defaultBuildQuery(reqCtx);
        this.handleRequest = reqCtx => this.defaultHandleRequest(reqCtx);
    }

    addCustomQuery(factory: CustomQueryFactory<T>): this {
        this.customQueryFactories.push(factory);
        return this;
    }

    private defaultBuildQuery(requestContext: McmaApiRequestContext): Query<T> | CustomQuery<T> {
        const customQueryFactory = this.customQueryFactories.find(x => x.isMatch(requestContext));
        return customQueryFactory?.create(requestContext) ?? buildStandardQuery<T>(requestContext);
    }

    private async defaultHandleRequest(requestContext: McmaApiRequestContext): Promise<void> {
        if (this.onStarted) {
            const continueRequest = await this.onStarted(requestContext);
            if (continueRequest !== undefined && !continueRequest) {
                return;
            }
        }

        const table = await this.dbTableProvider.get(getTableName(requestContext.configVariables));

        const query = this.buildQuery(requestContext);

        const queryResults = isCustomQuery(query) ? await table.customQuery<T>(query) : await table.query<T>(query);
        if (this.onCompleted) {
            await this.onCompleted(requestContext, queryResults);
        }

        requestContext.setResponseBody(queryResults);
    }
}

export function buildStandardQuery<T>(requestContext: McmaApiRequestContext, defaultSortAscending: boolean = true): Query<T> {
    const path = requestContext.request.path;
    const queryParams = requestContext.request.queryStringParameters;

    let pageSize;
    if (queryParams.pageSize) {
        pageSize = parseInt(queryParams.pageSize);
        if (isNaN(pageSize)) {
            pageSize = undefined;
        }
        delete queryParams.pageSize;
    }

    let pageStartToken;
    if (queryParams.pageStartToken) {
        pageStartToken = queryParams.pageStartToken;
        delete queryParams.pageStartToken;
    }

    let sortBy;
    if (queryParams.sortBy) {
        sortBy = queryParams.sortBy;
        delete queryParams.sortBy;
    }

    let sortAscending = defaultSortAscending;
    if (queryParams.sortAscending) {
        sortAscending = queryParams.sortAscending.toLowerCase() === "true";
        delete queryParams.sortAscending;
    }

    const filterExpression = getFilterExpressionFromKeyValuePairs<T>(queryParams);

    return {
        path,
        filterExpression,
        pageStartToken,
        pageSize,
        sortBy,
        sortAscending
    };
}
