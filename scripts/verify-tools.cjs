const assert = require('node:assert/strict');
assert.ok(Number(process.versions.node.split('.')[0]) >= 22, 'Node 22+ is required');
if (process.argv.includes('--typescript')) {
    assert.equal(require('../node_modules/typescript/package.json').version, '5.9.3', 'Run npm ci to install TypeScript 5.9.3');
}
