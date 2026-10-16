# Media Cloud Microservices Architecture (MCMA)

This repository contains various libraries that assist in setting up media workflows in a multi-cloud environment. Example use cases of these libraries can be found in the [mcma-projects GitHub project](https://github.com/ebu/mcma-projects)


## Local verification

Requires Node.js 22 or newer. CI checks Linux on Node 22, 24, and 26, and Windows on Node 22.

Run from the repository root:

```sh
npm ci
npm run verify
```

The compiler is pinned to TypeScript 5.9.3. The repository is an npm workspace: the root lockfile covers all 30 libraries and their external dependencies. Internal MCMA dependencies resolve to the checked-out packages, including versions that have not been published yet. Run dependency installation from the repository root, not individual library folders.
Verification compiles the packages in dependency order and runs local tests. It replaces generated build output and the temporary consumer installation. It does not update lockfiles, publish packages, deploy services, or require cloud credentials. The lockfile consolidation preserves the previously locked external dependency versions.

Logging tests cover current behavior, including serialization fallbacks and AWS output. Credential redaction is a separate change. Every library entry point is loaded in Node as ESM. All 30 release tarballs are installed in a temporary consumer using locked external dependencies, imported, and checked with TypeScript. These import checks do not exercise cloud operations or imply behavioral test coverage for every package.

Verification uses standard GitHub-hosted runners with read-only repository permissions. No cloud secrets are configured. A local pass validates only the Node/OS combination used locally; the other combinations are verified by CI after pushing.

## Module format

The libraries produce ESM JavaScript and TypeScript declarations, using TypeScript's fixed `Node20` module mode and `"type": "module"` in each package. Supported runtimes remain Node.js 22 and newer. Relative imports and re-exports include explicit `.js` paths, including `/index.js` for directory entry points.

Consumers should use ESM imports, for example `import { ConsoleLogger } from "@mcma/core"`. TypeScript consumers should use a Node-aware module mode such as `Node20` or `NodeNext` (or a bundler-compatible configuration when bundling). This is a breaking module-format change; migrate and validate consuming applications before publishing a release. The repository's `.cjs` verification tooling remains CommonJS and runs independently of the published libraries.

## Preparing a release

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

On Linux use `bash ./gradlew prepareRelease`. This installs locked workspace dependencies, builds, runs tests, and creates and tests all tarballs under `build/release/`. It requires Java 17 and Node 22+. The equivalent npm sequence is `npm ci --ignore-scripts` followed by `npm run release:prepare`.

The Gradle subprojects remain available. Their `npmInstall` and `tsc` tasks delegate to the shared workspace installation and dependency-ordered build. `setVersion` is explicit (`gradlew setVersion -PreleaseVersion=2.0.1`). Public `npmPublish` delegates to the guarded release publisher and requires the GitHub release artifact; it no longer builds and publishes individual packages in an interleaved sequence. `npmPublishLocal` prepares and publishes the full package set to `http://localhost:4873` with tag `alpha`.

## Publishing through GitHub Actions

Merging a PR does not publish. After merging the release preparation PR:

1. Open **Actions → Publish release → Run workflow**, choose **main**, and enter the committed version. Leave **Publish to npm** unchecked for a complete dry run.
2. Configure a GitHub Actions trusted publisher in the npm settings of **each of the 30 packages**: organization `ebu`, repository `mcma-libraries`, workflow filename `publish.yml`, no environment name. Allow direct `npm publish`; dist-tag management permission is not needed. Use the package list in root `package.json` to find all libraries.
3. Run the workflow again with the same committed version and **Publish to npm** checked.

Configure npm shortly before the first real publish: a new, unvalidated trust configuration expires after 48 hours. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/). No npm publishing token is required. The publisher uses Node 24 and npm 11.10.0, which meet npm's OIDC requirements.

All four Node/OS combinations must pass before publishing starts. The Node 24 Linux tarballs are retained as a workflow artifact and published without rebuilding. Only the publish job can request an OIDC identity. A separate job creates `vVERSION` and a GitHub release at the tested commit after every package succeeds; only this final job has repository write permission.

Publishing 30 packages is not atomic: packages become available on npm one at a time, with `latest` updated as each is published. If a run fails partway through, use **Re-run failed jobs** on that same run. Existing versions are accepted only when their tarball integrity and source commit match the tested artifact. Registry/authentication failures are errors, not treated as unpublished packages. Visibility polling is bounded. A conflicting existing version or tag requires investigation; do not delete or overwrite it. Artifacts are retained for 30 days, so resume interrupted releases within that period.

After 2.0.0 is published, update Cloud Storage Service to the published packages and remove its temporary local MCMA integration. Its Gradle dependency-loading mechanism for application-local libraries remains separate from this repository's npm workspace.
