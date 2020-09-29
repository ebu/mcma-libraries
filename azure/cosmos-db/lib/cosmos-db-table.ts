import { McmaException, Utils } from "@mcma/core";
import { CustomQuery, Document, DocumentDatabaseMutex, DocumentDatabaseTable, Query, QueryResults, CustomQueryParameters } from "@mcma/data";
import { Container, ContainerDefinition } from "@azure/cosmos";

import { buildQueryDefinition } from "./build-query-definition";
import { parsePartitionKeyAndGuid } from "./parse-partition-key-and-guid";
import { CustomQueryRegistry } from "./cosmos-db-table-provider-options";
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
            } else{
                copy[key] = value;
            }
        }
    }
    return copy;
}

export class CosmosDbTable implements DocumentDatabaseTable {

    private readonly partitionKeyName: string;

    constructor(private container: Container, containerDefinition: ContainerDefinition, private customQueryRegistry: CustomQueryRegistry) {
        if (containerDefinition.partitionKey.paths.length > 1) {
            throw new McmaException(`Container ${containerDefinition.id} defines a partition key with multiple paths. MCMA only supports partition keys with a single path.`);
        }
        
        this.partitionKeyName = containerDefinition.partitionKey.paths[0].substr(1);
    }

    async query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<QueryResults<TDocument>> {
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
    }

    async customQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters>(
        query: CustomQuery<TDocument, TParameters>
    ): Promise<QueryResults<TDocument>> {
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
    }
    
    async get<TDocument extends Document = Document>(id: string): Promise<TDocument> {
        const { partitionKey, guid } = parsePartitionKeyAndGuid(id);
        const resp = await this.container.item(guid, partitionKey).read();
        if (resp.statusCode === 404) {
            return null;
        }

        return deserialize(resp.resource.resource);
    }
    
    async put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument> {
        const { partitionKey, guid } = parsePartitionKeyAndGuid(id);
        const item = {
            id: guid,
            [this.partitionKeyName]: partitionKey,
            resource
        };

        const resp = await this.container.items.upsert(item);

        return deserialize(resp.resource.resource);
    }
    
    async delete(id: string): Promise<void> {
        const { partitionKey, guid } = parsePartitionKeyAndGuid(id);
        await this.container.item(guid, partitionKey).delete();
    }
    
    createMutex(mutexName: string, mutexHolder: string, lockTimeout = 60000): DocumentDatabaseMutex {
        return new CosmosDbMutex(this.container, this.partitionKeyName, mutexName, mutexHolder, lockTimeout);
    }
}
