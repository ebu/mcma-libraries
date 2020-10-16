import { DocumentDatabaseTable, DocumentDatabaseTableProvider } from "@mcma/data";
import { Firestore } from "@google-cloud/firestore";
import { FirestoreTable } from "./firestore-table";
import { FirestoreTableProviderOptions } from "./firestore-table-provider-options";

export class FirestoreTableProvider implements DocumentDatabaseTableProvider {
    private firestore: Firestore;

    constructor(private options: FirestoreTableProviderOptions = {}) {
        this.firestore = options.firestore ?? new Firestore(options.firestoreSettings);
    }

    get(tableName: string): Promise<DocumentDatabaseTable> {
        return Promise.resolve(new FirestoreTable(this.firestore.collection(tableName), this.options.customQueries));
    }
}