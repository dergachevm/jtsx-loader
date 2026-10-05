import { readFileSync } from 'node:fs';

// Executable examples are read once and shared by both translations and tests.
export const examples = Object.fromEntries(
    [
        'Page.jsx',
        'Counter.jsx',
        'client.jsx',
        'build-client.mjs',
        'data.jsx',
        'app.js',
        'bootstrap.js',
        'server.js',
        'async.jsx',
        'async.config.js',
        'static.js',
        'reload.js',
        'dev-server.js',
    ].map((name) => [
        name,
        readFileSync(
            new URL('./examples/' + name, import.meta.url),
            'utf8',
        ).trimEnd(),
    ]),
);

const block = (code, lang = 'jsx', file = '') => ({ code, lang, file });
const sample = (name, lang = name.endsWith('.jsx') ? 'jsx' : 'javascript') =>
    block(examples[name], lang, name);
const choose = (lang, ru, en) => (lang === 'ru' ? ru : en);

export function sections(lang) {
    const t = (ru, en) => choose(lang, ru, en);
    return [
        {
            id: 'start',
            title: t('Быстрый старт', 'Quick start'),
            intro: t(
                'Подключайте JSX и TSX прямо в Node.js без React. Те же компоненты и HTML-фабрика работают в браузере.',
                'Import JSX and TSX directly in Node.js without React. Use the same components and HTML factory in the browser.',
            ),
            paragraphs: [
                t(
                    'Нужны Node.js ≥20.16 и ESM ("type": "module" в package.json). В Node.js loader подключает .jsx/.tsx через импорт и преобразует синтаксис с помощью esbuild. Для браузера компоненты собираются в обычный JavaScript.',
                    'Requires Node.js ≥20.16 and ESM ("type": "module" in package.json). In Node.js, the loader handles .jsx/.tsx imports and transforms syntax with esbuild. For the browser, bundle components into ordinary JavaScript.',
                ),
                t(
                    'Выберите вариант установки, затем создайте Counter.jsx, Page.jsx и app.js в одной папке проекта. Запустите node app.js из этой папки: HTML появится в терминале. Этот пример не запускает сервер; для страницы в браузере перейдите к разделу «Express и Fastify».',
                    'Choose a setup option, then create Counter.jsx, Page.jsx and app.js in the same project directory. Run node app.js there: HTML appears in your terminal. This example does not start a server; see “Express & Fastify” to serve a page in the browser.',
                ),
            ],
            installation: [
                block(
                    'npm install jtsx-loader\nnpm pkg set type=module',
                    'bash',
                    t('Проект уже есть', 'Existing project'),
                ),
                block(
                    'mkdir my-jtsx-app\ncd my-jtsx-app\nnpm init -y\nnpm pkg set type=module\nnpm install jtsx-loader',
                    'bash',
                    t('Создать проект', 'New project'),
                ),
            ],
            blocks: [
                sample('Counter.jsx'),
                sample('Page.jsx'),
                sample('app.js'),
                block('node app.js', 'bash'),
            ],
        },
        {
            id: 'registration',
            title: t('Запуск без --import', 'Run without --import'),
            intro: t(
                'Регистрация загрузчика может находиться прямо в стартовом JS-файле.',
                'Register the loader directly in your JavaScript entry point.',
            ),
            paragraphs: [
                t(
                    'Обычный Node.js должен сначала узнать, как загружать JSX/TSX. Регистрация подключает эту обработку один раз на процесс. Выберите один способ: регистрация в app.js перед динамическим импортом, отдельный bootstrap.js или флаг --import при запуске.',
                    'Node.js first needs a handler for JSX/TSX imports. Registration installs that handler once per process. Choose one approach: register in app.js before a dynamic import, use a separate bootstrap.js, or pass --import when starting Node.',
                ),
                t(
                    'Импорт "jtsx-loader" регистрирует загрузчик; из того же модуля можно импортировать raw и renderToString. Для явной регистрации используйте register.js, как в примере ниже. После регистрации загружайте .jsx/.tsx через await import(). Статический import шаблона в том же стартовом файле выполняется слишком рано — даже если написан ниже регистрации.',
                    'Importing "jtsx-loader" registers the loader; the same module exports raw and renderToString. For explicit registration, use register.js as shown below. Load .jsx/.tsx with await import() afterwards. A static template import in the same entry file is linked too early, even if written below registration.',
                ),
                t(
                    'bootstrap.js — небольшой стартовый файл: он регистрирует загрузчик и только затем запускает server.js. Поэтому в server.js уже можно писать import Page from "./Page.jsx". Код server.js приведён в разделе «Express и Fastify». Для функций без регистрации используйте jtsx-loader/runtime.js; этот путь нужен внутри jtsx.config.js, чтобы избежать цикла загрузки.',
                    'bootstrap.js is a small entry file: it registers the loader and then starts server.js. That lets server.js use import Page from "./Page.jsx". Find server.js in “Express & Fastify”. Use jtsx-loader/runtime.js for helpers without registration, including inside jtsx.config.js to avoid a loading cycle.',
                ),
            ],
            blocks: [
                sample('bootstrap.js'),
                block(
                    'node bootstrap.js\n# Or the original preload path:\nnode --import jtsx-loader server.js',
                    'bash',
                ),
            ],
        },
        {
            id: 'browser',
            title: t('Фабрика в браузере', 'Factory in the browser'),
            intro: t(
                'Один JSX-компонент для фронтенда и бэкенда.',
                'One JSX component for frontend and backend.',
            ),
            paragraphs: [
                t(
                    'Для примера нужны Counter.jsx из быстрого старта и три файла ниже: client.jsx, build-client.mjs и index.html в одной папке. Установите esbuild, запустите сборку и раздавайте эту папку через ваш локальный HTTP-сервер. Откройте index.html по HTTP: кнопка обновляет счётчик. После изменения JSX повторите сборку и обновите страницу.',
                    'Use Counter.jsx from the quick start and the three files below: client.jsx, build-client.mjs and index.html in one directory. Install esbuild, run the build and serve this directory with your local HTTP server. Open index.html over HTTP: the button updates the counter. After changing JSX, rebuild and refresh the page.',
                ),
                t(
                    'Counter.jsx из быстрого старта уже отрендерен на сервере прямо ниже. Клиентская сборка импортирует тот же файл и обновляет его в браузере. Нажмите кнопку: счётчик меняется без запроса к серверу и без React.',
                    'Counter.jsx from the quick start is already server-rendered below. The client bundle imports the same file and updates it in the browser. Click the button: the counter changes without a server request or React.',
                ),
                t(
                    'Импортируйте фабрику из jtsx-loader/browser.js. Этот вход не читает Node-конфиг, не регистрирует loader hooks и не требует Node-полифиллов. Он экспортирует _jsx, _jsxFragment, _jsxUtils, raw, renderToString и createFactory(options). Корневой импорт также выбирает browser.js в сборщиках с поддержкой browser condition; явный путь удобен для предсказуемой настройки.',
                    'Import the factory from jtsx-loader/browser.js. This entry does not read Node configuration, register loader hooks or require Node polyfills. It exports _jsx, _jsxFragment, _jsxUtils, raw, renderToString and createFactory(options). Root imports also select browser.js in bundlers supporting the browser condition; the explicit path makes configuration predictable.',
                ),
                t(
                    'Соберите JSX/TSX заранее: браузер сам не понимает JSX-синтаксис. В esbuild задайте jsxFactory, jsxFragment и inject, как в примере. React и ReactDOM устанавливать не нужно. esbuild работает только при сборке, в клиентский bundle попадают компоненты и фабрика.',
                    'Compile JSX/TSX ahead of time: browsers do not parse JSX syntax themselves. Set jsxFactory, jsxFragment and inject in esbuild as shown. No React or ReactDOM installation is needed. esbuild runs at build time; the client bundle contains your components and the factory.',
                ),
                t(
                    'Фабрика возвращает HTML, а состояние, DOM и события контролирует ваш код. Пример использует innerHTML и делегированный addEventListener на стабильном контейнере. Это повторный рендер, а не hydration или virtual DOM: замена содержимого сбрасывает состояние вложенного DOM и фокус. Для сложных обновлений выбирайте нужную стратегию работы с DOM.',
                    'The factory produces HTML; your code owns state, DOM and events. This example uses innerHTML and a delegated addEventListener on a stable container. It re-renders rather than hydrating or diffing a virtual DOM: replacing content resets nested DOM state and focus. Choose a suitable DOM update strategy for more complex updates.',
                ),
                t(
                    'Общие компоненты должны использовать только данные и универсальные импорты. Вызовы node:fs оставляйте на сервере, а document/window — в клиентском entry. Настройки браузерной фабрики задаются через createFactory(options), не через jtsx.config.js. Async-компоненты можно вызывать с явным await; для автоматического ожидания вложенных компонентов используйте browserAsync.js как inject и renderToString(await Page()). Прежние пути factory/jsxFactory.js и factory/asyncFactory.js также выбирают клиентские адаптеры при browser condition.',
                    'Shared components should use data and cross-platform imports only. Keep node:fs on the server and document/window in the client entry. Configure browser factories through createFactory(options), not jtsx.config.js. Await async component calls explicitly, or inject browserAsync.js for automatic nested resolution and use renderToString(await Page()). Existing factory/jsxFactory.js and factory/asyncFactory.js package imports also select client adapters under the browser condition.',
                ),
            ],
            blocks: [
                sample('client.jsx'),
                sample('build-client.mjs'),
                block(
                    'npm install --save-dev esbuild\nnode build-client.mjs',
                    'bash',
                ),
                block(
                    '<div id="client-demo" data-lang="en"></div>\n<script type="module" src="./dist/client.js"></script>',
                    'html',
                    'index.html',
                ),
                block(
                    `import { createFactory } from 'jtsx-loader/browser.js';\nexport const { _jsx, _jsxFragment, _jsxUtils } = createFactory({\n    rewriteReactAttrs: true,\n});\n// Use this module as the bundler inject entry instead of browser.js.`,
                    'javascript',
                    'factory-config.js',
                ),
            ],
        },
        {
            id: 'components',
            title: t('Компоненты и layouts', 'Components & layouts'),
            intro: t(
                'Обычные функции, props и композиция.',
                'Ordinary functions, props and composition.',
            ),
            paragraphs: [
                t(
                    'Компонент — функция, получающая объект props и возвращающая JSX. Вызов <Layout title="Catalog">...</Layout> передаёт title и вложенное содержимое children. Layout в примере ниже задаёт общую HTML-страницу, а компонент каталога заполняет её содержимое. Для готовой строки вызовите renderToString(await Page({ items })) в серверном коде.',
                    'A component is a function receiving a props object and returning JSX. <Layout title="Catalog">...</Layout> passes title and nested content as children. The Layout below defines a shared HTML document; the catalog component fills its content. To obtain a string, call renderToString(await Page({ items })) in your server code.',
                ),
                t(
                    'Props передаются компоненту без экранирования: значения остаются данными до сериализации тега. children — [], одно значение или массив. Массивы разворачиваются рекурсивно без добавления пробелов. null, undefined и boolean пропускаются; 0 и bigint сохраняются. Пробелы задавайте явно.',
                    'Props reach a component unescaped: values remain data until tag serialization. children is [], one value or an array. Arrays flatten recursively without extra spaces. null, undefined and booleans are omitted; 0 and bigint remain. Add spaces explicitly.',
                ),
                t(
                    'Фрагменты не добавляют DOM-обёртку. Произвольный объект в children вызывает ошибку: выберите его поле или явно используйте JSON.stringify. JSX не устанавливает браузерные обработчики событий; клиентский JS подключается отдельно.',
                    'Fragments add no DOM wrapper. Arbitrary object children throw: select a field or explicitly use JSON.stringify. JSX does not install browser event handlers; load client JavaScript separately.',
                ),
            ],
            blocks: [
                block(
                    `const Layout = ({ title, children }) => <html lang="en">\n    <head><title>{title}</title></head>\n    <body>{children}</body>\n</html>;\n\nexport default ({ items }) => <Layout title="Catalog">\n    <h1>Catalog</h1>\n    <ul>{items.map(item => <li>{item.name}</li>)}</ul>\n    {items.length === 0 && <p>No items</p>}\n    <>{'A'}{' '}{'B'}</>\n</Layout>;`,
                ),
            ],
        },
        {
            id: 'async',
            title: t('Асинхронный рендер', 'Async rendering'),
            intro: t(
                'Явный await или фабрика, ожидающая вложенные компоненты.',
                'Explicit await, or a factory that awaits nested components.',
            ),
            paragraphs: [
                t(
                    'Если компонент загружает данные из API или файла, объявите его async. Для одного такого компонента достаточно явного await; менять конфиг не нужно. Если хотите писать вложенные <Child /> без await в каждом месте, подключите async-фабрику через jtsx.config.js. Это два альтернативных способа, показанных ниже.',
                    'Declare a component async when it loads data from an API or a file. For a single async component, explicit await is enough and needs no config change. To use nested <Child /> without awaiting each call manually, select the async factory in jtsx.config.js. These are two alternative approaches shown below.',
                ),
                t(
                    'Стандартная фабрика синхронна: для async-компонента внутри шаблона используйте {await Child()}. Если Promise попал в children, стандартный рендер сообщит, что его нужно дождаться. Альтернатива — asyncFactory.js в конфиге ниже.',
                    'The default factory is synchronous: use {await Child()} for an async component inside a template. A Promise passed to children produces an instruction to await it. Alternatively, select asyncFactory.js below.',
                ),
                t(
                    'Async-фабрика возвращает Promise с готовой JSX-разметкой, разрешает вложенные массивы и Promise параллельно, сохраняя порядок. Ошибки вложенных компонентов попадают во внешний await. Значения атрибутов и __raw/__escape автоматически не ожидаются: разрешайте их заранее.',
                    'The async factory returns a Promise of rendered JSX markup and resolves nested arrays and Promises concurrently in source order. Nested failures reach the outer await. Attribute values and __raw/__escape are not automatically awaited: resolve them first.',
                ),
            ],
            blocks: [
                block(
                    `const Child = async () => <b>Ready</b>;\nexport default async () => <main>{await Child()}</main>;`,
                ),
                { ...sample('async.config.js'), file: 'jtsx.config.js' },
                sample('async.jsx'),
                block(
                    `import { renderToString } from 'jtsx-loader';\nconst { default: Page } = await import('./async.jsx');\nconsole.log(renderToString(await Page()));`,
                    'javascript',
                    'app-async.js',
                ),
                block('node app-async.js', 'bash'),
            ],
        },
        {
            id: 'attributes',
            title: t('Атрибуты и CSS', 'Attributes & CSS'),
            intro: t(
                'Нативные HTML-имена и явные правила сериализации.',
                'Native HTML names and explicit serialization rules.',
            ),
            paragraphs: [
                t(
                    'Используйте обычный class прямо в JSX/TSX: <div class="card">. className не нужен — это работает без дополнительных настроек и на сервере, и в браузере. Для совместимости className тоже поддерживается и всегда преобразуется в class.',
                    'Use ordinary class directly in JSX/TSX: <div class="card">. You do not need className or extra configuration, on either the server or the browser. For compatibility, className is also supported and always becomes class.',
                ),
                t(
                    'Для других React-имён по умолчанию выводится предупреждение; rewriteReactAttrs: true включает замену. style принимает строку или объект с нативными CSS-именами. style={null} пропускается.',
                    'Other React-style names warn by default; rewriteReactAttrs: true enables replacement. style accepts a string or an object with native CSS names. style={null} is omitted.',
                ),
                t(
                    'true сериализуется как "true", false пропускается, null становится "null", undefined создаёт атрибут без значения. Поэтому aria-expanded={false} нужно записывать строкой "false". Функции в атрибутах пропускаются с предупреждением.',
                    'true serializes as "true", false is omitted, null becomes "null", and undefined creates a bare attribute. Therefore use the string "false" for aria-expanded. Function-valued attributes are ignored with a warning.',
                ),
                t(
                    'attributeParser выбирается по префиксу до двоеточия и возвращает доверенный HTML-фрагмент целиком. Он обязан сам экранировать значения. Имя атрибута берите из кода шаблона.',
                    'attributeParser is selected by the prefix before a colon and returns a complete trusted HTML fragment. It must escape its own values. Attribute names should come from template code.',
                ),
            ],
            blocks: [
                block(
                    `<label class="field" for="name">Name</label>\n<input id="name" value={'"<&'} disabled={true} />\n<div style={{ color: 'red', '--gap': '8px' }} />`,
                ),
                block(
                    `import { escapeHtml } from 'jtsx-loader/factory/jsxUtils.js';\nexport default {\n    attributeParser: {\n        ac: (name, value) =>\n            \`data-\${name.replaceAll(':', '-')}="\${escapeHtml(value)}"\`,\n    },\n};`,
                    'javascript',
                    'jtsx.config.js',
                ),
            ],
        },
        {
            id: 'configuration',
            title: t('Конфигурация', 'Configuration'),
            intro: 'jtsx.config.js',
            paragraphs: [
                t(
                    'Для базового запуска конфиг не нужен. Если хотите изменить настройки, создайте jtsx.config.js рядом с package.json и экспортируйте объект через export default. Запускайте Node из этой папки. После изменения конфига перезапустите процесс: ?reload предназначен для шаблонов, а не для повторной настройки загрузчика.',
                    'Basic usage needs no configuration file. To change options, create jtsx.config.js beside package.json and export an object with export default. Start Node from that directory. Restart the process after changing configuration: ?reload refreshes templates rather than reconfiguring the loader.',
                ),
                t(
                    'Конфиг читается из process.cwd(), а не из папки шаблона. Отсутствующий файл допустим. Ошибка существующего файла вызывает предупреждение и fallback к defaults; JTSX_STRICT_CONFIG=1 завершает запуск с ошибкой. Конфиг может выполняться в разных контекстах Node: избегайте побочных эффектов.',
                    'Configuration is read from process.cwd(), not the template directory. A missing file is optional. A broken existing file warns and falls back to defaults; JTSX_STRICT_CONFIG=1 makes it fail. Configuration can run in separate Node contexts: avoid side effects.',
                ),
                t(
                    'При esbuildTransformConfig задайте injectFactory: true либо импортируйте фабрику вручную. Не сочетайте ручной импорт тех же имён с принудительной инъекцией. esbuildTransformConfig поддерживает настройки transform, включая minify и target.',
                    'When setting esbuildTransformConfig, use injectFactory: true or import the factory manually. Do not combine a manual import of the same names with forced injection. esbuildTransformConfig accepts transform options including minify and target.',
                ),
            ],
            rows: [
                [
                    'escapeChildren',
                    'true',
                    t(
                        'Экранировать строки, возвращать JSX-обёртку',
                        'Escape text; return a JSX wrapper',
                    ),
                ],
                [
                    'escapeAttributes',
                    'true',
                    t(
                        'Экранировать обычные значения атрибутов',
                        'Escape ordinary attribute values',
                    ),
                ],
                [
                    'injectFactory',
                    "'legacy'",
                    t(
                        'Инъекция без esbuildTransformConfig; true — всегда, false — вручную',
                        'Inject without esbuildTransformConfig; true always, false manually',
                    ),
                ],
                [
                    'importFactory',
                    'factory/jsxFactory.js',
                    t(
                        'Строка импорта _jsx, _jsxFragment, _jsxUtils',
                        'Import source for _jsx, _jsxFragment, _jsxUtils',
                    ),
                ],
                [
                    'esbuildTransformConfig',
                    'null',
                    t(
                        'Настройки esbuild transform',
                        'esbuild transform options',
                    ),
                ],
                [
                    'attributeParser',
                    '{}',
                    t(
                        'Обработчики по префиксам атрибутов',
                        'Attribute prefix callbacks',
                    ),
                ],
                [
                    'disableAttrWarnings',
                    'false',
                    t(
                        'Отключить предупреждения React-имён',
                        'Silence React-name warnings',
                    ),
                ],
                [
                    'rewriteReactAttrs',
                    'false',
                    t(
                        'Заменять React-имена нативными',
                        'Rewrite React names to native names',
                    ),
                ],
            ],
            blocks: [
                block(
                    `export default {\n    injectFactory: true,\n    esbuildTransformConfig: { minify: true },\n};`,
                    'javascript',
                    'jtsx.config.js',
                ),
                block(
                    '$env:JTSX_STRICT_CONFIG = "1"\nnode app.js',
                    'powershell',
                ),
            ],
        },
        {
            id: 'servers',
            title: t('Express и Fastify', 'Express & Fastify'),
            intro: t(
                'HTML-строка на границе HTTP.',
                'An HTML string at the HTTP boundary.',
            ),
            paragraphs: [
                t(
                    'Выберите один сервер. Для Express сохраните server.js ниже и bootstrap.js из раздела «Запуск без --import» рядом с Page.jsx и Counter.jsx. Установите express, запустите node bootstrap.js и откройте http://localhost:3000/. Для Fastify используйте отдельный fastify.js, установите fastify и запустите node fastify.js; bootstrap в этом примере не нужен.',
                    'Choose one server. For Express, save server.js below and bootstrap.js from “Run without --import” beside Page.jsx and Counter.jsx. Install express, run node bootstrap.js and open http://localhost:3000/. For Fastify, use a separate fastify.js, install fastify and run node fastify.js; this example needs no bootstrap.',
                ),
                t(
                    'При запросе сервер вызывает Page с данными, ждёт результат и превращает его в HTML-строку через renderToString(). Передавайте в res.send()/reply.send() именно эту строку: JSX-объект фреймворк может принять за JSON. Обработчики ниже возвращают 404 для неизвестного пути и 500 при ошибке рендера.',
                    'On each request, the server calls Page with data, awaits the result and converts it to an HTML string with renderToString(). Pass that string to res.send()/reply.send(): the framework may treat a JSX object as JSON. The handlers below return 404 for an unknown path and 500 if rendering fails.',
                ),
            ],
            blocks: [
                block('npm install express\nnode bootstrap.js', 'bash'),
                sample('server.js'),
                block(
                    `import Fastify from 'fastify';\nimport { renderToString } from 'jtsx-loader';\nconst { default: Page } = await import('./Page.jsx');\nconst app = Fastify({ logger: true });\napp.get('/', async (request, reply) => {\n    const html = renderToString(await Page({ title: 'Hello' }));\n    return reply.type('text/html').send(html);\n});\napp.setNotFoundHandler((request, reply) => reply.code(404).send('Not found'));\napp.setErrorHandler((error, request, reply) => {\n    request.log.error(error);\n    reply.code(500).send('Internal server error');\n});\nawait app.listen({ port: 3000 });`,
                    'javascript',
                    'fastify.js',
                ),
                block('npm install fastify\nnode fastify.js', 'bash'),
            ],
        },
        {
            id: 'static',
            title: t('Статическая генерация', 'Static generation'),
            intro: t(
                'Рендер в файл без HTTP-сервера.',
                'Render to a file without an HTTP server.',
            ),
            paragraphs: [
                t(
                    'Сохраните static.js рядом с Page.jsx и Counter.jsx из быстрого старта. Команда node static.js создаст dist/index.html и завершится. Откройте этот файл или разместите dist на статическом хостинге. После изменения шаблона запустите генерацию заново: уже записанный HTML сам не обновляется.',
                    'Save static.js beside Page.jsx and Counter.jsx from the quick start. Running node static.js creates dist/index.html and exits. Open the file or deploy dist to static hosting. Run the generator again after changing a template: existing HTML files do not update themselves.',
                ),
                t(
                    'Этот пример не требует --import. Не подавляйте ошибки сборки: недоступные данные или ошибка шаблона должны приводить к ненулевому коду выхода. Создание каталога и запись выполняются явно. Для полной страницы добавьте html/head/body в Page.',
                    'This example needs no --import flag. Do not swallow build errors: unavailable data or a broken template should produce a non-zero exit. Directory creation and writing are explicit. Add html/head/body to Page for a complete document.',
                ),
            ],
            blocks: [sample('static.js'), block('node static.js', 'bash')],
        },
        {
            id: 'typescript',
            title: 'JSX / TSX',
            intro: t(
                'Транспиляция через esbuild, без проверки типов.',
                'Transpilation with esbuild, without type checking.',
            ),
            paragraphs: [
                t(
                    'Загрузчик обрабатывает .jsx и .tsx. Обычные .ts он передаёт Node; возможность выполнить их зависит от версии Node. Импортируйте файлы с расширением. Проверку типов запускайте отдельно; готовый JSX namespace и полные типы props пока не поставляются. Не считайте успешный запуск TSX проверкой TypeScript.',
                    'The loader handles .jsx and .tsx. Ordinary .ts files are delegated to Node, whose support varies by version. Include file extensions in imports. Run type checking separately; a complete JSX namespace and prop typings are not yet shipped. A successful TSX render is not a TypeScript check.',
                ),
            ],
            blocks: [
                block(
                    `type Props = { title: string; count: number };\nexport default ({ title, count }: Props) => <section>\n    <h1>{title}</h1>\n    <p>{count}</p>\n</section>;`,
                    'tsx',
                    'Card.tsx',
                ),
            ],
        },
        {
            id: 'development',
            title: t('Разработка и диагностика', 'Development & diagnostics'),
            intro: t(
                'Как увидеть изменения шаблонов и найти причину ошибки.',
                'See template changes and identify the cause of an error.',
            ),
            paragraphs: [
                t(
                    'Node.js сохраняет результат импорта модуля в памяти. Если сервер продолжает работать, повторный обычный import того же пути возвращает уже загруженный модуль. Изменение файла на диске и обновление вкладки браузера сами по себе не обновляют этот модуль.',
                    'Node.js caches imported modules in memory. While the server keeps running, an ordinary import of the same path returns the already loaded module. Editing the file and refreshing the browser tab do not themselves refresh that module.',
                ),
                t(
                    'Есть два способа увидеть изменения: перезапустить процесс Node.js или повторно импортировать шаблон с ?reload в том же процессе. Автоматическое обновление вкладки браузера — отдельная задача; сам jtsx-loader не следит за файлами и не отправляет браузеру сигнал live reload.',
                    'There are two ways to see edits: restart Node.js or import the template again with ?reload in the same process. Automatic browser refresh is a separate task; jtsx-loader does not watch files or send live-reload notifications to the browser.',
                ),
            ],
            topics: [
                {
                    id: 'reload',
                    title: t('Где писать ?reload', 'Where to put ?reload'),
                    paragraphs: [
                        t(
                            'Добавьте ?reload в конец пути внутри динамического import: await import("./Page.jsx?reload"). На диске файл по-прежнему называется Page.jsx. Это параметр импорта, который обрабатывает загрузчик jtsx-loader, а не флаг команды Node и не параметр адреса страницы в браузере. Перед импортом загрузчик должен быть зарегистрирован.',
                            'Append ?reload to the path inside a dynamic import: await import("./Page.jsx?reload"). The file on disk is still named Page.jsx. This is an import parameter handled by jtsx-loader, not a Node command-line flag or a query parameter in the browser address bar. Register the loader before importing the template.',
                        ),
                        t(
                            'Используйте именно ?reload без значения. Каждый такой вызов создаёт новый экземпляр шаблона и его ESM-зависимостей, включая вложенные JSX/TSX-компоненты и JS-модули. Добавлять ?reload к каждому дочернему импорту не нужно: он распространяется от родительского шаблона. Это не механизм очистки CommonJS require.cache.',
                            'Use exactly ?reload without a value. Each call creates a fresh instance of the template and its ESM dependencies, including nested JSX/TSX components and JS modules. Child imports do not need their own ?reload: refreshing propagates from the parent template. This does not clear CommonJS require.cache.',
                        ),
                        t(
                            'Импорт должен выполняться заново при каждом обновлении. Если один раз сохранить Page в переменную, повторный Page(props) продолжит вызывать старую функцию. В reload.js ниже импорт находится внутри renderPage(), поэтому каждый вызов берёт актуальный шаблон.',
                            'Run the import again on each refresh. If you save Page in a variable once, calling Page(props) again still invokes the old function. In reload.js below, the import is inside renderPage(), so each call obtains the current template.',
                        ),
                    ],
                    blocks: [sample('reload.js')],
                },
                {
                    id: 'reload-example',
                    title: t('Проверить обновление вложенного компонента', 'Try refreshing a nested component'),
                    paragraphs: [
                        t(
                            'Сохраните reload.js и dev-server.js рядом с Page.jsx и Counter.jsx из быстрого старта. Запустите node dev-server.js и откройте http://localhost:3000/. Измените текст в Counter.jsx, сохраните файл и обновите страницу. Ответ должен содержать новый текст без перезапуска сервера, даже если Page.jsx не менялся. Сервер использует встроенный node:http, Express не нужен.',
                            'Save reload.js and dev-server.js beside Page.jsx and Counter.jsx from the quick start. Run node dev-server.js and open http://localhost:3000/. Edit text in Counter.jsx, save and refresh the page. The response should contain the new text without restarting the server, even when Page.jsx is unchanged. This server uses built-in node:http and needs no Express.',
                        ),
                        t(
                            'Это пример для разработки. Новые импорты не удаляют старые экземпляры из памяти, а зависимости могут повторно выполнять код при загрузке. Для долгих сессий перезапускайте процесс; для production используйте обычные импорты. После изменения jtsx.config.js также перезапустите Node.js.',
                            'This is a development example. New imports do not remove old instances from memory, and dependencies may execute initialization code again. Restart the process during long sessions; use ordinary imports in production. Restart Node.js after changing jtsx.config.js too.',
                        ),
                    ],
                    blocks: [sample('dev-server.js'), block('node dev-server.js', 'bash')],
                },
                {
                    id: 'restart',
                    title: t('Автоматический перезапуск вашего сервера', 'Automatically restart your server'),
                    paragraphs: [
                        t(
                            'Если сохранять процесс не требуется, используйте nodemon с обычным bootstrap.js из примера Express. Он следит за указанными расширениями и перезапускает Node после сохранения файла. ?reload в этом варианте не нужен. После перезапуска обновите страницу браузера; nodemon сам вкладку не обновляет.',
                            'If the process does not need to stay alive, use nodemon with the ordinary bootstrap.js from the Express example. It watches the listed file extensions and restarts Node after a save. This option needs no ?reload. Refresh the browser after the restart; nodemon does not refresh the tab itself.',
                        ),
                    ],
                    blocks: [block('npm install --save-dev nodemon\nnpx nodemon --watch . --ext js,mjs,cjs,json,jsx,tsx --ignore dist/ --ignore build/ bootstrap.js', 'bash')],
                },
                {
                    id: 'docs-site',
                    title: t('Запуск самого сайта документации', 'Run the documentation site itself'),
                    paragraphs: [
                        t(
                            'Следующие команды относятся к клону репозитория jtsx-loader, а не к проекту, в котором установлен пакет. После npm install запустите npm run dev и откройте http://localhost:3001/ru. Сервер перезапускается при изменении исходников; страницу браузера обновляйте отдельно. Для запуска без наблюдения используйте npm start.',
                            'These commands are for a clone of the jtsx-loader repository, not a project that installs the package. After npm install, run npm run dev and open http://localhost:3001/. The server restarts when source files change; refresh the browser separately. Use npm start to run without watching.',
                        ),
                        t(
                            'Для сохранения HTML остановите сервер и запустите npm start -- --write-html. Затем откройте нужные страницы: их HTML запишется в build/. Это сохранение запрошенных страниц, а не обход всех маршрутов. Исходники JSX по HTTP не раздаются.',
                            'To save HTML, stop the server and run npm start -- --write-html. Visit the pages you need: their HTML is written to build/. This saves requested pages rather than crawling every route. JSX sources are not served over HTTP.',
                        ),
                    ],
                    blocks: [block('npm install\nnpm run dev', 'bash')],
                },
            ],
            tableTitle: t('Частые ошибки и способы исправления', 'Common errors and fixes'),
            rows: [
                [
                    t('Ошибка', 'Error'),
                    t('Причина', 'Cause'),
                    t('Действие', 'Action'),
                ],
                [
                    'ERR_UNKNOWN_FILE_EXTENSION',
                    t(
                        'Шаблон импортирован до регистрации',
                        'Template imported before registration',
                    ),
                    t(
                        'Сначала import "jtsx-loader", затем await import("./Page.jsx"); либо запускайте server.js через bootstrap.js.',
                        'Import "jtsx-loader" first, then await import("./Page.jsx"); or start server.js through bootstrap.js.',
                    ),
                ],
                [
                    '_jsx is not defined',
                    t(
                        'Отключена инъекция фабрики',
                        'Factory injection disabled',
                    ),
                    t('В jtsx.config.js задайте injectFactory: true или импортируйте фабрику вручную. Проверьте esbuildTransformConfig.', 'Set injectFactory: true in jtsx.config.js or import the factory manually. Check esbuildTransformConfig.'),
                ],
                [
                    t('Теги видны как текст', 'Tags shown as text'),
                    t(
                        'HTML передан обычной строкой',
                        'HTML passed as a plain string',
                    ),
                    t(
                        'Не преобразуйте дочерний JSX в строку. Для доверенной HTML-строки используйте raw(html); renderToString вызывайте перед отправкой всего результата.',
                        'Keep child JSX as a JSX value. Use raw(html) for trusted HTML strings; call renderToString before sending the final result.',
                    ),
                ],
                [
                    '[object Promise]',
                    t(
                        'Async-значение в старом режиме',
                        'Async value in legacy mode',
                    ),
                    t('await или asyncFactory', 'await or asyncFactory'),
                ],
                [
                    t('Вложенный компонент не обновляется', 'A nested component stays unchanged'),
                    t('Сервер использует кешированный импорт', 'The server uses a cached import'),
                    t('Повторите await import("./Page.jsx?reload") и используйте новый default, либо перезапустите процесс. Обновления браузера недостаточно.', 'Repeat await import("./Page.jsx?reload") and use the new default export, or restart the process. Refreshing the browser alone is not enough.'),
                ],
                [
                    'ERR_MODULE_NOT_FOUND',
                    t('Не найден пакет или импортируемый файл', 'A package or imported file cannot be found'),
                    t('Установите зависимость в этом проекте и проверьте путь, регистр букв и расширение .jsx/.tsx.', 'Install the dependency in this project and check the path, letter case and .jsx/.tsx extension.'),
                ],
                [
                    'JTSX TRANSFORM ERROR',
                    t('Ошибка синтаксиса шаблона или параметров преобразования', 'Invalid template syntax or transform options'),
                    t('Откройте файл и строку из сообщения в терминале. Исправьте JSX/TSX или esbuildTransformConfig и повторите запуск.', 'Open the file and line reported in the terminal. Fix JSX/TSX or esbuildTransformConfig and retry.'),
                ],
            ],
            blocks: [],
        },
        {
            id: 'escaping',
            title: t('Экранирование и raw()', 'Escaping & raw()'),
            intro: t(
                'Строки — текст. raw(value) — явное разрешение на вставку HTML.',
                'Strings are text. raw(value) explicitly permits HTML insertion.',
            ),
            paragraphs: [
                t(
                    'По умолчанию текст и значения обычных атрибутов экранируются. JSX-результат хранит признак готовой разметки: вложенные компоненты не экранируются повторно. На границе HTTP, файла или лога вызывайте renderToString(await Page(props)). Не превращайте дочерний JSX в строку до вставки — признак разметки потеряется.',
                    'Text and ordinary attribute values are escaped by default. JSX results retain their identity as rendered markup, so nested components are not escaped twice. Call renderToString(await Page(props)) at the HTTP, file or logging boundary. Converting child JSX to a string before insertion loses its markup identity.',
                ),
                t(
                    'raw() возвращает неизменяемую обёртку и ничего не очищает. Используйте только доверенный или заранее очищенный HTML. В атрибуте raw() не отключает экранирование. __raw и __escape сохранены; __escape не нужно для обычного текста. Уже экранированные строки будут экранированы повторно.',
                    'raw() returns an immutable wrapper and does not sanitize anything. Only use trusted or previously sanitized HTML. raw() does not bypass escaping in attributes. __raw and __escape remain supported; ordinary text no longer needs __escape. Pre-escaped strings are escaped again.',
                ),
                t(
                    'Экранирование не проверяет URL-протоколы, имена динамических тегов/атрибутов, CSS и строковые event handlers. Не передавайте недоверенные структуры props целиком. Для script/style нужна контекстная обработка: raw() допустим для доверенного исходного кода, но не делает вставку пользовательского JavaScript безопасной.',
                    'Escaping does not validate URL protocols, dynamic tag/attribute names, CSS or string event handlers. Do not spread untrusted props wholesale. script/style need context-specific handling: raw() can insert trusted source code, but does not make user JavaScript safe.',
                ),
            ],
            blocks: [
                block(
                    `import { raw } from 'jtsx-loader';\n\nconst text = '<b>Hello</b>';\nconst Text = () => <p>{text}</p>;\nconst Markup = () => <p>{raw(text)}</p>;`,
                ),
                block(
                    '<p>&lt;b&gt;Hello&lt;&#x2F;b&gt;</p>\n<p><b>Hello</b></p>',
                    'html',
                    t('Результат', 'Result'),
                ),
                sample('data.jsx'),
            ],
        },
        {
            id: 'migration',
            title: t('Миграция с 0.1.18', 'Migration from 0.1.18'),
            intro: t(
                'Новые defaults меняют публичный контракт.',
                'The new defaults change the public contract.',
            ),
            steps: [
                t(
                    'Замените передачу результата напрямую в HTTP/файл на renderToString(await Page(props)).',
                    'Replace direct HTTP/file output with renderToString(await Page(props)).',
                ),
                t(
                    'Уберите ручной escapeHtml у обычных children и атрибутов.',
                    'Remove manual escapeHtml calls for ordinary children and attributes.',
                ),
                t(
                    'Замените намеренную HTML-строку в children на raw(html).',
                    'Wrap intentional HTML strings in raw(html).',
                ),
                t(
                    'Не склеивайте дочерний JSX через join()/шаблонные строки до рендера.',
                    'Do not join/interpolate child JSX into strings before rendering.',
                ),
                t(
                    'Учитывайте отсутствие неявных пробелов и сохранение нуля.',
                    'Account for no implicit spaces and preserved zero.',
                ),
            ],
            paragraphs: [
                t(
                    'Для поэтапного перехода включите оба старых defaults. Этот режим возвращает прежние строки, поэтому отдавайте результат напрямую, как раньше: renderToString считает обычную строку текстом. Отключать экранирование для новых проектов не рекомендуется.',
                    'For gradual migration, enable both legacy defaults below. This mode returns the old strings, so send the result directly as before: renderToString treats a plain string as text. Disabling escaping is not recommended for new projects.',
                ),
                t(
                    'В этом обновлении сохранены прежние deep-import пути, регистрация через --import, конфигурация, async-фабрика и ?reload. Полный changelog находится в репозитории.',
                    'This update retains existing deep-import paths, --import registration, configuration, the async factory and ?reload. The complete changelog lives in the repository.',
                ),
            ],
            blocks: [
                block(
                    `export default {\n    escapeChildren: false,\n    escapeAttributes: false,\n};`,
                    'javascript',
                    'jtsx.config.js',
                ),
            ],
        },
    ];
}
