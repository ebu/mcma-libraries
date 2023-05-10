import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@mcma/core";
import { DynamoDbTableDescription } from "./dynamo-db-table-description";
import { DocumentDatabaseMutex, LockData } from "@mcma/data";

interface TableKey {
    [key: string]: any
}

type TableItem = TableKey & LockData;

export class DynamoDbMutex extends DocumentDatabaseMutex {
    private readonly _versionId: string;
    
    constructor(
        private dc: DynamoDBDocumentClient,
        private tableDescription: DynamoDbTableDescription,
        mutexName: string,
        mutexHolder: string,
        lockTimeout: number = 300000,
        logger?: Logger
    ) {
        super(mutexName, mutexHolder, lockTimeout, logger);

        this._versionId = (Math.random() * 2147483648 << 0).toString();
    }
    
    protected get versionId(): string {
        return this._versionId;
    }

    private generateTableKey(): TableKey {
        const Key: TableKey = {};
        if (this.tableDescription.keyNames.sort) {
            Key[this.tableDescription.keyNames.partition] = "Mutex";
            Key[this.tableDescription.keyNames.sort] = this.mutexName;
        } else {
            Key[this.tableDescription.keyNames.partition] = "Mutex-" + this.mutexName;
        }
        return Key;
    }

    private generateTableItem(): TableItem {
        const tableItem: TableItem = {
            mutexHolder: this.mutexHolder,
            versionId: this.versionId,
            timestamp: Date.now()
        };
        if (this.tableDescription.keyNames.sort) {
            tableItem[this.tableDescription.keyNames.partition] = "Mutex";
            tableItem[this.tableDescription.keyNames.sort] = this.mutexName;
        } else {
            tableItem[this.tableDescription.keyNames.partition] = "Mutex-" + this.mutexName;
        }
        return tableItem;
    }

    protected async getLockData(): Promise<LockData> {
        const record = await this.dc.send(new GetCommand({
            TableName: this.tableDescription.tableName,
            Key: this.generateTableKey(),
            ConsistentRead: true
        }));

        // sanity check which removes the record from DynamoDB in case it has incompatible structure. Only possible
        // if modified externally, but this could lead to a situation where the lock would never be acquired.
        if (record.Item && (!record.Item.mutexHolder || !record.Item.versionId || !record.Item.timestamp)) {
            await this.dc.send(new DeleteCommand({
                TableName: this.tableDescription.tableName,
                Key: this.generateTableKey(),
            }));
            delete record.Item;
        }

        return record.Item as TableItem;
    }

    protected async putLockData() {
        const value: PutCommandInput = {
            TableName: this.tableDescription.tableName,
            Item: this.generateTableItem(),
            Expected: {
                resource_id: {
                    Exists: false
                }
            }
        };
        value.Expected[this.tableDescription.keyNames.partition] = { Exists: false };

        await this.dc.send(new PutCommand(value));
    }

    protected async deleteLockData(versionId: string) {
        await this.dc.send(new DeleteCommand({
            TableName: this.tableDescription.tableName,
            Key: this.generateTableKey(),
            ConditionExpression: "#v = :v",
            ExpressionAttributeNames: { "#v": "versionId" },
            ExpressionAttributeValues: { ":v": versionId }
        }));
    }
}
