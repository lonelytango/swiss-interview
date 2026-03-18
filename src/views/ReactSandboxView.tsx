import EditorPanel from '../components/EditorPanel';
import PreviewPanel from '../components/PreviewPanel';
import { useCallback, useRef, useState } from 'react';
import ConsolePanel from '../components/ConsolePanel';

interface ReactSandboxViewProps {
  tsxCode: string;
  setTsxCode: (val: string) => void;
  cssCode: string;
  setCssCode: (val: string) => void;
  compiledPreview: { tsx: string; css: string };
}

export default function ReactSandboxView({
  tsxCode,
  setTsxCode,
  cssCode,
  setCssCode,
  compiledPreview,
}: ReactSandboxViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editorWidth, setEditorWidth] = useState<number>(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const isPointerDownRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const [previewConsoleOutput, setPreviewConsoleOutput] = useState('');
  const [previewConsoleError, setPreviewConsoleError] = useState<string | null>(null);

  const handleConsoleOutput = useCallback((message: string) => {
    setPreviewConsoleOutput((prev) => (prev ? `${prev}\n${message}` : message));
  }, []);

  const handleConsoleError = useCallback((message: string) => {
    setPreviewConsoleError(message);
    setPreviewConsoleOutput('');
  }, []);

  const handleConsoleClear = useCallback(() => {
    setPreviewConsoleError(null);
    setPreviewConsoleOutput('');
  }, []);

  const setWidthFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = (offsetX / rect.width) * 100;
    const clamped = Math.min(80, Math.max(20, percentage));
    setEditorWidth(clamped);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-1 w-full h-full overflow-hidden">
      {/* Left Panel: React Editors */}
      <div
        className="flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10 shrink-0"
        style={{ flexBasis: `${editorWidth}%`, maxWidth: `${editorWidth}%` }}
      >
        <EditorPanel tsxCode={tsxCode} setTsxCode={setTsxCode} cssCode={cssCode} setCssCode={setCssCode} />
      </div>

      {/* Drag Handle */}
      <div
        className={`relative z-20 flex items-stretch ${isResizing ? 'bg-[#4f46e5]/20' : ''}`}
        onPointerDown={(e) => {
          // Only start on left button / primary pointer.
          if (e.button !== 0) return;
          isPointerDownRef.current = true;
          pointerIdRef.current = e.pointerId;
          setIsResizing(true);
          // Prevent accidental text selection during drag.
          try {
            document.body.style.userSelect = 'none';
          } catch (_) {}

          try {
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          } catch (_) {}

          setWidthFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!isPointerDownRef.current) return;
          setWidthFromClientX(e.clientX);
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
        <div className="w-[6px] bg-[#4b5563] hover:bg-[#6366f1] active:bg-[#4f46e5] cursor-col-resize transition-colors flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.9)]">
          <div className="w-[2px] h-8 rounded-full bg-[#e5e7eb]/80" />
        </div>
      </div>

      {/* Right Panel: React Preview */}
      <div
        className="h-full relative bg-white flex flex-col shrink-0"
        style={{ flexBasis: `${100 - editorWidth}%`, maxWidth: `${100 - editorWidth}%` }}
      >
        <div className="h-10 shrink-0 bg-[#0f0f0f] border-b border-[#2d2d2d] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider justify-between shadow-sm z-10 w-full relative">
          Preview Environment
        </div>
        <div className="flex-1 min-h-0 bg-white w-full h-full relative flex flex-col">
          <div className="flex-1 min-h-0 relative">
            <PreviewPanel
              tsxCode={compiledPreview.tsx}
              cssCode={compiledPreview.css}
              onConsoleOutput={handleConsoleOutput}
              onConsoleError={handleConsoleError}
              onConsoleClear={handleConsoleClear}
            />
          </div>
          <div className="h-1/4 min-h-[140px] border-t border-[#2d2d2d]">
            <ConsolePanel output={previewConsoleOutput} error={previewConsoleError} />
          </div>
        </div>
      </div>
    </div>
  );
}

