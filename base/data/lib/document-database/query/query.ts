import { FilterExpression } from "./filter";
import { Document } from "../document";

export interface Query<TDocument extends Document = Document> {
    path: string;
    filterExpression?: FilterExpression<TDocument>;
    pageSize?: number;
    pageStartToken?: string;
    sortBy?: string;
    sortAscending?: boolean;
}
