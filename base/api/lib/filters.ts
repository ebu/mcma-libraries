export function inMemoryTextValues<T>(filterValues: { [key: string]: string }): (item: T) => boolean {
    if (!filterValues) {
        return null;
    }
	
	const functionTextPrefix = "item => ";
	
	let functionText = functionTextPrefix;
	
	for (const propKey of Object.keys(filterValues)) {
        
        const isString = typeof filterValues[propKey] === "string";
        
		functionText += functionText.length > functionTextPrefix.length ? " && "  : "";
		functionText += "(item." + propKey + " === ";
		functionText += isString ? "'" : "";
        functionText += filterValues[propKey] ? filterValues[propKey].toString() : "null";
		functionText += isString ? "'" : "";
		functionText += ")";
    }
    
    return eval(functionText);
}