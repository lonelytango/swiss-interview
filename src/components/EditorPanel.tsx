import Editor, { type Monaco } from '@monaco-editor/react';

interface EditorPanelProps {
  tsxCode: string;
  setTsxCode: (val: string) => void;
  cssCode: string;
  setCssCode: (val: string) => void;
}

export default function EditorPanel({ tsxCode, setTsxCode, cssCode, setCssCode }: EditorPanelProps) {
  
  const handleEditorBeforeMount = (monaco: Monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      allowNonTsExtensions: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      allowJs: true,
    });

    // Provide minimal React typings for the in-app TSX sandbox.
    // These live in Monaco's virtual FS and are independent of the host app's TS config.
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module "react" {
        export type Dispatch<A> = (value: A) => void;
        export type SetStateAction<S> = S | ((prevState: S) => S);
        export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
        export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
        export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
        export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
        export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly unknown[]): T;
        export function useRef<T>(initialValue: T): { current: T };
        export function useRef<T>(initialValue: T | null): { current: T | null };
        export const Fragment: any;
        export const StrictMode: any;
        const React: any;
        export default React;
      }
      declare module "react-dom/client" {
        export function createRoot(container: Element | DocumentFragment): { render(node: any): void };
      }
      declare namespace JSX {
        interface IntrinsicElements {
          [elemName: string]: any;
        }
      }`,
      'file:///node_modules/@types/react/index.d.ts'
    );

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module "react/jsx-runtime" {
        export const Fragment: any;
        export const jsx: any;
        export const jsxs: any;
      }`,
      'file:///node_modules/@types/react/jsx-runtime.d.ts'
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* TSX Editor */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-[#2d2d2d]">
        <div className="h-10 shrink-0 bg-[#0f0f0f] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider shadow-sm z-10">
          Component.tsx
        </div>
        <div className="flex-1 min-h-0 pt-2 bg-[#1e1e1e]">
          <Editor
            beforeMount={handleEditorBeforeMount}
            path="App.tsx"
            height="100%"
            defaultLanguage="typescript"
            theme="vs-dark"
            value={tsxCode}
            onChange={(val) => setTsxCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              wordWrap: 'on',
              formatOnPaste: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              padding: { top: 8, bottom: 8 }
            }}
          />
        </div>
      </div>
      
      {/* CSS Editor */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-10 shrink-0 bg-[#0f0f0f] border-t border-[#3d3d3d] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider shadow-sm z-10">
          styles.css
        </div>
        <div className="flex-1 min-h-0 pt-2 bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage="css"
            theme="vs-dark"
            value={cssCode}
            onChange={(val) => setCssCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              wordWrap: 'on',
              formatOnPaste: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              padding: { top: 8, bottom: 8 }
            }}
          />
        </div>
      </div>
    </div>
  );
}
