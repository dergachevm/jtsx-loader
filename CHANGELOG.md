# Changelog

## Unreleased

- Use `npm install jtsx-loader` as the documented installation path. Keep the quick start compatible with the published 0.1.18 release and distinguish upcoming APIs.

### Universal JSX without React

- Make JSX/TSX imports in Node.js and shared frontend/backend components the main documentation focus. Move escaping to the API reference rather than presenting it as the product's headline.
- Extract the existing HTML serializer into environment-independent `createFactory(options)`. Keep Node config loading in its adapter, preserving server and legacy behavior.
- Add `jtsx-loader/browser.js` and `browserAsync.js` without Node filesystem/hooks, top-level await, React or Node polyfills. Route root and existing sync/async factory package imports through browser export conditions while retaining their Node adapters.
- Document a complete esbuild client setup and explicit factory configuration. Add a live counter rendered from the same JSX component on the server and in the browser.

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
- Start the documentation demo from JavaScript without a CLI preload.

### Documentation

- Rewrite README and configuration examples for safe defaults, raw HTML, output boundaries, source registration, async rendering and migration from 0.1.18.
- Replace outdated English/Russian demo pages with a shared 12-section documentation site on the existing `/` and `/ru` routes. Add responsive navigation, content search, light/dark themes, accessible controls and code copying.
- Add server-side Shiki syntax highlighting for JSX/TSX, JS/TS, JSON, HTML, CSS, Bash and PowerShell, with a plain-text fallback. Shiki is development-only; the runtime still depends only on esbuild.
- Share executable examples across translations; test source preservation, JSON script escaping, no-flag startup and static generation. Mark the new API as Unreleased, distinct from npm 0.1.18.

No version bump, npm publication or website deployment in this change.

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

### Demo and verification

- Restrict static serving to styles and selected JSON files; use explicit page routes and completed 404/500 responses without exposing render error details.
- Use process restarts in development instead of an unconditional `?reload` import. Watch loader/factory/config and JSX/TSX changes.
- Write generated HTML only with `--write-html`.
- Opt the demo into attribute escaping and show explicit escaping of fetched text.
- Add regression/compatibility tests, HTTP and development-restart checks, plus an independent tarball installation check.

### Compatibility limits

The supported-engine change only removes the upper bound. With the default factory, string children are raw and nested async children require explicit awaiting. `?reload` grows the ESM cache. Attribute escaping and the async factory require explicit configuration. Full consumer-project and cross-platform validation has not been performed.
