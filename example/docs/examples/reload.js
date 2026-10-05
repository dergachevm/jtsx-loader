import { renderToString } from 'jtsx-loader';

// Development only: import again for each render, including nested components.
export async function renderPage(props) {
    const { default: Page } = await import('./Page.jsx?reload');
    return renderToString(await Page(props));
}
