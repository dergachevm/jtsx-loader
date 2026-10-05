import { readFileSync } from 'node:fs';
import { raw, renderToString } from 'jtsx-loader/runtime.js';
import { sections } from './content.js';
import { highlight } from './highlight.js';
import Counter from './examples/Counter.jsx';
import Page from './examples/Page.jsx';

const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const Icon = ({ name }) => <img class="icon" src={`/styles/icons/${name}.svg`} alt="" aria-hidden="true" width="16" height="16" />;

const Code = ({ code, lang, file, copy }) => (
    <figure class="code-block">
        <figcaption>
            <span>{file || lang}</span>
            <button
                type="button"
                class="copy-code"
                aria-label={`${copy}: ${file || lang}`}
            >
                <Icon name="copy" /><span data-copy-label>{copy}</span>
            </button>
        </figcaption>
        {raw(highlight(code, lang))}
    </figure>
);

const CodeTabs = ({ items, id, label, copy }) => (
    <div class="code-tabs" data-tabs>
        <div class="file-tabs" role="tablist" aria-label={label} hidden>
            {items.map((item, i) => <button type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={String(i === 0)} tabindex={i === 0 ? 0 : -1}>{item.file}</button>)}
        </div>
        {items.map((item, i) => <div id={`${id}-panel-${i}`} role="tabpanel" aria-labelledby={`${id}-tab-${i}`} tabindex="0"><Code {...item} copy={copy} /></div>)}
    </div>
);

const QuickStart = ({ section, ru, copy }) => {
    const files = ['Page.jsx', 'Counter.jsx', 'app.js'].map((name) => section.blocks.find((item) => item.file === name));
    return <>
        <div class="breadcrumbs"><span>{ru ? 'Документация' : 'Documentation'}</span><span>/</span><span>{ru ? 'Начало работы' : 'Getting started'}</span></div>
        <header class="article-header">
            <h1 id="start-title">{section.title}</h1>
            <p class="lead">{ru ? 'JSX и TSX в Node.js без React. Одна HTML-фабрика для сервера и браузера.' : 'JSX and TSX in Node.js without React. One HTML factory for server and browser.'}</p>
            <p class="requirements">{ru ? 'Требования' : 'Requirements'}: Node.js ≥20.16 · ESM</p>
        </header>
        <div class="quick-step">
            <h2 id="start-install"><span class="step-number">01</span>{ru ? 'Установка' : 'Installation'}</h2>
            <div class="installation-options" data-tabs>
                <div class="installation-tabs" role="tablist" aria-label={ru ? 'Вариант установки' : 'Setup option'} hidden>
                    {section.installation.map((item, i) => <button type="button" role="tab" id={`install-tab-${i}`} aria-controls={`install-panel-${i}`} aria-selected={String(i === 0)} tabindex={i === 0 ? 0 : -1}>{item.file}</button>)}
                </div>
                {section.installation.map((item, i) => <div id={`install-panel-${i}`} role="tabpanel" aria-labelledby={`install-tab-${i}`} tabindex="0"><Code {...item} file={ru ? 'Терминал' : 'Terminal'} copy={copy} /></div>)}
            </div>
        </div>
        <div class="quick-step">
            <h2 id="start-component"><span class="step-number">02</span>{ru ? 'Первый компонент' : 'Your first component'}</h2>
            <p>{ru ? 'Создайте Page.jsx, Counter.jsx и app.js в одной папке.' : 'Create Page.jsx, Counter.jsx and app.js in the same directory.'}</p>
            <CodeTabs items={files} id="start-files" label={ru ? 'Файлы примера' : 'Example files'} copy={copy} />
            <div id="start-result" class="output-preview" data-toc-label={ru ? 'Результат' : 'Result'}><Code code={renderToString(Page({ title: 'Hello JSX' }))} lang="html" file="HTML" copy={copy} /></div>
        </div>
        <div class="quick-step">
            <h2 id="start-run"><span class="step-number">03</span>{ru ? 'Запуск' : 'Run'}</h2>
            <Code code="node app.js" lang="bash" file={ru ? 'Терминал' : 'Terminal'} copy={copy} />
            <p>{ru ? 'HTML появится в терминале. Чтобы открыть страницу в браузере, подключите ' : 'HTML appears in your terminal. To serve the page in a browser, connect '}<a href="#servers">Express {ru ? 'или' : 'or'} Fastify</a>.</p>
            <p class="technical-note">{section.paragraphs[0]}</p>
        </div>
    </>;
};

