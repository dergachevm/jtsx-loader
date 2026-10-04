import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const repository = fileURLToPath(new URL('../../', import.meta.url));

export function createFixture(t, { files = {}, config, linkSource = true } = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jtsx test-'));
    const write = (name, content) => {
        const target = path.resolve(root, name);
        const relative = path.relative(root, target);
        assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    };
    write('package.json', JSON.stringify({ private: true, type: 'module' }));
    // Fast runtime fixtures exercise this checkout. Package-installation smoke
    // tests separately install a real tarball with linkSource: false.
    const packageLink = path.join(root, 'node_modules', 'jtsx-loader');
    if (linkSource) {
        fs.mkdirSync(path.dirname(packageLink), { recursive: true });
        fs.symlinkSync(repository, packageLink, process.platform === 'win32' ? 'junction' : 'dir');
    }
    t.after(() => {
        const relative = path.relative(fs.realpathSync(os.tmpdir()), fs.realpathSync(root));
        assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
        if (linkSource) fs.unlinkSync(packageLink);
        fs.rmSync(root, { recursive: true, force: true });
    });
    if (config !== undefined) write('jtsx.config.js', config);
    for (const [name, content] of Object.entries(files)) write(name, content);
    return { root, write };
}

export function runFixture(t, { code, env = {}, register = true, ...options }) {
    const fixture = createFixture(t, options);
    fixture.write('app.mjs', `import assert from 'node:assert/strict';\n${code}`);
    const result = spawnSync(process.execPath,
        [...(register ? ['--import', 'jtsx-loader'] : []), 'app.mjs'], {
            cwd: fixture.root,
            env: { ...process.env, JTSX_STRICT_CONFIG: '', ...env },
            encoding: 'utf8', windowsHide: true, timeout: 15000,
        });
    assert.ifError(result.error);
    return result;
}

export function expectSuccess(result) {
    assert.equal(result.status, 0, result.stderr || result.stdout);
}
