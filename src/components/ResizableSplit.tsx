import { type ReactNode, useCallback, useRef, useState } from 'react';

type ResizableOrientation = 'vertical' | 'horizontal';

interface ResizableSplitProps {
  orientation: ResizableOrientation;
  initialPrimaryPercent?: number;
  minPrimaryPercent?: number;
  maxPrimaryPercent?: number;
  primary: ReactNode;
  secondary: ReactNode;
  primaryWrapperClassName?: string;
  secondaryWrapperClassName?: string;
  containerClassName?: string;
  handleSizePx?: number;
}

export default function ResizableSplit({
  orientation,
  initialPrimaryPercent = 50,
  minPrimaryPercent = 20,
  maxPrimaryPercent = 80,
  primary,
  secondary,
  primaryWrapperClassName = '',
  secondaryWrapperClassName = '',
  containerClassName = '',
  handleSizePx = 6,
}: ResizableSplitProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [primaryPercent, setPrimaryPercent] = useState<number>(initialPrimaryPercent);
  const [isResizing, setIsResizing] = useState(false);
  const isPointerDownRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const setPercentFromClient = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (orientation === 'vertical') {
        const offsetX = clientX - rect.left;
        const percentage = (offsetX / rect.width) * 100;
        const clamped = Math.min(maxPrimaryPercent, Math.max(minPrimaryPercent, percentage));
        setPrimaryPercent(clamped);
        return;
      }

      const offsetY = clientY - rect.top;
      const percentage = (offsetY / rect.height) * 100;
      const clamped = Math.min(maxPrimaryPercent, Math.max(minPrimaryPercent, percentage));
      setPrimaryPercent(clamped);
    },
    [maxPrimaryPercent, minPrimaryPercent, orientation]
  );

  const cursorClass = orientation === 'vertical' ? 'cursor-col-resize' : 'cursor-row-resize';
  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full overflow-hidden ${orientation === 'vertical' ? 'flex-row' : 'flex-col'} ${
        containerClassName || ''
      }`}
    >
      <div
        className={`shrink-0 overflow-hidden ${primaryWrapperClassName || ''}`}
        style={
          isVertical
            ? { flexBasis: `${primaryPercent}%`, maxWidth: `${primaryPercent}%` }
            : { flexBasis: `${primaryPercent}%`, maxHeight: `${primaryPercent}%` }
        }
      >
        {primary}
      </div>

      {/* Drag Handle */}
      <div
        className={`relative z-20 flex items-center justify-center ${
          isVertical ? 'h-full' : 'w-full'
        } ${cursorClass} transition-colors bg-[#4b5563] hover:bg-[#6366f1] active:bg-[#4f46e5] ${
          isResizing ? 'bg-[#4f46e5]' : ''
        } shadow-[inset_0_0_0_1px_rgba(15,23,42,0.9)]`}
        style={
          isVertical
            ? { width: handleSizePx, flex: `0 0 ${handleSizePx}px` }
            : { height: handleSizePx, flex: `0 0 ${handleSizePx}px` }
        }
        onPointerDown={(e) => {
          // Only start on primary mouse button / primary pointer.
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

          setPercentFromClient(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!isPointerDownRef.current) return;
          setPercentFromClient(e.clientX, e.clientY);
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
        {/* Visible grip */}
        {isVertical ? (
          <div className="w-[2px] h-8 rounded-full bg-[#e5e7eb]/80 shadow-[0_0_10px_rgba(99,102,241,0.25)]" />
        ) : (
          <div className="h-[2px] w-8 rounded-full bg-[#e5e7eb]/80 shadow-[0_0_10px_rgba(99,102,241,0.25)]" />
        )}
      </div>

      <div
        className={`flex-1 overflow-hidden ${secondaryWrapperClassName || ''}`}
        style={
          isVertical
            ? { flexBasis: `${100 - primaryPercent}%`, maxWidth: `${100 - primaryPercent}%` }
            : { flexBasis: `${100 - primaryPercent}%`, maxHeight: `${100 - primaryPercent}%` }
        }
      >
        {secondary}
      </div>
    </div>
  );
}

