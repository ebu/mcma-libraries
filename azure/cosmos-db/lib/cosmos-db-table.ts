import { McmaException, Utils } from "@mcma/core";
import { CustomQuery, CustomQueryParameters, Document, DocumentDatabaseMutex, DocumentDatabaseTable, MutexProperties, Query, QueryResults } from "@mcma/data";
import { Container, ContainerDefinition } from "@azure/cosmos";

import { buildQueryDefinition } from "./build-query-definition";
import { parsePartitionKeyAndGuid } from "./parse-partition-key-and-guid";
import { CosmosDbTableRetryOptions, CustomQueryRegistry } from "./cosmos-db-table-provider-options";
import { CosmosDbMutex } from "./cosmos-db-mutex";

function deserialize(object: any) {
    let copy: any;
    if (object) {
        copy = Array.isArray(object) ? [] : {};
        for (const key of Object.keys(object)) {
            const value = object[key];
            if (Utils.isValidDateString(value)) {
                copy[key] = new Date(value);
            } else if (typeof value === "object") {
                copy[key] = deserialize(value);
            } else {
                copy[key] = value;
            }
        }
    }
    return copy;
}

export class CosmosDbTable implements DocumentDatabaseTable {

    private readonly partitionKeyName: string;

    constructor(private container: Container, containerDefinition: ContainerDefinition, private customQueryRegistry: CustomQueryRegistry, private readonly retry: CosmosDbTableRetryOptions) {
        if (containerDefinition.partitionKey.paths.length > 1) {
            throw new McmaException(`Container ${containerDefinition.id} defines a partition key with multiple paths. MCMA only supports partition keys with a single path.`);
        }

        this.partitionKeyName = containerDefinition.partitionKey.paths[0].substring(1);

        if (!this.retry) {
            this.retry = {};
        }
        if (!Number.isInteger(this.retry.maxAttempts) || this.retry.maxAttempts < 0) {
            this.retry.maxAttempts = 2;
        }
        if (!Number.isFinite(this.retry.intervalSeconds) || this.retry.intervalSeconds < 1) {
            this.retry.intervalSeconds = 5;
        }
        if (!Number.isFinite(this.retry.backoffRate) || this.retry.backoffRate < 1) {
            this.retry.backoffRate = 2;
        }
        if (this.retry.jitter !== false) {
            this.retry.jitter = true;
        }
    }

    async query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<QueryResults<TDocument>> {
        return await this.withRetry(async () => {
            const sqlQuery = buildQueryDefinition(query, this.partitionKeyName);

            const queryIterator = this.container.items.query(sqlQuery, {
                continuationToken: query.pageStartToken,
                maxItemCount: query.pageSize
            });

            const resp = await queryIterator.fetchAll();

            return {
                results: resp.resources.map(x => deserialize(x.resource)),
                nextPageStartToken: resp.continuationToken
            };
        });
    }

    async customQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters>(
        query: CustomQuery<TDocument, TParameters>
    ): Promise<QueryResults<TDocument>> {
        return await this.withRetry(async () => {
            const createCustomQuery = this.customQueryRegistry[query.name];
            if (!createCustomQuery) {
                throw new McmaException(`Custom query with name '${query.name}' has not been configured.`);
            }

            const sqlQuery = createCustomQuery(query);

            const queryIterator = this.container.items.query(sqlQuery, {
                continuationToken: query.pageStartToken
            });

            const resp = await queryIterator.fetchAll();

            return {
                results: resp.resources.map(x => deserialize(x.resource)),
                nextPageStartToken: resp.continuationToken
            };
        });
    }

    async get<TDocument extends Document = Document>(id: string): Promise<TDocument> {
        return await this.withRetry(async () => {
            const { partitionKey, guid } = parsePartitionKeyAndGuid(id);
            const resp = await this.container.item(guid, partitionKey).read();
            if (resp.statusCode === 404) {
                return null;
            }

            return deserialize(resp.resource.resource);
        });
    }

    async put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument> {
        return await this.withRetry(async () => {
            const { partitionKey, guid } = parsePartitionKeyAndGuid(id);
            const item = {
                id: guid,
                [this.partitionKeyName]: partitionKey,
                resource
            };

            const resp = await this.container.items.upsert(item);
            return deserialize(resp.resource.resource);
        });
    }

    async delete(id: string): Promise<void> {
        return await this.withRetry(async () => {
            const { partitionKey, guid } = parsePartitionKeyAndGuid(id);
            await this.container.item(guid, partitionKey).delete();
        });
    }

    createMutex(mutexProperties: MutexProperties): DocumentDatabaseMutex {
        return new CosmosDbMutex(this.container, this.partitionKeyName, mutexProperties.name, mutexProperties.holder, mutexProperties.lockTimeout, mutexProperties.logger);
    }

    private async withRetry<T>(func: () => Promise<T>): Promise<T> {
        let retries = 0;

        while (true) {
            try {
                return func();
            } catch (error) {
                retries++;

                if (error.code !== "TooManyRequests" || retries > this.retry.maxAttempts) {
                    throw error;
                }

                const multiplier = Math.pow(this.retry.backoffRate, retries - 1);
                let timeoutSecs = this.retry.intervalSeconds * multiplier;
                if (timeoutSecs > this.retry.maxDelaySeconds) {
                    timeoutSecs = this.retry.maxDelaySeconds;
                }

                if (this.retry.jitter) {
                    // random jitter between 50% and 100% of computed value
                    timeoutSecs = (timeoutSecs * 0.5) + (Math.random() * timeoutSecs * 0.5);
                }

                await Utils.sleep(Math.round(timeoutSecs * 1000));
            }
        }
    }
}
