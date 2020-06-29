import { DocumentDatabaseFilterExpression, isExpression, Document } from "@mcma/data";
import { ExpressionAttributeNameMap, ExpressionAttributeValueMap } from "aws-sdk/clients/dynamodb";

export class DynamoDbFilter<T extends Document = Document> {
    attributeNames: ExpressionAttributeNameMap = { ["#r"]: "resource" };
    attributeValues: ExpressionAttributeValueMap = {};

    private expressions: string[] = [];
    private childExpressionIndex = 0;
    private criteriaIndex = 0;

    constructor(private filter: DocumentDatabaseFilterExpression<T>) {}

    get expression(): string {
        return this.expressions.length > 0 ? this.expressions.join(" " + (this.filter.logicalOperator === "||" ? "or" : "and") + " ") : null;
    }

    build(): void {
        if (!this.filter) {
            return;
        }
        
        for (const currentChild of this.filter.children) {
            if (isExpression(currentChild)) {
                const childFilter = new DynamoDbFilter(currentChild);
                childFilter.build();
                this.merge(childFilter);
    
                this.childExpressionIndex++;
            } else {
                const curAttributeName = "#a" + this.criteriaIndex;
                const curAttributeValue = ":a" + this.criteriaIndex;
    
                this.expressions.push("#r." + curAttributeName + " " + currentChild.operator + " " + curAttributeValue);
    
                this.attributeNames[curAttributeName] = currentChild.propertyName;
                this.attributeValues[curAttributeValue] = currentChild.propertyValue;
    
                this.criteriaIndex++;
            }
        }
    }

    private merge(childFilter: DynamoDbFilter): void {

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