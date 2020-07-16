import { Document, FilterCriteria, FilterExpression, isFilterCriteriaGroup, LogicalOperator } from "@mcma/data";
import { ExpressionAttributeNameMap, ExpressionAttributeValueMap } from "aws-sdk/clients/dynamodb";

export class DynamoDbQueryFilter<T extends Document = Document> {
    attributeNames: ExpressionAttributeNameMap = { ["#r"]: "resource" };
    attributeValues: ExpressionAttributeValueMap = {};

    private expressions: string[] = [];
    private childExpressionIndex = 0;
    private criteriaIndex = 0;

    private logicalOperator: LogicalOperator | undefined;

    constructor(private filter: FilterExpression<T>) {}

    get expression(): string {
        if (this.expressions.length === 0) {
            return null;
        }
        if (this.expressions.length === 1) {
            return this.expressions[0];
        }
        return this.expressions.join(" " + (this.logicalOperator === "||" ? "or" : "and") + " ");
    }

    build(): void {
        if (!this.filter) {
            return;
        }

        if (isFilterCriteriaGroup<T>(this.filter)) {
            for (const currentChild of this.filter.children) {
                if (isFilterCriteriaGroup(currentChild)) {
                    const childFilter = new DynamoDbQueryFilter(currentChild);
                    childFilter.build();
                    this.merge(childFilter);
        
                    this.childExpressionIndex++;
                } else {
                    this.addCriteria(currentChild);
                }
            }
        } else {
            this.addCriteria(this.filter);
        }
    }

    private addCriteria(criteria: FilterCriteria<T>): void {
        const curAttributeName = "#a" + this.criteriaIndex;
        const curAttributeValue = ":a" + this.criteriaIndex;

        this.expressions.push("#r." + curAttributeName + " " + criteria.operator + " " + curAttributeValue);

        this.attributeNames[curAttributeName] = criteria.propertyName;
        this.attributeValues[curAttributeValue] = criteria.propertyValue;

        this.criteriaIndex++;
    }

    private merge(childFilter: DynamoDbQueryFilter): void {

        for (const childAttributeNameKey in Object.keys(childFilter.attributeNames).filter(a => a !== "#r")) {
            const scopedKey = "#c" + this.childExpressionIndex + childAttributeNameKey.substr(1);
            this.attributeNames[scopedKey] = childFilter.attributeNames[childAttributeNameKey];
        }

        for (const childAttributeValueKey in Object.keys(childFilter.attributeValues)) {
            const scopedKey = ":c" + this.childExpressionIndex + childAttributeValueKey.substr(1);
            this.attributeValues[scopedKey] = childFilter.attributeValues[childAttributeValueKey];
        }

        this.expressions.push("(" + childFilter.expression + ")");
    }
}