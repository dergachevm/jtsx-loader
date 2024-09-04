export default {
    importFactory: `import { _jsx, _jsxFragment, _jsxUtils } from '#@/factory/jsxFactory.js';`,
    attributeParser: {
        ac: (attribute, value) => {
            const attr = attribute.replace(/:/gi, '-');
            return `data-${attr}="${value}"`;
        }
    }
}