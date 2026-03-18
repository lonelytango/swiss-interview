import { type Monaco } from '@monaco-editor/react';
import CodeEditor from './CodeEditor';
import { useCallback, useRef, useState } from 'react';

interface EditorPanelProps {
  tsxCode: string;
  setTsxCode: (val: string) => void;
  cssCode: string;
  setCssCode: (val: string) => void;
}

export default function EditorPanel({ tsxCode, setTsxCode, cssCode, setCssCode }: EditorPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tsxHeight, setTsxHeight] = useState<number>(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const isPointerDownRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  
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

  const setHeightFromClientY = useCallback((clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const percentage = (offsetY / rect.height) * 100;
    const clamped = Math.min(80, Math.max(20, percentage));
    setTsxHeight(clamped);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full overflow-hidden">
      {/* TSX Editor */}
      <div
        className="flex flex-col min-h-0"
        style={{ flexBasis: `${tsxHeight}%`, maxHeight: `${tsxHeight}%` }}
      >
        <div className="h-10 shrink-0 bg-[#0f0f0f] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider shadow-sm z-10">
          Component.tsx
        </div>
        <div className="flex-1 min-h-0 pt-2 bg-[#1e1e1e]">
          <CodeEditor
            beforeMount={handleEditorBeforeMount}
            path="App.tsx"
            language="typescript"
            value={tsxCode}
            onChange={setTsxCode}
          />
        </div>
      </div>
      
      {/* Drag Handle */}
      <div
        className={`relative z-20 flex items-center w-full h-[10px] cursor-row-resize transition-colors ${
          isResizing ? 'bg-indigo-500/20' : 'bg-transparent'
        }`}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          isPointerDownRef.current = true;
          pointerIdRef.current = e.pointerId;
          setIsResizing(true);

          try {
            document.body.style.userSelect = 'none';
          } catch (_) {}

          try {
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          } catch (_) {}

          setHeightFromClientY(e.clientY);
        }}
        onPointerMove={(e) => {
          if (!isPointerDownRef.current) return;
          setHeightFromClientY(e.clientY);
        }}
        onPointerUp={(e) => {
          if (!isPointerDownRef.current) return;
          if (pointerIdRef.current === e.pointerId) {
            isPointerDownRef.current = false;
            pointerIdRef.current = null;
            setIsResizing(false);
            try {
              document.body.style.userSelect = '';
            } catch (_) {}
          }
          try {
            (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
          } catch (_) {}
        }}
        onPointerCancel={(e) => {
          if (!isPointerDownRef.current) return;
          if (pointerIdRef.current === e.pointerId) {
            isPointerDownRef.current = false;
            pointerIdRef.current = null;
            setIsResizing(false);
            try {
              document.body.style.userSelect = '';
            } catch (_) {}
          }
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-[2px] bg-[#2d2d2d] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" />
          <div className="w-[38px] h-[3px] rounded-full bg-[#e5e7eb]/80" />
        </div>
      </div>

      {/* CSS Editor */}
      <div
        className="flex flex-col min-h-0"
        style={{ flexBasis: `${100 - tsxHeight}%`, maxHeight: `${100 - tsxHeight}%` }}
      >
        <div className="h-10 shrink-0 bg-[#0f0f0f] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider shadow-sm z-10 border-t border-[#3d3d3d]">
          styles.css
        </div>
        <div className="flex-1 min-h-0 pt-2 bg-[#1e1e1e]">
          <CodeEditor path="styles.css" language="css" value={cssCode} onChange={setCssCode} />
        </div>
      </div>
    </div>
  );
}
