import express, { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
// import { prettify } from 'htmlfy';

const port = process.env.PORT || 3001;
process.env.URL = process.env.URL || 'http://localhost:' + port;
const app = express();
let server = app;


const router = Router();
// jtsx-loader server
app.use('/', express.static(path.resolve('./example')));
app.use('/', router);

const saveFile = (dir, name, data) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + '/' + name, data);
}

const saveHTML = (filePath, data) => {
    const parsed = path.parse(filePath);
    const name = parsed.name + '.html';
    // console.log('name', name);
    saveFile(parsed.dir, name, data);
}

let renderCount = 0;
const render = async (page) => {
    console.time('Render');
    // const fileName = 'test.jsx';
    const fileName = (!page || page === '/'  ? 'index' : page) + '.jsx';

    //INFO: The ?reload parameter is required in development mode to prevent import caching
    const JSXComp = (await import('./pages/' + fileName + '?reload')).default;
    let rendered = await JSXComp({ data: renderCount, title: 'Hello' });
    /* rendered = rendered + `<style>
        body {
            color: #fff;
            background-color: #000;
        }
    </style>`; */
    // rendered = prettify(rendered);
    saveHTML('build/' + fileName, rendered);
    console.timeEnd('Render');
    console.log('================================================');

    return rendered;
}

// Prerender chunks on cold start if needed
// await render();

router.get('/', async (req, res) => {
    renderCount++;
    return res.send(await render());
});

router.get('/:page', async (req, res) => {
    renderCount++;
    return res.send(await render(req.params.page));
});


server.listen(port, () => {
    console.log(`-------------------------------------`);
    console.log(`Static server: http://localhost:${port}`);
    console.log(`-------------------------------------`);
});
