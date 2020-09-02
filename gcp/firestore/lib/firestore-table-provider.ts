import { DocumentDatabaseTable, DocumentDatabaseTableProvider } from "@mcma/data";
import { Firestore } from "@google-cloud/firestore";
import { FirestoreTable } from "./firestore-table";
import { FirestoreTableProviderOptions } from "./firestore-table-provider-options";

export class FirestoreTableProvider implements DocumentDatabaseTableProvider {
    constructor(private firestore = new Firestore(), private options: FirestoreTableProviderOptions) { }

    get(tableName: string): Promise<DocumentDatabaseTable> {
        return Promise.resolve(new FirestoreTable(this.firestore.collection(tableName), this.options.customQueries));
    }
}