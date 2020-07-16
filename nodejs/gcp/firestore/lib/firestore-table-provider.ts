import { DocumentDatabaseTableProvider, DocumentDatabaseTable } from "@mcma/data";
import { Firestore } from "@google-cloud/firestore";
import { FirestoreTable } from "./firestore-table";

export class FirestoreTableProvider implements DocumentDatabaseTableProvider {
    constructor(private firestore = new Firestore()) { }

    get(tableName: string): Promise<DocumentDatabaseTable> {
        return Promise.resolve(new FirestoreTable(this.firestore.collection(tableName)));
    }
}