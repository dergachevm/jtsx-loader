# jtsx-loader

Import `.jsx` and `.tsx` files in Node.js and render HTML with ordinary functions. Templates are transpiled with esbuild; no browser runtime or hydration is added.

**Release status:** the fixes and opt-in options described under **Unreleased** are implemented in this checkout. The package version remains `0.1.15`; this work has not published a new release. Installing the existing npm release does not provide these new features. See [CHANGELOG.md](CHANGELOG.md).

## Requirements

- Node.js `>=20.16`, matching `package.json#engines`; there is no upper version cap. Node.js 22 and newer are included without dropping previously supported 20.x releases.
- ESM: `"type": "module"`.
- The full suite has been checked on **Node.js 26.10.0 / Windows**, with loader/render compatibility checks on older releases (see [PLAN.md](PLAN.md)). Other operating systems and future Node.js releases have not been tested.

The unchanged `node --import jtsx-loader app.js` entry point selects `module.registerHooks()` when available (Node.js 22.15+ and 23.5+, including 24/26). These hooks are synchronous, as required by the API. Earlier supported versions, including Node.js 22.0–22.14, use the existing asynchronous `module.register()` path. This avoids Node.js 26's `DEP0205` warning without suppressing deprecations. See the [Node.js registration API](https://nodejs.org/api/module.html#moduleregisterhooksoptions).

The legacy `loader/loader.mjs` deep path remains available for applications registering asynchronous hooks themselves; switch those callers to `--import jtsx-loader` to get automatic API selection. Configuration is awaited before synchronous hooks are installed, so an ESM config may still use top-level await.

TSX is transpiled, not type-checked. The loader handles `.jsx` and `.tsx`; ordinary `.ts` imports are delegated to Node and are not made portable by this package.

## Quick start (legacy-compatible)

Install the loader:

```sh
npm install jtsx-loader
```

Set `"type": "module"` in your project's `package.json`. Create `Page.jsx`:

```jsx
const Child = async () => <strong>Ready</strong>;

export default async ({ message }) => <main>
    <h1 __escape={message}></h1>
    {await Child()}
</main>;
```

Create `app.js`:

```js
import Page from './Page.jsx';

console.log(await Page({ message: '<Hello>' }));
```

Run:

```sh
node --import jtsx-loader app.js
```

The default factory returns an HTML string synchronously for a native tag. A function component returns its own result, which may be a Promise. **Await nested async components explicitly**, as in `await Child()` above; legacy `<Child />` does not automatically wait for its Promise.

For Express SSR, install Express separately and use a fixed route:

```js
import express from 'express';
import Page from './Page.jsx';

const app = express();
app.get('/', async (req, res, next) => {
    try {
        res.type('html').send(await Page({ message: 'Hello' }));
    } catch (error) {
        next(error);
    }
});
app.listen(3000);
```

## Configuration

An optional `jtsx.config.js` is loaded from **the process working directory**, not from the template's directory. Export a configuration object. See the commented [configuration example](jtsx.config.example.js).

Existing keys remain available:

| Key | Default / behavior |
| --- | --- |
| `importFactory` | Imports `_jsx`, `_jsxFragment`, `_jsxUtils` from `jtsx-loader/factory/jsxFactory.js` |
| `esbuildTransformConfig` | No user options; properties override the loader's esbuild transform options |
| `attributeParser` | An empty object; callbacks receive `(attribute, value)` by attribute prefix |
| `disableAttrWarnings` | Warnings enabled; `true` silences React-style attribute warnings |
| `rewriteReactAttrs` | No general rewriting; `true` enables the existing attribute map. `className` always becomes `class` |

The following options are **Unreleased** and opt-in:

| Option | Without opt-in | Explicit mode |
| --- | --- | --- |
| `injectFactory` | `'legacy'`: inject only when `!esbuildTransformConfig` | `true`: always inject; `false`: leave imports to the template |
| `escapeAttributes` | `false`: legacy attribute values | `true`: escape ordinary attribute values |
| `JTSX_STRICT_CONFIG` environment variable | Warn and use defaults when an existing config cannot load | `1`: fail with the original cause |

For example, opt into attribute escaping and use minification without losing the factory import:

```js
// jtsx.config.js — Unreleased
export default {
    injectFactory: true,
    escapeAttributes: true,
    esbuildTransformConfig: { minify: true },
};
```

With `injectFactory` omitted, even `esbuildTransformConfig: {}` still disables injection, preserving the previous behavior. Projects that already import the factory manually can keep their existing configuration or set `injectFactory: false`. Do not combine a manual import of the same names with `injectFactory: true`.

A missing config remains optional in strict mode. A syntax error, a thrown error, or a missing dependency of an existing config is reported with its path and cause. Set the environment variable outside the config, for example in PowerShell:

