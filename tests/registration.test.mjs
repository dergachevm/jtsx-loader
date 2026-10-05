import test from 'node:test';
import assert from 'node:assert/strict';
import * as moduleAPI from 'node:module';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

test('public registration renders without deprecated API calls', t => {
    const result = runFixture(t, {
        env: { NODE_OPTIONS: '--throw-deprecation' },
        config: `await Promise.resolve(); export default { injectFactory: true, escapeAttributes: true, esbuildTransformConfig: { minify: true } };`,
        files: { 'Page.tsx': `export default () => <p title={'"'}>ready</p>;` },
        code: `import Page from './Page.tsx'; assert.equal(String(Page()), '<p title="&quot;">ready</p>');`,
    });
    expectSuccess(result);
    assert.doesNotMatch(result.stderr, /DEP0205|DeprecationWarning/);
});

test('synchronous registration chains with other hooks and delegates CommonJS', {
    skip: typeof moduleAPI.registerHooks !== 'function' && 'Node has no synchronous hooks',
}, t => {
    expectSuccess(runFixture(t, {
        files: {
            'Page.jsx': `import value from './value.cjs'; export default () => <p>{value}</p>;`,
            'value.cjs': 'module.exports = 42;',
        },
        code: `
            import { registerHooks } from 'node:module';
            const seen = [];
            const hook = registerHooks({
                load(url, context, nextLoad) {
                    seen.push(url);
                    const result = nextLoad(url, context);
                    assert.equal(typeof result.then, 'undefined');
                    return result;
                }
            });
            const { default: Page } = await import('./Page.jsx');
            assert.equal(String(Page()), '<p>42</p>');
            assert.ok(seen.some(url => url.endsWith('/Page.jsx')));
            hook.deregister();
        `,
    }));
});

test('the legacy loader deep path still exports asynchronous hooks', t => {
    expectSuccess(runFixture(t, {
        register: false,
        files: { 'Page.jsx': 'export default () => <p/>;' },
        code: `
            import { load, resolve } from 'jtsx-loader/loader/loader.mjs';
            const loaded = load(new URL('./Page.jsx', import.meta.url).href, {}, () => assert.fail('unexpected delegation'));
            assert.ok(loaded instanceof Promise);
            assert.equal((await loaded).format, 'module');
            const resolved = resolve('node:fs', {}, async () => ({ url: 'node:fs' }));
            assert.ok(resolved instanceof Promise);
            assert.deepEqual(await resolved, { url: 'node:fs' });
        `,
    }));
});
