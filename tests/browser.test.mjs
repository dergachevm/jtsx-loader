import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { createFactory, renderToString } from '../browser.js';

test('client factory options are explicit and isolated from Node config', () => {
    const normal = createFactory();
    const legacy = createFactory({ escapeChildren: false });
    assert.equal(
        renderToString(normal._jsx('p', null, '<b>x</b>')),
        '<p>&lt;b&gt;x&lt;&#x2F;b&gt;</p>',
    );
    assert.equal(legacy._jsx('p', null, '<b>x</b>'), '<p><b>x</b></p>');
    assert.equal(
        renderToString(normal._jsx('p', { 'ac:x': 'value' })),
        '<p ac:x="value"></p>',
    );
});

test('browser bundle renders JSX/TSX without React, Node globals or polyfills', async () => {
    const result = await build({
        stdin: {
            contents: `import { raw, renderToString } from 'jtsx-loader';
                const Card = ({ title }: { title: string }) => <article><h2>{title}</h2></article>;
                globalThis.rendered = renderToString(<><Card title="<hello>" />{raw('<b>ok</b>')}</>);`,
            loader: 'tsx',
            resolveDir: fileURLToPath(new URL('../', import.meta.url)),
        },
        bundle: true,
        platform: 'browser',
        format: 'iife',
        target: 'es2020',
        jsxFactory: '_jsx',
        jsxFragment: '_jsxFragment',
        inject: [fileURLToPath(new URL('../browser.js', import.meta.url))],
        write: false,
        metafile: true,
    });
    assert.ok(
        Object.keys(result.metafile.inputs).every(
            (path) => !/loader\/|node_modules\/react/.test(path),
        ),
    );
    const context = vm.createContext({});
    vm.runInContext(result.outputFiles[0].text, context);
    assert.equal(
        context.rendered,
        '<article><h2>&lt;hello&gt;</h2></article><b>ok</b>',
    );
});

test('existing sync and async factory imports resolve to browser-safe adapters', async () => {
    const result = await build({
        stdin: {
            contents: `import { _jsx as h } from 'jtsx-loader/factory/jsxFactory.js';
                import { _jsx as asyncH } from 'jtsx-loader/factory/asyncFactory.js';
                import { renderToString } from 'jtsx-loader';
                globalThis.result = asyncH('p', null, h('b', null, '<x>'), Promise.resolve('ok')).then(renderToString);`,
            resolveDir: fileURLToPath(new URL('../', import.meta.url)),
        },
        bundle: true,
        platform: 'browser',
        format: 'iife',
        target: 'es2020',
        write: false,
        metafile: true,
    });
    assert.ok(
        Object.keys(result.metafile.inputs).every(
            (path) => !/loader\//.test(path),
        ),
    );
    const context = vm.createContext({});
    vm.runInContext(result.outputFiles[0].text, context);
    assert.equal(await context.result, '<p><b>&lt;x&gt;</b>ok</p>');
});
