import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Build the documented client example once per development-server process.
// Only the generated JS is public; no template sources or Node runtime leak.
const result = await build({
    entryPoints: [
        fileURLToPath(new URL('./examples/client.jsx', import.meta.url)),
    ],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2020',
    jsxFactory: '_jsx',
    jsxFragment: '_jsxFragment',
    inject: [fileURLToPath(import.meta.resolve('jtsx-loader/browser.js'))],
    write: false,
});
export default result.outputFiles[0].text;
