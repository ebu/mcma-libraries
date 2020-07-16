import { DynamoDB } from "aws-sdk";
import { Logger, McmaException, Utils } from "@mcma/core";
import { DynamoDbTableDescription, getTableDescription } from "./dynamo-db-table-description";

interface TableKey {
    [key: string]: any
}

interface TableItem extends TableKey {
    mutexHolder?: string
    random?: number
    timestamp?: number
}

export class DynamoDbMutex {
    private readonly dc: DynamoDB.DocumentClient;
    private readonly random: number;
    private hasLock: boolean;
    private tableDescription: DynamoDbTableDescription;

    constructor(
        public mutexName: string,
        private mutexHolder: string,
        private tableName: string,
        private logger?: Logger,
        private lockTimeout: number = 60000,
        private dynamoDb = new DynamoDB()
    ) {
        this.dc = new DynamoDB.DocumentClient({ service: dynamoDb });
        this.random = Math.random() * 2147483648 << 0;
        this.hasLock = false;
    }

    private async initializeTableDescription() {
        if (!this.tableDescription) {
            this.tableDescription = await getTableDescription(this.dynamoDb, this.tableName);
        }
    }

    private generateTableKey() {
        const Key: TableKey = {};
        if (this.tableDescription.sortKeyName) {
            Key[this.tableDescription.partitionKeyName] = "Mutex";
            Key[this.tableDescription.sortKeyName] = this.mutexName;
        } else {
            Key[this.tableDescription.partitionKeyName] = "Mutex-" + this.mutexName;
        }
        return Key;
    }

    private generateTableItem() {
        const Item: TableItem = {};
        if (this.tableDescription.sortKeyName) {
            Item[this.tableDescription.partitionKeyName] = "Mutex";
            Item[this.tableDescription.sortKeyName] = this.mutexName;
        } else {
            Item[this.tableDescription.partitionKeyName] = "Mutex-" + this.mutexName;
        }
        Item["mutexHolder"] = this.mutexHolder;
        Item["random"] = this.random;
        Item["timestamp"] = Date.now();
        return Item;
    }

    private async getLockData() {
        const record = await this.dc.get({
            TableName: this.tableName,
            Key: this.generateTableKey(),
            ConsistentRead: true
        }).promise();

        // sanity check which removes the record from DynamoDB in case it has incompatible structure. Only possible
        // if modified externally, but this could lead to a situation where the lock would never be acquired.
        if (record.Item && (!record.Item.mutexHolder || !record.Item.random || !record.Item.timestamp)) {
            await this.dc.delete({
                TableName: this.tableName,
                Key: this.generateTableKey(),
            }).promise();
            delete record.Item;
        }

        return record.Item;
    }

    private async putLockData() {
        const value: DynamoDB.DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: this.generateTableItem(),
            Expected: {
                resource_id: {
                    Exists: false
                }
            }
        };
        value.Expected[this.tableDescription.partitionKeyName] = { Exists: false };

        await this.dc.put(value).promise();
    }

    private async deleteLockData(random: number) {
        await this.dc.delete({
            TableName: this.tableName,
            Key: this.generateTableKey(),
            ConditionExpression: "#rnd = :v",
            ExpressionAttributeNames: { "#rnd": "random" },
            ExpressionAttributeValues: { ":v": random }
        }).promise();
    }

    async lock() {
        if (this.hasLock) {
            throw new McmaException("Cannot lock when already locked");
        }

        await this.initializeTableDescription();

        this.logger?.debug("Requesting lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
        while (!this.hasLock) {
            try {
                await this.putLockData();
                const lockData = await this.getLockData();
                this.hasLock = lockData?.mutexHolder === this.mutexHolder && lockData?.random === this.random;
            } catch (error) {
                const lockData = await this.getLockData();
                if (lockData) {
                    if (lockData.timestamp < Date.now() - this.lockTimeout) {
                        // removing lock in case it's held too long by other thread
                        this.logger?.warn("Deleting stale lock for mutex '" + this.mutexName + "' by '" + lockData.mutexHolder + "'");
                        try {
                            await this.deleteLockData(lockData.random);
                        } catch (error) {
                        }
                    }
                }
            }

            if (!this.hasLock) {
                await Utils.sleep(500);
            }
        }
        this.logger?.debug("Acquired lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
    }

    async unlock() {
        if (!this.hasLock) {
            throw new McmaException("Cannot unlock when not locked");
        }
        await this.initializeTableDescription();

        await this.deleteLockData(this.random);
        this.hasLock = false;
        this.logger?.debug("Released lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
    }
}
