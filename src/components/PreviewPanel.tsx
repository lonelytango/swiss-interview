import { useEffect, useRef, useState } from 'react';
import * as Babel from '@babel/standalone';

interface PreviewPanelProps {
  tsxCode: string;
  cssCode: string;
}

export default function PreviewPanel({ tsxCode, cssCode }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let compiledCode = '';
    setError(null);
    try {
      // Transpile TSX to executable JS
      const result = Babel.transform(tsxCode, {
        presets: ['env', 'react', 'typescript'],
        filename: 'App.tsx'
      });
      compiledCode = result.code || '';
    } catch (err: any) {
      setError(err.message);
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
                document.getElementById('root').innerHTML = '<div style="color:#ef4444;padding:20px;font-family:monospace;background:#fef2f2;border-bottom:1px solid #fca5a5;">Error: Could not find a default export component.</div>';
              }
            } catch (err) {
              document.getElementById('root').innerHTML = '<div style="color:#ef4444;padding:20px;font-family:monospace;background:#fef2f2;border-bottom:1px solid #fca5a5;">Runtime Error: ' + err.message + '</div>';
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
      {error && (
        <div className="absolute top-0 left-0 w-full p-4 bg-red-950/90 text-red-200 text-sm border-b border-red-800 z-10 font-mono whitespace-pre-wrap shrink-0 max-h-48 overflow-auto shadow-xl backdrop-blur-md">
          {error}
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Interview Code Preview Sandbox"
        sandbox="allow-scripts allow-same-origin"
        className="flex-1 w-full border-none bg-white"
      />
    </div>
  );
}
