import { Query } from "./query/query";
import { CustomQuery, CustomQueryParameters } from "./query/custom-query";
import { Document } from "./document";
import { DocumentDatabaseMutex } from "./document-database-mutex";
import { QueryResults } from "./query/query-results";

export interface DocumentDatabaseTable {
    query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<QueryResults<TDocument>>;

    customQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters>(
        query: CustomQuery<TDocument, TParameters>
    ): Promise<QueryResults<TDocument>>;

    get<TDocument extends Document = Document>(id: string): Promise<TDocument>;

    put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument>;

    delete(id: string): Promise<void>;

    createMutex(mutexName: string, mutexHolder: string, lockTimeout?: number): DocumentDatabaseMutex;
}
