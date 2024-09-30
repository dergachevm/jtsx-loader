import ComponentInner from '../components/Inner.tsx';
import Header from '../components/Header.tsx';
import Layout from '../layouts/Layout.jsx';
import fs from 'node:fs';

// const requestOnImport = await fetch(process.env.URL + '/api/401.json').then(r => r.json()).catch(e => e.message);
// console.log('Build time request when component imported', requestOnImport);

export default async ({ data }) => {
    // inline server request example
    // possible only if current server already running
    const inlineRequest = await fetch(process.env.URL + '/api/200.json').then(r => r.json()).catch(e => e.message);

    return <Layout title="JTSX Loader">
        <script __raw={`window.addEventListener('load', () => {
                console.log('LOADED INLINE');
            });`}>
        </script>

        <script __raw={`
            window.addEventListener('load', () => {
                console.log('Self Closing INLINE');
            })
        `}/>

        <section>
            <Header lang="ru" />

            <h5>* Документация в стадии разработки</h5>

            <p><b>J</b>avaScript <b>T</b>ype<b>S</b>cript <b>X</b>ml — загрузчик <code>.jsx</code> и <code>.tsx</code> файлов для <b>Node.js</b></p>
            <p>Позволяет писать <b>JTSX</b> код и компилировать в нативный HTML</p>
            <p>Цель разработки данного загрузчика в том, чтобы решить проблему комфортного использования JSX как шаблонизатора, без привязки к React</p>
            <p>Транспиляция JTSX файлов происходит с помощью <a href="https://esbuild.github.io/" target="_blank">esbuild</a> - надежный и очень быстрый транспайлер</p>
            <p>Всего одна зависимость — esbuild</p>
            <p>Для конвертации используется <code>jsxFactory</code> функция, которая преобразует теги, аттрибуты и дочерние элементы в стандартный HTML</p>
            <p>Загрузчик позволяет расширить преобразования JTSX файлов через конфигурации и самостоятельно написанные функции</p>
            <p>Так же загрузчик позволяет предотвратить кеширование при импорте компонентов, что дает возможность комфортно использовать перезагрузку страницы при изменениях и не перезапускать сервер, которые рендерит компонент</p>
            <p>Если вы нашли ошибку или хотите предложить улучшения для загрузчика, создайте issue на <a href="https://github.com/dergachevm/jtsx-loader/issues">github</a></p>

            <h4>О документации</h4>
            <p>Данная документация это проект внутри модуля, который можно запустить локально для изучения его работы. Исходники расположены в папке <a href="https://github.com/dergachevm/jtsx-loader/tree/master/example">example</a></p>
            <p>Вы можете запустить ее локально с помощью <code>npm i</code> и <code>npm run start</code> или с помощью nodemon для разработки <code>npm run dev</code></p>
            <p>ВАЖНО: Данный загрузчик это НЕ замена React, Vue и их производных. Если вам нужна реактивность и толстые клиенты, то лучше использовать соответствующие инструменты</p>

            <p><a href="https://github.com/dergachevm/jtsx-loader">Github</a></p>
            <p><a href="https://github.com/dergachevm/jtsx-loader/blob/master/jtsx.config.example.js">Описание файла конфигурации</a></p>
        </section>

        <section>
            <h2>Установка, использование, требования</h2>
            <h3>Установка</h3>
            <pre>npm install jtsx-loader</pre>

            <h3>Использование</h3>
            <p>Проекты необходимо запускать через команду --import</p>
            <pre>node --import jtsx-loader ./server.js</pre>

            <h3>Как отрендерить файл</h3>
            <p>Напишем простой компонент страницы index.jsx:</p>
            <pre __escape={`
export default async ({ title }) => <html lang="ru">
    <head>
        <title>{title}</title>
    </head>
    <body>
        <h1>{title}</h1>
        <p>
            Body content with array:
            {[0, 1, 2].map(n => <code>{n}</code>)}
        </p>
    </body>
</html>;
            `}></pre>
            <p>Импортировать компонент через <code>import()</code>, ?reload параметр опционален, используется для предотвращения кеширования</p>
            <pre>
                const JSXComp = (await import('./index.jsx?reload')).default;
            </pre>
            <p>Вызвать импортированный компонент как функцию передав объект данных и вывести результат в консоль</p>
            <pre>
                {`const rendered = await JSXComp({ data: renderCount });\nconsole.log(rendered);`}
            </pre>

            <p>Подробный пример с сохранением результат в файл <a href="https://github.com/dergachevm/jtsx-loader/tree/master/example">здесь</a></p>

            <h3>Требования</h3>
            <p>Минимальная версия Node.js - 20.16.0</p>
        </section>

        <section>
            <h2>Базовые примеры</h2>

            <div class="examples">
                <div class="item">
                    <h3>Нативные HTML аттрибуты</h3>
                    <p>Допускается использование только нативных HTML аттрибутов</p>

                    <p>React аттрибуты и инлайн функции в тегах не поддерживаются по дизайну и никогда не должны использоваться</p>

                    <p>В случае использования React аттрибутов, как например <code>className</code>,<br />
                    в консоль будет выведено предупреждение, а аттрибут отрендерится как есть</p>

                    <p>Другие отличия от стандартного JSX:</p>

                    <ul>
                        <li>Аттрибут <code>__escape</code>: используется для вывода любого экранированного контента</li>
                        <li>Аттрибут <code>__raw</code>: рендерит строку в содержимое тега как есть, например полезно для тегов <code>script</code> и <code>style</code></li>
                        <li>В JTSX файл передается объект <code>_jsxUtils</code>, которая содержит в себе полезные утилиты. Вместо данного объекта можно передать свою любую функцию и использовать ее для расширения стандартного преобразования</li>
                    </ul>
                </div>

                <div class="item">
                    <h3>Доступны все возможности JavaScript, которые используются в обычном JSX</h3>
                    <p>ВАЖНО: весь код выполняется в среде Node.js, поэтому здесь нет браузерного DOM</p>
                    <h4>Вычисления</h4>
                    <pre __escape={'{(1 + 1 + 2 * 2) / 3}'}></pre>
                    <p>Результат: <code>{(1 + 1 + 2 * 2) / 3}</code></p>

                    <h4>Стандартная библиотека Node.js</h4>
                    <pre __escape={'{Math.pow(9, 2)}'}></pre>
                    <p>Результат: <code>{Math.pow(9, 2)}</code></p>

                    <h4>Тернарные выражения</h4>
                    <pre __escape={`1 > 2 ? <strong>Больше</strong> : 'Меньше'`}></pre>
                    <p>Результат: <code>{1 > 2 ? <strong>Больше</strong> : 'Меньше'}</code></p>
                    <pre __escape={`2 > 1 ? <strong>Больше</strong> : 'Меньше'`}></pre>
                    <p>Результат: <code>{2 > 1 ? <strong>Больше</strong> : 'Меньше'}</code></p>

                    <h4>Манипуляции c массивами и рендеринг компонентов</h4>
                    <p>Рендерит компоненты/теги с данными из массива</p>
                    <pre __escape={'[0, 1, 2].map(num => <code>{num}</code>)'}></pre>
                    <p>Результат: {[0, 1, 2].map(el => <code>{el}</code>)}</p>

                    <h4>__escape</h4>
                    <p>Вывод любого экранированного контента</p>
                    <pre __escape={'<code __escape={\'<div>escaped</div>\'}></code>'}></pre>
                    <p>Результат: <code __escape={'<div>escaped</div>'}></code></p>
                </div>

                <div class="item">
                    <h3>Запрос внутри компонента через <code>fetch</code></h3>
                    <p><code __escape={`const inlineRequest = await fetch(process.env.URL + '/api/200.json').then(r => r.json()).catch(e => e.message);`}></code></p>
                    <p>Вызывается при каждом рендеринге</p>
                    <p>Если вызывается внутренний сервер, то он должен быть запущен до запуска рендеринга</p>
                    <pre>
                        Ответ: {JSON.stringify(inlineRequest, null, 4)}
                    </pre>
                </div>

                <div class="item">
                    <h3>Импортированный компонент</h3>
                    <p></p>
                    <div class="component-container">
                        <ComponentInner renderCount={data} >
                            <p><i special="CHILD 0">Дочерний компонент 0</i></p>
                            <p><i special="CHILD 1">Дочерний компонент 1</i></p>
                        </ComponentInner>
                    </div>
                </div>

                <div class="item">
                    <h3>Пользовательские аттрибуты и их обработка</h3>
                    <p><code>{_jsxUtils.escapeHtml(`<input type="text" ac:custom="input" />`)}</code> трансформируется в <code>data-ac-custom="input"</code></p>
                    <p>Обработчик пишется в jtsx.config.js</p>
                    <div>
                        <input type="text" ac:custom="input" value="ac:custom='input'" />
                    </div>
                </div>
            </div>
        </section>


        <section>
            <h2>Авторы</h2>
            <p><a href="mailto:dergachev.mihail@gmail.com">Дергачев Михаил</a></p>
            <p><a href="https://ancros.dev">https://ancros.dev</a></p>
        </section>

        <section>
            <h2>Референсы</h2>
            <p><a href="https://esbuild.github.io/api/#jsx-factory">https://esbuild.github.io/api/#jsx-factory</a></p>
            <p><a href="https://lwebapp.com/en/post/custom-jsx">https://lwebapp.com/en/post/custom-jsx</a></p>
            <p><a href="https://nakedjsx.org/">https://nakedjsx.org/</a></p>
        </section>

        {/*
        Inline functions not allowed
        <form action="/api" onSubmit={async () => {
            await console.log('ONSUBMIT');
        }} novalidate></form> */}
    </Layout>
}
