# Media Cloud Microservices Architecture (MCMA)

This repository contains various libraries that assist in setting up media workflows in a multi-cloud environment. Example use cases of these libraries can be found in the [mcma-projects GitHub project](https://github.com/ebu/mcma-projects)


## Local verification

Requires Node.js 22 or newer. CI checks Linux on Node 22, 24, and 26, and Windows on Node 22.

Run from the repository root:

```sh
npm ci
npm run verify
```

The compiler is pinned to TypeScript 7.0.2. The repository is an npm workspace: the root lockfile covers all 30 libraries and their external dependencies. Internal MCMA dependencies resolve to the checked-out packages, including versions that have not been published yet. Run dependency installation from the repository root, not individual library folders.
Verification compiles the packages in dependency order and runs local tests. It replaces generated build output and the temporary consumer installation. It does not update lockfiles, publish packages, deploy services, or require cloud credentials. Node.js type definitions stay on the latest 22.x release to keep compilation aligned with the minimum supported runtime.

Logging tests cover current behavior, including serialization fallbacks and AWS output. Credential redaction is a separate change. Every library entry point is loaded in Node as ESM. All 30 release tarballs are installed in a temporary consumer using locked external dependencies, imported, and checked with TypeScript. These import checks do not exercise cloud operations or imply behavioral test coverage for every package.

Core/client/API behavior tests cover configuration and resource validation, date serialization, HTTP request signing and retries, discovered versus fallback authentication, routing, middleware, and API-key permissions. HTTP tests use an ephemeral loopback server and the real Axios transport; secrets are supplied by in-memory test doubles. The full verification runs these tests automatically on every CI matrix entry.

For a focused run after installing dependencies:

```sh
npm run build
npm run test:behavior
npm run test:coverage
```

The coverage command runs the same focused tests and reports executed lines, branches, and functions in the compiled `base/core`, `base/client`, and `base/api` JavaScript. It excludes test code and third-party dependencies. This is a baseline for these tests, not whole-repository coverage: the separate logging, ESM interop, and release tests are not included, and cloud operations still need integration validation. Rebuild after source changes so the tests and report use current output.

Verification uses standard GitHub-hosted runners with read-only repository permissions. No cloud secrets are configured. A local pass validates only the Node/OS combination used locally; the other combinations are verified by CI after pushing.

## Module format

The libraries produce ESM JavaScript and TypeScript declarations, using TypeScript's fixed `Node20` module mode and `"type": "module"` in each package. Supported runtimes remain Node.js 22 and newer. Relative imports and re-exports include explicit `.js` paths, including `/index.js` for directory entry points.

Consumers should use ESM imports, for example `import { ConsoleLogger } from "@mcma/core"`. TypeScript consumers should use a Node-aware module mode such as `Node20` or `NodeNext` (or a bundler-compatible configuration when bundling). This is a breaking module-format change; migrate and validate consuming applications before publishing a release. The repository's `.cjs` verification tooling remains CommonJS and runs independently of the published libraries.

## Preparing a release

For Azure Functions, `@mcma/azure-logger` now uses invocation-context logging without a mandatory telemetry SDK. See [Azure logger usage and migration](azure/logger/README.md) for invocation scoping, log-query changes, and the optional Application Insights SDK entry point.

Version 2.0.0 is the first ESM release. Node 18 and 20 are no longer supported.

For a future release, create a branch and update versions explicitly:

```sh
npm run release:version -- 2.0.1
```

This updates `gradle.properties`, all package versions and internal dependency ranges, and the workspace lock entries. Review and commit those changes. Builds never change versions automatically.

Run the complete local release preparation (Windows):

```powershell
.\gradlew.bat prepareRelease
```

On Linux use `bash ./gradlew prepareRelease`. This installs locked workspace dependencies, builds, runs tests, and creates and tests all tarballs under `build/release/`. The wrapper uses Gradle 9.8.1 with distribution checksum verification; Java 17 and Node 22+ are required. The equivalent npm sequence is `npm ci --ignore-scripts` followed by `npm run release:prepare`.

The Gradle subprojects remain available. Their `npmInstall` and `tsc` tasks delegate to the shared workspace installation and dependency-ordered build. `setVersion` is explicit (`gradlew setVersion -PreleaseVersion=2.0.1`). Public `npmPublish` delegates to the guarded release staging task and requires the GitHub release artifact; it no longer builds and publishes individual packages in an interleaved sequence. `npmPublishLocal` prepares and publishes the full package set to `http://localhost:4873` with tag `alpha`.

## Publishing through GitHub Actions

Merging a PR does not publish. Releases have three separate steps: stage, approve on npm, then finalize on GitHub.

1. In the npm settings of **each of the 30 packages**, configure a GitHub Actions trusted publisher: organization `ebu`, repository `mcma-libraries`, workflow filename `publish.yml`, no environment name. Leave **Allow npm publish** and **Allow npm dist-tag** unchecked; staging is always allowed. The root `package.json` lists the library workspaces.
2. Open **Actions > Stage release > Run workflow**, choose **main**. The version is read automatically from `gradle.properties` and shown in the job logs and run summary. Leave **Stage on npm** unchecked for a complete dry run. When ready, run it with staging checked.
3. All four Node/OS verification jobs must pass. GitHub then submits the tested Node 24 Linux tarballs to npm without rebuilding. Save the numeric workflow run ID shown in the staging job summary (also in the run URL after `/actions/runs/`).
4. On npm, review and approve each package using your npm account with publish access and 2FA. Check the package version and source commit against the workflow summary. The `npm-release` artifact contains the tested tarballs and `manifest.json` with their SHA-512 integrity values. Approve prerequisites first, following the summary's package order. Each approval makes that package public and updates `latest`; approving 30 packages is not atomic.
5. After all approvals, run **Actions > Finalize release** on **main** with the original staging run ID. The version is read from that run's artifact and shown in the logs and summary. This downloads that run's artifact, checks out its original commit, and verifies every published package's integrity and source commit. Only then does it create `vVERSION` and the GitHub release. Moving `main` after staging does not change the release's source commit.

No npm publishing token or GitHub environment is required. Only the staging job has OIDC permission; only the finalization job has repository write permission. Staging and finalization use Node 24 and npm 11.15.0. Existing build verification remains on npm 11.10.0. For optional local review/approval commands, npm staging requires Node 22.14.0+ and npm 11.15.0+; using the npm website does not require upgrading your local tools. See [npm staged publishing](https://docs.npmjs.com/staged-publishing/) and [trusted publishers](https://docs.npmjs.com/trusted-publishers/).

### Recovering an interrupted release

Use **Re-run failed jobs** on the original staging run to preserve its tested artifact and commit. Published versions are skipped only if their integrity and source commit match. GitHub's npm OIDC identity cannot list or inspect pending stages, so an existing pending stage or an ambiguous network failure stops the job. Review pending packages on npm and approve only those matching the original artifact, then retry. If a stage is incorrect, stop and investigate; the workflow never automatically rejects or overwrites it. A failure partway through may require approving the packages already staged before the remaining packages can be staged.

Finalization rejects dry runs, unsuccessful runs, other workflows/repositories/branches, missing approvals, mismatched artifacts, and conflicting tags. If you finalize too early, finish approvals, allow registry metadata to propagate, and rerun the failed finalization job. Registry/authentication errors are never treated as missing packages. Retrying finalization reuses an existing matching tag/release. Artifacts are retained for 30 days; complete or recover the release within that period. Do not start a fresh staging run for the same version to work around missing or conflicting artifacts.

After 2.0.0 is published, update Cloud Storage Service to the published packages and remove its temporary local MCMA integration. Its Gradle dependency-loading mechanism for application-local libraries remains separate from this repository's npm workspace.
