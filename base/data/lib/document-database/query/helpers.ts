import { FilterExpression, FilterCriteria } from "./filter.js";
import { Document } from "../document.js";

export function getFilterExpressionFromKeyValuePairs<T extends Document = Document>(keyValuePairs: { [key: string]: any }): FilterExpression<T> {
    return {
        logicalOperator: "&&",
        children: Object.keys(keyValuePairs).map(k => new FilterCriteria(k, "=", keyValuePairs[k]))
    };
}