# Media Cloud Microservices Architecture (MCMA)

This repository contains various libraries that assist in setting up media workflows in a multi-cloud environment. Example use cases of these libraries can be found in the [mcma-projects GitHub project](https://github.com/ebu/mcma-projects)


## Local verification

Requires Node.js 22 or newer. CI checks Linux on Node 22, 24, and 26, and Windows on Node 22.

Run from the repository root:

```sh
npm ci
npm run verify
```

The compiler is pinned to TypeScript 5.9.3. Run root `npm ci` before using Gradle too; Gradle uses the same local compiler.
Verification reinstalls package dependencies with `npm ci`, compiles the packages, and runs local tests. It replaces generated build output and installed copies of local packages. It does not update lockfiles, publish packages, deploy services, or require cloud credentials. Runtime dependency versions are unchanged by the ESM conversion.

Logging tests cover current behavior, including serialization fallbacks and AWS output. Credential redaction is a separate change. Every library entry point is loaded in Node as ESM. A packed core package is imported and its declarations are compiled from a temporary ESM consumer. These import checks do not exercise cloud operations or imply behavioral test coverage for every package.

GitHub Actions uses standard hosted runners with read-only repository permissions. No cloud secrets are configured. A local pass validates only the Node/OS combination used locally; the other combinations are verified by CI after pushing.

## Module format

The libraries produce ESM JavaScript and TypeScript declarations, using TypeScript's fixed `Node20` module mode and `"type": "module"` in each package. Supported runtimes remain Node.js 22 and newer. Relative imports and re-exports include explicit `.js` paths, including `/index.js` for directory entry points.

Consumers should use ESM imports, for example `import { ConsoleLogger } from "@mcma/core"`. TypeScript consumers should use a Node-aware module mode such as `Node20` or `NodeNext` (or a bundler-compatible configuration when bundling). This is a breaking module-format change; migrate and validate consuming applications before publishing a release. The repository's `.cjs` verification tooling remains CommonJS and runs independently of the published libraries.
