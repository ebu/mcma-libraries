import { Document } from "../document";

export type CustomQueryParameters = { [key: string]: any };

export interface CustomQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters> {
    name: string;
    parameters: TParameters;
    pageStartToken?: string;
}

export function isCustomQuery<TDocument extends Document = Document>(query: any): query is CustomQuery<TDocument> {
    return !!query.name;
}