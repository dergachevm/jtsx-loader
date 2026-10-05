import 'jtsx-loader';

// Registration completes before this dynamic import.
const { default: Page } = await import('./Page.jsx');
const html = String(Page({ title: 'Hello JSX' }));
console.log(html);
