export default {
    // When true disables warnings when uses React camelCase attributes, like htmlFor instead of for xLinkHref instead of xlink:href
    disableAttrWarnings: false,

    // When true - rewrite react camelCase attributes into default HTML name style
    rewriteReactAttrs: false,

    // Esbuild transform config https://esbuild.github.io/api/#transform
    esbuildTransformConfig: undefined,

    // custom factory path, #@ is native node.js alias from package.json
    importFactory: `import { _jsx, _jsxFragment, _jsxUtils } from 'jtsx-loader/factory/jsxFactory.js';`,

    // Custom attribute parser. Attribute with colon determined as custom and called method by first part before colon
    // Example method below will be called for attribute "ac:anything" in jsx and returns data-ac-anything="value"
    attributeParser: {
        ac: (attribute, value) => {
            const attr = attribute.replace(/:/gi, '-');
            console.log('attr', attr);
            return `data-${attr}="${value}"`;
        }
    }
}