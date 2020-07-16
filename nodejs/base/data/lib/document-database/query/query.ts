import { FilterExpression } from "./filter";
import { Document } from "../document";

export interface Query<TDocument extends Document = Document> {
    pageNumber?: number;
    pageSize?: number;
    path: string;
    filterExpression?: FilterExpression<TDocument>;
}
