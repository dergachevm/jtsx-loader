import { fileURLToPath } from 'node:url';
import { isBuiltin } from 'node:module';
import { transformSync } from 'esbuild';

// TODO: убрать esm-reload
// INSPIRED: https://github.com/pygy/esm-reload/tree/main
let id = 0;
export function resolveReload(result, context) {
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

export function getTemplatePath(url) {
    const parsedURL = new URL(url);
    if (parsedURL.protocol !== 'file:') return null;
    const filePath = fileURLToPath(parsedURL);
    return filePath.endsWith('.jsx') || filePath.endsWith('.tsx') ? filePath : null;
}

export function createTransform(loadedConfig) {
    const config = {
        esbuildTransformConfig: null,
        injectFactory: 'legacy',
        importFactory: `import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/jsxFactory.js';`,
        ...loadedConfig,
    };
    // Snapshot options once, as the original loader did, including any getters.
    return (filePath, input) => transformTemplate(filePath, input, config);
}

function transformTemplate(filePath, input, config) {
    const ext = filePath.endsWith('.jsx') ? 'jsx' : 'tsx';

    if (![undefined, 'legacy', true, false].includes(config.injectFactory)) {
        throw new TypeError('[jtsx-loader] injectFactory must be "legacy", true or false');
    }
    // Preserve manual imports and custom factories unless injection is
    // explicitly requested; transform options alone retain the old policy.
    const inject = typeof config.injectFactory === 'boolean'
        ? config.injectFactory : !config.esbuildTransformConfig;
    const prefix = inject ? config.importFactory + '\n' : '';
    const prefixLines = prefix.split(/\r\n|\r|\n/).length - 1;
    const source = prefix + input;

    const esbuildTransformConfig = {
        jsxFactory: '_jsx',
        jsxFragment: '_jsxFragment',
        loader: ext,
        format: 'esm',
        sourcefile: filePath,
        ...config.esbuildTransformConfig
    };

    let transformed;
    try {
        transformed = transformSync(source, esbuildTransformConfig);
    } catch (cause) {
        const messages = Array.isArray(cause.errors) ? cause.errors.map(error => {
            const location = error.location;
            if (!location) return error.text;
            // Option-validation errors may point into esbuild itself.
            // Do not relabel them as a line of the user's JSX file.
            const sameSource = location.file.replaceAll('\\', '/') === String(esbuildTransformConfig.sourcefile).replaceAll('\\', '/');
            const inPrefix = sameSource && location.line <= prefixLines;
            const line = sameSource && !inPrefix ? location.line - prefixLines : location.line;
            const label = inPrefix ? `${location.file} [injected factory]` : location.file;
            return `${error.text}\n${label}:${line}:${location.column + 1}\n${location.lineText}`;
        }) : [cause.message];
        throw new Error(`JTSX TRANSFORM ERROR in ${filePath}\n${messages.join('\n')}`, { cause });
    }

    return {
        format: 'module',
        source: transformed.code,
        shortCircuit: true,
    };
}
