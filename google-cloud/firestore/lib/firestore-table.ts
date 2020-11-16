import { McmaException } from "@mcma/core";
import { CustomQuery, CustomQueryParameters, Document, DocumentDatabaseMutex, DocumentDatabaseTable, MutexProperties, Query, QueryResults } from "@mcma/data";
import { CollectionReference, DocumentReference, QuerySnapshot } from "@google-cloud/firestore";

import { buildFirestoreQuery } from "./build-firestore-query";
import { FirestoreMutex } from "./firestore-mutex";
import { CustomQueryRegistry } from "./firestore-table-provider-options";
import { FirestoreMcmaDataConverter } from "./firestore-mcma-data-converter";

async function getNextPageStartToken<TDocument extends Document>(results: QuerySnapshot, sortBy: string) {
    if (!results.docs.length) {
        return undefined;
    }

    const lastItem = results.docs[results.docs.length - 1];

    const nextResults = await results.query.limit(1).startAfter(lastItem).get();
    if (nextResults.empty) {
        return undefined;
    }

    return sortBy ? lastItem.data()[sortBy] : lastItem.id;
}

export class FirestoreTable implements DocumentDatabaseTable {
    private readonly customQueryRegistry: CustomQueryRegistry;

    constructor(private readonly rootCollection: CollectionReference, customQueryRegistry: CustomQueryRegistry) {
        this.customQueryRegistry = customQueryRegistry ?? {};
    }

    private collection<TDocument>(path: string): CollectionReference<TDocument> {
        return this.rootCollection
                   .doc("resources")
                   .collection(path)
                   .withConverter(new FirestoreMcmaDataConverter<TDocument>());
    }

    private doc<TDocument>(id: string): DocumentReference<TDocument> {
        return this.rootCollection
                   .doc("resources" + id)
                   .withConverter(new FirestoreMcmaDataConverter<TDocument>());
    }

    async query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<QueryResults<TDocument>> {
        const firestoreQuery = await buildFirestoreQuery<TDocument>(this.collection(query.path), query);

        const results = await firestoreQuery.get();
        return {
            results: results.docs.map(doc => doc.data()),
            nextPageStartToken: await getNextPageStartToken(results, query.sortBy)
        };
    }

    async customQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters>(
        query: CustomQuery<TDocument, TParameters>
    ): Promise<QueryResults<TDocument>> {
        const createCustomQuery = this.customQueryRegistry[query.name];
        if (!createCustomQuery) {
            throw new McmaException(`Custom query with name '${query.name}' has not been configured.`);
        }

        const customQuery = createCustomQuery(query);

        const results = await customQuery.firestoreQuery.get();
        return {
            results: results.docs.map(doc => doc.data() as TDocument),
            nextPageStartToken: await getNextPageStartToken<TDocument>(results, customQuery.sortBy)
        };
    }

    async get<TDocument extends Document = Document>(id: string): Promise<TDocument> {
        const doc = await this.doc<TDocument>(id).get();
        return doc.data();
    }

    async put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument> {
        await this.doc<TDocument>(id).set(resource);
        return resource;
    }

    async delete(id: string): Promise<void> {
        await this.doc(id).delete();
    }

    createMutex(mutexProperties: MutexProperties): DocumentDatabaseMutex {
        return new FirestoreMutex(this.rootCollection, mutexProperties.name, mutexProperties.holder, mutexProperties.lockTimeout, mutexProperties.logger);
    }
}
