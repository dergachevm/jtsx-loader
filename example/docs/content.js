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
                    'Установите пакет из npm в своём проекте. Этот быстрый старт работает с опубликованной версией 0.1.18 и не требует флага --import. String() получает HTML как из текущей строки, так и из HTML-значения следующей версии.',
                    'Install the package from npm in your project. This quick start works with the published 0.1.18 release without an --import flag. String() reads HTML from both the current string result and the next version’s HTML value.',
                ),
            ],
            blocks: [
                block(
                    'npm install jtsx-loader',
                    'bash',
                ),
                block('{\n  "type": "module"\n}', 'json', 'package.json'),
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
                    'В npm 0.1.18 используйте import "jtsx-loader", как в быстром старте. Следующий релиз также добавляет renderToString и register.js из примеров ниже. После регистрации загружайте .jsx/.tsx через await import(). Статический import шаблона в том же стартовом файле выполняется слишком рано — даже если написан ниже регистрации.',
                    'With npm 0.1.18, use import "jtsx-loader" as in the quick start. The next release also adds renderToString and register.js shown below. Load .jsx/.tsx with await import() afterwards. A static template import in the same entry file is linked too early, even if written below registration.',
                ),
                t(
                    'Чтобы оставить статические импорты в server.js, используйте отдельный bootstrap. Вариант node --import jtsx-loader server.js тоже продолжает работать. Для функций без регистрации используйте jtsx-loader/runtime.js; этот путь нужен внутри jtsx.config.js, чтобы избежать цикла загрузки.',
                    'To keep static imports in server.js, use a separate bootstrap. node --import jtsx-loader server.js also remains supported. Use jtsx-loader/runtime.js for helpers without registration; use this path inside jtsx.config.js to avoid a loading cycle.',
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
                    'Точки входа browser.js и browserAsync.js относятся к следующему релизу (Unreleased). В опубликованной npm-версии 0.1.18 их пока нет.',
                    'The browser.js and browserAsync.js entries belong to the next release (Unreleased). The published npm 0.1.18 package does not include them yet.',
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
                    `const html = renderToString(await Page());`,
                    'javascript',
                ),
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
                    'className всегда становится class. Для других React-имён по умолчанию выводится предупреждение; rewriteReactAttrs: true включает замену. style принимает строку или объект с нативными CSS-именами. style={null} пропускается.',
                    'className always becomes class. Other React-style names warn by default; rewriteReactAttrs: true enables replacement. style accepts a string or an object with native CSS names. style={null} is omitted.',
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
                    `<label className="field" for="name">Name</label>\n<input id="name" value={'"<&'} disabled={true} />\n<div style={{ color: 'red', '--gap': '8px' }} />`,
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
                    'Express и Fastify устанавливаются отдельно. Запускайте сервер через bootstrap из раздела выше либо с --import. Обрабатывайте ошибки рендера и возвращайте завершённые 404/500. Не передавайте JSX-объект напрямую в res.send()/reply.send(): сначала renderToString().',
                    'Install Express or Fastify separately. Start the server with the bootstrap above or --import. Handle render failures and complete 404/500 responses. Do not pass a JSX object directly to res.send()/reply.send(): call renderToString() first.',
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
                'Перезапуск процесса вместо бесконечного reload.',
                'Restart the process instead of endless reload.',
            ),
            paragraphs: [
                t(
                    'npm start запускает этот сайт, npm run dev перезапускает его при изменении файлов. Скрипты регистрируют loader из кода. --write-html явно разрешает сохранение запрошенных страниц в build/. Исходники шаблонов по HTTP не раздаются.',
                    'npm start runs this site; npm run dev restarts it when files change. These scripts register the loader from code. --write-html explicitly enables saving requested pages to build/. Template sources are not served over HTTP.',
                ),
                t(
                    '?reload создаёт новые ESM-идентичности шаблона и зависимостей. Он не выгружает старые модули и не ограничивает память. Для dev используйте перезапуск, для production — обычные импорты.',
                    '?reload creates new ESM identities for the template and dependencies. It does not unload old modules or bound memory. Use restarts in development and normal imports in production.',
                ),
            ],
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
                        'Динамический import или bootstrap',
                        'Dynamic import or bootstrap',
                    ),
                ],
                [
                    '_jsx is not defined',
                    t(
                        'Отключена инъекция фабрики',
                        'Factory injection disabled',
                    ),
                    'injectFactory: true',
                ],
                [
                    t('Теги видны как текст', 'Tags shown as text'),
                    t(
                        'HTML передан обычной строкой',
                        'HTML passed as a plain string',
                    ),
                    t(
                        'Сохранить JSX-объект или raw(trustedHtml)',
                        'Keep the JSX object or use raw(trustedHtml)',
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
            ],
            blocks: [
                block(
                    'npm install\nnpm start\nnpm run dev\nnpm start -- --write-html',
                    'bash',
                ),
            ],
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
            paragraphs: [
                t(
                    '1. Замените передачу результата напрямую в HTTP/файл на renderToString(await Page(props)). 2. Уберите ручной escapeHtml у обычных children и атрибутов. 3. Замените намеренную HTML-строку в children на raw(html). 4. Не склеивайте дочерний JSX через join()/шаблонные строки до рендера. 5. Учитывайте отсутствие неявных пробелов и сохранение нуля.',
                    '1. Replace direct HTTP/file output with renderToString(await Page(props)). 2. Remove manual escapeHtml calls for ordinary children and attributes. 3. Wrap intentional HTML strings in raw(html). 4. Do not join/interpolate child JSX into strings before rendering. 5. Account for no implicit spaces and preserved zero.',
                ),
                t(
                    'Для поэтапного перехода включите оба старых defaults. Этот режим возвращает прежние строки, поэтому отдавайте результат напрямую, как раньше: renderToString считает обычную строку текстом. Отключать экранирование для новых проектов не рекомендуется.',
                    'For gradual migration, enable both legacy defaults below. This mode returns the old strings, so send the result directly as before: renderToString treats a plain string as text. Disabling escaping is not recommended for new projects.',
                ),
                t(
                    'В этом обновлении сохранены прежние deep-import пути, регистрация через --import, конфигурация, async-фабрика и ?reload. Пакет и сайт ещё не опубликованы. Полный changelog находится в репозитории.',
                    'This update retains existing deep-import paths, --import registration, configuration, the async factory and ?reload. The package and site have not been published. The complete changelog lives in the repository.',
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
