function getTypeName(type) {
    if (typeof type === 'function') {
        type = type.name;
    } else if (typeof type === 'object') {
        type = type.constructor.name;
    } else if (typeof type !== 'string') {
        throw new Error('Invalid type for db table.');
    }
    return type;
}

module.exports = {
    getTypeName
};