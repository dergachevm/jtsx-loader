import ComponentInner from '../components/Inner.tsx';
import Layout from '../layouts/Layout.jsx';

// const requestOnImport = await fetch(process.env.URL + '/api/401.json').then(r => r.json()).catch(e => e.message);
// console.log('Build time request when component imported', requestOnImport);

export default async ({ data }) => {
    // inline server request example
    // possible only if current server already running
    const inlineRequest = await fetch(process.env.URL + '/api/200.json').then(r => r.json()).catch(e => e.message);

    return <Layout title="JTSX Loader">
        <script __raw={ `window.addEventListener('load', () => {
                console.log('LOADED INLINE');
            });`}>
        </script>

        <script __raw={ `
            window.addEventListener('load', () => {
                console.log('Self Closing INLINE');
            })
        `} />

        <section>
            <div class="lang">
                <h1>JTSX Loader <small>v0.1.0</small></h1>
                <a href="/">Russian</a> / <a href="/en" class="is-active">English</a>
            </div>

            <h5>* Documentation under development</h5>

            <p><b>J</b>avaScript <b>T</b>ype<b>S</b>cript <b>X</b>ml — <code>.jsx</code> and <code>.tsx</code> file loader for <b>Node.js</b></p>
            <p>Allows you to write <b>JTSX</b> code and compile it into native HTML</p>
            <p>The purpose of developing this loader is to solve the problem of comfortable use of JSX as a template engine, without being tied to React</p>
            <p>JTSX files are transpiled using <a href="https://esbuild.github.io/" target="_blank">esbuild</a> — a reliable and very fast transpiler</p>
            <p>Only one dependency — esbuild</p>
            <p>For conversion, the <code>jsxFactory</code> function is used, which converts tag attributes, attributes and child elements into standard HTML</p>
            <p>The loader allows you to extend the transformation of JTSX files through configurations and self-written functions</p>
            <p>The loader also allows you to prevent caching when importing components, which makes it possible to comfortably use page reloading when changes are made and not restart the server that renders the component</p>
            <p>IMPORTANT: This project is NOT a replacement for React, Vue and their derivatives. If you need reactivity and thick clients, it is better to use the appropriate tools</p>
        </section>

        <section>
            <h2>Installation, usage, requirements</h2>
            <h3>Installation</h3>
            <pre>npm install jtsx-loader</pre>

            <h3>Usage</h3>
            <p>Projects must be run via the --import command</p>
            <pre>node --import jtsx-loader ./server.js</pre>

            <h3>How to render a file</h3>
            <p>Let's write a simple index.jsx page component:</p>
            <pre __escape={`
export default async ({ title }) => <html lang="en">
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
            <p>Import the component via <code>import()</code>, the ?reload parameter is optional, used to prevent caching</p>
            <pre>
                const JSXComp = (await import('./index.jsx?reload')).default;
            </pre>
            <p>Call the imported component as a function passing the data object and output the result to the console</p>
            <pre>
                {`const rendered = await JSXComp({ data: renderCount });\nconsole.log(rendered);`}
            </pre>

            <p>A detailed example with saving the result to a file <a href="https://github.com/dergachevm/jtsx-loader/tree/master/example">here</a></p>

            <h3>Requirements</h3>
            <p>Minimum Node.js version - 20.16.0</p>
        </section>

        <section>
            <h2>Basic Examples</h2>

            <div class="examples">
                <div class="item">
                    <h3>Native HTML Attributes</h3>
                    <p>Only native HTML attributes are allowed</p>

                    <p>React attributes are not supported by design and should never be used</p>

                    <p>If you use React attributes, such as <code>className</code>,<br />
                        a warning will be printed to the console, and the attribute will be rendered as is</p>

                    <p>Other differences from standard JSX:</p>

                    <ul>
                        <li><code>__escape</code> attribute: used to output any escaped content</li>
                        <li><code>__raw</code> attribute: renders a string into the tag content as is, for example useful for <code>script</code> tags and <code>style</code></li>
                        <li>The JTSX file is passed the <code>_jsxUtils</code> object, which contains useful utilities. Instead of this object, you can pass any function you want and use it to extend the standard transformation</li>
                    </ul>
                </div>

                <div class="item">
                    <h3>All JavaScript capabilities that are used in regular JSX are available</h3>
                    <p>IMPORTANT: all code is executed in the Node.js environment, so there is no browser DOM</p>
                    <h4>Calculations</h4>
                    <pre __escape={ '{(1 + 1 + 2 * 2) / 3}' }></pre>
                    <p>Result: <code>{ (1 + 1 + 2 * 2) / 3 }</code></p>

                    <h4>Node.js Standard Library</h4>
                    <pre __escape={ '{Math.pow(9, 2)}' }></pre>
                    <p>Result: <code>{ Math.pow(9, 2) }</code></p>

                    <h4>Ternary expressions</h4>
                    <pre __escape={ `1 > 2 ? <strong>Greater</strong> : 'Less'` }></pre>
                    <p>Result: <code>{ 1 > 2 ? <strong>Greater</strong> : 'Less' }</code></p>
                    <pre __escape={ `2 > 1 ? <strong>Greater</strong> : 'Less'` }></pre>
                    <p>Result: <code>{ 2 > 1 ? <strong>Greater</strong> : 'Less' }</code></p>

                    <h4>Array manipulation and component rendering</h4>
                    <p>Renders components/tags with array data</p>
                    <pre __escape={ '[0, 1, 2].map(num => <code>{num}</code>)' }></pre>
                    <p>Result: { [0, 1, 2].map(el => <code>{ el }</code>) }</p>

                    <h4>__escape</h4>
                    <p>Output any escaped content</p>
                    <pre __escape={ '<code __escape={\'<div>escaped</div>\'}></code>' }></pre>
                    <p>Result: <code __escape={ '<div>escaped</div>' }></code></p>
                </div>

                <div class="item">
                    <h3>Request inside the component via <code>fetch</code></h3>
                    <p><code __escape={ `const inlineRequest = await fetch(process.env.URL + '/api/200.json').then(r => r.json()).catch(e => e.message);` }></code></p>
                    <p>Called on every render</p>
                    <p>If the internal server is called, it must be running before the render starts</p>
                    <pre>
                        Response: { JSON.stringify(inlineRequest, null, 4) }
                    </pre>
                </div>

                <div class="item">
                    <h3>Imported component</h3>
                    <p></p>
                    <div class="component-container">
                        <ComponentInner lang="en" renderCount={ data } >
                            <p><i special="CHILD 0">Child component 0</i></p>
                            <p><i special="CHILD 1">Child component 1</i></p>
                        </ComponentInner>
                    </div>
                </div>

                <div class="item">
                    <h3>Custom attributes and their processing</h3>
                    <p>{ _jsxUtils.escapeHtml(`<input type="text" ac:custom="input"`) } is transformed into <code>data-ac-custom="input"</code></p>
                    <p>The handler is written in jtsx.config.js</p>

                    <div>
                        <input type="text" ac:custom="input" value="ac:custom='input'" />
                    </div>
                </div>
            </div>
        </section>

        <section>
            <h2>Authors</h2>
            <p><a href="mailto:dergachev.mihail@gmail.com">Dergachev Mikhail</a></p>
            <p><a href="https: //ancros.dev">https://ancros.dev</a></p>
        </section>

        <section>
            <h2>References</h2>
            <p><a href="https://esbuild.github.io/api/#jsx-factory">https://esbuild.github.io/api/# jsx-factory</a></p>
            <p><a href="https://lwebapp.com/en/post/custom-jsx">https://lwebapp.com/en/post/custom- jsx</a></p>
            <p><a href="https://nakedjsx.org/">https://nakedjsx.org/</a></p>
        </section>
    </Layout>
}
