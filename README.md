
\* Documentation under development

JavaScript TypeScript Xml — .jsx and .tsx file loader for Node.js

Allows you to write JTSX code and compile it into native HTML

The purpose of developing this loader is to solve the problem of comfortable use of JSX as a template engine, without being tied to React

JTSX files are transpiled using esbuild — a reliable and very fast transpiler

Only one dependency — esbuild

For conversion, the jsxFactory function is used, which converts tag attributes, attributes and child elements into standard HTML

The loader allows you to extend the transformation of JTSX files through configurations and self-written functions

Also loader allows you to prevent caching when importing components, which makes it possible to comfortably use page reloading when changes are made and not restart the server that renders the component

If you find a bug or want to suggest improvements to the loader, create an issue on [github](https://github.com/dergachevm/jtsx-loader/issues)

IMPORTANT: This project is NOT a replacement for React, Vue and their derivatives. If you need reactivity and thick clients, it is better to use the appropriate tools

[Detailed documentation with examples](https://jtsx.ancros.dev)
