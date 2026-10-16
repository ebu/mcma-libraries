const assert = require('node:assert/strict');
assert.ok(Number(process.versions.node.split('.')[0]) >= 22, 'Node 22+ is required');
if (process.argv.includes('--typescript')) {
    assert.equal(require('../node_modules/typescript/package.json').version, '5.9.3', 'Run npm ci to install TypeScript 5.9.3');
}

// Check before installation so a developer registry cannot break clean runners.
for (const [location, entry] of Object.entries(require('../package-lock.json').packages)) {
    if (entry.link || !entry.resolved) continue;
    assert.equal(new URL(entry.resolved).origin, 'https://registry.npmjs.org',
        `Non-public dependency URL in package-lock.json: ${location}`);
}
