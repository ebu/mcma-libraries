import { Document, DocumentDatabaseFilterExpression, isExpression } from "@mcma/data";
import { SqlQuerySpec, SqlParameter } from "@azure/cosmos";

export class CosmosDbFilter<T extends Document = Document> {
    private query: string;
    private parameters: SqlParameter[] = [];

    private expressions: string[] = [];
    private childExpressionIndex = 0;
    private criteriaIndex = 0;

    constructor(private filter: DocumentDatabaseFilterExpression<T>) {}

    get expression(): string {
        return this.expressions.join(" " + (this.filter.logicalOperator === "||" ? "or" : "and") + " ");
    }

    build(): void {
        for (const currentChild of this.filter.children) {
            if (isExpression(currentChild)) {
                const childFilter = new CosmosDbFilter(currentChild);
                childFilter.build();
                this.merge(childFilter);
    
                this.childExpressionIndex++;
            } else {
                const curParameterName = "@p" + this.criteriaIndex;
                this.parameters.push({ name: curParameterName, value: currentChild.propertyValue });
                this.expressions.push("root[\"resource\"][\"" + currentChild.propertyName + "\"]" + currentChild.operator + " " + curParameterName);
    
                this.criteriaIndex++;
            }
        }
    }

    private merge(childFilter: CosmosDbFilter): void {
        for (const parameter of childFilter.parameters) {
            this.parameters.push({
                name: "@c" + this.childExpressionIndex + parameter.name.substr(1),
                value: parameter.value
            })
        }

        this.expressions.push("(" + childFilter.expression + ")");
    }

    toSqlQuerySpec(): SqlQuerySpec {
        const query = `SELECT VALUE root FROM root WHERE ${this.expression}`;
        return {
            query,
            parameters: this.parameters
        };
    }
}