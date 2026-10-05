import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFixture, repository } from './helpers/fixture.mjs';

test('build, patch and bump generate both languages with the package version and local assets', t => {
    const cleanups = [];
    const fixture = createFixture({ after: fn => cleanups.push(fn) }, { linkSource: false });
    const dependencies = path.join(fixture.root, 'node_modules');
    t.after(() => {
        if (fs.existsSync(dependencies)) fs.unlinkSync(dependencies);
        for (const cleanup of cleanups) cleanup();
    });
    fs.symlinkSync(path.join(repository, 'node_modules'), dependencies, process.platform === 'win32' ? 'junction' : 'dir');
    for (const name of [
        'package.json', 'package-lock.json', 'register.js', 'runtime.js',
        'browser.js', 'browserAsync.js', 'loader', 'factory', 'example',
    ]) {
        fs.cpSync(path.join(repository, name), path.join(fixture.root, name), { recursive: true });
    }
    fixture.write('scripts/build-docs.mjs', fs.readFileSync(path.join(repository, 'scripts/build-docs.mjs'), 'utf8'));

    // Use a distinct version so hardcoded documentation versions cannot pass.
    const manifest = JSON.parse(fs.readFileSync(path.join(fixture.root, 'package.json'), 'utf8'));
    manifest.version = '1.2.3';
    fixture.write('package.json', JSON.stringify(manifest));
    const lock = JSON.parse(fs.readFileSync(path.join(fixture.root, 'package-lock.json'), 'utf8'));
    lock.version = lock.packages[''].version = manifest.version;
    fixture.write('package-lock.json', JSON.stringify(lock));

    function run(command, expectedVersion) {
        const npm = process.env.npm_execpath;
        const executable = npm ? process.execPath : process.platform === 'win32' ? 'cmd.exe' : 'npm';
        const args = npm ? [npm, 'run', command] : process.platform === 'win32'
            ? ['/d', '/s', '/c', `npm run ${command}`] : ['run', command];
        const result = spawnSync(executable, args, {
            cwd: fixture.root, encoding: 'utf8', windowsHide: true, timeout: 60000,
            env: { ...process.env, JTSX_STRICT_CONFIG: '', npm_config_offline: 'true' },
        });
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        const read = name => fs.readFileSync(path.join(fixture.root, name), 'utf8');
        assert.equal(JSON.parse(read('package.json')).version, expectedVersion);
        const updatedLock = JSON.parse(read('package-lock.json'));
        assert.equal(updatedLock.version, expectedVersion);
        assert.equal(updatedLock.packages[''].version, expectedVersion);
        for (const [file, lang] of [['index.html', 'en'], ['ru/index.html', 'ru']]) {
            const html = read(`build/${file}`);
            assert.ok(html.startsWith('<!doctype html>'));
            assert.ok(html.includes(`<html lang="${lang}">`));
            assert.ok(html.includes(`<span class="package-version">v${expectedVersion}</span>`));
            assert.ok(html.includes('id="migration-since-0115"'));
            assert.ok(html.includes('id="migration-rendering"'));
            for (const [, url] of html.matchAll(/(?:src|href)="(\/(?:styles|scripts)\/[^"?#]+)"/g)) {
                assert.ok(fs.statSync(path.join(fixture.root, 'build', url)).isFile(), url);
            }
        }
        assert.ok(read('build/scripts/client-demo.js').includes('addEventListener'));
        assert.ok(!fs.existsSync(path.join(fixture.root, 'build/docs')));
        assert.ok(!fs.existsSync(path.join(fixture.root, '.git')));
    }
    run('build', '1.2.3');
    run('patch', '1.2.4');
    run('bump', '1.3.0');

    // A broken template must fail the build, rather than reporting success.
    fixture.write('example/pages/index.jsx', 'export default () => <main>;');
    const failed = spawnSync(process.execPath, ['scripts/build-docs.mjs'], {
        cwd: fixture.root, encoding: 'utf8', windowsHide: true, timeout: 30000,
    });
    assert.ifError(failed.error);
    assert.notEqual(failed.status, 0);
    assert.match(failed.stderr, /JTSX TRANSFORM ERROR/);
});
