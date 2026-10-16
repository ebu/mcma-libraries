const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { root, orderedPackages } = require('./packages.cjs');
const compiler = path.join(root, 'node_modules/typescript/bin/tsc');
for (const pkg of orderedPackages()) {
    const output = path.resolve(pkg.dir, 'dist');
    if (!output.startsWith(root + path.sep) || path.basename(output) !== 'dist') throw new Error('Unsafe output path');
    fs.rmSync(output, { recursive: true, force: true });
    console.log(`Building ${pkg.manifest.name}`);
    const result = spawnSync(process.execPath, [compiler, '-p', path.join(pkg.dir, 'tsconfig.json')], { cwd: root, stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
}
