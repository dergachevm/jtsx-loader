import test from 'node:test';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

const config = `export default { escapeChildren: false, injectFactory: true, escapeAttributes: true,
    importFactory: ${JSON.stringify("import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/asyncFactory.js';")} };`;

test('async factory resolves nested components and arrays in source order', t => {
    expectSuccess(runFixture(t, { config,
        files: { 'Page.jsx': `
            const delayed = (text, ms) => new Promise(resolve => setTimeout(() => resolve(text), ms));
            const Child = async ({ value }) => <b>{await delayed(value, 10)}</b>;
            export default () => <p title={'"<&'}><Child value="A"/>{[delayed('B', 20), [Promise.resolve('C'), null, false, 0], true]}</p>;
        ` },
        code: `import Page from './Page.jsx'; const html = Page(); assert.ok(html instanceof Promise);
            assert.equal(await html, '<p title="&quot;&lt;&amp;"><b>A</b>BC0</p>');`,
    }));
});

test('async fragments and component props follow the explicit normalized contract', t => {
    expectSuccess(runFixture(t, { config, code: `
        import { _jsx as h, _jsxFragment as F } from 'jtsx-loader/factory/asyncFactory.js';
        const seen = [];
        const Component = props => { seen.push(props); return ['A', Promise.resolve('B')]; };
        assert.equal(await h(Component, { title: 'T' }), 'AB');
        assert.equal(await h(Component, null, Promise.resolve('x')), 'AB');
        assert.equal(await h(Component, null, ['x', [false, 'y']]), 'AB');
        assert.deepEqual(seen, [{ title: 'T', children: [] }, { children: 'x' }, { children: ['x', 'y'] }]);
        assert.equal(await h(F, null), '');
        assert.equal(await h(F, null, null, undefined, false, true, 0), '0');
        assert.equal(await F({ children: ['A', [Promise.resolve('B')]] }), 'AB');
    ` }));
});

test('async payloads retain zero and scalar values while text remains explicitly escaped', t => {
    expectSuccess(runFixture(t, { config, code: `
        import { _jsx as h } from 'jtsx-loader/factory/asyncFactory.js';
        assert.equal(await h('p', { __raw: 0, __escape: 0 }, 'A'), '<p>A00</p>');
        assert.equal(await h('p', { __escape: false }), '<p>false</p>');
        assert.equal(await h('p', { __raw: null, __escape: undefined }), '<p></p>');
        assert.equal(await h('p', { __escape: '<i>C</i>' }, '<b>B</b>'), '<p><b>B</b>&lt;i&gt;C&lt;&#x2F;i&gt;</p>');
    ` }));
});

test('outer await catches nested rejections including fast failures after slow siblings', t => {
    expectSuccess(runFixture(t, { config,
        files: { 'Page.jsx': `
            const slow = new Promise(resolve => setTimeout(() => resolve('slow'), 25));
            const Child = async () => { throw new Error('CHILD_SENTINEL'); };
            export default () => <><p>{slow}{[<Child/>, Promise.reject(new Error('SIBLING_SENTINEL'))]}</p></>;
        ` },
        code: `import Page from './Page.jsx';
            await assert.rejects(Page(), /CHILD_SENTINEL|SIBLING_SENTINEL/);
            await new Promise(resolve => setTimeout(resolve, 40));`,
    }));
});

test('synchronous component errors and unsupported child objects reject the render', t => {
    expectSuccess(runFixture(t, { config, code: `
        import { _jsx as h } from 'jtsx-loader/factory/asyncFactory.js';
        await assert.rejects(h(() => { throw new Error('SYNC_SENTINEL'); }, null), /SYNC_SENTINEL/);
        await assert.rejects(h('p', null, { arbitrary: true }), /child/i);
    ` }));
});
