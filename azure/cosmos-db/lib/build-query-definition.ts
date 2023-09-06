import { Document, Query, FilterExpression, FilterCriteria, FilterCriteriaGroup, isFilterCriteriaGroup } from "@mcma/data";
import { SqlQuerySpec } from "@azure/cosmos";

type SqlQuery = { text: string, parameters: any[], addParameter: (parameter: any) => string };

export function buildQueryDefinition<TDocument extends Document = Document>(query: Query<TDocument>, partitionKeyName: string): SqlQuerySpec {
    const sqlQuery: SqlQuery = {
        text: "SELECT VALUE root FROM root",
        parameters: [],
        addParameter: function (parameter: any) {
            const paramName = `@p${this.parameters.length}`;
            this.parameters.push(parameter);
            return paramName;
        }
    };

    function addFilterExpression(filterExpression: FilterExpression): string {
        if (isFilterCriteriaGroup(filterExpression)) {
            return addFilterCriteriaGroup(filterExpression);
        } else {
            return addFilterCriteria(filterExpression);
        }
    }

    function addFilterCriteriaGroup(filterCriteriaGroup: FilterCriteriaGroup): string {
        return filterCriteriaGroup.children.length
            ? "(" + filterCriteriaGroup.children.map(x => addFilterExpression(x)).join(` ${(filterCriteriaGroup.logicalOperator === "||" ? "or" : "and")} `) + ")"
            : "";
    }

    function addFilterCriteria(filterCriteria: FilterCriteria): string {
        return `root["resource"]["${filterCriteria.propertyName}"] ${filterCriteria.operator} ${sqlQuery.addParameter(filterCriteria.propertyValue)}`;
    }

    const partitionKeyClause = query.path ? `root["${partitionKeyName}"] = ${sqlQuery.addParameter(query.path)}` : null;
    const filterClause = query.filterExpression ? addFilterExpression(query.filterExpression) : null;

    if (partitionKeyClause && partitionKeyClause.length && filterClause && filterClause.length) {
        sqlQuery.text += ` WHERE (${partitionKeyClause}) and (${filterClause})`;
    } else if (partitionKeyClause && partitionKeyClause.length) {
        sqlQuery.text += ` WHERE ${partitionKeyClause}`;
    } else if (filterClause && filterClause.length) {
        sqlQuery.text += ` WHERE ${partitionKeyClause}`;
    }

    if (query.sortBy) {
        sqlQuery.text += ` ORDER BY root["resource"]["${query.sortBy}"]`;
        if (query.sortOrder) {
            sqlQuery.text += ` ${query.sortOrder}`;
        }
    }

    return {
        query: sqlQuery.text,
        parameters: sqlQuery.parameters.map((p, i) => ({ name: `@p${i}`, value: p }))
    };
}
