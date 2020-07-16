import { DocumentDatabaseTable, Query, Document } from "@mcma/data";
import { CollectionReference } from "@google-cloud/firestore";
import { buildFirestoreQuery } from "./build-firestore-query";

export class FirestoreTable implements DocumentDatabaseTable {
    constructor(private collectionRef: CollectionReference) { }

    async query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<TDocument[]> {
        let firestoreQuery = await buildFirestoreQuery<TDocument>(this.collectionRef, query);
        const results = await firestoreQuery.get();
        return results.docs.map(doc => doc.data().resource as TDocument);
    }

    async get<TDocument extends Document = Document>(id: string): Promise<TDocument> {
        const doc = await this.collectionRef.doc(id).get();
        return doc.data().resource as TDocument;
    }

    async put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument> {
        await this.collectionRef.doc().create({ path: id, resource });
        return resource;
    }

    async delete(id: string): Promise<void> {
        await this.collectionRef.doc(id).delete();
    }
}