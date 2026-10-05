import { escapeHtml } from './factory/jsxUtils.js';

// Share identity across ?reload module instances. Strings themselves never carry
// trust, and JSON/plain objects cannot manufacture a trusted result.
const key = Symbol.for('jtsx-loader.html-values');
const values = (globalThis[key] ??= new WeakMap());

export function isHtml(value) {
    return value !== null && typeof value === 'object' && values.has(value);
}

export function raw(value) {
    if (isHtml(value)) return value;
    if (value != null && typeof value.then === 'function') {
        throw new TypeError(
            '[jtsx-loader] await the value before calling raw()',
        );
    }
    const html = value == null ? '' : String(value);
    const result = Object.freeze({
        toString: () => html,
        [Symbol.toPrimitive]: () => html,
    });
    values.set(result, html);
    return result;
}

export function renderToString(value) {
    if (isHtml(value)) return values.get(value);
    if (Array.isArray(value)) return value.map(renderToString).join('');
    if (value == null || typeof value === 'boolean') return '';
    if (['string', 'number', 'bigint'].includes(typeof value))
        return escapeHtml(value);
    if (typeof value?.then === 'function') {
        throw new TypeError(
            '[jtsx-loader] await the render before calling renderToString()',
        );
    }
    throw new TypeError(
        '[jtsx-loader] Unsupported child value; render objects to text explicitly',
    );
}
