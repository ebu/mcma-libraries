import { DocumentDatabaseFilterExpression } from "./document-database-filter-expression";
import { DocumentDatabaseFilterCriteria } from "./document-database-filter-criteria";
import { Document } from "./document";

export function getFilterExpressionFromKeyValuePairs<T extends Document = Document>(keyValuePairs: { [key: string]: any }): DocumentDatabaseFilterExpression<T> {
    return {
        logicalOperator: "&&",
        children: Object.keys(keyValuePairs).map(k => new DocumentDatabaseFilterCriteria(k, "=", keyValuePairs[k]))
    };
}