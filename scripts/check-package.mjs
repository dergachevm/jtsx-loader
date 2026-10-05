import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFixture, repository } from '../tests/helpers/fixture.mjs';

// Kept separate from npm test: this check installs a real package and may need
// registry access. No source junctions, npm link, or copied dependencies.
const npmCLI = process.env.npm_execpath;
assert.ok(npmCLI && fs.existsSync(npmCLI), 'Run this check with npm run test:package');
const cleanups = [];
const fixture = createFixture({ after: fn => cleanups.push(fn) }, { linkSource: false });
const cache = path.join(fixture.root, 'npm-cache');
function run(args, cwd = fixture.root) {
    const result = spawnSync(process.execPath, args, {
        cwd, encoding: 'utf8', windowsHide: true, timeout: 120000,
        env: { ...process.env, JTSX_STRICT_CONFIG: '' },
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, (result.stderr || result.stdout).slice(-8000));
    return result.stdout;
}
function npm(args, cwd) {
    return run([npmCLI, ...args, '--cache', cache], cwd);
}

try {
    const [preview] = JSON.parse(npm(['pack', '--dry-run', '--ignore-scripts', '--json'], repository));
    const files = new Set(preview.files.map(file => file.path));
    for (const file of [
        'loader/register.mjs', 'loader/loader.mjs', 'loader/config.mjs',
        'loader/hooks.mjs', 'loader/sync-loader.mjs',
        'factory/jsxFactory.js', 'factory/asyncFactory.js', 'factory/jsxUtils.js',
        'factory/utils.js', 'factory/possibleAttributes.js', 'package.json',
        'runtime.js', 'register.js',
        'example/server.js', 'example/pages/index.jsx', 'example/pages/ru.jsx', 'example/pages/test.jsx',
        'jtsx.config.example.js', 'README.md', 'CHANGELOG.md',
    ]) assert.ok(files.has(file), `Missing package file: ${file}`);
    console.log(`pack --dry-run: ${preview.files.length} files; required paths present`);
    const [packed] = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', fixture.root], repository));
    const archive = path.join(fixture.root, packed.filename);
    npm(['install', archive, '--no-audit', '--no-fund']);
    fixture.write('Page.tsx', `export default ({ title }: { title: string }) => <h1 __escape={title}></h1>;`);
    fixture.write('app.mjs', `
        import assert from 'node:assert/strict';
        import fs from 'node:fs';
        import path from 'node:path';
        import { fileURLToPath } from 'node:url';
        import Page from './Page.tsx';
        import { raw, renderToString } from 'jtsx-loader';
        import { _jsx } from 'jtsx-loader/factory/jsxFactory.js';
        import { _jsx as asyncJSX } from 'jtsx-loader/factory/asyncFactory.js';
        import { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';
        import * as oldUtils from 'jtsx-loader/factory/utils.js';
        import oldAttributes from 'jtsx-loader/factory/possibleAttributes.js';
        assert.equal(renderToString(Page({ title: '<Hello>' })), '<h1>&lt;Hello&gt;</h1>');
        assert.equal(renderToString(_jsx('p', null, '<b>text</b>')), '<p>&lt;b&gt;text&lt;&#x2F;b&gt;</p>');
        assert.equal(renderToString(_jsx('p', null, raw('<b>html</b>'))), '<p><b>html</b></p>');
        assert.equal(renderToString(await asyncJSX('p', null, Promise.resolve('new'))), '<p>new</p>');
        assert.equal(escapeHtml('<'), '&lt;');
        assert.ok(Object.keys(oldUtils).length && Object.keys(oldAttributes).length);
        for (const name of ['jtsx-loader', 'esbuild']) {
            const resolved = fs.realpathSync(fileURLToPath(import.meta.resolve(name)));
            const relative = path.relative(fs.realpathSync(process.cwd()), resolved);
            assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), resolved);
        }
    `);
    run(['--import', 'jtsx-loader', 'app.mjs']);
    fixture.write('bootstrap.mjs', `import 'jtsx-loader/register.js'; await import('./app.mjs');`);
    run(['bootstrap.mjs']);
    fixture.write('direct.mjs', `import { renderToString } from 'jtsx-loader';
        const { default: Page } = await import('./Page.tsx');
        if (renderToString(Page({ title: '<x>' })) !== '<h1>&lt;x&gt;</h1>') throw new Error('direct registration failed');`);
    run(['direct.mjs']);
    fixture.write('jtsx.config.js', `export default {
        injectFactory: true, escapeAttributes: true,
        esbuildTransformConfig: { minify: true },
        importFactory: "import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/asyncFactory.js';"
    };`);
    fixture.write('Async.jsx', `const Child = async () => <b>nested</b>; export default () => <main><Child />{Promise.resolve(0)}</main>;`);
    fixture.write('async-app.mjs', `import assert from 'node:assert/strict'; import Page from './Async.jsx'; import { renderToString } from 'jtsx-loader/runtime.js'; assert.equal(renderToString(await Page()), '<main><b>nested</b>0</main>');`);
    run(['--import', 'jtsx-loader', 'async-app.mjs']);
    fixture.write('jtsx.config.js', `export default { escapeChildren: false, escapeAttributes: false };`);
    fixture.write('legacy.mjs', `import assert from 'node:assert/strict'; import { _jsx } from 'jtsx-loader/factory/jsxFactory.js';
        assert.equal(_jsx('p', null, '<b>old</b>'), '<p><b>old</b></p>');`);
    run(['--import', 'jtsx-loader', 'legacy.mjs']);
    console.log('Installed tarball: escaping, raw, no-flag registration, async, legacy, TSX and deep paths passed');
} finally {
    for (const cleanup of cleanups) cleanup();
}
