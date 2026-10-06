# Changelog

## Unreleased

- Expand the README migration guide to cover upgrades from 0.1.15, separating compatible 0.1.16–0.1.18 additions from the current rendering API changes.

- Use `npm install jtsx-loader` as the documented installation path. Include setup for a new project with `npm init -y` and ESM configuration, alongside installation in an existing project.

### Universal JSX without React

- Extract the existing HTML serializer into environment-independent `createFactory(options)`. Keep Node config loading in its adapter, preserving server and legacy behavior.
- Add `jtsx-loader/browser.js` and `browserAsync.js` without Node filesystem/hooks, top-level await, React or Node polyfills. Route root and existing sync/async factory package imports through browser export conditions while retaining their Node adapters.

### Breaking: escaped output by default

- Default `escapeChildren` and `escapeAttributes` to `true`. Ordinary text and attribute values are escaped; intentional HTML uses the new `raw(value)` helper. `raw()` is not an HTML sanitizer and does not bypass attribute escaping.
- Native tags/fragments return immutable trusted HTML objects instead of strings; nested JSX retains its markup identity, including across `?reload`. Use `renderToString(await Page(props))` at HTTP/file boundaries. It escapes plain strings and rejects unawaited Promises/unsupported objects.
- Normalize default children recursively without implicit spaces, omit null/undefined/booleans and preserve zero/bigint. `__raw` and `__escape` remain supported and preserve zero in the new mode.
- Both factories follow the new policy. The async factory returns `Promise<Html>`, resolves siblings concurrently and propagates nested errors.
- Preserve the old behavior with explicit `escapeChildren: false, escapeAttributes: false`. Compatibility tests keep the original expected strings under those settings. In legacy mode, send returned strings directly without `renderToString()`.

### Added

- Export `raw` and `renderToString` from the package root; add side-effect-free `runtime.js` for configuration and serialization tools.
- Add `register.js` for a source bootstrap: `import 'jtsx-loader/register.js'; await import('./server.js')`. Root imports also register the loader. The `--import jtsx-loader` path remains supported; registration is idempotent within a realm.
- Enable package self-imports with a root export and a wildcard preserving existing deep paths.

### Documentation

- Rewrite README and configuration examples for safe defaults, raw HTML, output boundaries, source registration, async rendering and migration from 0.1.18.

## 0.1.18 — 2026-10-05

- Update README and the configuration example to describe published features, configuration and async rendering.
- Remove outdated unreleased notices and compatibility commentary from the main guide; collect important rendering and runtime limitations at the end.
- Correct release status and remove broken documentation references.

## 0.1.16–0.1.17 — 2026-10-04

### Node.js compatibility

- Remove the upper engine cap: `>=20.16`, retaining the existing minimum and allowing Node.js 22 and later.
- Select `module.registerHooks()` by API availability; retain `module.register()` on older supported releases. Node.js 26 no longer invokes the deprecated API through the public `--import jtsx-loader` entry point.
- Share resolution and transformation between synchronous and asynchronous adapters, preserving the legacy `loader/loader.mjs` path, configuration, JSX/TSX behavior and `?reload` dependency identities.
- Await ESM configuration before installing synchronous hooks. Preserve factory selection and all rendering defaults.
- Add regression checks for deprecation-free registration, hook chaining/CommonJS delegation and legacy asynchronous exports. Node.js 26.10.0: 38/38 tests and independent tarball installation passed on Windows.

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

### Compatibility limits

The supported-engine change only removes the upper bound. With the default factory, string children are raw and nested async children require explicit awaiting. `?reload` grows the ESM cache. Attribute escaping and the async factory require explicit configuration. Full consumer-project and cross-platform validation has not been performed.