```powershell
$env:JTSX_STRICT_CONFIG = '1'
node --import jtsx-loader app.js
```

Configuration may execute in both the loader's context and the application's context. Keep it free of side effects; do not assume one evaluation or one warning per process.

## Escaping and trusted HTML

**Both factories treat string children and `__raw` as raw HTML.** Use `__escape` for untrusted text:

```jsx
<p __escape={userText}></p>
```

Or import `escapeHtml` from `jtsx-loader/factory/jsxUtils.js` and explicitly escape a text value. The helper is also available as `_jsxUtils.escapeHtml` in an injected template.

With `escapeAttributes: true`, pass ordinary, unescaped values:

```jsx
<a title={userText} href="/about">About</a>
```

Pre-escaping these attribute values would escape them twice. This setting does not validate URL protocols, sanitize HTML, or serialize JavaScript safely inside `script`. Avoid placing untrusted values into raw script strings.

Custom parsers return a **trusted HTML fragment**, so they must escape their own values:

```js
import { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';

export default {
    escapeAttributes: true,
    attributeParser: {
        ac: (attribute, value) =>
            `data-${attribute.replaceAll(':', '-')}="${escapeHtml(value)}"`,
    },
};
```

Here the attribute name comes from template code. The callback's complete returned fragment is never escaped by the loader.

## Async factory (Unreleased, opt-in)

Select the new factory explicitly:

```js
// jtsx.config.js
export default {
    injectFactory: true,
    escapeAttributes: true,
    importFactory: "import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/asyncFactory.js';",
};
```

Nested async components can then use normal JSX:

```jsx
const Child = async () => <strong>Ready</strong>;
export default () => <main><Child />{Promise.resolve(0)}</main>;
```

```js
import Page from './Page.jsx';

try {
    console.log(await Page()); // <main><strong>Ready</strong>0</main>
} catch (error) {
    // Includes rejected nested components and children.
    console.error(error);
}
```

The new factory's `_jsx` and `_jsxFragment` return `Promise<string>`. They resolve nested arrays and Promises concurrently while preserving their source order. Null, undefined and boolean children are omitted; numbers (including zero) and bigint values remain. Unsupported object children reject: convert them to text explicitly.

Arrays and fragments join without implicit spaces; add text spaces in your template when required. After resolution, function components receive `children` as `[]`, one value, or an array. `__raw=0` and `__escape=0` produce `0`; null/undefined payloads are absent and other scalar payloads are stringified. Promises in attributes are not awaited.

## Preserved legacy behavior

Updating the library does not select the async factory or enable attribute escaping. Public deep paths and the synchronous factory API remain available.

- Arrays and fragments retain their old spaces and value rules.
- A lone `false` fragment still returns `false`; `__escape=0` still produces no content. Use `__escape={String(value)}` for legacy numeric text.
- Ordinary attributes keep the previous boolean/null/undefined rules, even with attribute escaping: `true` is quoted, `false` omitted, `null` becomes `"null"`, and `undefined` gives a bare attribute.
- Children are followed by `__raw`, then `__escape`.
- Only the narrow repairs listed in the changelog alter default behavior: null fragments, null styles, backslashes, file URL hashes and diagnostics.

The existing `?reload` import mechanism and dependency propagation remain available for compatibility. It creates new ESM module identities; it does **not** unload old modules or bound their memory use. Use process restarts during development and ordinary imports for a long-running server.

## Run this repository's demo

```sh
npm install
npm start
npm run dev
```

Run either start or dev from the repository root. The demo listens on port 3001 (`PORT` overrides it). Routes are `/`, `/ru` and `/test`. Public assets are `/styles/*`, `/api/200.json` and `/api/401.json`; server code and templates are not served.

The demo opts into attribute escaping. Requests normally write no files. To save rendered pages into `build/` under the working directory:

```sh
npm start -- --write-html
```

Development uses nodemon to restart on changes to loader, factory, templates and configuration, including JSX/TSX. Consumers using nodemon should install it as a dev dependency and explicitly include `jsx,tsx` in its extensions; see [nodemon.json](nodemon.json). CSS is served from disk and needs a browser refresh.

## Verification and project work

```sh
npm test
npm run test:compat
npm run test:package
```

`npm test` includes isolated runtime, HTTP and real nodemon restart checks. On Windows the test runner must be allowed to start and stop its own process tree. Temporary fixtures are removed after checks.

`test:package` separately runs a pack preview, creates a tarball and installs it into an independent temporary project. It checks public registration, both factories and installed esbuild without source links. It may need npm registry access.

👉 [https://jtsx.ancros.dev](https://jtsx.ancros.dev)
