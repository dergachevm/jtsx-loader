# jtsx-loader

> JavaScript / TypeScript / XML — `.jsx` and `.tsx` file loader for Node.js

`jtsx-loader` allows you to import **JSX / TSX files directly into Node.js** and use them as **async functions**. It is especially useful as a **JSX-based template engine** without React, Vue, or any client-side framework.

---

## ✨ Features

* Import `.jsx` / `.tsx` files directly in Node.js
* Use JSX components as **async functions**
* Full async/await support inside templates
* Extremely fast transpilation via **esbuild**
* Minimal footprint — **only one dependency**
* Optional import cache disabling (great for dev hot-reload)
* Extensible JSX → HTML transformation pipeline
* No React, no VDOM, no hydration — just server-side rendering

---

## ⚙️ Requirements

* **Node.js v22+**
* ESM (`"type": "module"`)

---

## 🚀 Quick Start

### 1. Initialize project

```bash
npm init -y
```

### 2. Install dependencies

```bash
npm i jtsx-loader express nodemon
```

### 3. Configure `package.json`

Enable ESM and add scripts:

```json
{
  "type": "module",
  "scripts": {
    "start": "node --import jtsx-loader app.js",
    "dev": "nodemon --watch ./*.* --import jtsx-loader app.js"
  }
}
```

Example full `package.json`:

```json
{
  "name": "test",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node --import jtsx-loader app.js",
    "dev": "nodemon --watch ./*.* --import jtsx-loader app.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "jtsx-loader": "^0.1.9",
    "nodemon": "^3.1.11"
  }
}
```

---

## 🧠 Example

### `app.js`

```js
import express from 'express';
import Component from './Component.jsx';

const app = express();
const port = 3000;

app.use('/', async (req, res) => {
  if (!req.get('Accept')?.includes('text/html')) {
    return res.status(404).end();
  }

  const html = await Component({ message: 'Hello JSX' });
  return res.send(html);
});

app.listen(port, () => {
  console.log(`SERVER: http://localhost:${port}`);
});
```

---

### `Component.jsx`

```jsx
const Component = async ({ message }) => {
  const exampleObject = { example: 'object' };

  return (
    <>
      <html>
        <head>
          <title>{message}</title>
        </head>
        <body>
          <h2>{message}</h2>

          <pre>{JSON.stringify(exampleObject, null, 2)}</pre>

          <script>{`
            window.serverObject = ${JSON.stringify(exampleObject)};
            console.log(window.serverObject);
          `}</script>
        </body>
      </html>
    </>
  );
};

export default Component;
```

---

### 4. Run dev server

```bash
npm run dev
```

Open: **[http://localhost:3000/](http://localhost:3000/)**

---

## 🧩 How It Works

* `.jsx` / `.tsx` files are transpiled using **esbuild**
* JSX is converted to HTML via a configurable `jsxFactory`
* Components are regular async functions returning strings
* No virtual DOM, no runtime client JS required

---

## 🔌 Extensibility

`jtsx-loader` supports:

* Custom JSX factories
* Transformation hooks
* Import cache control (useful for live reload in dev mode)

This makes it suitable for:

* SSR HTML rendering
* Email templates
* Static page generation
* Lightweight CMS or admin panels

---

## ❗ Important Notes

> **This is NOT a replacement for React, Vue, or similar frameworks.**

If you need:

* reactivity
* stateful UI
* client-side hydration

use a proper frontend framework.

`jtsx-loader` is designed for **simple, fast, server-side rendering**.

---

## 🐞 Issues & Feedback

Found a bug or have an idea?

👉 [https://github.com/dergachevm/jtsx-loader/issues](https://github.com/dergachevm/jtsx-loader/issues)

---

## 📚 More Documentation

Extended documentation and examples:

👉 [https://jtsx.ancros.dev](https://jtsx.ancros.dev)
