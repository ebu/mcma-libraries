import { Document } from "./document";

type Operator = "=" | "!=" | "<" | "<=" | ">" | ">=";

export class DocumentDatabaseFilterCriteria<T extends Document = Document, K extends keyof T = string> {
    constructor(propertyName: K, operator: Operator, propertyValue: T[K]) {
        this.propertyName = propertyName;
        this.operator = operator;
        this.propertyValue = propertyValue;
    }

    readonly propertyName: K;
    readonly operator: Operator;
    readonly propertyValue: T[K];
}