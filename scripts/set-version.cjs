const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { root, packages, readJson } = require('./packages.cjs');
const version = process.argv[2];
assert.match(version || '', /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, 'Provide a stable version, e.g. 2.0.0');
const lock = readJson(path.join(root, 'package-lock.json'));
const writes = [];
for (const pkg of packages()) {
    pkg.manifest.version = version;
    const entry = lock.packages[pkg.relative];
    assert.ok(entry, `Missing workspace lock entry ${pkg.relative}`);
    entry.version = version;
    for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        for (const name of Object.keys(pkg.manifest[section] || {})) {
            if (name.startsWith('@mcma/')) pkg.manifest[section][name] = version;
        }
        if (pkg.manifest[section]) entry[section] = pkg.manifest[section];
    }
    writes.push([path.join(pkg.dir, 'package.json'), JSON.stringify(pkg.manifest, null, 4) + '\n']);
}
writes.push([path.join(root, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n']);
const properties = path.join(root, 'gradle.properties');
writes.push([properties, fs.readFileSync(properties, 'utf8').replace(/^VERSION=.*$/m, `VERSION=${version}`)]);
for (const [file, contents] of writes) fs.writeFileSync(file, contents);
console.log(`Set all package and lockfile versions to ${version}. Review and commit these changes before releasing.`);
