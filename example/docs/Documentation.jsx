import { raw } from 'jtsx-loader/runtime.js';
import { sections } from './content.js';
import { highlight } from './highlight.js';
import Counter from './examples/Counter.jsx';

const Code = ({ code, lang, file, copy }) => (
    <figure class="code-block">
        <figcaption>
            <span>{file || lang}</span>
            <button
                type="button"
                class="copy-code"
                aria-label={`${copy}: ${file || lang}`}
            >
                {copy}
            </button>
        </figcaption>
        {raw(highlight(code, lang))}
    </figure>
);

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
                            {ru ? 'Тема' : 'Theme'}
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
                            <span>⌄</span>
                        </button>
                        <div class="sidebar-heading">
                            {ru ? 'РУКОВОДСТВО' : 'GUIDE'}
                            <span>{content.length}</span>
                        </div>
                        <label class="search-label" for="docs-search">
                            {ru
                                ? 'Поиск по документации'
                                : 'Search documentation'}
                        </label>
                        <input
                            id="docs-search"
                            type="search"
                            placeholder={
                                ru ? 'Найти раздел…' : 'Find a section…'
                            }
                            autocomplete="off"
                            hidden
                        />
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
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                        <p id="search-empty" role="status" hidden>
                            {ru ? 'Ничего не найдено' : 'No matching sections'}
                        </p>
                        <div class="sidebar-note">
                            <span class="status-dot" />
                            npm
                            <p>
                                {ru
                                    ? 'Установка: npm install jtsx-loader'
                                    : 'Install: npm install jtsx-loader'}
                            </p>
                        </div>
                    </aside>
                    <main id="content" tabindex="-1">
                        <div class="hero">
                            <div class="eyebrow">
                                NODE.JS + BROWSER · JSX / TSX
                            </div>
                            <h1>
                                {ru ? (
                                    <>
                                        JSX и TSX.
                                        <br />
                                        Без React.
                                    </>
                                ) : (
                                    <>
                                        JSX and TSX.
                                        <br />
                                        Without React.
                                    </>
                                )}
                            </h1>
                            <p class="lead">
                                {ru
                                    ? 'Подключайте .jsx и .tsx прямо в Node.js и используйте те же компоненты в браузере. Одна HTML-фабрика для фронтенда и бэкенда.'
                                    : 'Import .jsx and .tsx directly in Node.js and use the same components in the browser. One HTML factory for frontend and backend.'}
                            </p>
                            <div class="hero-actions">
                                <a class="primary-link" href="#start">
                                    {ru ? 'Начать работу' : 'Get started'}{' '}
                                    <span>↗</span>
                                </a>
                                <a href="#browser">
                                    {ru ? 'В браузере' : 'In the browser'} →
                                </a>
                            </div>
                            <div class="feature-strip">
                                <span>{ru ? 'Без React' : 'No React'}</span>
                                <span>
                                    {ru
                                        ? 'Общие компоненты'
                                        : 'Shared components'}
                                </span>
                                <span>Node.js + Browser</span>
                            </div>
                        </div>
                        <div id="sections">
                            {content.map((section, index) => (
                                <section
                                    id={section.id}
                                    class="doc-section"
                                    aria-labelledby={`${section.id}-title`}
                                >
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
                                    {section.paragraphs.map((text) => (
                                        <p>{text}</p>
                                    ))}
                                    {section.installation && (
                                        <div class="installation-options">
                                            <div
                                                class="installation-tabs"
                                                role="tablist"
                                                aria-label={ru ? 'Вариант установки' : 'Setup option'}
                                                hidden
                                            >
                                                {section.installation.map((item, i) => (
                                                    <button
                                                        type="button"
                                                        role="tab"
                                                        id={`install-tab-${i}`}
                                                        aria-controls={`install-panel-${i}`}
                                                        aria-selected={String(i === 0)}
                                                        tabindex={i === 0 ? 0 : -1}
                                                    >
                                                        {item.file}
                                                    </button>
                                                ))}
                                            </div>
                                            {section.installation.map((item, i) => (
                                                <div
                                                    id={`install-panel-${i}`}
                                                    role="tabpanel"
                                                    aria-labelledby={`install-tab-${i}`}
                                                    tabindex="0"
                                                >
                                                    <Code {...item} copy={copy} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                            <span>
                                {ru ? 'Подсветка' : 'Highlighting'}:{' '}
                                <a href="https://shiki.style/guide/install">
                                    Shiki
                                </a>
                            </span>
                        </footer>
                    </main>
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
