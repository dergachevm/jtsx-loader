import { isHtml, raw, renderToString } from '../runtime.js';

export function createAsyncFactory({
    _jsx: renderTag,
    _jsxUtils,
    escapeChildren,
}) {
    async function resolveChildren(children) {
        // Attach handlers to all siblings (and nested arrays) immediately. Waiting
        // sequentially can leave a fast rejection unhandled behind a slow sibling.
        const resolved = await Promise.all(
            children.map(async (child) => {
                if (Array.isArray(child)) return resolveChildren(child);
                const value = await child;
                if (Array.isArray(value)) return resolveChildren(value);
                if (value == null || typeof value === 'boolean') return [];
                if (
                    isHtml(value) ||
                    ['string', 'number', 'bigint'].includes(typeof value)
                )
                    return [value];
                throw new TypeError(
                    '[jtsx-loader] Unsupported child value; render objects to text explicitly',
                );
            }),
        );
        return resolved.flat();
    }

    async function _jsx(tagName, attrs, ...children) {
        const resolved = await resolveChildren(children);
        if (typeof tagName === 'function') {
            const result = tagName({
                ...attrs,
                children: resolved.length === 1 ? resolved[0] : resolved,
            });
            const content = await resolveChildren([result]);
            return escapeChildren
                ? raw(renderToString(content))
                : content.join('');
        }

        const attributes = { ...attrs };
        for (const name of ['__raw', '__escape']) {
            if (attributes[name] != null)
                attributes[name] = String(attributes[name]);
        }
        // Keep trusted JSX objects intact until the native tag serializes them.
        // Legacy mode still joins without the synchronous factory's array spaces.
        return renderTag(
            tagName,
            attributes,
            ...(escapeChildren ? resolved : [resolved.join('')]),
        );
    }

    async function _jsxFragment({ children }) {
        const content = await resolveChildren([children]);
        return escapeChildren ? raw(renderToString(content)) : content.join('');
    }

    return { _jsx, _jsxFragment, _jsxUtils };
}
