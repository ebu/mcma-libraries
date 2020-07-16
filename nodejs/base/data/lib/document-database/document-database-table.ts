import { Query } from "./query/query";
import { Document } from "./document";

export interface DocumentDatabaseTable {
    query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<TDocument[]>;
    get<TDocument extends Document = Document>(id: string): Promise<TDocument>;
    put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument>;
    delete(id: string): Promise<void>
}