/**
 * Directory URL for Pyodide runtime files (pyodide.asm.js, .wasm, stdlib zip, lockfile).
 * Using jsDelivr avoids broken relative paths when the app is served from a subpath
 * (e.g. GitHub Pages) — Vite only emits the JS glue in /assets/, not the WASM payloads.
 * Keep the version aligned with the `pyodide` entry in package.json.
 */
export const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.29.3/';
