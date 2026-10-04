import { readFileSync } from 'node:fs';
import { readConfig } from './config.mjs';
import { getTemplatePath, resolveReload, createTransform } from './hooks.mjs';

// Await ESM configuration before installing hooks; registerHooks callbacks must
// return synchronously, even when the config itself uses top-level await.
const transform = createTransform(await readConfig());

export function resolve(specifier, context, nextResolve) {
    return resolveReload(nextResolve(specifier, context), context);
}

export function load(url, context, nextLoad) {
    const filePath = getTemplatePath(url);
    if (!filePath) return nextLoad(url, context);
    return transform(filePath, readFileSync(filePath, 'utf8'));
}
