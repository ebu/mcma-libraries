import { ContextVariableProvider } from "./context-variable-provider";

export function getTableName(contextVariableProvider: ContextVariableProvider): string {
    return contextVariableProvider.getRequiredContextVariable("TableName");
}