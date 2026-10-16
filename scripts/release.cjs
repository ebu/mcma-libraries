const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { root, readJson, orderedPackages } = require('./packages.cjs');
const registry = 'https://registry.npmjs.org';
const releaseDir = path.join(root, 'build/release');
const integrity = bytes => 'sha512-' + crypto.createHash('sha512').update(bytes).digest('base64');
function command(executable, args, cwd = root) {
    const result = spawnSync(executable, args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    if (result.error) throw result.error;
    return result;
}
function checked(executable, args, cwd = root) {
    const result = command(executable, args, cwd);
    if (result.status !== 0) throw new Error(`${executable} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
}
function npm(args, cwd = root) {
    assert.ok(process.env.npm_execpath, 'Run this script through npm.');
    return checked(process.execPath, [process.env.npm_execpath, ...args], cwd);
}
function resetBuildDirectory(dir) {
    const resolved = path.resolve(dir);
    assert.ok(resolved.startsWith(path.join(root, 'build') + path.sep), 'Only reset generated build directories');
    fs.rmSync(resolved, { recursive: true, force: true });
    fs.mkdirSync(resolved, { recursive: true });
}
function version() {
    const match = fs.readFileSync(path.join(root, 'gradle.properties'), 'utf8').match(/^VERSION=(\d+\.\d+\.\d+)\s*$/m);
    assert.ok(match, 'VERSION must be a stable semantic version');
    return match[1];
}
function validatePackages(items, expected) {
    assert.equal(items.length, 30, 'Expected all 30 libraries');
    const names = new Set(items.map(p => p.manifest.name));
    for (const {manifest: m} of items) {
        assert.equal(m.version, expected, `${m.name}: version mismatch`);
        assert.equal(m.type, 'module');
        assert.equal(m.repository.url, 'git+https://github.com/ebu/mcma-libraries.git');
        for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
            for (const [name, spec] of Object.entries(m[section] || {})) {
                if (name.startsWith('@mcma/')) {
                    assert.ok(names.has(name), `Unknown internal package ${name}`);
                    assert.equal(spec, expected, `${m.name}: ${name} version mismatch`);
                }
            }
        }
    }
}
function sourceCommit() {
    return checked('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'rev-parse', 'HEAD']).trim();
}
function prepare() {
    const items = orderedPackages(), expected = version();
    validatePackages(items, expected);
    if (process.env.RELEASE_VERSION) assert.equal(process.env.RELEASE_VERSION, expected, 'Input must match committed VERSION');
    resetBuildDirectory(releaseDir);
    const staging = path.join(root, 'build/release-staging');
    resetBuildDirectory(staging);
    const commit = sourceCommit();
    const entries = [];
    for (const pkg of items) {
        const stage = path.join(staging, pkg.relative);
        fs.mkdirSync(stage, { recursive: true });
        fs.cpSync(path.join(pkg.dir, 'dist'), path.join(stage, 'dist'), { recursive: true });
        fs.copyFileSync(path.join(root, 'LICENSE'), path.join(stage, 'LICENSE'));
        const readme = fs.existsSync(path.join(pkg.dir, 'README.md')) ? path.join(pkg.dir, 'README.md') : path.join(root, 'README.md');
        fs.copyFileSync(readme, path.join(stage, 'README.md'));
        fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({ ...pkg.manifest, gitHead: commit }, null, 4) + '\n');
        const result = JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', releaseDir], stage))[0];
        assert.equal(result.name, pkg.manifest.name);
        assert.equal(result.version, expected);
        for (const entry of [pkg.manifest.main, pkg.manifest.types]) {
            assert.ok(result.files.some(f => f.path === entry), `${result.name}: missing ${entry}`);
        }
        assert.ok(!result.files.some(f => /^(build|test|node_modules)\//.test(f.path)), `${result.name}: unexpected packed files`);
        const digest = integrity(fs.readFileSync(path.join(releaseDir, result.filename)));
        assert.equal(digest, result.integrity);
        entries.push({ name: result.name, version: expected, filename: result.filename, integrity: digest });
    }
    smokeTest(items, entries);
    // Written only after the exact tarballs have passed consumer checks.
    fs.writeFileSync(path.join(releaseDir, 'manifest.json'), JSON.stringify({
        version: expected, commit, packages: entries
    }, null, 2) + '\n');
    console.log(`Prepared and verified ${entries.length} tarballs in build/release for ${expected}. Nothing published.`);
}
function smokeTest(items, entries) {
    const fixture = path.join(root, 'build/release-consumer');
    resetBuildDirectory(fixture);
    const dependencies = Object.fromEntries(entries.map(e => [e.name, `file:../release/${e.filename}`]));
    // Seed a consumer lock with the exact external dependency versions from the workspace lock.
    const workspaceLock = readJson(path.join(root, 'package-lock.json'));
    const lock = { name: 'release-consumer', lockfileVersion: 3, requires: true,
        packages: { '': { dependencies } } };
    for (const [key, value] of Object.entries(workspaceLock.packages)) {
        if (key.startsWith('node_modules/') && !key.startsWith('node_modules/@mcma/')) {
            lock.packages[key] = value;
        }
    }
    // A consumer supplies external peer dependencies at its root. Node types are
    // an explicit TypeScript consumer prerequisite, not a runtime library dependency.
    function addConsumerDependency(name, pkg) {
        const value = workspaceLock.packages[`${pkg.relative}/node_modules/${name}`] || workspaceLock.packages[`node_modules/${name}`];
        assert.ok(value, `Missing locked consumer dependency ${name}`);
        if (dependencies[name]) { assert.equal(dependencies[name], value.version); return; }
        dependencies[name] = value.version;
        const entry = { ...value };
        delete entry.dev;
        delete entry.devOptional;
        lock.packages[`node_modules/${name}`] = entry;
        for (const child of Object.keys(entry.dependencies || {})) addConsumerDependency(child, pkg);
    }
    addConsumerDependency('@types/node', items.find(p => p.manifest.name === '@mcma/core'));
    for (const pkg of items) {
        for (const name of Object.keys(pkg.manifest.peerDependencies || {})) {
            if (!name.startsWith('@mcma/')) addConsumerDependency(name, pkg);
        }
    }
    for (const pkg of items) {
        const e = entries.find(e => e.name === pkg.manifest.name);
        const destination = `node_modules/${e.name}`;
        lock.packages[destination] = { version: e.version, resolved: `file:../release/${e.filename}`, integrity: e.integrity,
            dependencies: pkg.manifest.dependencies, peerDependencies: pkg.manifest.peerDependencies,
            optionalDependencies: pkg.manifest.optionalDependencies, engines: pkg.manifest.engines };
        for (const [key, value] of Object.entries(workspaceLock.packages)) {
            if (key.startsWith(pkg.relative + '/node_modules/')) {
                lock.packages[destination + key.slice(pkg.relative.length)] = value;
            }
        }
    }
    fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies }));
    fs.writeFileSync(path.join(fixture, 'package-lock.json'), JSON.stringify(lock, null, 2));
    console.log(npm(['ci', '--offline', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], fixture));
    for (const entry of entries) {
        const installed = path.join(fixture, 'node_modules', entry.name);
        assert.ok(!fs.lstatSync(installed).isSymbolicLink(), 'Consumer must use tarballs, not workspace links');
        assert.equal(readJson(path.join(installed, 'package.json')).version, entry.version);
        checked(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(entry.name)});`], fixture);
    }
    fs.writeFileSync(path.join(fixture, 'consumer.ts'), items.map((p, i) =>
        `import * as package${i} from ${JSON.stringify(p.manifest.name)};\nvoid package${i};`).join('\n') + '\n' +
        'import { ConsoleLogger, LogEvent } from "@mcma/core";\nnew ConsoleLogger("consumer").info("test");\n' +
        'const event: LogEvent = new LogEvent("INFO", 400, "consumer", "request", new Date(), "hello");\n');
    checked(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--module', 'Node20',
        '--target', 'ES2022', '--strict', 'consumer.ts'], fixture);
}
function existingPackage(result) {
    if (result.status === 0) return JSON.parse(result.stdout);
    let error;
    try { error = JSON.parse(result.stdout).error; } catch { /* Report the original failure below. */ }
    if (error?.code === 'E404') return null;
    throw new Error(`Registry lookup failed (not a missing version): ${result.stdout}\n${result.stderr}`);
}
function verifyExisting(remote, entry, commit) {
    assert.equal(remote.dist?.integrity, entry.integrity, `Published bytes differ: ${entry.name}@${entry.version}`);
    assert.equal(remote.gitHead, commit, `Published source differs: ${entry.name}@${entry.version}`);
}
async function publish() {
    assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Publish only from GitHub Actions');
    assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch');
    assert.equal(process.env.GITHUB_REF, 'refs/heads/main', 'Publish only from main');
    assert.equal(process.env.GITHUB_REPOSITORY, 'ebu/mcma-libraries');
    assert.ok(process.env.ACTIONS_ID_TOKEN_REQUEST_URL, 'OIDC identity is required');
    const manifest = readJson(path.join(releaseDir, 'manifest.json'));
    assert.equal(manifest.version, version());
    assert.equal(manifest.version, process.env.RELEASE_VERSION);
    assert.equal(manifest.commit, process.env.GITHUB_SHA);
    assert.equal(manifest.commit, sourceCommit());
    const items = orderedPackages();
    validatePackages(items, manifest.version);
    assert.deepEqual(manifest.packages.map(e => e.name), items.map(p => p.manifest.name));
    validateArtifacts(manifest, filename => fs.readFileSync(path.join(releaseDir, filename)));
    const lookup = entry => existingPackage(command(process.execPath, [process.env.npm_execpath, 'view',
        `${entry.name}@${entry.version}`, '--json', '--registry', registry]));
    return publishPackages(manifest, {
        lookup,
        publishTarball: entry => console.log(npm(['publish', path.join(releaseDir, entry.filename), '--access', 'public', '--tag', 'latest',
            '--registry', registry, '--ignore-scripts', '--provenance'])),
        wait: () => new Promise(resolve => setTimeout(resolve, 5000))
    });
}
function validateArtifacts(manifest, readTarball) {
    for (const entry of manifest.packages) {
        assert.equal(entry.version, manifest.version);
        assert.equal(path.basename(entry.filename), entry.filename);
        assert.equal(integrity(readTarball(entry.filename)), entry.integrity, 'Tarball changed after testing');
    }
}
async function publishPackages(manifest, { lookup, publishTarball, wait }) {
    // Preflight all existing versions before publishing anything. Never silently skip a conflicting release.
    const existing = new Set();
    for (const entry of manifest.packages) {
        const remote = lookup(entry);
        if (remote) { verifyExisting(remote, entry, manifest.commit); existing.add(entry.name); }
    }
    for (const entry of manifest.packages) {
        if (existing.has(entry.name)) { console.log(`Already published and identical: ${entry.name}`); continue; }
        await publishTarball(entry);
        let visible = false;
        for (let attempt = 0; attempt < 12; attempt++) {
            const remote = lookup(entry);
            if (remote) { verifyExisting(remote, entry, manifest.commit); visible = true; break; }
            await wait();
        }
        assert.ok(visible, `${entry.name} not visible after 12 checks; retry the same workflow run`);
    }
}
function publishLocal() {
    const manifest = readJson(path.join(releaseDir, 'manifest.json'));
    assert.equal(manifest.version, version());
    for (const entry of manifest.packages) {
        assert.equal(path.basename(entry.filename), entry.filename);
        assert.equal(integrity(fs.readFileSync(path.join(releaseDir, entry.filename))), entry.integrity);
        const remote = existingPackage(command(process.execPath, [process.env.npm_execpath, 'view',
            `${entry.name}@${entry.version}`, '--json', '--registry', 'http://localhost:4873']));
        if (remote) { verifyExisting(remote, entry, manifest.commit); continue; }
        console.log(npm(['publish', path.join(releaseDir, entry.filename), '--access', 'public', '--tag', 'alpha',
            '--registry', 'http://localhost:4873', '--ignore-scripts']));
    }
}
module.exports = { integrity, existingPackage, verifyExisting, validatePackages, validateArtifacts, publishPackages };
if (require.main === module) {
    Promise.resolve().then(() => {
        if (process.argv[2] === 'prepare') return prepare();
        if (process.argv[2] === 'publish') return publish();
        if (process.argv[2] === 'publish-local') return publishLocal();
        throw new Error('Expected prepare, publish or publish-local');
    }).catch(error => { console.error(error); process.exitCode = 1; });
}
