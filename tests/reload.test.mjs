import test from 'node:test';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

for (const registration of ['preload', 'source', 'async-hooks']) {
    for (const asyncFactory of [false, true]) {
        test(`?reload reads edited nested JSX/TSX and JS dependencies (${registration}, ${asyncFactory ? 'async' : 'sync'} factory)`, (t) => {
            expectSuccess(runFixture(t, {
                register: registration === 'preload',
                config: asyncFactory
                    ? `export default { importFactory: "import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/asyncFactory.js';" };`
                    : undefined,
                files: {
                    'Page.jsx': `
                        import Child from './components/index.js';
                        import { state } from './state.js';
                        export { state };
                        export const detail = async () => (await import('./Detail.tsx')).default();
                        export default () => <main><Child /></main>;`,
                    'components/index.js': `export { default } from './Child.tsx';`,
                    'components/Child.tsx': `
                        import Leaf from './Leaf.jsx';
                        import { state } from '../state.js';
                        export default () => <section data-version={state.version}><Leaf /></section>;`,
                    'components/Leaf.jsx': `export default () => <b>before</b>;`,
                    'state.js': `export const state = { version: 'one' };`,
                    'Detail.tsx': `export default () => <aside>before</aside>;`,
                },
                code: `
                    import { writeFile } from 'node:fs/promises';
                    import { renderToString } from 'jtsx-loader/runtime.js';
                    ${registration === 'source'
                        ? "await import('jtsx-loader');"
                        : registration === 'async-hooks'
                          ? "const { register } = await import('node:module'); register('jtsx-loader/loader/loader.mjs', import.meta.url);"
                          : ''}
                    const html = async module => renderToString(await module.default());
                    const original = await import('./Page.jsx');
                    assert.equal(await html(original), '<main><section data-version="one"><b>before</b></section></main>');
                    assert.equal(renderToString(await original.detail()), '<aside>before</aside>');

                    // Only edit a deeply nested component; the parent stays unchanged.
                    await writeFile('components/Leaf.jsx', 'export default () => <b>after & updated</b>;');
                    const first = await import('./Page.jsx?reload');
                    assert.equal(await html(first), '<main><section data-version="one"><b>after &amp; updated</b></section></main>');
                    assert.equal(await import('./Page.jsx'), original);
                    assert.equal(await html(original), '<main><section data-version="one"><b>before</b></section></main>');

                    // A subsequent reload picks up TSX, plain JS and dynamic imports too.
                    await writeFile('components/Child.tsx', "import Leaf from './Leaf.jsx'; import { state } from '../state.js'; export default () => <article data-version={state.version}><Leaf /></article>;");
                    await writeFile('state.js', 'export const state = { version: "two" };');
                    await writeFile('Detail.tsx', 'export default () => <aside>after</aside>;');
                    const second = await import('./Page.jsx?reload');
                    assert.notEqual(first, second);
                    assert.notEqual(first.state, second.state);
                    assert.equal(await html(second), '<main><article data-version="two"><b>after &amp; updated</b></article></main>');
                    assert.equal(renderToString(await second.detail()), '<aside>after</aside>');
                    assert.equal(renderToString(await original.detail()), '<aside>before</aside>');

                    // Modules within one reload share a dependency instance.
                    second.state.version = 'shared';
                    assert.equal(await html(second), '<main><article data-version="shared"><b>after &amp; updated</b></article></main>');

                    // A failed transform must not poison the next reload after a fix.
                    await writeFile('components/Leaf.jsx', 'export default () => <b>');
                    await assert.rejects(import('./Page.jsx?reload'), /JTSX TRANSFORM ERROR/);
                    await writeFile('components/Leaf.jsx', 'export default () => <b>fixed</b>;');
                    const repaired = await import('./Page.jsx?reload');
                    assert.equal(await html(repaired), '<main><article data-version="two"><b>fixed</b></article></main>');
                `,
            }));
        });
    }
}
