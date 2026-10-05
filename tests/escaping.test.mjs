import test from 'node:test';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

for (const factory of ['jsxFactory', 'asyncFactory']) {
    test(`${factory}: safe defaults, explicit raw and nested trusted results`, (t) => {
        expectSuccess(
            runFixture(t, {
                code: `
            import { _jsx as h, _jsxFragment as F } from 'jtsx-loader/factory/${factory}.js';
            import { raw, renderToString } from 'jtsx-loader';
            const text = '<b>text</b>&';
            const escaped = '&lt;b&gt;text&lt;&#x2F;b&gt;&amp;';
            assert.equal(renderToString(await h('p', { title: '\"<&' }, text)), '<p title="&quot;&lt;&amp;">' + escaped + '</p>');
            assert.equal(renderToString(await h('p', null, raw(text))), '<p>' + text + '</p>');
            const child = await h('b', null, text);
            assert.equal(renderToString(await h('p', null, child, text)), '<p><b>' + escaped + '</b>' + escaped + '</p>');
            assert.equal(renderToString(await h(F, null, [text, [child, null, false, 0]])), escaped + '<b>' + escaped + '</b>0');
            assert.equal(renderToString(await h(() => text, null)), escaped);
            assert.equal(renderToString(await h('p', { __escape: 0, __raw: 0 })), '<p>00</p>');
            assert.equal(renderToString(await h('p', { __escape: text }, text)), '<p>' + escaped + escaped + '</p>');
            assert.equal(renderToString(await h('p', { title: raw('\"<&') })), '<p title="&quot;&lt;&amp;"></p>');
            assert.equal(renderToString(await h('p', null, String(child))), '<p>&lt;b&gt;' + escaped.replaceAll('&', '&amp;') + '&lt;&#x2F;b&gt;</p>');
            assert.throws(() => renderToString(Promise.resolve('x')), /await/i);
            assert.throws(() => raw(Promise.resolve('x')), /await/i);
            assert.throws(() => renderToString({ html: '<b>fake</b>' }), /child/i);
            assert.equal(renderToString(raw('')), '');
            assert.equal(renderToString(raw(null)), '');
            assert.equal(renderToString(raw(0)), '0');
            assert.equal(renderToString(await h('p', null, '&lt;')), '<p>&amp;lt;</p>');
        `,
            }),
        );
    });
}

test('JSX/TSX components keep props as data and trust through reload boundaries', (t) => {
    expectSuccess(
        runFixture(t, {
            files: {
                'Page.tsx': `import { raw } from 'jtsx-loader';
                const Child = ({ title, children }) => <span title={title}>{children}</span>;
                export default () => <main><Child title={'"<&'}>{'<i>x</i>'}</Child>{raw('<b>raw</b>')}</main>;`,
            },
            code: `import { _jsx as h } from 'jtsx-loader/factory/jsxFactory.js';
            import { renderToString } from 'jtsx-loader';
            for (const suffix of ['', '?reload']) {
                const { default: Page } = await import('./Page.tsx' + suffix);
                const output = Page();
                assert.equal(typeof output, 'object');
                assert.equal(renderToString(h('article', null, output)), '<article><main><span title="&quot;&lt;&amp;">&lt;i&gt;x&lt;&#x2F;i&gt;</span><b>raw</b></main></article>');
            }`,
        }),
    );
});

test('safe async mode catches nested failures and leaves component props unescaped', (t) => {
    expectSuccess(
        runFixture(t, {
            config: `export default { importFactory: "import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/asyncFactory.js';" };`,
            files: {
                'Page.jsx': `const Child = async ({ value, children }) => <p title={value}>{children}{value}</p>;
            export default () => <main><Child value={'"<&'}>{Promise.resolve('<x>')}</Child></main>;`,
            },
            code: `import Page from './Page.jsx';
            import { renderToString } from 'jtsx-loader/runtime.js';
            import { _jsx as h } from 'jtsx-loader/factory/asyncFactory.js';
            assert.equal(renderToString(await Page()), '<main><p title="&quot;&lt;&amp;">&lt;x&gt;&quot;&lt;&amp;</p></main>');
            await assert.rejects(h('p', null, new Promise(resolve => setTimeout(resolve, 20)), Promise.reject(new Error('nested'))), /nested/);
            await assert.rejects(h('p', null, {}), /child/);`,
        }),
    );
});

test('source registration works without CLI preload and with a bootstrap module', (t) => {
    expectSuccess(
        runFixture(t, {
            register: false,
            files: {
                'Page.jsx': `import { raw } from 'jtsx-loader'; export default () => <p>{'<x>'}{raw('<b>ok</b>')}</p>;`,
                'server.mjs': `import Page from './Page.jsx'; export default Page;`,
            },
            code: `import { renderToString } from 'jtsx-loader';
            const { default: Page } = await import('./server.mjs');
            assert.equal(renderToString(Page()), '<p>&lt;x&gt;<b>ok</b></p>');`,
        }),
    );
});
