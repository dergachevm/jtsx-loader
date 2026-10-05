import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { createFixture, repository } from './helpers/fixture.mjs';

async function until(predicate, output, timeout = 12000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        if (await predicate()) return;
        await delay(50);
    }
    assert.fail(`Server did not reach expected state:\n${output()}`);
}

async function startExample(t, { writeHTML = false, broken = false, dev = false } = {}) {
    if (dev && process.platform === 'win32') {
        // Detect a restricted runner before nodemon can leave orphan servers.
        const probe = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { windowsHide: true, stdio: 'ignore' });
        const stopped = spawnSync('taskkill', ['/pid', String(probe.pid), '/T', '/F'], { windowsHide: true });
        if (stopped.status !== 0) probe.kill();
        assert.equal(stopped.status, 0, 'The nodemon check requires permission to stop its own Windows process tree');
    }
    const cleanups = [];
    const fixture = createFixture({ after: fn => cleanups.push(fn) }, {
        config: `export default { escapeAttributes: true };`,
    });
    let child;
    t.after(async () => {
        if (child && child.exitCode === null) {
            // Stop only this test's process tree; nodemon owns a server child.
            if (dev && process.platform === 'win32') {
                const stopped = spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
                if (stopped.status !== 0) {
                    child.kill();
                    assert.fail('Windows denied process-tree cleanup; run server tests where taskkill is allowed');
                }
            } else child.kill('SIGTERM');
            await until(() => child.exitCode !== null || child.signalCode !== null, () => 'stopping example');
        }
        for (const name of ['express', 'shiki']) fs.unlinkSync(path.join(fixture.root, 'node_modules', name));
        for (const cleanup of cleanups) cleanup();
    });
    fs.symlinkSync(path.join(repository, 'node_modules/express'),
        path.join(fixture.root, 'node_modules/express'), process.platform === 'win32' ? 'junction' : 'dir');
    fs.symlinkSync(path.join(repository, 'node_modules/shiki'),
        path.join(fixture.root, 'node_modules/shiki'), process.platform === 'win32' ? 'junction' : 'dir');
    fs.cpSync(path.join(repository, 'example'), path.join(fixture.root, 'example'), { recursive: true });
    fixture.write('package.json', JSON.stringify({ private: true, type: 'module', version: 'fixture' }));
    if (broken) fixture.write('example/pages/test.jsx', `export default () => { throw new Error('render-sentinel'); };`);
    fs.copyFileSync(path.join(repository, 'nodemon.json'), path.join(fixture.root, 'nodemon.json'));
    const socket = net.createServer();
    await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
    const port = socket.address().port;
    await new Promise(resolve => socket.close(resolve));
    const url = `http://127.0.0.1:${port}`;
    let output = '';
    child = spawn(process.execPath, [
        ...(dev ? [path.join(repository, 'node_modules/nodemon/bin/nodemon.js')] : []),
        '--import', 'jtsx-loader', 'example/server.js', ...(writeHTML ? ['--write-html'] : []),
    ], {
        cwd: fixture.root, windowsHide: true,
        env: { ...process.env, PORT: String(port), URL: url, NODE_ENV: 'production', JTSX_STRICT_CONFIG: '' },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', error => { output += error.message; });
    await until(() => output.includes('Static server:'), () => output);
    const request = async pathname => {
        const response = await fetch(url + pathname, { signal: AbortSignal.timeout(3000) });
        return { status: response.status, text: await response.text() };
    };
    return { ...fixture, request, output: () => output };
}

test('demo serves pages/resources, closes 404s and keeps sources private without disk writes', async t => {
    const fixture = await startExample(t);
    for (const route of ['/', '/ru', '/test', '/styles/styles.css', '/api/200.json']) {
        const result = await fixture.request(route);
        assert.equal(result.status, 200, `${route}: ${result.text}`);
    }
    for (const route of ['/missing', '/missing.js', '/server.js', '/pages/index.jsx', '/api/private.js']) {
        assert.equal((await fixture.request(route)).status, 404, route);
    }
    assert.equal(fs.existsSync(path.join(fixture.root, 'build')), false);
});

test('demo writes HTML only with --write-html', async t => {
    const fixture = await startExample(t, { writeHTML: true });
    const result = await fixture.request('/test');
    assert.equal(result.status, 200);
    assert.equal(fs.readFileSync(path.join(fixture.root, 'build/test.html'), 'utf8'), result.text);
});

test('render errors finish with 500 and do not expose production details', async t => {
    const fixture = await startExample(t, { broken: true });
    const result = await fixture.request('/test');
    assert.equal(result.status, 500);
    assert.doesNotMatch(result.text, /render-sentinel|example[/\\]pages|Error:/);
});

test('nodemon restarts the demo after a JSX edit', async t => {
    const fixture = await startExample(t, { dev: true });
    assert.match((await fixture.request('/test')).text, /Hello/);
    await delay(300);
    fixture.write('example/pages/test.jsx', `export default () => <h1>watch-sentinel</h1>;`);
    await until(() => fixture.output().split('Static server:').length >= 3, fixture.output);
    const result = await fixture.request('/test');
    assert.equal(result.status, 200);
    assert.match(result.text, /watch-sentinel/);
});
