import { CustomQuery } from "@mcma/data";
import { Query as FirestoreQuery } from "@google-cloud/firestore";

export type CustomQueryFactory = (query: CustomQuery) => FirestoreQuery;
export type CustomQueryRegistry = { [key: string]: CustomQueryFactory };

export interface FirestoreTableProviderOptions {
    customQueries: CustomQueryRegistry;
}