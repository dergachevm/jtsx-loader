import { createFactory } from './factory/createFactory.js';

// No Node hooks, filesystem imports, config-file reads or DOM side effects.
const { _jsx, _jsxFragment, _jsxUtils } = createFactory();
export { _jsx, _jsxFragment, _jsxUtils, createFactory };
export { raw, renderToString } from './runtime.js';
