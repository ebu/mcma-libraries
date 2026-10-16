const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existingPackage, verifyExisting, integrity } = require('./release.cjs');
const { orderedPackages } = require('./packages.cjs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
test('publishing refuses local runs, pull-request events and non-main branches before doing any work', () => {
    const base = { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch',
        GITHUB_REF: 'refs/heads/main', GITHUB_REPOSITORY: 'ebu/mcma-libraries' };
    delete base.ACTIONS_ID_TOKEN_REQUEST_URL;
    for (const overrides of [{ GITHUB_ACTIONS: 'false' }, { GITHUB_EVENT_NAME: 'pull_request' },
        { GITHUB_REF: 'refs/heads/feature' }, { GITHUB_REPOSITORY: 'someone/other-repo' }, {}]) {
        const result = spawnSync(process.execPath, [path.join(__dirname, 'release.cjs'), 'publish'],
            { env: { ...base, ...overrides }, encoding: 'utf8' });
        assert.equal(result.status, 1);
        assert.match(result.stderr, /AssertionError/);
        assert.doesNotMatch(result.stderr, /ENOENT|Registry lookup failed/);
    }
});
test('only an explicit registry E404 counts as unpublished', () => {
    assert.equal(existingPackage({ status: 1, stdout: '{"error":{"code":"E404"}}' }), null);
    for (const code of ['E401', 'E403', 'E429', 'E500', 'ECONNRESET']) {
        assert.throws(() => existingPackage({ status: 1, stdout: JSON.stringify({ error: { code } }) }));
    }
    assert.throws(() => existingPackage({ status: 1, stdout: 'not JSON' }));
});
test('resuming rejects differing bytes or source commits', () => {
    const entry = { name: '@mcma/core', version: '2.0.0', integrity: integrity(Buffer.from('tested tarball')) };
    verifyExisting({ dist: { integrity: entry.integrity }, gitHead: 'commit-a' }, entry, 'commit-a');
    assert.throws(() => verifyExisting({ dist: { integrity: integrity(Buffer.from('other bytes')) }, gitHead: 'commit-a' }, entry, 'commit-a'));
    assert.throws(() => verifyExisting({ dist: { integrity: entry.integrity }, gitHead: 'commit-b' }, entry, 'commit-a'));
});
test('dependency order puts prerequisites first and rejects cycles', () => {
    const core = { manifest: { name: '@mcma/core' } };
    const client = { manifest: { name: '@mcma/client', peerDependencies: { '@mcma/core': '2.0.0' } } };
    assert.deepEqual(orderedPackages([client, core]), [core, client]);
    core.manifest.devDependencies = { '@mcma/client': '2.0.0' };
    assert.throws(() => orderedPackages([core, client]), /cycle/);
});
const { publishPackages, validateArtifacts } = require('./release.cjs');
const { finalizeRelease } = require('./github-release.cjs');
function registryFixture() {
    const manifest = { version: '2.0.0', commit: 'commit-a', packages: ['core', 'client', 'api'].map(name => ({
        name: `@mcma/${name}`, version: '2.0.0', filename: `${name}.tgz`, integrity: integrity(Buffer.from(name))
    })) };
    const remote = new Map(), writes = [], reads = [];
    let waits = 0;
    const metadata = entry => ({ dist: { integrity: entry.integrity }, gitHead: manifest.commit });
    const adapter = {
        lookup(entry) { reads.push(entry.name); return remote.get(entry.name) || null; },
        publishTarball(entry) { writes.push(entry.name); remote.set(entry.name, metadata(entry)); },
        async wait() { waits++; }
    };
    return { manifest, remote, writes, reads, adapter, metadata, waits: () => waits };
}
test('preflights every version before publishing in dependency order', async () => {
    const f = registryFixture();
    const publish = f.adapter.publishTarball;
    f.adapter.publishTarball = entry => {
        assert.deepEqual(f.reads.slice(0, 3), f.manifest.packages.map(p => p.name));
        publish(entry);
    };
    await publishPackages(f.manifest, f.adapter);
    assert.deepEqual(f.writes, f.manifest.packages.map(p => p.name));
    assert.equal(f.waits(), 0);
});
test('a conflict or registry failure on the final package prevents every publish', async () => {
    for (const failure of ['bytes', 'commit', 'authorization']) {
        const f = registryFixture(), last = f.manifest.packages[2];
        if (failure === 'authorization') {
            const lookup = f.adapter.lookup;
            f.adapter.lookup = entry => { if (entry === last) throw new Error('E403'); return lookup(entry); };
        } else {
            const value = f.metadata(last);
            if (failure === 'bytes') value.dist.integrity = 'different'; else value.gitHead = 'other';
            f.remote.set(last.name, value);
        }
        await assert.rejects(publishPackages(f.manifest, f.adapter));
        assert.deepEqual(f.writes, []);
    }
});
test('retry resumes partial publication, including a timeout after registry acceptance', async () => {
    for (const accepted of [false, true]) {
        const f = registryFixture(), publish = f.adapter.publishTarball;
        f.adapter.publishTarball = entry => {
            if (entry === f.manifest.packages[1]) {
                if (accepted) publish(entry);
                throw new Error('connection lost');
            }
            publish(entry);
        };
        await assert.rejects(publishPackages(f.manifest, f.adapter), /connection lost/);
        assert.equal(f.remote.has('@mcma/api'), false);
        f.adapter.publishTarball = publish;
        await publishPackages(f.manifest, f.adapter);
        assert.deepEqual(f.writes, ['@mcma/core', '@mcma/client', '@mcma/api']);
        await publishPackages(f.manifest, f.adapter);
        assert.equal(f.writes.length, 3, 'completed retries must not publish again');
    }
});
test('visibility polling recovers from delayed metadata and stops after its bounded timeout', async () => {
    for (const delay of [2, Infinity]) {
        const f = registryFixture(), lookup = f.adapter.lookup;
        let polls = 0;
        f.adapter.lookup = entry => {
            if (f.remote.has(entry.name) && entry === f.manifest.packages[0] && polls++ < delay) return null;
            return lookup(entry);
        };
        if (delay === Infinity) {
            await assert.rejects(publishPackages(f.manifest, f.adapter), /not visible after 12 checks/);
            assert.equal(polls, 12);
            assert.equal(f.writes.length, 1);
            assert.equal(f.waits(), 12);
        } else {
            await publishPackages(f.manifest, f.adapter);
            assert.equal(f.waits(), 2);
            assert.equal(f.writes.length, 3);
        }
    }
});
test('unexpected published metadata stops dependent packages', async () => {
    const f = registryFixture();
    f.adapter.publishTarball = entry => {
        f.writes.push(entry.name);
        f.remote.set(entry.name, { dist: { integrity: 'wrong' }, gitHead: f.manifest.commit });
    };
    await assert.rejects(publishPackages(f.manifest, f.adapter), /Published bytes differ/);
    assert.equal(f.writes.length, 1);
});
test('artifact validation rejects tampering, wrong versions and paths before reading outside the release folder', () => {
    const f = registryFixture();
    const read = filename => Buffer.from(filename.replace('.tgz', ''));
    validateArtifacts(f.manifest, read);
    assert.throws(() => validateArtifacts(f.manifest, () => Buffer.from('tampered')), /Tarball changed/);
    f.manifest.packages[0].version = '1.0.0';
    assert.throws(() => validateArtifacts(f.manifest, read));
    f.manifest.packages[0].version = '2.0.0';
    f.manifest.packages[0].filename = '../outside.tgz';
    let reads = 0;
    assert.throws(() => validateArtifacts(f.manifest, () => { reads++; }));
    assert.equal(reads, 0);
});
function githubFixture() {
    const options = { version: '2.0.0', commit: 'a'.repeat(40), mode: 'create' };
    const state = { ref: null, release: null, writes: [], failRelease: false, tags: new Map() };
    const api = async (endpoint, method = 'GET', body) => {
        if (method === 'GET') {
            if (endpoint === 'git/ref/tags/v2.0.0') return state.ref;
            if (endpoint === 'releases/tags/v2.0.0') return state.release;
            if (endpoint.startsWith('git/tags/')) return state.tags.get(endpoint.slice(9));
        } else {
            state.writes.push({ endpoint, body });
            if (endpoint === 'git/refs') { state.ref = { object: { type: 'commit', sha: body.sha } }; return state.ref; }
            if (endpoint === 'releases') {
                if (state.failRelease) throw new Error('GitHub unavailable');
                state.release = { html_url: 'https://example.test/release' }; return state.release;
            }
        }
        throw new Error(`Unexpected API call ${method} ${endpoint}`);
    };
    return { options, state, api };
}
test('GitHub preflight never creates tags or releases', async () => {
    const f = githubFixture();
    await finalizeRelease({ ...f.options, mode: 'check' }, f.api);
    assert.deepEqual(f.state.writes, []);
});
test('GitHub release retry reuses a tag created before a release API failure', async () => {
    const f = githubFixture();
    f.state.failRelease = true;
    await assert.rejects(finalizeRelease(f.options, f.api), /GitHub unavailable/);
    assert.equal(f.state.ref.object.sha, f.options.commit);
    f.state.failRelease = false;
    await finalizeRelease(f.options, f.api);
    await finalizeRelease(f.options, f.api);
    assert.deepEqual(f.state.writes.map(w => w.endpoint), ['git/refs', 'releases', 'releases']);
    assert.equal(f.state.writes[0].body.ref, 'refs/tags/v2.0.0');
    assert.equal(f.state.writes[2].body.target_commitish, f.options.commit);
});
test('GitHub rejects conflicting tags, orphan releases and excessive annotated tag nesting', async () => {
    for (const scenario of ['conflict', 'orphan', 'cycle']) {
        const f = githubFixture();
        if (scenario === 'orphan') f.state.release = {};
        else if (scenario === 'conflict') f.state.ref = { object: { type: 'commit', sha: 'b'.repeat(40) } };
        else {
            f.state.ref = { object: { type: 'tag', sha: 'nested' } };
            f.state.tags.set('nested', f.state.ref);
        }
        await assert.rejects(finalizeRelease(f.options, f.api));
        assert.deepEqual(f.state.writes, []);
    }
});
test('GitHub accepts an annotated tag resolving to the tested commit', async () => {
    const f = githubFixture();
    f.state.ref = { object: { type: 'tag', sha: 'annotated' } };
    f.state.tags.set('annotated', { object: { type: 'commit', sha: f.options.commit } });
    await finalizeRelease(f.options, f.api);
    assert.deepEqual(f.state.writes.map(w => w.endpoint), ['releases']);
});
test('GitHub lookup failure does not create anything', async () => {
    const f = githubFixture();
    await assert.rejects(finalizeRelease(f.options, async () => { throw new Error('Forbidden'); }), /Forbidden/);
    assert.deepEqual(f.state.writes, []);
});
test('GitHub retry recognizes a release accepted before the response was lost', async () => {
    const f = githubFixture();
    await assert.rejects(finalizeRelease(f.options, async (...args) => {
        const result = await f.api(...args);
        if (args[0] === 'releases' && args[1] === 'POST') throw new Error('response lost');
        return result;
    }), /response lost/);
    await finalizeRelease(f.options, f.api);
    assert.deepEqual(f.state.writes.map(w => w.endpoint), ['git/refs', 'releases']);
});
test('GitHub tag creation failure prevents release creation', async () => {
    const f = githubFixture();
    await assert.rejects(finalizeRelease(f.options, async (...args) => {
        if (args[0] === 'git/refs') throw new Error('tag creation denied');
        return f.api(...args);
    }), /tag creation denied/);
    assert.equal(f.state.release, null);
    assert.deepEqual(f.state.writes, []);
});
