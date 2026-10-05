import { createServer } from 'node:http';
import { renderPage } from './reload.js';

export const server = createServer(async (request, response) => {
    if (request.url !== '/') {
        response.writeHead(404).end('Not found');
        return;
    }
    try {
        const html = await renderPage({ title: 'Live JSX' });
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(html);
    } catch (error) {
        console.error(error);
        response.writeHead(500).end('Render failed; check the terminal');
    }
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
    console.log('Development server: http://localhost:' + server.address().port);
});
