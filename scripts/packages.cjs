const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
function packages() {
    return ['base', 'aws', 'azure', 'google-cloud'].flatMap(group =>
        fs.readdirSync(path.join(root, group), { withFileTypes: true })
            .filter(e => e.isDirectory() && fs.existsSync(path.join(root, group, e.name, 'package.json')))
            .map(e => ({ dir: path.join(root, group, e.name), relative: `${group}/${e.name}`,
                manifest: readJson(path.join(root, group, e.name, 'package.json')) })));
}
function orderedPackages(items = packages()) {
    const byName = new Map(items.map(p => [p.manifest.name, p]));
    const done = new Set(), active = new Set(), ordered = [];
    function visit(pkg) {
        if (done.has(pkg)) return;
        if (active.has(pkg)) throw new Error(`Dependency cycle: ${pkg.manifest.name}`);
        active.add(pkg);
        for (const name of Object.keys({ ...pkg.manifest.dependencies, ...pkg.manifest.devDependencies,
            ...pkg.manifest.peerDependencies })) {
            if (byName.has(name)) visit(byName.get(name));
        }
        active.delete(pkg); done.add(pkg); ordered.push(pkg);
    }
    items.forEach(visit);
    return ordered;
}
module.exports = { root, readJson, packages, orderedPackages };
