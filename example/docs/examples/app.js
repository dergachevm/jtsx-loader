import { renderToString } from 'jtsx-loader';

// Registration completes before this dynamic import.
const { default: Page } = await import('./Page.jsx');
const html = renderToString(Page({ title: '<Hello>' }));
console.log(html);
