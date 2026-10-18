const assert = require('node:assert/strict');
const fs = require('node:fs');
const { root } = require('./packages.cjs');
const path = require('node:path');
async function main() {
    const version = process.env.RELEASE_VERSION;
    assert.match(version || '', /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
    assert.equal(process.env.GITHUB_REPOSITORY, 'ebu/mcma-libraries');
    assert.equal(process.env.GITHUB_REF, 'refs/heads/main');
    assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch');
    const commit = process.env.RELEASE_COMMIT || process.env.GITHUB_SHA;
    assert.match(commit || '', /^[a-f0-9]{40}$/);
    assert.ok(fs.readFileSync(path.join(root, 'gradle.properties'), 'utf8').split(/\r?\n/).includes(`VERSION=${version}`));
    assert.ok(['check', 'create'].includes(process.argv[2]));
    async function api(endpoint, method = 'GET', body) {
        const response = await fetch(`https://api.github.com/repos/ebu/mcma-libraries/${endpoint}`, {
            method, headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json' }, body: body && JSON.stringify(body), signal: AbortSignal.timeout(30000)
        });
        if (response.status === 404 && method === 'GET') return null;
        if (!response.ok) throw new Error(`GitHub ${method} ${endpoint}: ${response.status} ${await response.text()}`);
        return response.json();
    }
    return finalizeRelease({ version, commit, mode: process.argv[2] }, api);
}
async function finalizeRelease({ version, commit, mode }, api) {
    const tag = `v${version}`;
    const ref = await api(`git/ref/tags/${tag}`);
    if (ref) {
        let object = ref.object;
        for (let depth = 0; object.type === 'tag' && depth < 5; depth++) object = (await api(`git/tags/${object.sha}`)).object;
        assert.equal(object.type, 'commit');
        assert.equal(object.sha, commit, `${tag} already refers to a different commit`);
    }
    const release = await api(`releases/tags/${tag}`);
    if (release) assert.ok(ref, 'A release exists without its expected tag');
    if (mode === 'check') return;
    if (!ref) await api('git/refs', 'POST', { ref: `refs/tags/${tag}`, sha: commit });
    if (!release) {
        const created = await api('releases', 'POST', { tag_name: tag, target_commitish: commit,
            name: tag, generate_release_notes: true,
            body: 'MCMA libraries now use ESM and require Node.js 22 or newer. This is a breaking module-format change.' });
        console.log(created.html_url);
    } else console.log(`Release already exists: ${release.html_url}`);
}
module.exports = { finalizeRelease };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
