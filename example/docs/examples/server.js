import express from 'express';
import { renderToString } from 'jtsx-loader/runtime.js';
import Page from './Page.jsx';

const app = express();
app.get('/', async (req, res, next) => {
    try {
        const html = renderToString(await Page({ title: 'Hello' }));
        res.type('html').send(html);
    } catch (error) {
        next(error);
    }
});
app.use((req, res) => res.status(404).send('Not found'));
app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    res.status(500).send('Internal server error');
});
app.listen(3000);