export default ({ lang = 'ru' }) => {
    const ru = lang === 'ru';
    const content = sections(lang);
    const copy = ru ? 'Копировать' : 'Copy';
    const title = ru
        ? 'jtsx-loader — документация'
        : 'jtsx-loader — documentation';
    return (
        <html lang={lang}>
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta
                    name="description"
                    content={
                        ru
                            ? 'JSX и TSX в Node.js без React. Общие компоненты и HTML-фабрика для фронтенда и бэкенда, SSR и статическая генерация.'
                            : 'JSX and TSX in Node.js without React. Shared components and an HTML factory for frontend and backend, SSR and static generation.'
                    }
                />
                <title>{title}</title>
                <link rel="stylesheet" href="/styles/styles.css" />
                <script src="/scripts/docs.js" defer />
                <script type="module" src="/scripts/client-demo.js" />
            </head>
            <body>
                <a class="skip-link" href="#content">
                    {ru ? 'К содержимому' : 'Skip to content'}
                </a>
                <header class="topbar">
                    <a class="wordmark" href={ru ? '/ru' : '/'}>
                        <span class="brand-mark">{'<j/>'}</span>jtsx-loader
                        <span class="docs-label">
                            {ru ? 'Документация' : 'Docs'}
                        </span>
                    </a>
                    <nav
                        aria-label={
                            ru ? 'Общая навигация' : 'Global navigation'
                        }
                    >
                        <a href={ru ? '/' : '/ru'} lang={ru ? 'en' : 'ru'}>
                            {ru ? 'EN' : 'RU'}
                        </a>
                        <a
                            class="github-link"
                            href="https://github.com/dergachevm/jtsx-loader"
                        >
                            GitHub ↗
                        </a>
                        <button
                            id="theme-toggle"
                            type="button"
                            hidden
                            aria-label={
                                ru ? 'Переключить тему' : 'Toggle theme'
                            }
                        >
                            <Icon name="sun" /><span class="sr-only" data-theme-label>{ru ? 'Тема' : 'Theme'}</span>
                        </button>
                    </nav>
                </header>
                <div class="docs-shell">
                    <aside class="sidebar">
                        <button
                            id="menu-toggle"
                            type="button"
                            aria-expanded="false"
                            aria-controls="section-nav"
                            hidden
                        >
                            {ru
                                ? 'Разделы документации'
                                : 'Documentation sections'}{' '}
                            <Icon name="chevron-down" />
                        </button>
                        <label class="sr-only" for="docs-search">
                            {ru
                                ? 'Поиск по документации'
                                : 'Search documentation'}
                        </label>
                        <div class="search-box"><Icon name="search" /><input
                            id="docs-search"
                            type="search"
                            placeholder={
                                ru ? 'Найти раздел…' : 'Find a section…'
                            }
                            autocomplete="off"
                            hidden
                        /><kbd>/</kbd></div>
                        <div class="sidebar-heading">{ru ? 'РУКОВОДСТВО' : 'GUIDE'}</div>
                        <div class="sidebar-scroll">
                        <nav
                            id="section-nav"
                            aria-label={
                                ru
                                    ? 'Разделы документации'
                                    : 'Documentation sections'
                            }
                        >
                            {content.map((section, index) => (
                                <a href={`#${section.id}`}>
                                    <span class="section-number">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    {section.id === 'development' ? (ru ? 'Диагностика' : 'Development') : section.title}
                                </a>
                            ))}
                        </nav>
                        <p id="search-empty" role="status" hidden>
                            {ru ? 'Ничего не найдено' : 'No matching sections'}
                        </p>
                        </div>
                        <div class="sidebar-note">
                            <div class="package-meta"><a href="https://www.npmjs.com/package/jtsx-loader" target="_blank" rel="noopener noreferrer">jtsx-loader</a><span class="package-version">v{version}</span></div>
                            <button type="button" class="install-copy" data-copy-command="npm install jtsx-loader" aria-label={ru ? 'Скопировать команду установки' : 'Copy install command'}><code>npm install jtsx-loader</code><Icon name="copy" /></button>
                            <p class="install-feedback" data-copy-label aria-live="polite" />
                        </div>
                    </aside>
                    <main id="content" tabindex="-1">
                        <div id="sections">
                            {content.map((section, index) => (
                                <section
                                    id={section.id}
                                    class="doc-section"
                                    aria-labelledby={`${section.id}-title`}
                                >
                                    {section.id === 'start' ? <QuickStart section={section} ru={ru} copy={copy} /> : <>
                                    <div class="section-kicker">
                                        {String(index + 1).padStart(2, '0')} /{' '}
                                        {String(content.length).padStart(
                                            2,
                                            '0',
                                        )}
                                    </div>
                                    <h2 id={`${section.id}-title`}>
                                        <a href={`#${section.id}`}>
                                            {section.title}
                                        </a>
                                    </h2>
                                    <p class="section-intro">{section.intro}</p>
                                    {section.steps && (
                                        <ol>
                                            {section.steps.map((step) => <li>{step}</li>)}
                                        </ol>
                                    )}
                                    {section.paragraphs.map((text) => (
                                        <p>{text}</p>
                                    ))}
                                    {section.topics?.map((topic) => (
                                        <div class="doc-topic">
                                            <h3 id={`${section.id}-${topic.id}`}>
                                                <a href={`#${section.id}-${topic.id}`}>{topic.title}</a>
                                            </h3>
                                            {topic.paragraphs.map((text) => <p>{text}</p>)}
                                            {topic.blocks.map((item) => <Code {...item} copy={copy} />)}
                                        </div>
                                    ))}
                                    {section.tableTitle && <h3>{section.tableTitle}</h3>}
                                    {section.rows && (
                                        <div class="table-scroll">
                                            <table>
                                                <caption>
                                                    {section.title}
                                                </caption>
                                                <tbody>
                                                    {section.rows.map((row) => (
                                                        <tr>
                                                            {row.map(
                                                                (cell, i) =>
                                                                    i === 0 ? (
                                                                        <th scope="row">
                                                                            {
                                                                                cell
                                                                            }
                                                                        </th>
                                                                    ) : (
                                                                        <td>
                                                                            {
                                                                                cell
                                                                            }
                                                                        </td>
                                                                    ),
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {section.id === 'browser' && (
                                        <div id="client-demo" data-lang={lang}>
                                            <Counter
                                                count={0}
                                                label={
                                                    ru
                                                        ? 'Один компонент. Две среды.'
                                                        : 'One component. Two environments.'
                                                }
                                                buttonLabel={
                                                    ru
                                                        ? 'Добавить один'
                                                        : 'Add one'
                                                }
                                            />
                                        </div>
                                    )}
                                    {section.blocks.map((item) => (
                                        <Code {...item} copy={copy} />
                                    ))}
                                    </>}
                                </section>
                            ))}
                        </div>
                        <footer>
                            <a href="https://github.com/dergachevm/jtsx-loader/blob/master/CHANGELOG.md">
                                Changelog ↗
                            </a>
                            <a href="https://github.com/dergachevm/jtsx-loader/issues">
                                {ru ? 'Сообщить об ошибке' : 'Report an issue'}{' '}
                                ↗
                            </a>
                        </footer>
                    </main>
                    <aside class="page-outline" aria-label={ru ? 'На этой странице' : 'On this page'}>
                        <div class="outline-heading">{ru ? 'НА ЭТОЙ СТРАНИЦЕ' : 'ON THIS PAGE'}</div>
                        <nav id="page-toc">
                            <a href="#start-install" aria-current="location">{ru ? 'Установка' : 'Installation'}</a>
                            <a href="#start-component">{ru ? 'Первый компонент' : 'Your first component'}</a>
                            <a href="#start-run">{ru ? 'Запуск' : 'Run'}</a>
                            <a href="#start-result">{ru ? 'Результат' : 'Result'}</a>
                        </nav>
                    </aside>
                </div>
                <div
                    id="copy-status"
                    class="sr-only"
                    role="status"
                    aria-live="polite"
                />
            </body>
        </html>
    );
};
