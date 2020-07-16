import { Document, isFilterCriteriaGroup, Query } from "@mcma/data";
import { SqlQuerySpec, SqlParameter } from "@azure/cosmos";
import { FilterExpression, FilterCriteria } from "@mcma/data/dist/lib/document-database/query/filter";

export class CosmosDbFilter<TDocument extends Document = Document> {
    private parameters: SqlParameter[] = [];

    private criteriaIndex = 0;
    private expressionParts: string[] = [];

    constructor(private query: Query<TDocument>, private partitionKeyName: string) {}

    private get expression(): string {
        return this.expressionParts.map(p => "(" + p + ")").join(" && ");
    }

    build(): void {
        if (this.query.path) {
            const partitionKeyParamName = this.addParameter(this.query.path);
            this.expressionParts.push("root[\"" + this.partitionKeyName + "\"] = " + partitionKeyParamName);
        }

        if (this.query.filterExpression) {
            this.expressionParts.push(this.buildQueryFilterExpression(this.query.filterExpression));
        }
    }

    private addParameter(value: any): string {
        const name = "@p" + this.criteriaIndex++;
        this.parameters.push({ name, value });
        return name;
    }

    private buildQueryFilterExpression(queryFilter: FilterExpression<TDocument>): string {
        if (isFilterCriteriaGroup<TDocument>(queryFilter)) {
            return "(" + queryFilter.children.map(c => this.buildQueryFilterExpression(c)).join(queryFilter.logicalOperator) + ")";
        } else {
            return this.buildQueryFilterCriteria(queryFilter);
        }
    }

    private buildQueryFilterCriteria(criteria: FilterCriteria<TDocument>): string {
        return "root[\"resource\"][\"" + criteria.propertyName + "\"]" + criteria.operator + " " + this.addParameter(criteria.propertyValue);
    }

    toSqlQuerySpec(): SqlQuerySpec {
        const query = `SELECT VALUE root FROM root WHERE ${this.expression}`;
        return {
            query,
            parameters: this.parameters
        };
    }
}