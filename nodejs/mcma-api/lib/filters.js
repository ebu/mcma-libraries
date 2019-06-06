function inMemoryTextValues(filterValues) {
    if (!filterValues || filterValues.length === 0) {
        return null;
    }

    return item => {
        for (const propKey in Object.keys(filterValues)) {
            if (item[propKey] !== undefined &&
                (item[propKey] && item[propKey].toString()) !== (filterValues[propKey] && filterValues[propKey].toString())) {
                return false;
            }
        }
        return true;
    };
}

module.exports = {
    inMemoryTextValues
};