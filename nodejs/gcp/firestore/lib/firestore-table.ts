import { CustomQuery, Document, DocumentDatabaseMutex, DocumentDatabaseTable, Query, QueryResults, CustomQueryParameters } from "@mcma/data";
import { CollectionReference } from "@google-cloud/firestore";
import { buildFirestoreQuery } from "./build-firestore-query";
import { FirestoreMutex } from "./firestore-mutex";
import { CustomQueryRegistry } from "./firestore-table-provider-options";
import { McmaException } from "@mcma/core";

export class FirestoreTable implements DocumentDatabaseTable {
    constructor(private collectionRef: CollectionReference, private customQueryRegistry: CustomQueryRegistry) { }

    async query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<QueryResults<TDocument>> {
        const firestoreQuery = await buildFirestoreQuery<TDocument>(this.collectionRef, query);
        
        const results = await firestoreQuery.get();
        return {
            results: results.docs.map(doc => doc.data().resource as TDocument),
            nextPageStartToken: results.docs[results.docs.length - 1].id
        };
    }

    async customQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters>(
        query: CustomQuery<TDocument, TParameters>
    ): Promise<QueryResults<TDocument>> {
        const createCustomQuery = this.customQueryRegistry[query.name];
        if (!createCustomQuery) {
            throw new McmaException(`Custom query with name '${query.name}' has not been configured.`);
        }

        const firestoreQuery = createCustomQuery(query);
        
        const results = await firestoreQuery.get();
        return {
            results: results.docs.map(doc => doc.data().resource as TDocument),
            nextPageStartToken: results.docs[results.docs.length - 1].id
        };
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

    createMutex(mutexName: string, mutexHolder: string, lockTimeout?: number): DocumentDatabaseMutex {
        return new FirestoreMutex(this.collectionRef, mutexName, mutexHolder, lockTimeout);
    }
}

