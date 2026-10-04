export default async ({ title }) => <html lang="ru">
    <head>
        <title __escape={title}></title>
    </head>
    <body>
        <h1 __escape={title}></h1>
        <p>Body content with array: {[0, 1, 2].map(n => <code>{n}</code>)}</p>
    </body>
</html>;
