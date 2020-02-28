import { McmaResource, McmaResourceType, Utils, Exception } from "@mcma/core";
import { SqlQuerySpec, SqlParameter } from "@azure/cosmos";

export class SqlBuilder<T extends McmaResource> {
    private query: string;
    private parameters: SqlParameter[] = [];

    constructor(private type: McmaResourceType<T>) {
        this.query = this.getSelect(Utils.getTypeName(type));
    }

    private getSelect(type: string): string {
        return `SELECT VALUE root FROM root WHERE (root[\"type\"] = '${type}')`;
    }

    addFilter(filter: (x: T) => boolean): this {
        const filterText = filter.toString();
        const filterStart = filterText.indexOf("=>");
        if (filterStart < 0) {
            throw new Exception(`Invalid query ${filterText}. Filters must be arrow functions.`);
        }

        const itemParameterName = filterText.substr(0, filterStart).trim();
        const filterExpression = filterText.substr(filterStart + 2).trim();

        this.query += " AND (";

        this.query +=
            filterExpression
                .replace(/\&\&/g, "AND")
                .replace(/\|\|/g, "OR")
                .replace(/"/g, "'")
                .replace(/===/g, "=")
                .replace(/==/g, "=")
                .replace(new RegExp(itemParameterName + "\\.([A-Za-z0-9_]+)", "g"), "root[\"resource\"][\"$1\"]")

        this.query += ")";
        
        return this;
    }

    toSqlQuerySpec(): SqlQuerySpec {
        return {
            query: this.query,
            parameters: this.parameters
        };
    }
}