import { FilterExpression } from "./filter";
import { Document } from "../document";

export enum QuerySortOrder {
    Ascending = "asc",
    Descending = "desc",
}

export interface Query<TDocument extends Document = Document> {
    path: string;
    filterExpression?: FilterExpression<TDocument>;
    pageSize?: number;
    pageStartToken?: string;
    sortBy?: string;
    sortOrder?: QuerySortOrder;
}
