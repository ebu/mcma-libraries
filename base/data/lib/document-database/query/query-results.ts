import { Document } from "../document";

export interface QueryResults<TDocument extends Document = Document> {
    nextPageStartToken?: any;
    results: TDocument[];
}