import AlgorithmPanel from '../components/AlgorithmPanel';
import ConsolePanel from '../components/ConsolePanel';
import { useCallback, useRef, useState } from 'react';

interface AlgorithmPlaygroundViewProps {
  algoCode: string;
  setAlgoCode: (val: string) => void;
  consoleOutput: string;
  consoleError: string | null;
}

export default function AlgorithmPlaygroundView({
  algoCode,
  setAlgoCode,
  consoleOutput,
  consoleError,
}: AlgorithmPlaygroundViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editorWidth, setEditorWidth] = useState<number>(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const isPointerDownRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

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
      {/* Left Panel: Algorithm Editor */}
      <div
        className="flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10 shrink-0"
        style={{ flexBasis: `${editorWidth}%`, maxWidth: `${editorWidth}%` }}
      >
        <AlgorithmPanel code={algoCode} setCode={setAlgoCode} />
      </div>

      {/* Drag Handle */}
      <div
        className={`relative z-20 flex items-stretch ${isResizing ? 'bg-[#4f46e5]/20' : ''}`}
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
        <div
          className="w-[6px] bg-[#4b5563] hover:bg-[#6366f1] active:bg-[#4f46e5] cursor-col-resize transition-colors flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(15,23,42,0.9)]"
        >
          <div className="w-[2px] h-8 rounded-full bg-[#e5e7eb]/80" />
        </div>
      </div>

      {/* Right Panel: Console */}
      <div
        className="h-full flex flex-col shrink-0 relative bg-black"
        style={{ flexBasis: `${100 - editorWidth}%`, maxWidth: `${100 - editorWidth}%` }}
      >
        <ConsolePanel output={consoleOutput} error={consoleError} />
      </div>
    </div>
  );
}

