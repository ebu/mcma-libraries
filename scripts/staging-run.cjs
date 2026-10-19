const assert = require('node:assert/strict');
const fs = require('node:fs');

function validateStagingRun(run, jobs) {
    assert.equal(run.repository?.full_name, 'ebu/mcma-libraries');
    assert.equal(run.head_repository?.full_name, 'ebu/mcma-libraries');
    assert.equal(run.path, '.github/workflows/publish.yml');
    assert.equal(run.event, 'workflow_dispatch');
    assert.equal(run.head_branch, 'main');
    assert.equal(run.status, 'completed');
    assert.equal(run.conclusion, 'success');
    assert.match(run.head_sha || '', /^[a-f0-9]{40}$/);
    // Older workflow runs used the job ID as their display name.
    assert.ok(jobs.some(job => (job.name === 'stage' || /^Stage (0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(job.name)) && job.conclusion === 'success'),
        'Select a successful staging run, not a dry run');
    return run.head_sha;
}

async function main() {
    assert.equal(process.env.GITHUB_REPOSITORY, 'ebu/mcma-libraries');
    assert.equal(process.env.GITHUB_REF, 'refs/heads/main');
    assert.equal(process.env.GITHUB_EVENT_NAME, 'workflow_dispatch');
    const runId = process.env.STAGING_RUN_ID;
    assert.match(runId || '', /^[1-9]\d*$/, 'Enter the numeric staging workflow run ID');
    async function get(endpoint) {
        const response = await fetch(`https://api.github.com/repos/ebu/mcma-libraries/actions/runs/${runId}${endpoint}`, {
            headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json' },
            signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) throw new Error(`Cannot read staging run: ${response.status}`);
        return response.json();
    }
    const run = await get('');
    // Include earlier attempts: a retry may only have rerun a failed staging job.
    const jobs = await get('/jobs?filter=all&per_page=100');
    assert.ok(jobs.total_count <= 100, 'Too many job attempts; inspect this run manually');
    const commit = validateStagingRun(run, jobs.jobs);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `commit=${commit}\n`);
}

module.exports = { validateStagingRun };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
