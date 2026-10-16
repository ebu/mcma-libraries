const { spawnSync } = require('node:child_process');
const { root } = require('./packages.cjs');
const coverage = process.argv.includes('--coverage');
const args = ['--test', '--test-timeout=15000'];
if (coverage) args.push('--experimental-test-coverage',
    '--test-coverage-include=base/core/dist/**',
    '--test-coverage-include=base/client/dist/**',
    '--test-coverage-include=base/api/dist/**');
args.push('scripts/behavior/core.test.mjs', 'scripts/behavior/client.test.mjs', 'scripts/behavior/api.test.mjs');
const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
