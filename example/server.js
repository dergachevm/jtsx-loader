import express from 'express';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { renderToString } from 'jtsx-loader/runtime.js';

const port = process.env.PORT || 3001;
process.env.URL = process.env.URL || 'http://localhost:' + port;
const app = express();
const exampleDirectory = fileURLToPath(new URL('./', import.meta.url));
const writeHTML = process.argv.includes('--write-html');

// Only public assets are served; templates and server code stay private.
app.use('/styles', express.static(path.join(exampleDirectory, 'styles')));
app.use('/scripts', express.static(path.join(exampleDirectory, 'scripts')));
for (const name of ['200.json', '401.json']) {
    app.get('/api/' + name, (req, res) => res.sendFile(path.join(exampleDirectory, 'api', name)));
}

const pages = new Map([['/', 'index'], ['/ru', 'ru'], ['/test', 'test']]);
let renderCount = 0;
for (const [route, page] of pages) {
    app.get(route, async (req, res, next) => {
        try {
            // Development changes restart the process through nodemon.
            const Component = (await import('./pages/' + page + '.jsx')).default;
            const rendered = '<!doctype html>\n' + renderToString(await Component({ data: ++renderCount, title: 'Hello' }));
            if (writeHTML) {
                const outputDirectory = path.resolve('build');
                await mkdir(outputDirectory, { recursive: true });
                await writeFile(path.join(outputDirectory, page + '.html'), rendered);
            }
            res.type('html').send(rendered);
        } catch (error) {
            next(error);
        }
    });
}

app.use((req, res) => res.status(404).type('text').send('Not found'));
app.use((error, req, res, next) => {
    console.error('[jtsx-loader demo] Render failed:', error);
    if (res.headersSent) return next(error);
    res.status(500).type('text').send('Internal server error');
});

app.listen(port, () => {
    console.log(`Static server: http://localhost:${port}`);
});
