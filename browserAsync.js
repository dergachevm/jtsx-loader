import { createFactory } from './factory/createFactory.js';
import { createAsyncFactory } from './factory/createAsyncFactory.js';

const { _jsx, _jsxFragment, _jsxUtils } = createAsyncFactory(createFactory());
export { _jsx, _jsxFragment, _jsxUtils };
export { raw, renderToString } from './runtime.js';
