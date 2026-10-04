import { escapeHtml } from './factory/jsxUtils.js';

export default {
    // The demo opts in; the library keeps its legacy defaults.
    escapeAttributes: true,
    importFactory: `import { _jsx, _jsxFragment, _jsxUtils } from '#@/factory/jsxFactory.js';`,
    attributeParser: {
        ac: (attribute, value) => {
            const attr = attribute.replace(/:/gi, '-');
            return `data-${attr}="${escapeHtml(value)}"`;
        }
    }
}
