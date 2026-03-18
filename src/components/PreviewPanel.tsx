import { useEffect, useRef, useState } from 'react';
import * as Babel from '@babel/standalone';

interface PreviewPanelProps {
  tsxCode: string;
  cssCode: string;
  onConsoleError?: (message: string) => void;
  onConsoleOutput?: (message: string) => void;
  onConsoleClear?: () => void;
}

const PREVIEW_POST_MESSAGE_SOURCE = 'devview-preview';

export default function PreviewPanel({
  tsxCode,
  cssCode,
  onConsoleError,
  onConsoleOutput,
  onConsoleClear,
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [_, setError] = useState<string | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as any;
      if (!data || data.source !== PREVIEW_POST_MESSAGE_SOURCE) return;
      if (data.type === 'runtime-error' && typeof data.message === 'string') {
        onConsoleError?.(`Runtime Error: ${data.message}`);
      }
      if (data.type === 'console' && typeof data.message === 'string') {
        onConsoleOutput?.(data.message);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onConsoleError, onConsoleOutput]);

  useEffect(() => {
    let compiledCode = '';
    setError(null);
    onConsoleClear?.();
    try {
      // Transpile TSX to executable JS
      const result = Babel.transform(tsxCode, {
        presets: ['env', 'react', 'typescript'],
        filename: 'App.tsx'
      });
      compiledCode = result.code || '';
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setError(msg);
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
              __post('runtime-error', message);
            });

            window.addEventListener('unhandledrejection', (event) => {
              const reason = event && event.reason;
              const message =
                (reason && reason.message) ? reason.message :
                (typeof reason === 'string') ? reason :
                'Unhandled promise rejection';
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
                document.getElementById('root').innerHTML = '<div style="color:#ef4444;padding:20px;font-family:monospace;background:#fef2f2;border-bottom:1px solid #fca5a5;">Error: ' + msg + '</div>';
              }
            } catch (err) {
              const msg = err && err.message ? err.message : String(err);
              __post('runtime-error', msg);
              document.getElementById('root').innerHTML = '<div style="color:#ef4444;padding:20px;font-family:monospace;background:#fef2f2;border-bottom:1px solid #fca5a5;">Runtime Error: ' + msg + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  }, [tsxCode, cssCode]);

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
