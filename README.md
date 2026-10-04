# jtsx-loader

Import `.jsx` and `.tsx` files in Node.js and render HTML with ordinary functions. Templates are transpiled with esbuild; no browser runtime or hydration is added.

## Requirements

- Node.js `>=20.16`.
- ESM: `"type": "module"`.

## Quick start

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

The default factory returns an HTML string synchronously for a native tag. A function component returns its own result, which may be a Promise. **Await nested async components explicitly**, as in `await Child()` above, or select the [async factory](#async-factory) to await them automatically.

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

| Key | Default / behavior |
| --- | --- |
| `importFactory` | Imports `_jsx`, `_jsxFragment`, `_jsxUtils` from `jtsx-loader/factory/jsxFactory.js` |
| `esbuildTransformConfig` | No user options; properties override the loader's esbuild transform options |
| `injectFactory` | `'legacy'`: inject the factory import when `esbuildTransformConfig` is falsy. `true`: always inject. `false`: import manually in templates |
| `escapeAttributes` | `false`; set to `true` to escape ordinary attribute values |
| `attributeParser` | An empty object; callbacks receive `(attribute, value)` by attribute prefix |
| `disableAttrWarnings` | Warnings enabled; `true` silences React-style attribute warnings |
| `rewriteReactAttrs` | `false`; `true` rewrites React-style names to HTML names. `className` always becomes `class` |

For example, enable attribute escaping and minification:

```js
// jtsx.config.js
export default {
    injectFactory: true,
    escapeAttributes: true,
    esbuildTransformConfig: { minify: true },
};
```

Set `injectFactory: true` when supplying `esbuildTransformConfig`, including `{}`, unless templates import the factory themselves. Do not combine a manual import of the same names with `injectFactory: true`.

A missing config uses defaults. If an existing config fails to load, the loader warns with its path and cause, then uses defaults. Set `JTSX_STRICT_CONFIG=1` to fail instead. Set it outside the config, for example in PowerShell:

```powershell
$env:JTSX_STRICT_CONFIG = '1'
node --import jtsx-loader app.js
```

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

## Async factory

Select the async factory in your configuration:

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

The async factory's `_jsx` and `_jsxFragment` return `Promise<string>`. They resolve nested arrays and Promises concurrently while preserving their source order. Null, undefined and boolean children are omitted; numbers (including zero) and bigint values remain. Unsupported object children reject: convert them to text explicitly.

Arrays and fragments join without implicit spaces; add text spaces in your template when required. After resolution, function components receive `children` as `[]`, one value, or an array. `__raw=0` and `__escape=0` produce `0`; null/undefined payloads are absent and other scalar payloads are stringified. Promises in attributes are not awaited.

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

## Development checks

```sh
npm test
npm run test:compat
npm run test:package
```

`npm test` includes isolated runtime, HTTP and real nodemon restart checks. On Windows the test runner must be allowed to start and stop its own process tree. Temporary fixtures are removed after checks.

`test:package` separately runs a pack preview, creates a tarball and installs it into an independent temporary project. It checks public registration, both factories and installed esbuild without source links. It may need npm registry access.

See the [changelog](CHANGELOG.md) for release history.

## Important notes

- TSX is transpiled, not type-checked. Only `.jsx` and `.tsx` are transformed; ordinary `.ts` imports are delegated to Node.js.
- String children are raw HTML in both factories. Use `__escape` for untrusted text and enable `escapeAttributes` for ordinary attribute values; neither sanitizes HTML or validates URLs.
- With the default factory, arrays and fragments insert spaces between their items, and falsy `__raw` / `__escape` payloads are omitted. Use `__escape={String(value)}` when a numeric value may be zero. Content is rendered in this order: children, `__raw`, `__escape`.
- Ordinary attributes serialize `true` as `"true"`, omit `false`, serialize `null` as `"null"`, and render `undefined` as a bare attribute. `style={null}` is omitted. Function-valued attributes are ignored with a warning; browser event handlers are not installed.
- Configuration may execute in both loader and application contexts. Avoid side effects and do not assume a single evaluation. A missing config is optional even with `JTSX_STRICT_CONFIG=1`.
- Use `node --import jtsx-loader` for automatic Node.js hook selection. Direct registration of `jtsx-loader/loader/loader.mjs` uses the asynchronous API, which is deprecated in Node.js 26.
- `?reload` creates new ESM module identities, including for dependencies, without unloading old modules. Use process restarts in development and ordinary imports in long-running servers.
