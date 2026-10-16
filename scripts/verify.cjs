const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { root, packages, readJson } = require('./packages.cjs');
if (!process.env.npm_execpath) throw new Error('Run through npm run verify.');
if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node 22 or newer is required.');
if (readJson(path.join(root, 'node_modules/typescript/package.json')).version !== '5.9.3') throw new Error('Run npm ci to install TypeScript 5.9.3.');
function run(args, cwd = root) {
    const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
}
if (!process.argv.includes('--package-only')) {
    run(['scripts/build.cjs']);
    for (const pkg of packages()) {
        run(['--input-type=module', '-e', `await import(${JSON.stringify(pkg.manifest.name)});`]);
        if (['@mcma/core', '@mcma/aws-logger'].includes(pkg.manifest.name)) {
            run([process.env.npm_execpath, 'test'], pkg.dir);
        }
    }
    run(['--test', 'scripts/esm-interop.test.mjs', 'scripts/release.test.cjs']);
    run(['scripts/test-behavior.cjs']);
}
// Pack and test every actual release tarball, not just workspace links.
run(['scripts/release.cjs', 'prepare']);
console.log(`Verified 30 packages on Node ${process.versions.node} / ${process.platform}.`);
