import { ContextVariableProvider } from "./context-variable-provider";
import "./context-variable-provider-ext";

export class EnvironmentVariableProvider extends ContextVariableProvider {
    constructor() {
        super(process.env);
    }
}

var ctx = new ContextVariableProvider({});
ctx