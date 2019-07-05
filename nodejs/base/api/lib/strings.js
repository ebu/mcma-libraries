const pluralize = require("pluralize");

function camelCaseToKebabCase(value) {
    let result = "";

    for (let i = 0; i < value.length; i++) {
        if (value[i] === value[i].toUpperCase()) {
            if (result.length > 0) {
                result += "-";
            }
            result += value[i].toLowerCase();
        }
        else {
            result += value[i];
        }
    }

    return result;
}

function pluralizeKebabCase(value) {
    const parts = value.split("-");
    parts[parts.length - 1] = pluralize.plural(parts[parts.length - 1]);
    return parts.join("-");
}

module.exports = {
    camelCaseToKebabCase,
    pluralizeKebabCase
};