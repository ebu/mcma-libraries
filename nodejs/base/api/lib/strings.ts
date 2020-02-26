import { plural } from "pluralize";

export function camelCaseToKebabCase(value: string): string {
    let result = "";

    for (let i = 0; i < value.length; i++) {
        if (value[i] === value[i].toUpperCase()) {
            if (result.length > 0) {
                result += "-";
            }
            result += value[i].toLowerCase();
        } else {
            result += value[i];
        }
    }

    return result;
}

export function pluralizeKebabCase(value: string): string {
    const parts = value.split("-");
    parts[parts.length - 1] = plural(parts[parts.length - 1]);
    return parts.join("-");
}