import { Query } from "./query/query.js";
import { CustomQuery, CustomQueryParameters } from "./query/custom-query.js";
import { Document } from "./document.js";
import { DocumentDatabaseMutex } from "./document-database-mutex.js";
import { QueryResults } from "./query/query-results.js";
import { Logger } from "@mcma/core";

export interface MutexProperties {
    name: string
    holder: string
    lockTimeout?: number
    logger?: Logger
}

export interface DocumentDatabaseTable {
    query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<QueryResults<TDocument>>;

    customQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters>(
        query: CustomQuery<TDocument, TParameters>
    ): Promise<QueryResults<TDocument>>;

    get<TDocument extends Document = Document>(id: string): Promise<TDocument>;

    put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument>;

    delete(id: string): Promise<void>;

    createMutex(mutexProperties: MutexProperties): DocumentDatabaseMutex;
}
