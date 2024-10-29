import path from 'node:path';
import { readFile } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { transformSync } from 'esbuild';
import { isBuiltin } from 'node:module';

// TODO: убрать esm-reload
// INSPIRED: https://github.com/pygy/esm-reload/tree/main
let id = 0;
export async function resolve(specifier, context, nextResolve) {
    const result = await nextResolve(specifier, context);

    if (!isBuiltin(result.url) && context.parentURL) {
        const url = new URL(result.url);
        const parentUrl = new URL(context.parentURL);
        // TODO: заменить на v=1
        const instance = url.searchParams.get("reload") === ""
            ? `esm-reload-${id++}`
            : parentUrl.searchParams.get("instance");


        if (instance !== null) {
            if (url.searchParams.has('reload')) {
                url.searchParams.delete('reload')
            }
            url.searchParams.set("instance", instance);

            return {
                ...result,
                url: `${url}`,
            };
        }
    }
    return result;
}

/* INFO:
    import.meta.dirname всегда указывает на расположение текущего файла
    cwd полностью зависит от контекста вызова
*/

const configUrl = pathToFileURL(path.join(process.cwd(), 'jtsx.config.js'));
let loadedConfig = (await import(configUrl.href).catch(() => ({}))).default;

let config = {
    esbuildTransformConfig: null,
    importFactory: `import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/jsxFactory.js';`,
    ...loadedConfig
};

// TODO: typescript supported, add types for native HTML
export async function load(url, context, nextLoad) {
    const urlSanitized = url.split('?')[0];

    if (urlSanitized.endsWith('.jsx') || urlSanitized.endsWith('.tsx')) {
        const ext = (urlSanitized.endsWith('.jsx') && 'jsx') || (urlSanitized.endsWith('.tsx') && 'tsx');
        const filePath = fileURLToPath(url);

        let source = (await readFile(filePath, 'utf-8')).toString();

        if (!config?.esbuildTransformConfig) {
            source = config.importFactory + '\n' + source;
        }

        const esbuildTransformConfig = {
            jsxFactory: '_jsx',
            jsxFragment: '_jsxFragment',
            loader: ext,
            format: 'esm',
            ...config.esbuildTransformConfig
        };

        let transformed;
        try {
            transformed = transformSync(source, esbuildTransformConfig);
        } catch (error) {
            throw new Error(error.message);
        }

        return {
            format: 'module',
            source: transformed.code,
            shortCircuit: true,
        };
    }

    return nextLoad(url, context);
}
