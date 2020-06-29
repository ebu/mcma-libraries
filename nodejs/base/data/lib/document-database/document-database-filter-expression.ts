import { DocumentDatabaseFilterCriteria } from "./document-database-filter-criteria";
import { Document } from "./document";

export interface DocumentDatabaseFilterExpression<T extends Document = Document> {
    children: (DocumentDatabaseFilterCriteria<T> | DocumentDatabaseFilterExpression)[];
    logicalOperator: "&&" | "||";
}

export function isExpression(obj: any): obj is DocumentDatabaseFilterExpression {
    return obj && obj.logicalOperator;
}