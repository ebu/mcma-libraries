import { DynamoDB } from "aws-sdk";
import { McmaException, Logger, Utils } from "@mcma/core";

export class DynamoDbMutex {
    private readonly dc: DynamoDB.DocumentClient;
    private readonly random: number;
    private hasLock: boolean;
    private tableKey: { partitionKey: string, sortKey?: string };

    constructor(public mutexName: string, private mutexHolder: string, private tableName: string, private logger?: Logger, private lockTimeout: number = 60000) {
        this.dc = new DynamoDB.DocumentClient();
        this.random = Math.random() * 2147483648 << 0;
        this.hasLock = false;
    }

    private async initializeTableKey() {
        if (!this.tableKey) {
            const dynamoDB = new DynamoDB();

            const data = await dynamoDB.describeTable({
                TableName: this.tableName
            }).promise();

            const tableKey: any = {};

            for (const key of data.Table.KeySchema) {
                switch (key.KeyType) {
                    case "HASH":
                        tableKey.partitionKey = key.AttributeName;
                        break;
                    case "RANGE":
                        tableKey.sortKey = key.AttributeName;
                        break;
                }
            }

            this.tableKey = tableKey;
        }
    }

    private generateTableKey() {
        const Key = {};
        if (this.tableKey.sortKey) {
            Key[this.tableKey.partitionKey] = "Mutex";
            Key[this.tableKey.sortKey] = this.mutexName;
        } else {
            Key[this.tableKey.partitionKey] = "Mutex-" + this.mutexName;
        }
        return Key;
    }

    private generateTableItem() {
        const Item = {};
        if (this.tableKey.sortKey) {
            Item[this.tableKey.partitionKey] = "Mutex";
            Item[this.tableKey.sortKey] = this.mutexName;
        } else {
            Item[this.tableKey.partitionKey] = "Mutex-" + this.mutexName;
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
        const value = {
            TableName: this.tableName,
            Item: this.generateTableItem(),
            Expected: {
                resource_id: {
                    Exists: false
                }
            }
        };
        value.Expected[this.tableKey.partitionKey] = { Exists: false };

        await this.dc.put(value).promise();
    }

    private async deleteLockData(random) {
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

        await this.initializeTableKey();

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
        await this.initializeTableKey();

        await this.deleteLockData(this.random);
        this.hasLock = false;
        this.logger?.debug("Released lock for mutex '" + this.mutexName + "' by '" + this.mutexHolder + "'");
    }
}
