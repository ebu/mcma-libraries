import { FilterCriteria, FilterCriteriaGroup, FilterExpression, isFilterCriteriaGroup } from "@mcma/data";

interface DynamoDbExpression {
    expressionStatement: string;
    expressionAttributeNames: { [key: string]: string },
    expressionAttributeValues: { [key: string]: string }
}

function addFilterExpression(expression: DynamoDbExpression, filterExpression: FilterExpression): string {
    if (isFilterCriteriaGroup(filterExpression)) {
        return addFilterCriteriaGroup(expression, filterExpression);
    } else {
        return addFilterCriteria(expression, filterExpression);
    }
}

function addFilterCriteriaGroup(expression: DynamoDbExpression,filterCriteriaGroup: FilterCriteriaGroup): string {
    return filterCriteriaGroup.children && filterCriteriaGroup.children.length
        ? "(" + filterCriteriaGroup.children.map(x => addFilterExpression(expression, x)).join(` ${filterCriteriaGroup.logicalOperator === "||" ? "or" : "and"} `) + ")"
        : "";
}

function addFilterCriteria(expression: DynamoDbExpression, filterCriteria: FilterCriteria): string {
    let attributeNameKey: string
    if (!expression.expressionAttributeNames[filterCriteria.propertyName]) {
        attributeNameKey = `#a${Object.keys(expression.expressionAttributeNames).length}`;
        expression.expressionAttributeNames[attributeNameKey] = filterCriteria.propertyName;
    } else {
        attributeNameKey = expression.expressionAttributeNames[filterCriteria.propertyName];
    }

    let attributeValueKey = `:a${Object.keys(expression.expressionAttributeValues).length}`;
    expression.expressionAttributeValues[attributeValueKey] = filterCriteria.propertyValue;

    return `#r.${attributeNameKey} ${filterCriteria.operator} ${attributeValueKey}`;
}

export function buildFilterExpression(filterExpression: FilterExpression): DynamoDbExpression {
    const expression: DynamoDbExpression = { expressionStatement: "", expressionAttributeNames: { ["#r"]: "resource"}, expressionAttributeValues: {} };
    expression.expressionStatement = addFilterExpression(expression, filterExpression);
    return expression;
}