import { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';

export default {
    // Control automatic factory imports.
    // 'legacy': inject only without esbuildTransformConfig.
    // true: inject even with {} / minify; false: templates import their factory.
    injectFactory: 'legacy',

    // Unreleased defaults: original text/attribute data is escaped automatically.
    // Set BOTH to false only to restore the 0.1.18 raw/string-returning mode.
    escapeChildren: true,
    escapeAttributes: true,

    // When true disables warnings when uses React camelCase attributes, like htmlFor instead of for xLinkHref instead of xlink:href
    disableAttrWarnings: false,

    // When true - rewrite react camelCase attributes into default HTML name style
    rewriteReactAttrs: false,

    // Esbuild transform config https://esbuild.github.io/api/#transform
    esbuildTransformConfig: undefined,

    // Set injectFactory: true and switch this path to factory/asyncFactory.js
    // to await nested components. Output with renderToString(await Page(props)).
    importFactory: `import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/jsxFactory.js';`,

    // Custom parsers return trusted raw fragments. Escape each value yourself.
    // Attributes with a colon select a callback by their prefix.
    // Example method below will be called for attribute "ac:anything" in jsx and returns data-ac-anything="value"
    attributeParser: {
        ac: (attribute, value) => {
            const attr = attribute.replace(/:/gi, '-');
            return `data-${attr}="${escapeHtml(value)}"`;
        }
    }
}

// Set JTSX_STRICT_CONFIG=1 in the environment to fail on a broken config.
// A missing config remains optional. It may execute in separate contexts;
// avoid side effects and do not assume one evaluation per process.
