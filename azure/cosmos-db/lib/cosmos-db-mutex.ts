import { DocumentDatabaseMutex, LockData } from "@mcma/data";
import { ConsistencyLevel, Container } from "@azure/cosmos";
import { Logger } from "@mcma/core";

interface TableKey {
    id: string;
    [key: string]: any;
}

type TableItem = TableKey & LockData;

function replaceIllegalCharsInMutexName(mutexName: string): string {
    return mutexName.replace(/\//g, "_");
}

export class CosmosDbMutex extends DocumentDatabaseMutex {
    private etag: string;
    
    constructor(
        private container: Container,
        private partitionKeyName: string,
        mutexName: string,
        mutexHolder: string,
        lockTimeout: number = 300000,
        logger?: Logger
    ) {
        super(mutexName, mutexHolder, lockTimeout, logger);
    }
    
    protected get versionId(): string {
        return this.etag;
    }

    private generateTableKey(): TableKey {
        return this.partitionKeyName
            ? {
                id: replaceIllegalCharsInMutexName(this.mutexName),
                [this.partitionKeyName]: "Mutex"
            }
            : {
                id: replaceIllegalCharsInMutexName(`Mutex-${this.mutexName}`)
            };
    }

    private generateTableItem() {
        return Object.assign({}, this.generateTableKey(), {
            mutexHolder: this.mutexHolder,
            timestamp: Date.now()
        });
    }

    protected async getLockData(): Promise<LockData> {
        const item =
            this.partitionKeyName
                ? this.container.item(replaceIllegalCharsInMutexName(this.mutexName), "Mutex")
                : this.container.item(replaceIllegalCharsInMutexName(`Mutex-${this.mutexName}`));
                
        const itemResponse = await item.read<TableItem>({ consistencyLevel: ConsistencyLevel.Strong });

        if (!itemResponse.resource) {
            return undefined;
        }

        // sanity check which removes the record from CosmosDB in case it has incompatible structure. Only possible
        // if modified externally, but this could lead to a situation where the lock would never be acquired.
        if (!itemResponse.resource.mutexHolder || !itemResponse.resource.timestamp) {
            await item.delete();
            return undefined;
        }

        itemResponse.resource.versioId = itemResponse.etag;

        return itemResponse.resource;
    }

    protected async putLockData(): Promise<void> {
        const item = this.generateTableItem();
        
        const response = await this.container.items.upsert(item, {
            accessCondition: {
                type: "IfMatch",
                condition: null,
            }
        });
        
        this.etag = response.etag;
    }

    protected async deleteLockData(versionId: string): Promise<void> {
        const item =
            this.partitionKeyName
                ? this.container.item(replaceIllegalCharsInMutexName(this.mutexName), "Mutex")
                : this.container.item(replaceIllegalCharsInMutexName(`Mutex-${this.mutexName}`));

        await item.delete<TableItem>({
            accessCondition: {
                type: "IfMatch",
                condition: versionId,
            }
        });
    }
}
