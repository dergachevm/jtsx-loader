# jtsx-loader

**JSX and TSX in Node.js — without React.** Import templates as modules, compose ordinary functions, and reuse the same HTML factory and components in the browser. One approach for frontend and backend: SSR, static pages and client-side rendering.

The Node loader transforms JSX/TSX with esbuild when importing a template. For the browser, compile the same components into JavaScript with your bundler. Neither environment needs React or ReactDOM.

Install from [npm](https://www.npmjs.com/package/jtsx-loader). See [migration](#migration-from-0115) when updating an existing project.

## Requirements and installation

- Node.js `>=20.16`.
- ESM: `"type": "module"` in `package.json`.
- No React dependency. Express/Fastify are optional, separately installed integrations.

In an existing ESM project:

```sh
npm install jtsx-loader
```

## Quick start — no command-line flag

If you do not have a project yet, create one and enable ESM:

```sh
mkdir my-jtsx-app
cd my-jtsx-app
npm init -y
npm pkg set type=module
npm install jtsx-loader
```

If you already installed the package in an existing project, skip these commands. Create the following files in your project directory.

Create `Page.jsx`:

```jsx
const Badge = ({ children }) => <strong>{children}</strong>;

export default ({ title }) => <main>
    <h1>{title}</h1>
    <Badge>Ready</Badge>
</main>;
```

Create `app.js`:

```js
import 'jtsx-loader';

const { default: Page } = await import('./Page.jsx');
console.log(String(Page({ title: 'Hello JSX' })));
```

Run `node app.js`. The template renders to HTML using ordinary functions; React is not involved.

Importing the package root registers the loader. The registration must complete **before** importing templates. A static `import Page from './Page.jsx'` in the same entry file is linked too early, regardless of its position. `String(...)` converts the returned HTML value to a string.

## Additional registration and serialization APIs

The package also exports `raw` and `renderToString` from the package root and provides `register.js` for explicit registration.

To keep static imports in a server module, use a bootstrap:

```js
// bootstrap.js
import 'jtsx-loader/register.js';
await import('./server.js');
```

Then run `node bootstrap.js`. The original preload still works:

```sh
node --import jtsx-loader server.js
```

`jtsx-loader/runtime.js` exports the helpers without registering hooks. Use this path in configuration and tools that only need serialization. Do not import the package root from `jtsx.config.js`: registration is waiting for that configuration and would create a loading cycle.

## The same factory in the browser

Use `jtsx-loader/browser.js` for client-side JSX/TSX. It contains the same HTML serializer as the Node factory, without filesystem access, hook registration or Node polyfills. It exports `_jsx`, `_jsxFragment`, `_jsxUtils`, `raw`, `renderToString` and `createFactory(options)`.

Share a component between server and browser:

```jsx
// Counter.jsx — no React imports, no environment-specific code
export default ({ count }) => <p>Count: {count}</p>;
```

```jsx
// client.jsx
import { renderToString } from 'jtsx-loader/browser.js';
import Counter from './Counter.jsx';

const root = document.querySelector('#app');
let count = 0;
const render = () => { root.innerHTML = renderToString(<Counter count={count} />); };
document.querySelector('#increment').addEventListener('click', () => {
    count += 1;
    render();
});
render();
```

Build the client entry with esbuild (`npm install --save-dev esbuild`):

```js
// build-client.mjs
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

await build({
    entryPoints: ['client.jsx'],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2020',
    jsxFactory: '_jsx',
    jsxFragment: '_jsxFragment',
    inject: [fileURLToPath(import.meta.resolve('jtsx-loader/browser.js'))],
    outfile: 'dist/client.js',
});
```

Run `node build-client.mjs`, then serve your HTML and `dist/` over HTTP:

```html
<div id="app"></div>
<button id="increment">Add one</button>
<script type="module" src="./dist/client.js"></script>
```

In Node.js, import the same `Counter.jsx` after loader registration and call `renderToString(Counter({ count: 0 }))`. A [live client example](http://localhost:3001/ru#browser) and its [executable source](example/docs/examples/client.jsx) use the very same component for SSR and browser rendering.

Browsers do not parse JSX/TSX directly: esbuild transforms it **at build time** and is not included in the client bundle. Bundlers honoring the `browser` export condition also resolve the package root to the browser entry. The explicit `/browser.js` path works without relying on that condition. A browser import by bare package name requires a bundler or import map; it is not a CDN URL.

The factory generates HTML. Your code manages state, DOM insertion and events with normal browser APIs. It does not automatically hydrate, diff a virtual DOM or install JSX event handlers. Replacing `innerHTML` resets the replaced DOM and its focus; choose an appropriate DOM update strategy for larger interfaces. Shared components should keep Node-only and browser-only APIs in their respective entry files.

For custom client options, create a small injection module:

```js
import { createFactory } from 'jtsx-loader/browser.js';
export const { _jsx, _jsxFragment, _jsxUtils } = createFactory({ rewriteReactAttrs: true });
```

Point the bundler's `inject` to that module. The browser factory does not load `jtsx.config.js`. Await async component calls explicitly, or inject `jtsx-loader/browserAsync.js` to resolve nested async components automatically, then use `renderToString(await Page())`.

The existing `jtsx-loader/factory/jsxFactory.js` and `jtsx-loader/factory/asyncFactory.js` imports also select browser adapters when your bundler honors the browser export condition. Avoid importing Node loader paths from client code.

## Components, arrays and async rendering

Components are ordinary functions. Props are passed as data; they are escaped when serialized into a native tag. Components receive `children` as `[]`, one value or an array.

The default factory is synchronous. Await nested async calls explicitly:

```jsx
const Child = async () => <strong>Ready</strong>;
export default async () => <main>{await Child()}</main>;
```

Arrays flatten recursively without implicit spaces; use `{' '}` where needed. Fragments add no wrapper. Null, undefined and boolean children are omitted; zero and bigint remain. Convert arbitrary objects explicitly, for example with `JSON.stringify`.

To await nested components and Promise children automatically:

```js
// jtsx.config.js
export default {
    injectFactory: true,
    importFactory: "import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/asyncFactory.js';",
};
```

```jsx
const Child = async () => <strong>Ready</strong>;
export default () => <main><Child />{Promise.resolve(0)}</main>;
```

```js
try {
    const html = renderToString(await Page());
} catch (error) {
    // Includes nested component failures.
    console.error(error);
}
```

The async factory returns `Promise<Html>` in the new mode. Siblings resolve concurrently in source order. Attributes and `__raw`/`__escape` values are not automatically awaited; resolve those before passing them.

## Configuration and attributes

An optional `jtsx.config.js` is loaded from **process.cwd()**, not the template directory. See [the configuration example](jtsx.config.example.js).

| Key | Default / behavior |
| --- | --- |
| `escapeChildren` | `true`; `false` restores raw string children and string results |
| `escapeAttributes` | `true`; `false` restores unescaped ordinary attribute values |
| `importFactory` | Imports `_jsx`, `_jsxFragment`, `_jsxUtils` from `factory/jsxFactory.js` |
| `esbuildTransformConfig` | No custom options; properties override esbuild transform options |
| `injectFactory` | `'legacy'`: inject when `esbuildTransformConfig` is falsy; `true`: always; `false`: manual imports |
| `attributeParser` | `{}`; callbacks receive `(attribute, value)` by prefix |
| `disableAttrWarnings` | `false`; `true` suppresses React-style name warnings |
| `rewriteReactAttrs` | `false`; `true` rewrites React names; `className` always becomes `class` |

When configuring `esbuildTransformConfig`, set `injectFactory: true` or import the factory manually. Do not combine a manual import of the same names with forced injection.

```js
export default {
    injectFactory: true,
    esbuildTransformConfig: { minify: true },
};
```

A missing config is optional. A broken existing config warns and uses defaults. Set `JTSX_STRICT_CONFIG=1` outside the config to fail instead:

```powershell
$env:JTSX_STRICT_CONFIG = '1'
node app.js
```

Configurations can execute in separate Node contexts; avoid side effects and do not assume one evaluation per process.

Use native HTML attribute names directly in JSX/TSX, including `class`: `<div class="card">`. No `className` or extra configuration is needed, on either the server or the browser. `className` is also supported for compatibility and always becomes `class`.

`style` accepts a string or an object with native CSS names; `style={null}` is omitted. Attributes serialize `true` as `"true"`, omit `false`, serialize `null` as `"null"`, and render `undefined` as a bare attribute. Use strings for values such as `aria-expanded="false"`. Function-valued attributes are ignored with a warning; no browser listeners are installed.

Custom parsers return a **trusted HTML fragment** and must escape values themselves:

```js
import { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';

export default {
    attributeParser: {
        ac: (name, value) =>
            `data-${name.replaceAll(':', '-')}="${escapeHtml(value)}"`,
    },
};
```

Attribute names in this example come from template code. The returned fragment is never escaped again by the loader.

## HTTP and static output

With the bootstrap above, `server.js` can use static template imports:

```js
import express from 'express';
import Page from './Page.jsx';
import { renderToString } from 'jtsx-loader/runtime.js';

const app = express();
app.get('/', async (req, res, next) => {
    try {
        res.type('html').send(renderToString(await Page({ title: 'Hello' })));
    } catch (error) {
        next(error);
    }
});
app.listen(3000);
```

For Fastify: `reply.type('text/html').send(renderToString(await Page(props)))`. Handle render failures and complete 404/500 responses. Never send a JSX object directly to an HTTP framework, which may serialize it as JSON.

For a file: `await writeFile('page.html', renderToString(await Page(props)))`. Add `<!doctype html>` when producing a full document. The [documentation examples](example/docs/examples) contain a bootstrap, Express server and standalone static generator.

## Escaping and trusted HTML

```jsx
<p>{userText}</p>                 // Escaped text
<div>{raw(trustedHtml)}</div>      // Explicit HTML insertion
<p>{userText}{raw('<br>')}Next</p> // Mix text and HTML
<a title={userText}>Link</a>       // Escaped attribute value
```

- Ordinary string children and attribute values are escaped by default. Pass original, unescaped data.
- Native JSX tags and fragments produce immutable trusted HTML objects. Nested JSX keeps its identity and is not escaped again.
- `raw(value)` creates a trusted HTML object. It does **not** sanitize HTML. Use only trusted or independently sanitized content. Null/undefined become empty HTML; zero becomes `0`. Await Promises before calling it.
- `renderToString(value)` unwraps trusted HTML, escapes ordinary text, flattens arrays without separators and omits null/undefined/booleans. Numbers and bigint remain. Unsupported objects and unawaited Promises throw.
- Call `renderToString(await Page(props))` once at the output boundary. Avoid `String(child)`, string interpolation or `.join()` while composing JSX: those produce ordinary strings and lose the trusted marker.
- `raw()` in an ordinary attribute does **not** bypass attribute escaping.
- `__raw` and `__escape` remain available. Content order is children → `__raw` → `__escape`. Both retain zero in the new mode. Ordinary text no longer needs `__escape`.
- `escapeHtml` remains a low-level string helper from `jtsx-loader/factory/jsxUtils.js`, also available as `_jsxUtils.escapeHtml` in injected templates. Feeding its output back into ordinary children escapes it again.

Escaping is not a sanitizer, URL protocol validator, CSS validator or JavaScript serializer. Keep tag names, attribute names, event-handler strings and spread-prop structures trusted. Do not assume that `href="javascript:..."` becomes safe by escaping it.

For trusted inline script/style source, explicitly use `raw()`. HTML escaping alone is not appropriate JavaScript serialization. For JSON data in a script element, neutralize HTML end tags before raw insertion:

```jsx
import { raw } from 'jtsx-loader';

const Data = ({ value }) => <script type="application/json">
    {raw(JSON.stringify(value).replaceAll('<', '\u003c'))}
</script>;
```

This example expects a JSON-serializable value and emits data, not executable JavaScript.

## Migration from 0.1.15

You can update directly from 0.1.15; installing each intermediate version is unnecessary. There are two distinct API transitions:

### 0.1.15 → 0.1.16–0.1.18

These releases preserved raw string output and the synchronous factory by default. Existing `node --import jtsx-loader app.js`, deep imports, `jtsx.config.js`, and `?reload` remain supported.

- Node.js support changed from `>=20.16 <25` to `>=20.16`. Registration selects the available Node hook API automatically; no launch-command change is required.
- `injectFactory: 'legacy' | true | false` makes factory injection explicit. The default keeps the old rule: inject only without `esbuildTransformConfig`. If you set transform options, use `injectFactory: true` or keep your manual factory import; do not do both.
- `escapeAttributes: true` was opt-in. String children and ordinary attributes were still raw by default; `attributeParser` callbacks still own escaping of the attribute fragments they return.
- The optional `factory/asyncFactory.js` entry resolves nested async components, Promises and arrays, preserves order and zero, omits null/undefined/booleans and joins without implicit spaces. Select it through `importFactory`; the default factory does not automatically await nested children.
- Broken existing configuration now emits a warning. Set the external environment variable `JTSX_STRICT_CONFIG=1` to fail instead of using defaults. Missing config is still allowed.
- Fixes cover backslashes in `escapeHtml`, null fragments, `style={null}`, query/hash template imports and source locations in errors. Review snapshots that depended on those bugs.

### Migration from 0.1.18

The current API changes the defaults and JSX result type. These steps also apply when upgrading directly from **0.1.15**:

1. Convert final JSX results with `renderToString()` before sending/writing them.
2. Remove manual `escapeHtml()` around ordinary text/attributes to prevent double escaping.
3. Wrap intentional HTML strings with `raw()`.
4. Keep child JSX as objects during composition; avoid string concatenation and `.join()`.
5. Account for recursive arrays, no implicit spaces, omitted booleans and preserved zero.

Native tags and fragments now return immutable HTML objects instead of strings. The async factory returns `Promise<Html>`; await it before serialization. `renderToString()` escapes plain strings and rejects unresolved Promises and unsupported objects. Keep an explicit `{' '}` where a space is required.

```jsx
// 0.1.15–0.1.18: children are raw strings; native JSX returns a string.
const Page = ({ html }) => <main>{html}</main>;
res.type('html').send(await Page({ html: '<b>Hello</b>' }));
```

```jsx
// Current API: mark intentional HTML and serialize at the HTTP boundary.
// In server.js, start with node --import jtsx-loader server.js.
import { raw, renderToString } from 'jtsx-loader';
const Page = ({ html }) => <main>{raw(html)}</main>;
res.type('html').send(renderToString(await Page({ html: '<b>Hello</b>' })));
```

The two snippets above are alternatives. `raw()` does not sanitize HTML. `__raw` and `__escape` remain supported; ordinary text no longer needs `__escape`. Custom `attributeParser` output still requires manual escaping.

New entry points are additive: `register.js` registers from a JavaScript bootstrap before `await import('./server.js')`; `runtime.js` supplies `raw`/`renderToString` without registration (use it inside configuration). Browser components use `browser.js` or `browserAsync.js` with a bundler; configure them through `createFactory(options)` rather than the Node-only `jtsx.config.js`. Existing factory paths select browser adapters when the bundler honors the `browser` export condition.

For gradual migration, explicitly restore both old defaults:

```js
export default {
    escapeChildren: false,
    escapeAttributes: false,
};
```

Merge these two settings into your existing `jtsx.config.js`, preserving `importFactory`, `attributeParser` and other options. If you already enabled `escapeAttributes: true` in 0.1.16–0.1.18, keep it enabled; only `escapeChildren: false` is needed to retain string output.

In this mode, send returned HTML strings directly as before. `renderToString()` intentionally treats a plain string as text and would escape the entire legacy page. The synchronous legacy factory retains its original whitespace, falsy payload and component-return behavior. The async factory returns `Promise<string>` when `escapeChildren: false`.

**Совместимость:** это осознанное изменение defaults и типа результата. Старый режим сохранён настройками, но он не защищает пользовательский текст автоматически.

## Documentation site and development

```sh
npm install
npm start
npm run dev
npm run build
npm start -- --write-html
```

Open [English documentation](http://localhost:3001/) or [русскую документацию](http://localhost:3001/ru). The existing routes remain. The site includes navigation, content search, light/dark themes, code copying and server-side syntax highlighting; no CDN or external API is needed to render pages. The highlighter is a development dependency, not part of the loader runtime.

Executable examples are shared by both languages. `npm start` registers hooks from code without `--import`; `npm run dev` restarts the process on changes. `npm start -- --write-html` saves individual requested pages to `build/`.

### Build documentation and update the version

| Command | Result |
| --- | --- |
| `npm run build` | Build the complete English/Russian documentation with the current package version |
| `npm run patch` | Increment the patch version, then build (for example, `0.1.18` → `0.1.19`) |
| `npm run bump` | Increment the minor version, then build (for example, `0.1.18` → `0.2.0`) |

The version commands update both `package.json` and `package-lock.json` before building. Each build reads the version from `package.json` into both documentation pages. They do not create Git commits/tags or publish to npm. If compilation fails, the command exits with an error; the updated version remains in the package files, so fix the error and run `npm run build` without another increment.

The static output is `build/index.html`, `build/ru/index.html`, styles/icons, the documentation script and the compiled browser demo. Serve `build/` as the site root with directory index support (`/` and `/ru/`); no running documentation Node server is needed. The loader package itself runs from its JavaScript sources and needs no separate compilation.

### Refresh templates in a running Node process

Node caches imported modules. Editing a JSX file or refreshing a browser tab does not update modules already loaded by the server. To read an edited template without restarting Node, append `?reload` **to the path inside a dynamic import**:

```js
import { renderToString } from 'jtsx-loader';

export async function renderPage(props) {
    const { default: Page } = await import('./Page.jsx?reload');
    return renderToString(await Page(props));
}
```

The actual file remains `Page.jsx`. This is not a CLI flag or a browser URL parameter. Use `?reload` without a value. Each call to `renderPage` obtains a fresh template and its ESM dependencies, including nested JSX/TSX components and JS modules. Child imports need no extra parameter. Reusing an old `Page` variable keeps calling the old component.

For a runnable example, save [reload.js](example/docs/examples/reload.js) and [dev-server.js](example/docs/examples/dev-server.js) beside `Page.jsx` and `Counter.jsx` from the documentation quick start. Run `node dev-server.js`, open `http://localhost:3000/`, edit `Counter.jsx`, then refresh the page. The updated component renders without restarting the server.

`?reload` does not watch files, refresh the browser automatically or clear CommonJS `require.cache`. It creates new ESM instances without unloading old ones, and dependency initialization may run again. Use it for development, restart during long sessions, and use ordinary imports in production. Restart Node after changing `jtsx.config.js`.

Alternatively, restart your existing server when files change:

```sh
npm install --save-dev nodemon
npx nodemon --watch . --ext js,mjs,cjs,json,jsx,tsx --ignore dist/ --ignore build/ bootstrap.js
```

This uses the Express `bootstrap.js` example and needs no `?reload`. Refresh the browser after the server restarts. The repository's `npm run dev` script runs the documentation site; installing the package does not add that script to your project.

JSX/TSX is transpiled, not type-checked. Ordinary `.ts` files are delegated to Node; support depends on the Node version. Complete JSX namespace/prop typings are not yet shipped. No routing, client reactivity, hydration or streaming is provided.

## Verification

```sh
npm test
npm run test:compat
npm run test:package
```

Compatibility tests explicitly use the legacy settings. New escaping tests cover both factories, nested components, raw fragments and registration without a CLI preload. The package check installs an actual tarball into an isolated project. Publication and deployment are separate actions.
