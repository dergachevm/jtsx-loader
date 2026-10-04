import { _jsx as renderTag, _jsxUtils } from './jsxFactory.js';

async function resolveChildren(children) {
    // Attach handlers to all siblings (and nested arrays) immediately. Waiting
    // sequentially can leave a fast rejection unhandled behind a slow sibling.
    const resolved = await Promise.all(children.map(async child => {
        if (Array.isArray(child)) return resolveChildren(child);
        const value = await child;
        if (Array.isArray(value)) return resolveChildren(value);
        if (value == null || typeof value === 'boolean') return [];
        if (['string', 'number', 'bigint'].includes(typeof value)) return [value];
        throw new TypeError('[jtsx-loader] Unsupported child value; render objects to text explicitly');
    }));
    return resolved.flat();
}

async function _jsx(tagName, attrs, ...children) {
    const resolved = await resolveChildren(children);
    if (typeof tagName === 'function') {
        const result = tagName({ ...attrs, children: resolved.length === 1 ? resolved[0] : resolved });
        return (await resolveChildren([result])).join('');
    }

    const attributes = { ...attrs };
    for (const name of ['__raw', '__escape']) {
        if (attributes[name] != null) attributes[name] = String(attributes[name]);
    }
    // Reuse the legacy HTML/attribute serializer without altering its API.
    // Joining here implements the new mode's explicit-whitespace policy.
    return renderTag(tagName, attributes, resolved.join(''));
}

async function _jsxFragment({ children }) {
    return (await resolveChildren([children])).join('');
}

export { _jsx, _jsxFragment, _jsxUtils };
