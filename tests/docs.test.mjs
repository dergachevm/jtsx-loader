import test from 'node:test';
import assert from 'node:assert/strict';
import { examples, sections } from '../example/docs/content.js';
import { highlight } from '../example/docs/highlight.js';
import { runFixture, expectSuccess } from './helpers/fixture.mjs';

test('documentation examples run without a preload and generate escaped static HTML', (t) => {
    const result = runFixture(t, {
        register: false,
        files: examples,
        code: `await import('./app.js'); await import('./static.js');
            const { readFile } = await import('node:fs/promises');
            const html = await readFile('dist/index.html', 'utf8');
            assert.match(html, /^<!doctype html>/);
            assert.ok(html.includes('<h1>Hello</h1>'));
            assert.ok(html.includes('<output aria-live="polite">3</output>'));`,
    });
    expectSuccess(result);
    assert.match(result.stdout, /<h1>Hello JSX<\/h1>/);
});

test('documented async config and JSON script escaping execute correctly', (t) => {
    expectSuccess(
        runFixture(t, {
            files: examples,
            config: examples['async.config.js'],
            code: `
        import Page from './async.jsx';
        import Data from './data.jsx';
        import { renderToString } from 'jtsx-loader/runtime.js';
        assert.equal(renderToString(await Page()), '<main><b>&lt;Ready&gt;</b>AB0</main>');
        const data = '</script><script>alert(1)</script>';
        const html = renderToString(await Data({ value: data }));
        assert.equal(html.match(/<script/g).length, 1);
        assert.equal(html.split('</script>').length - 1, 1);
        assert.equal(JSON.parse(html.slice(html.indexOf('>') + 1, html.lastIndexOf('<'))), data);
    `,
        }),
    );
});

test('highlighting preserves source text and never inserts executable sample tags', () => {
    const source = '<script>alert("<&")</script>\nC:\\temp\\file\nconst n = 1;';
    const decode = (value) =>
        value.replace(
            /&#x([\da-f]+);|&#(\d+);|&(amp|lt|gt|quot|apos);/gi,
            (_, hex, dec, name) =>
                hex
                    ? String.fromCodePoint(parseInt(hex, 16))
                    : dec
                      ? String.fromCodePoint(Number(dec))
                      : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[
                            name
                        ],
        );
    for (const language of [
        'jsx',
        'tsx',
        'javascript',
        'typescript',
        'json',
        'html',
        'css',
        'bash',
        'powershell',
        'unknown',
    ]) {
        const html = highlight(source, language);
        assert.doesNotMatch(html, /<script[\s>]/i);
        assert.equal(decode(html.replace(/<[^>]*>/g, '')), source, language);
    }
});

test('documented dev server refreshes a nested component and recovers after a template error', (t) => {
    expectSuccess(runFixture(t, {
        register: false,
        files: examples,
        env: { PORT: '0' },
        code: `
            const { writeFile } = await import('node:fs/promises');
            const { once } = await import('node:events');
            const { server } = await import('./dev-server.js');
            try {
                if (!server.listening) await once(server, 'listening');
                const url = 'http://127.0.0.1:' + server.address().port;
                const before = await fetch(url);
                assert.equal(before.status, 200);
                assert.ok(before.headers.get('content-type').startsWith('text/html'));
                assert.ok((await before.text()).includes('<output aria-live="polite">3</output>'));
                assert.equal((await fetch(url + '/missing')).status, 404);
                await writeFile('Counter.jsx', 'export default () => <p>Updated component</p>;');
                assert.equal(await (await fetch(url)).text(), '<main><h1>Live JSX</h1><p>Updated component</p></main>');
                await writeFile('Counter.jsx', 'export default () => <p>');
                assert.equal((await fetch(url)).status, 500);
                await writeFile('Counter.jsx', 'export default () => <p>Fixed</p>;');
                assert.equal(await (await fetch(url)).text(), '<main><h1>Live JSX</h1><p>Fixed</p></main>');
            } finally {
                server.closeAllConnections();
                await new Promise(resolve => server.close(resolve));
            }
        `,
    }));
});

test('both documentation languages share complete sections and executable snippets', () => {
    const ru = sections('ru');
    const en = sections('en');
    assert.deepEqual(
        ru.map((s) => s.id),
        en.map((s) => s.id),
    );
    assert.equal(new Set(ru.map((s) => s.id)).size, 13);
    for (const list of [ru, en]) {
        assert.ok(
            list.every(
                (s) =>
                    s.title &&
                    s.intro &&
                    s.paragraphs.length &&
                    (s.blocks.length || s.topics?.some((topic) => topic.blocks.length)),
            ),
        );
        for (const name of Object.keys(examples))
            assert.ok(
                list.some((s) =>
                    [...s.blocks, ...(s.topics || []).flatMap((topic) => topic.blocks)]
                        .some((b) => b.code === examples[name]),
                ),
                name,
            );
    }
});
