import test from 'node:test';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

test('legacy attribute warning does not rewrite without opt-in', t => {
    expectSuccess(runFixture(t, { code: `
        import { _jsx } from 'jtsx-loader/factory/jsxFactory.js';
        const warnings = [];
        console.warn = message => warnings.push(message);
        assert.equal(_jsx('label', { htmlFor: 'x' }), '<label htmlFor="x"></label>');
        assert.equal(warnings.length, 1);
    ` }));
});

test('escapeHtml preserves backslashes and existing entity spellings', t => {
    expectSuccess(runFixture(t, { code: `
        import { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';
        const slash = String.fromCharCode(92);
        assert.equal(escapeHtml('C:' + slash + 'temp' + slash + 'file'), 'C:' + slash + 'temp' + slash + 'file');
        assert.equal(escapeHtml('&<>' + String.fromCharCode(34, 39, 47)), '&amp;&lt;&gt;&quot;&#39;&#x2F;');
    ` }));
});

test('null fragment and style=null no longer throw; nearby legacy cases are unchanged', t => {
    expectSuccess(runFixture(t, { code: `
        import { _jsx as h, _jsxFragment as F } from 'jtsx-loader/factory/jsxFactory.js';
        assert.equal(h(F, null, null), '');
        assert.equal(h('div', { style: null, title: null }), '<div title="null"></div>');
        assert.equal(h('div', { style: 'color: red' }), '<div style="color: red"></div>');
        assert.equal(h('p', null, false, 0), '<p>0</p>');
        assert.equal(h(F, null, false), false);
        assert.equal(h(F, null, undefined), undefined);
        assert.equal(h('p', { __escape: 0 }), '<p></p>');
    ` }));
});

test('escapeAttributes encodes values once, preserves attribute rules and leaves children raw', t => {
    expectSuccess(runFixture(t, {
        config: `export default { escapeAttributes: true };`,
        code: `
            import { _jsx as h } from 'jtsx-loader/factory/jsxFactory.js';
            assert.equal(h('input', { value: '" onfocus="<&/' }), '<input value="&quot; onfocus=&quot;&lt;&amp;&#x2F;"/>');
            assert.equal(h('p', { title: 'a&b' }, '<b>x</b>'), '<p title="a&amp;b"><b>x</b></p>');
            assert.equal(h('input', { disabled: true, required: false, id: undefined, title: null }), '<input disabled="true" id title="null"/>');
            assert.equal(h('p', { style: { content: '"<&' } }), '<p style="content: &quot;&lt;&amp;;"></p>');
        `,
    }));
});

test('custom parsers own value escaping; their HTML fragments are not escaped again', t => {
    expectSuccess(runFixture(t, {
        config: `import { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';
            export default { escapeAttributes: true, attributeParser: {
                ac: (name, value) => 'data-' + name.replace(':', '-') + '="' + escapeHtml(value) + '"',
                raw: () => 'data-raw="<"',
            } };`,
        code: `import { _jsx as h } from 'jtsx-loader/factory/jsxFactory.js';
            assert.equal(h('p', { 'ac:x': '"<&', 'raw:x': '' }), '<p data-ac-x="&quot;&lt;&amp;" data-raw="<"></p>');`,
    }));
});
