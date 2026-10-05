# jtsx-loader

JSX and TSX templates for Node.js. Render HTML with ordinary functions, without React, hydration or a browser runtime. Transpiled with esbuild.

> **Unreleased / breaking change.** This checkout escapes text and ordinary attribute values by default, adds `raw()` and returns trusted JSX objects. Published `0.1.18` does not contain these changes. The package version has not been bumped. See [migration](#migration-from-0118) before updating.
>
> **Важно:** новый API ещё не опубликован. Готовую JSX-разметку преобразуйте в строку через `renderToString()` перед HTTP-ответом или записью в файл. Обычные строки теперь считаются текстом.

## Requirements and installation

- Node.js `>=20.16`.
- ESM: `"type": "module"` in `package.json`.
- No React dependency. Express/Fastify are optional, separately installed integrations.

For the existing released API: `npm install jtsx-loader@0.1.18`. To use the **new API in this README**, install a local build:

```sh
# In this checkout:
npm install
npm pack

# In your consumer project (replace the path):
npm install /path/to/jtsx-loader-0.1.18.tgz
```

The tarball still carries version `0.1.18`; it is a local preview, not a new published release.

## Quick start — no command-line flag

Create `Page.jsx`:

```jsx
import { raw } from 'jtsx-loader';

const Badge = ({ children }) => <strong>{children}</strong>;

export default ({ title }) => <main>
    <h1>{title}</h1>
    <Badge>Ready</Badge>
    <p>{raw('<em>Trusted HTML</em>')}</p>
</main>;
```

Create `app.js`:

```js
import { renderToString } from 'jtsx-loader';

const { default: Page } = await import('./Page.jsx');
console.log(renderToString(Page({ title: '<Hello>' })));
```

Run `node app.js`. The heading contains literal `<Hello>` text, and the trusted fragment renders as an `em` element.

Importing the package root registers the loader and exports `raw` and `renderToString`. The registration must complete **before** importing templates. A static `import Page from './Page.jsx'` in the same entry file is linked too early, regardless of its position.

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

Native HTML attribute names are preferred. `style` accepts a string or an object with native CSS names; `style={null}` is omitted. Attributes serialize `true` as `"true"`, omit `false`, serialize `null` as `"null"`, and render `undefined` as a bare attribute. Use strings for values such as `aria-expanded="false"`. Function-valued attributes are ignored with a warning; no browser listeners are installed.

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

## Migration from 0.1.18

1. Convert final JSX results with `renderToString()` before sending/writing them.
2. Remove manual `escapeHtml()` around ordinary text/attributes to prevent double escaping.
3. Wrap intentional HTML strings with `raw()`.
4. Keep child JSX as objects during composition; avoid string concatenation and `.join()`.
5. Account for recursive arrays, no implicit spaces, omitted booleans and preserved zero.

For gradual migration, explicitly restore both old defaults:

```js
export default {
    escapeChildren: false,
    escapeAttributes: false,
};
```

In this mode, send returned HTML strings directly as before. `renderToString()` intentionally treats a plain string as text and would escape the entire legacy page. The synchronous legacy factory retains its original whitespace, falsy payload and component-return behavior. The async factory returns `Promise<string>` when `escapeChildren: false`.

**Совместимость:** это осознанное изменение defaults и типа результата. Старый режим сохранён настройками, но он не защищает пользовательский текст автоматически.

## Documentation site and development

```sh
npm install
npm start
npm run dev
npm start -- --write-html
```

Open [English documentation](http://localhost:3001/) or [русскую документацию](http://localhost:3001/ru). The existing routes remain. The site includes navigation, content search, light/dark themes, code copying and server-side [Shiki highlighting](https://shiki.style/guide/install); no CDN or external API is needed to render pages. Shiki is a **dev dependency**, not part of the loader runtime.

Executable examples are shared by both languages. `npm start` registers hooks from code without `--import`; `npm run dev` restarts the process on changes. Requested pages are only saved to `build/` with `--write-html`.

`?reload` creates fresh ESM identities for templates and dependencies. It does **not** unload modules or bound memory. Prefer process restarts during development and ordinary imports in production.

JSX/TSX is transpiled, not type-checked. Ordinary `.ts` files are delegated to Node; support depends on the Node version. Complete JSX namespace/prop typings are not yet shipped. No routing, client reactivity, hydration or streaming is provided.

## Verification

```sh
npm test
npm run test:compat
npm run test:package
```

Compatibility tests explicitly use the legacy settings. New escaping tests cover both factories, nested components, raw fragments and registration without a CLI preload. The package check installs an actual tarball into an isolated project. Publication and deployment are separate actions.
