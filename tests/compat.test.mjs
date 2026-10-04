import test from 'node:test';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

// Compatibility baseline: 0.1.15 / 71dd852.
// Do not regenerate these expectations from the implementation under test.
test('legacy HTML, whitespace, attributes and component result types', t => {
    expectSuccess(runFixture(t, { code: `
        import { _jsx as h, _jsxFragment as F, _jsxUtils } from 'jtsx-loader/factory/jsxFactory.js';
        import utils, { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';
        import { errorToObject, errorStackToArray } from 'jtsx-loader/factory/utils.js';
        import attributes from 'jtsx-loader/factory/possibleAttributes.js';
        assert.equal(typeof errorStackToArray, 'function');
        assert.equal(errorToObject(new Error('check')).message, 'check');
        assert.equal(attributes.className, 'class');
        assert.equal(utils.escapeHtml, escapeHtml);
        assert.equal(_jsxUtils.escapeHtml, escapeHtml);
        assert.equal(h('p', null, 'hello'), '<p>hello</p>');
        assert.equal(h('p', null, '<b>hello</b>'), '<p><b>hello</b></p>');
        assert.equal(h('p', null, h('b', null, 'A'), h('i', null, 'B')), '<p><b>A</b><i>B</i></p>');
        assert.equal(h('p', null, ['A', 'B']), '<p>A B</p>');
        assert.equal(h(F, null, 'A', 'B'), 'A B');
        assert.equal(h(F, null, false), false);
        assert.equal(h(F, null, undefined), undefined);
        assert.equal(h(F, null), '');
        assert.equal(h(F, null, [false, 'A']), 'false A');
        assert.equal(h('p', null, [['A', 'B'], ['C', false, 'D']]), '<p>A,B C,false,D</p>');
        assert.equal(h('p', { __escape: 0 }), '<p></p>');
        assert.equal(h('input', { disabled: true, required: false, id: undefined, title: null }), '<input disabled="true" id title="null"/>');
        assert.equal(h('div', { className: 'a', 'data-x': 'b', style: { color: 'red', '--gap': 0 } }), '<div class="a" data-x="b" style="color: red; --gap: 0;"></div>');
        assert.equal(h('p', { __raw: '<b>B</b>', __escape: '<i>C</i>' }, 'A'), '<p>A<b>B</b>&lt;i&gt;C&lt;&#x2F;i&gt;</p>');
        const props = p => p;
        assert.deepEqual(h(props, null), { children: [] });
        assert.deepEqual(h(props, { title: 'T' }, 'A'), { title: 'T', children: 'A' });
        assert.deepEqual(h(props, null, 'A', 'B'), { children: ['A', 'B'] });
        const promise = Promise.resolve('async');
        assert.equal(h(() => promise, null), promise);
        assert.equal(await promise, 'async');
        assert.equal(h('p', { title: '" onfocus="test' }), '<p title="" onfocus="test"></p>');
    ` }));
});

test('legacy config: custom attributes and opt-in React rewrites', t => {
    expectSuccess(runFixture(t, {
        config: `export default { rewriteReactAttrs: true, disableAttrWarnings: true,
            attributeParser: { ac: (name, value) => 'data-' + name.replace(':', '-') + '=' + value } };`,
        code: `
            import { _jsx as h } from 'jtsx-loader/factory/jsxFactory.js';
            assert.equal(h('label', { htmlFor: 'field', 'ac:test': 'value' }), '<label for="field" data-ac-test=value></label>');
        `,
    }));
});

test('public registration, JSX/TSX, aliases, JS/JSON/builtin imports and explicit await', t => {
    expectSuccess(runFixture(t, {
        files: {
            'package.json': JSON.stringify({ type: 'module', imports: { '#page': './Page.jsx' } }),
            'Page.jsx': `import Child from './Child.tsx'; import { n } from './helper.js';
                import data from './data.json' with { type: 'json' };
                import { basename } from 'node:path';
                export default async () => <p>{await Child({ value: n + data.n })}{basename('/x/file')}</p>;`,
            'Child.tsx': `export default async ({ value }: { value: number }) => <b>{value}</b>;`,
            'helper.js': 'export const n = 2;',
            'data.json': '{"n":3}',
        },
        code: `import Page from '#page'; assert.equal(await Page(), '<p><b>5</b>file</p>');`,
    }));
});

test('manual factory import and custom jsxFactory retain legacy injection policy', t => {
    for (const custom of [false, true]) {
        expectSuccess(runFixture(t, {
            config: `export default { esbuildTransformConfig: ${custom ? "{ jsxFactory: 'custom' }" : '{ minify: true }'} };`,
            files: { 'Page.jsx': custom
                ? `const custom = tag => 'custom:' + tag; export default () => <p/>;`
                : `import { _jsx } from 'jtsx-loader/factory/jsxFactory.js'; export default () => <p/>;` },
            code: `import Page from './Page.jsx'; assert.equal(Page(), ${JSON.stringify(custom ? 'custom:p' : '<p></p>')});`,
        }));
    }
});

test('?reload creates fresh modules and dependencies while normal imports stay shared', t => {
    expectSuccess(runFixture(t, {
        files: {
            'Page.jsx': `import { state } from './state.js'; export { state }; export default () => <p>{state.n}</p>;`,
            'state.js': `globalThis.loads = (globalThis.loads || 0) + 1; export const state = { n: globalThis.loads };`,
        },
        code: `
            const a = await import('./Page.jsx');
            assert.equal(a, await import('./Page.jsx'));
            const b = await import('./Page.jsx?reload');
            const c = await import('./Page.jsx?reload');
            assert.notEqual(b, c); assert.notEqual(b.state, c.state);
            assert.deepEqual([a.default(), b.default(), c.default()], ['<p>1</p>', '<p>2</p>', '<p>3</p>']);
        `,
    }));
});
