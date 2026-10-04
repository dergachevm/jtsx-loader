# Changelog


### Node.js compatibility — 2026-10-03

- Remove the upper engine cap: `>=20.16`, retaining the existing minimum and allowing Node.js 22 and later.
- Select `module.registerHooks()` by API availability; retain `module.register()` on older supported releases. Node.js 26 no longer invokes the deprecated API through the public `--import jtsx-loader` entry point.
- Share resolution and transformation between synchronous and asynchronous adapters, preserving the legacy `loader/loader.mjs` path, configuration, JSX/TSX behavior and `?reload` dependency identities.
- Await ESM configuration before installing synchronous hooks. Preserve factory selection and all rendering defaults.
- Add regression checks for deprecation-free registration, hook chaining/CommonJS delegation and legacy asynchronous exports. Node.js 26.10.0: 38/38 tests and independent tarball installation passed on Windows. The older-version matrix is recorded in PLAN.md.

### Fixed with legacy defaults preserved

- Preserve backslashes in `escapeHtml` instead of producing `&undefined;`; existing entity spellings remain unchanged.
- Return an empty string for a null fragment and omit `style=null` instead of throwing.
- Load file URLs ending in `.jsx` or `.tsx` with query/hash components, preserving module identity.
- Report compiler locations against the original source, account for an injected factory prefix and retain the original error cause. Option-validation errors are not mislabeled as template source lines.
- Warn with the config path and cause when an existing `jtsx.config.js` fails to load. Default fallback remains available; missing config files stay optional.

### Added through explicit opt-in

- `injectFactory: true | false | 'legacy'`. The default still uses the old `!esbuildTransformConfig` condition, preserving manual imports and custom factories.
- `escapeAttributes: true` for ordinary attribute values. The default is false. Custom parser fragments and string children remain raw; callbacks must escape values themselves.
- External `JTSX_STRICT_CONFIG=1` to reject a broken existing config instead of using defaults.
- `factory/asyncFactory.js`, selected through `importFactory`. It resolves nested components/arrays/Promises, preserves order and zero, omits null/undefined/boolean children and propagates nested failures to the outer await. It joins without implicit spaces. The original factory remains synchronous.

### Demo and verification

- Restrict static serving to styles and selected JSON files; use explicit page routes and completed 404/500 responses without exposing render error details.
- Use process restarts in development instead of an unconditional `?reload` import. Watch loader/factory/config and JSX/TSX changes.
- Write generated HTML only with `--write-html`.
- Opt the demo into attribute escaping and show explicit escaping of fetched text.
- Add regression/compatibility tests, HTTP and development-restart checks, plus an independent tarball installation check.
- The original Stage 1 aligned documentation with `>=20.16 <25` and was checked on Node.js 22.14.0/Windows. The October compatibility update above removes that upper bound.

### Compatibility limits

No version bump, publication or exports restriction is included. The supported-engine change only removes the upper bound. Legacy string children are still raw, nested async children still require explicit awaiting, and `?reload` still grows the ESM cache. New factory/escaping options do not automatically repair those behaviors for existing configurations. Full consumer-project and cross-platform validation is deferred to the next stage.
