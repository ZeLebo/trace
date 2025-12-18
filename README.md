Trace (Programming Language)

Trace is a small visual runner for Python snippets. Paste or import a `.py` file and watch every executable line stream through a timeline with a centered highlight in the graph.

The stack is now **fully client-side**: no FastAPI backend, sockets, or CRIU—just React, Vite, and plain file parsing in the browser.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL, drop in a `.py` file, and hit "Запустить". The runner goes only forward in time: pause/resume or restart, but no rewinds.

To build a static bundle:

```bash
npm run build
```

<img src="scr1.png" alt="App screenshot"/>
