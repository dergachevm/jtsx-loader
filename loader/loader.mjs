import { readFile } from 'node:fs/promises';
import { readConfig } from './config.mjs';
import { getTemplatePath, resolveReload, createTransform } from './hooks.mjs';

const transform = createTransform(await readConfig());

// Keep the public asynchronous hook entry point for older Node.js and consumers
// that explicitly register loader/loader.mjs themselves.
export async function resolve(specifier, context, nextResolve) {
    return resolveReload(await nextResolve(specifier, context), context);
}

export async function load(url, context, nextLoad) {
    const filePath = getTemplatePath(url);
    if (!filePath) return nextLoad(url, context);
    return transform(filePath, await readFile(filePath, 'utf8'));
}
