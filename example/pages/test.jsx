export default async ({ title }) => <html lang="ru">
    <head>
        <title>{title}</title>
    </head>
    <body>
        <h1>{title}</h1>
        <p>Body content with array: {[0, 1, 2].map(n => <code>{n}</code>)}</p>
    </body>
</html>;
