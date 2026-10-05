import possibleAttributes from './possibleAttributes.js';
import _jsxUtils, { escapeHtml } from './jsxUtils.js';
import { raw, renderToString } from '../runtime.js';

// Environment-independent serializer. Node supplies file configuration;
// browsers can create independent factories with explicit options.
export function createFactory(options = {}) {
    const config = {
        attributeParser: {},
        escapeChildren: true,
        escapeAttributes: true,
        ...options,
    };

    // Какие аттрибуты должны быть заменены
    const AttributeMapper = (val) =>
        ({
            tabIndex: 'tabindex',
            className: 'class',
            readOnly: 'readonly',
        })[val] || val;

    const voidElements = [
        'area',
        'base',
        'br',
        'col',
        'embed',
        'hr',
        'img',
        'input',
        'link',
        'meta',
        'source',
        'track',
        'wbr',
    ];
    const isVoidElt = (tagName) => voidElements.includes(tagName);
    const spacer = ' ';

    const objectIntoAttrs = (object) => {
        if (!object) return '';

        const attrMap = Object.keys(object)
            .map((attr, i) => {
                const value = object[attr];
                let finalValue;

                if (typeof value === 'function') {
                    // TODO: в ошибках показывать файл и возможно строку
                    console.warn(
                        `Inline functions not allowed. Attribute ${attr} will be ignored:`,
                    );
                    console.warn(value.toString());
                    return;
                }

                const customAttr = attr.split(':')?.[0];

                if (customAttr && config?.attributeParser?.[customAttr]) {
                    const customAttrVal = config.attributeParser[customAttr](
                        attr,
                        value,
                    );
                    console.assert(
                        attr,
                        `The function "config.attributeParser['${customAttr}']" is expected to return new attribute and value`,
                    );

                    return spacer + customAttrVal;
                }

                if (attr === '__raw' || attr === '__escape') {
                    return; // prevent attribute rendering
                }

                if (attr.toLowerCase() === 'classname') {
                    attr = 'class';
                }

                if (
                    possibleAttributes[attr] &&
                    possibleAttributes[attr] !== attr
                ) {
                    config.disableAttrWarnings !== true &&
                        console.warn(
                            `Warning! Replace "${attr}" with native html property "${possibleAttributes[attr]}"`,
                        );
                    if (config.rewriteReactAttrs === true)
                        attr = possibleAttributes[attr];
                }

                if (attr === 'style' && typeof value === 'object') {
                    if (value === null) return;
                    finalValue = Object.keys(value)
                        .map((key, i) => {
                            const v = value[key];
                            return `${key}: ${v};`;
                        })
                        .join(' ');
                } else {
                    finalValue = value;
                }

                // TODO: how to process empty || falsy atrributes?
                if (finalValue === false) {
                    return;
                }

                // Custom parsers above own their HTML fragments. Ordinary values are
                // escaped by default; only an explicit false restores legacy output.
                if (
                    config.escapeAttributes !== false &&
                    finalValue !== undefined
                ) {
                    finalValue = escapeHtml(finalValue);
                }

                let result = spacer + `${attr}="${finalValue}"`;

                if (finalValue === undefined) {
                    result = spacer + attr;
                }

                return result;
            })
            .filter((a) => a);

        return attrMap;
    };

    const joinChildrens = (children) => {
        return children
            .map((c) => {
                if (Array.isArray(c)) {
                    return c.join(spacer);
                }

                return c;
            })
            .filter((c) => c !== false);
    };

    const createTag = (tagName, attrs, children) => {
        const attributes = objectIntoAttrs(attrs);
        const tagArray = ['<', tagName, ...attributes];

        tagArray.push(isVoidElt(tagName) ? '/>' : '>');
        tagArray.push(
            ...(config.escapeChildren === false
                ? joinChildrens(children)
                : [renderToString(children)]),
        );

        if (
            config.escapeChildren === false
                ? attrs?.__raw
                : attrs?.__raw != null
        ) {
            tagArray.push(attrs.__raw);
        }

        if (
            config.escapeChildren === false
                ? attrs?.__escape
                : attrs?.__escape != null
        ) {
            tagArray.push(escapeHtml(attrs.__escape));
        }

        !isVoidElt(tagName) && tagArray.push('</' + tagName + '>');

        const result = tagArray.join('');

        return config.escapeChildren === false ? result : raw(result);
    };

    const _jsx = (tagName, attrs, ...children) => {
        if (typeof tagName === 'function') {
            return tagName({
                ...attrs,
                children: children.length === 1 ? children[0] : children,
            });
        }

        const tag = createTag(tagName, attrs, children);
        return tag;
    };

    const _jsxFragment = ({ children, ...attrs }) => {
        if (config.escapeChildren !== false)
            return raw(renderToString(children));
        if (children === null) return '';
        if (typeof children === 'object') {
            return children.join(' ');
        }

        return children;
    };

    const escapeChildren = config.escapeChildren !== false;

    return { _jsx, _jsxFragment, _jsxUtils, escapeChildren };
}
