import { mkdir, writeFile } from 'node:fs/promises';
import { renderToString } from 'jtsx-loader';

const { default: Page } = await import('./Page.jsx');
await mkdir('dist', { recursive: true });
const html = '<!doctype html>\n' + renderToString(await Page({ title: 'Hello' }));
await writeFile('dist/index.html', html);
