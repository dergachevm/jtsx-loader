import { readConfig } from '../loader/config.mjs';
import { createFactory } from './createFactory.js';

const { _jsx, _jsxFragment, _jsxUtils, escapeChildren } = createFactory(
    await readConfig(),
);
export { _jsx, _jsxFragment, _jsxUtils, escapeChildren };
