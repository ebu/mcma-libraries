import { Document } from "../document.js";

export interface QueryResults<TDocument extends Document = Document> {
    nextPageStartToken?: any;
    results: TDocument[];
}