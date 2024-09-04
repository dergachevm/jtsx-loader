const entityMap = {
    "&": 'amp',
    "<": 'lt',
    ">": 'gt',
    '"': 'quot',
    "'": '#39',
    "/": '#x2F',
};

const escapeHtml = (str) => String(str).replace(/[&<>"'\/\\]/g, (s) => `&${entityMap[s]};`);

export default {
    escapeHtml
}

export {
    escapeHtml
}
