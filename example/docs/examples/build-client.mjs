import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

await build({
    entryPoints: ['client.jsx'],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2020',
    jsxFactory: '_jsx',
    jsxFragment: '_jsxFragment',
    inject: [fileURLToPath(import.meta.resolve('jtsx-loader/browser.js'))],
    outfile: 'dist/client.js',
});
