# Changelog

## 2.0.0

### Breaking changes

- All 30 libraries now publish ESM JavaScript and TypeScript declarations. Migrate consuming applications to ESM and use Node-aware TypeScript module resolution.
- Node.js 22 or newer is required. Node.js 18 and 20 are no longer supported.

### Build and release

- Pin TypeScript 5.9.3 and use its fixed `Node20` module mode.
- Fix interoperability with the existing CommonJS dependencies without changing external dependency versions.
- Fix declarations for strict TypeScript consumers and explicitly declare their Axios, AWS SDK, Express type and Azure Functions dependencies without upgrading their locked versions.
- Build unpublished internal dependencies through npm workspaces with one committed lockfile, while retaining Gradle entry points.
- Verify Linux on Node 22, 24 and 26, and Windows on Node 22, including tests and installation of all packed libraries.
- Publish manually through GitHub Actions and npm trusted publishing, with a dry-run option and verification before any package is published.
