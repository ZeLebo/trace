let pyodidePromise: Promise<any> | null = null;

function injectPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));

    const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Pyodide script failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.dataset.pyodide = 'true';
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Pyodide script failed'));
    document.head.appendChild(script);
  });
}

export async function ensurePyodide(): Promise<any> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    await injectPyodideScript();
    // @ts-ignore
    const loadPyodide = (window as any).loadPyodide;
    if (!loadPyodide) throw new Error('loadPyodide not found on window');
    const py = await loadPyodide();
    return py;
  })();

  return pyodidePromise;
}
