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
Verification reinstalls package dependencies with `npm ci`, compiles the packages, and runs local tests. It replaces generated build output and installed copies of local packages. It does not update lockfiles, publish packages, deploy services, or require cloud credentials. Runtime dependencies and CommonJS output are retained.

Logging tests cover current behavior, including serialization fallbacks and AWS output. Credential redaction is a separate change. A packed core package is loaded and its declarations are compiled from a temporary consumer. Packages without behavioral tests receive compilation checks, not an implied test-coverage guarantee.

GitHub Actions uses standard hosted runners with read-only repository permissions. No cloud secrets are configured. A local pass validates only the Node/OS combination used locally; the other combinations are verified by CI after pushing.
