class ContextVariableProvider {
    constructor(contextVariables) {
        contextVariables = contextVariables || {};

        this.getAllContextVariables = () => contextVariables;

        this.getRequiredContextVariable = (key) => {
            if (!key) {
                throw new Error('Invalid key specified.');
            }
        
            const matchedKey = Object.keys(contextVariables).find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());
            if (!matchedKey) {
                throw new Error(`Required context variable with key '${key}' is missing.`);
            }
        
            return contextVariables[matchedKey];
        };

        this.getOptionalContextVariable = (key, defaultValue) => {
            if (!key) {
                throw new Error('Invalid key specified.');
            }
        
            const matchedKey = Object.keys(contextVariables).find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());
            if (!matchedKey) {
                return defaultValue;
            }
        
            return contextVariables[matchedKey];
        };
    }
}

module.exports = {
    ContextVariableProvider
};