import * as moduleAPI from 'node:module';

// Feature detection also covers Node 22.15+ backports without importing a
// missing named export on earlier Node.js releases.
if (typeof moduleAPI.registerHooks === 'function') {
    const { resolve, load } = await import('./sync-loader.mjs');
    moduleAPI.registerHooks({ resolve, load });
} else {
    moduleAPI.register('./loader.mjs', import.meta.url);
}
