import { useEffect, useRef } from 'react';
import * as Babel from '@babel/standalone';

interface PreviewPanelProps {
  tsxCode: string;
  cssCode: string;
  onConsoleError?: (message: string) => void;
  onConsoleOutput?: (message: string) => void;
  onConsoleClear?: () => void;
}

const PREVIEW_POST_MESSAGE_SOURCE = 'devview-preview';

interface PreviewMessage {
  source: typeof PREVIEW_POST_MESSAGE_SOURCE;
  type: 'runtime-error' | 'console';
  message: string;
}

function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (!data || typeof data !== 'object') return false;

  const record = data as Record<string, unknown>;
  return (
    record.source === PREVIEW_POST_MESSAGE_SOURCE &&
    (record.type === 'runtime-error' || record.type === 'console') &&
    typeof record.message === 'string'
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createErrorHtml(title: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            background: #fff7f7;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            color: #7f1d1d;
          }

          .error-panel {
            margin: 16px;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            background: #fef2f2;
            box-shadow: 0 10px 30px rgba(127, 29, 29, 0.12);
            overflow: hidden;
          }

          .error-title {
            padding: 10px 12px;
            border-bottom: 1px solid #fecaca;
            background: #fee2e2;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .error-message {
            margin: 0;
            padding: 12px;
            white-space: pre-wrap;
            font-size: 12px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <section class="error-panel">
          <div class="error-title">${escapeHtml(title)}</div>
          <pre class="error-message">${escapeHtml(message)}</pre>
        </section>
      </body>
    </html>
  `;
}

export default function PreviewPanel({
  tsxCode,
  cssCode,
  onConsoleError,
  onConsoleOutput,
  onConsoleClear,
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!isPreviewMessage(data)) return;
      if (data.type === 'runtime-error') {
        onConsoleError?.(`Runtime Error: ${data.message}`);
      }
      if (data.type === 'console') {
        onConsoleOutput?.(data.message);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onConsoleError, onConsoleOutput]);

  useEffect(() => {
    let compiledCode = '';
    onConsoleClear?.();
    try {
      // Transpile TSX to executable JS
      const result = Babel.transform(tsxCode, {
        presets: ['env', 'react', 'typescript'],
        filename: 'App.tsx',
      });
      compiledCode = result.code || '';
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = createErrorHtml('Compile Error', msg);
      }
      onConsoleError?.(`Compile Error: ${msg}`);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <!-- React -->
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>
          
          <style>
            /* Base reset */
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            /* User injected CSS */
            ${cssCode}
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const __DEVVIEW_SOURCE__ = ${JSON.stringify(PREVIEW_POST_MESSAGE_SOURCE)};
            function __post(type, message) {
              try {
                window.parent && window.parent.postMessage({ source: __DEVVIEW_SOURCE__, type, message }, '*');
              } catch (_) {}
            }

            function __renderError(title, message) {
              const root = document.getElementById('root') || document.body;
              root.innerHTML = '';

              const panel = document.createElement('section');
              panel.style.cssText = 'margin:16px;border:1px solid #fca5a5;border-radius:8px;background:#fef2f2;color:#7f1d1d;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;box-shadow:0 10px 30px rgba(127,29,29,0.12);overflow:hidden;';

              const heading = document.createElement('div');
              heading.style.cssText = 'padding:10px 12px;border-bottom:1px solid #fecaca;background:#fee2e2;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;';
              heading.textContent = title;

              const body = document.createElement('pre');
              body.style.cssText = 'margin:0;padding:12px;white-space:pre-wrap;font-size:12px;line-height:1.5;';
              body.textContent = message;

              panel.appendChild(heading);
              panel.appendChild(body);
              root.appendChild(panel);
            }

            function __stringifyArg(arg) {
              try {
                if (typeof arg === 'string') return arg;
                if (arg instanceof Error) return arg.stack || arg.message || String(arg);
                return JSON.stringify(arg);
              } catch (_) {
                try { return String(arg); } catch (_) { return '[unprintable]'; }
              }
            }

            function __formatConsoleMessage(level, args) {
              const parts = [];
              for (const a of args) parts.push(__stringifyArg(a));
              return '[' + level + '] ' + parts.join(' ');
            }

            (function patchConsole() {
              const original = {
                log: console.log,
                info: console.info,
                warn: console.warn,
                error: console.error,
              };

              function makePatched(level) {
                return function(...args) {
                  try { __post('console', __formatConsoleMessage(level, args)); } catch (_) {}
                  try { original[level] && original[level].apply(console, args); } catch (_) {}
                };
              }

              console.log = makePatched('log');
              console.info = makePatched('info');
              console.warn = makePatched('warn');
              console.error = makePatched('error');
            })();

            window.addEventListener('error', (event) => {
              const message = (event && event.message) ? event.message : 'Unknown error';
              __renderError('Runtime Error', message);
              __post('runtime-error', message);
            });

            window.addEventListener('unhandledrejection', (event) => {
              const reason = event && event.reason;
              const message =
                (reason && reason.message) ? reason.message :
                (typeof reason === 'string') ? reason :
                'Unhandled promise rejection';
              __renderError('Unhandled Promise Rejection', message);
              __post('runtime-error', message);
            });

            // Mock module environment for Babel's CommonJS output
            const exports = {};
            const module = { exports };
            
            function require(name) {
              if (name === 'react') return React;
              if (name === 'react-dom' || name === 'react-dom/client') return ReactDOM;
              console.warn('Module not found:', name);
              return {};
            }

            try {
              // Execute the transpiled code
              ${compiledCode}

              // Extract exported component
              const AppLocal = module.exports.default || exports.default || App;
              
              if (AppLocal) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(AppLocal));
              } else {
                const msg = 'Could not find a default export component.';
                __post('runtime-error', msg);
                __renderError('Runtime Error', msg);
              }
            } catch (err) {
              const msg = err && err.message ? err.message : String(err);
              __post('runtime-error', msg);
              __renderError('Runtime Error', msg);
            }
          </script>
        </body>
      </html>
    `;

    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  }, [tsxCode, cssCode, onConsoleClear, onConsoleError]);

  return (
    <div className="w-full h-full relative bg-white flex flex-col">
      <iframe
        ref={iframeRef}
        title="Interview Code Preview Sandbox"
        sandbox="allow-scripts allow-same-origin"
        className="flex-1 w-full border-none bg-white"
      />
    </div>
  );
}
