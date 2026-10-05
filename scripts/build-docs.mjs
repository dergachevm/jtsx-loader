import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
// Configuration and package self-imports must use this checkout, even when
// the build script is invoked from a different working directory.
process.chdir(fileURLToPath(root));
await import('../register.js');
const { renderToString } = await import('../runtime.js');
const { default: clientBundle } = await import('../example/docs/clientBundle.js');
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const output = new URL('build/', root);

for (const [page, destination] of [['index', 'index.html'], ['ru', 'ru/index.html']]) {
    const { default: Page } = await import(`../example/pages/${page}.jsx`);
    const html = '<!doctype html>\n' + renderToString(await Page());
    const target = new URL(destination, output);
    await mkdir(new URL('./', target), { recursive: true });
    await writeFile(target, html);
}

for (const directory of ['styles', 'scripts']) {
    await cp(new URL(`example/${directory}/`, root), new URL(`${directory}/`, output), { recursive: true });
}
await writeFile(new URL('scripts/client-demo.js', output), clientBundle);
console.log(`Built jtsx-loader v${version} documentation in ${fileURLToPath(output)}`);
