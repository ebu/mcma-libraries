import { CustomQuery } from "@mcma/data";
import { QueryInput } from "@aws-sdk/client-dynamodb";

type AttributeValueRetriever = (partitionKey: any, sortKey: any, resource: any) => any;

export type CustomQueryFactory = (customQuery: CustomQuery) => QueryInput;
export type CustomQueryRegistry = { [key: string]: CustomQueryFactory };

export interface DynamoDbTableOptions {
    consistentGet?: boolean;
    consistentQuery?: boolean;
    topLevelAttributeMappings?: { [key: string]: AttributeValueRetriever };
    customQueryRegistry?: CustomQueryRegistry;
}
