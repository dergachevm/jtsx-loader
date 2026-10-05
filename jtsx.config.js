import { escapeHtml } from './factory/jsxUtils.js';

export default {
    // Explicit for clarity; the library now escapes by default too.
    escapeChildren: true,
    escapeAttributes: true,
    importFactory: `import { _jsx, _jsxFragment, _jsxUtils } from '#@/factory/jsxFactory.js';`,
    attributeParser: {
        ac: (attribute, value) => {
            const attr = attribute.replace(/:/gi, '-');
            return `data-${attr}="${escapeHtml(value)}"`;
        }
    }
}
