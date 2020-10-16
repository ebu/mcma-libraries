import { CustomQuery } from "@mcma/data";
import { Firestore, Settings, Query as FirestoreQuery } from "@google-cloud/firestore";

export type CustomQueryFactory = (query: CustomQuery) => { firestoreQuery: FirestoreQuery, sortBy: string };
export type CustomQueryRegistry = { [key: string]: CustomQueryFactory };

export interface FirestoreTableProviderOptions {
    firestore?: Firestore;
    firestoreSettings?: Settings;
    customQueries?: CustomQueryRegistry;
}