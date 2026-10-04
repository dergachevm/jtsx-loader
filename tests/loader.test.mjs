import test from 'node:test';
import assert from 'node:assert/strict';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

test('explicit injection works with transform options and explicit disable supports manual imports', t => {
    for (const options of ['{}', '{ minify: true }']) {
        expectSuccess(runFixture(t, {
            config: `export default { injectFactory: true, esbuildTransformConfig: ${options} };`,
            files: { 'Page.jsx': 'export default () => <><p>Hello</p></>;' },
            code: `import Page from './Page.jsx'; assert.equal(Page(), '<p>Hello</p>');`,
        }));
    }
    expectSuccess(runFixture(t, {
        config: `export default { injectFactory: false };`,
        files: { 'Page.jsx': `import { _jsx } from 'jtsx-loader/factory/jsxFactory.js'; export default () => <p/>;` },
        code: `import Page from './Page.jsx'; assert.equal(Page(), '<p></p>');`,
    }));
});

test('query/hash and paths with spaces work for both JSX and TSX without merging module identities', t => {
    for (const extension of ['jsx', 'tsx']) {
        expectSuccess(runFixture(t, {
            files: { [`some folder/Page.${extension}`]: `export default () => <p/>;` },
            code: `
                const a = await import('./some folder/Page.${extension}#first');
                const b = await import('./some folder/Page.${extension}?query=1#second');
                assert.equal(a.default(), '<p></p>'); assert.equal(b.default(), '<p></p>');
                assert.notEqual(a, b);
                assert.equal(a, await import('./some folder/Page.${extension}#first'));
            `,
        }));
    }
});

test('loader delegates data URLs and non-JSX files', t => {
    expectSuccess(runFixture(t, {
        files: { 'helper.js': 'export default 42;' },
        code: `import answer from 'data:text/javascript,export default 42';
            import local from './helper.js'; import fs from 'node:fs';
            assert.equal(answer, local); assert.equal(typeof fs.readFile, 'function');`,
    }));
});

test('syntax diagnostics refer to original source lines and retain the cause', t => {
    for (const importFactory of [undefined, `// injected line 1\n// injected line 2\nimport { _jsx } from 'jtsx-loader/factory/jsxFactory.js';`]) {
        expectSuccess(runFixture(t, {
            config: importFactory === undefined ? undefined : `export default { importFactory: ${JSON.stringify(importFactory)} };`,
            files: { 'Page.jsx': 'export default () => <div>;' },
            code: `await assert.rejects(import('./Page.jsx'), error => {
                assert.match(error.message, /Page\\.jsx:1:/);
                assert.match(error.message, /closing/);
                assert.ok(error.cause); return true;
            });`,
        }));
    }
});

test('esbuild option errors do not invent positions in the user file', t => {
    for (const options of ['{ unknownOption: true }', "{ target: 'definitely-invalid' }"]) {
        expectSuccess(runFixture(t, {
            config: `export default { injectFactory: true, esbuildTransformConfig: ${options} };`,
            files: { 'Page.jsx': 'export default () => <p/>;' },
            code: `await assert.rejects(import('./Page.jsx'), error => {
                assert.match(error.message, /unknownOption|definitely-invalid/);
                assert.doesNotMatch(error.message, /Page\\.jsx:\\d+/);
                assert.ok(error.cause); return true;
            });`,
        }));
    }
});

test('missing config uses default factory from a consumer cwd', t => {
    expectSuccess(runFixture(t, {
        files: { 'Page.jsx': 'export default () => <p>Hello</p>;' },
        code: `import Page from './Page.jsx'; assert.equal(Page(), '<p>Hello</p>');`,
    }));
});

for (const register of [true, false]) {
    test(`valid config applies in ${register ? 'loader' : 'direct factory'} context`, t => {
        expectSuccess(runFixture(t, {
            register, env: { JTSX_STRICT_CONFIG: '1' },
            config: `export default { rewriteReactAttrs: true, disableAttrWarnings: true };`,
            code: `import { _jsx } from 'jtsx-loader/factory/jsxFactory.js';
                assert.equal(_jsx('label', { htmlFor: 'x' }), '<label for="x"></label>');`,
        }));
    });

    for (const [name, config] of [
        ['syntax', 'export default { syntax: ; };'],
        ['throw', `export default { rewriteReactAttrs: true }; throw new Error('CONFIG_SENTINEL');`],
        ['nested import', `import './missing-config-dependency.mjs'; export default { rewriteReactAttrs: true };`],
    ]) {
        test(`config ${name}: warning/fallback or explicit strict failure (${register ? 'loader' : 'factory'})`, t => {
            for (const strict of [false, true]) {
                const result = runFixture(t, { register, config,
                    env: { JTSX_STRICT_CONFIG: strict ? '1' : '' },
                    code: `import { _jsx } from 'jtsx-loader/factory/jsxFactory.js';
                        assert.equal(_jsx('label', { htmlFor: 'x' }), '<label htmlFor="x"></label>');`,
                });
                if (strict) assert.notEqual(result.status, 0);
                else expectSuccess(result);
                assert.match(result.stderr, /\[jtsx-loader\].*jtsx\.config\.js/);
                if (name === 'throw') assert.match(result.stderr, /CONFIG_SENTINEL/);
                if (name === 'nested import') assert.match(result.stderr, /missing-config-dependency/);
            }
        });
    }
    test(`missing config remains optional in strict mode (${register ? 'loader' : 'factory'})`, t => {
        const result = runFixture(t, { register, env: { JTSX_STRICT_CONFIG: '1' },
            code: `import { _jsx } from 'jtsx-loader/factory/jsxFactory.js'; assert.equal(_jsx('p', null), '<p></p>');` });
        expectSuccess(result);
        assert.equal(result.stderr, '');
    });
}
