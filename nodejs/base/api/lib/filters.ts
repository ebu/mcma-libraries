export function inMemoryTextValues<T>(filterValues: { [key: string]: string }): (item: T) => boolean {
    if (!filterValues) {
        return null;
    }

    return item => {
        for (const propKey of Object.keys(filterValues)) {
            if (item[propKey] !== undefined &&
                (item[propKey] && item[propKey].toString()) !== (filterValues[propKey] && filterValues[propKey].toString())) {
                return false;
            }
        }
        return true;
    };
}