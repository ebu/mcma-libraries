import { BinaryOperator, LogicalOperator } from "./operator";
import { Document } from "../document";

export type FilterExpression<T extends Document = Document> = FilterCriteriaGroup<T> | FilterCriteria<T>;

export interface FilterCriteriaGroup<T extends Document = Document> {
    children: FilterExpression<T>[];
    logicalOperator: LogicalOperator;
}

export class FilterCriteria<T extends Document = Document, K extends keyof T = string> {
    constructor(propertyName: K, operator: BinaryOperator, propertyValue: T[K]) {
        this.propertyName = propertyName;
        this.operator = operator;
        this.propertyValue = propertyValue;
    }

    readonly propertyName: K;
    readonly operator: BinaryOperator;
    readonly propertyValue: T[K];
}

export function isFilterCriteriaGroup<T extends Document = Document>(obj: any): obj is FilterCriteriaGroup<T> {
    return obj && obj.logicalOperator;
}