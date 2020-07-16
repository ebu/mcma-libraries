import { FilterExpression, FilterCriteria } from "./filter";
import { Document } from "../document";

export function getFilterExpressionFromKeyValuePairs<T extends Document = Document>(keyValuePairs: { [key: string]: any }): FilterExpression<T> {
    return {
        logicalOperator: "&&",
        children: Object.keys(keyValuePairs).map(k => new FilterCriteria(k, "=", keyValuePairs[k]))
    };
}