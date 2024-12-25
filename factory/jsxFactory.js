import possibleAttributes from './possibleAttributes.js';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import _jsxUtils, { escapeHtml } from './jsxUtils.js';

// WARN: сделать вставку html без аттрибута нельзя, потому что тогда нужно писать новый синтаксис для vscode
const configUrl = pathToFileURL(path.join(process.cwd(), 'jtsx.config.js'));
const loadedConfig = (await import(configUrl.href).catch(() => ({}))).default;

let config = {
    attributeParser: {},
    ...loadedConfig
};

// Какие аттрибуты должны быть заменены
const AttributeMapper = (val) => ({
        tabIndex: 'tabindex',
        className: 'class',
        readOnly: 'readonly',
    }[val] || val);

const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'];
const isVoidElt = (tagName) => voidElements.includes(tagName);
const spacer = ' ';

const objectIntoAttrs = (object) => {
    if (!object) return '';

    const attrMap = Object.keys(object).map((attr, i) => {
        const value = object[attr];
        let finalValue;

        if (typeof value === 'function') {
            // TODO: в ошибках показывать файл и возможно строку
            console.warn(`Inline functions not allowed. Attribute ${attr} will be ignored:`);
            console.warn(value.toString());
            return;
        }

        const customAttr = attr.split(':')?.[0];

        if (customAttr && config?.attributeParser?.[customAttr]) {
            const customAttrVal = config.attributeParser[customAttr](attr, value);
            console.assert(attr, `The function "config.attributeParser['${customAttr}']" is expected to return new attribute and value`);

            return spacer + customAttrVal;
        }

        if (attr === '__raw' || attr === '__escape') {
            return; // prevent attribute rendering
        }

        if (attr.toLowerCase() === 'classname') {
            attr = 'class';
        }

        if (possibleAttributes[attr] && possibleAttributes[attr] !== attr) {
            (config.disableAttrWarnings !== true) && console.warn(`Warning! Replace "${attr}" with native html property "${possibleAttributes[attr]}"`);
            if (config.rewriteReactAttrs === true) attr = possibleAttributes[attr];
        }

        if (attr === 'style' && typeof value === 'object') {
            finalValue = Object.keys(value).map((key, i) => {
                const v = value[key];
                return `${key}: ${v};`;
            }).join(' ');
        } else {
            finalValue = value;
        }

        // TODO: how to process empty || falsy atrributes?
        if (finalValue === false) {
            return;
        }

        let result = spacer + `${attr}="${finalValue}"`;

        if (finalValue === undefined) {
            result = spacer + attr;
        }

        return result;
    })
        .filter(a => a);

    return attrMap;
}

const joinChildrens = (children) => {
    return children.map(c => {
        if (Array.isArray(c)) {
            return c.join(spacer);
        }

        return c;
    }).filter(c => c !== false)
}

const createTag = (tagName, attrs, children) => {
    const attributes = objectIntoAttrs(attrs);
    const tagArray = [
        '<',
        tagName,
        ...attributes
    ]

    tagArray.push(isVoidElt(tagName) ? '/>' : '>');
    tagArray.push(...joinChildrens(children));

    if (attrs?.__raw) { tagArray.push(attrs.__raw) }

    if (attrs?.__escape) { tagArray.push(escapeHtml(attrs.__escape)) }

    !isVoidElt(tagName) && tagArray.push('</' + tagName + '>');

    const result = tagArray.join('');

    return result;
}

const _jsx = (tagName, attrs, ...children) => {
    try {
        if (typeof tagName === 'function') {
            return tagName({ ...attrs, children: children.length === 1 ? children[0] : children });
        }

        const tag = createTag(tagName, attrs, children);
        return tag;
    } catch (error) {
        throw new Error(error);
    }
}

const _jsxFragment = ({ children, ...attrs }) => {
    return children.join(' ');
}

/* export {
    DOMcreateElement as h,
    DOMcreateFragment as Fragment,
} */

export { _jsx, _jsxFragment, _jsxUtils }
