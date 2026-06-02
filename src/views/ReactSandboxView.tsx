import EditorPanel from '../components/EditorPanel';
import PreviewPanel from '../components/PreviewPanel';
import ResizableSplit from '../components/ResizableSplit';
import { useCallback, useState } from 'react';
import ConsolePanel from '../components/ConsolePanel';

interface ReactSandboxViewProps {
  tsxCode: string;
  setTsxCode: (val: string) => void;
  cssCode: string;
  setCssCode: (val: string) => void;
  compiledPreview: { tsx: string; css: string };
  onPreviewError: () => void;
}

export default function ReactSandboxView({
  tsxCode,
  setTsxCode,
  cssCode,
  setCssCode,
  compiledPreview,
  onPreviewError,
}: ReactSandboxViewProps) {
  const [previewConsoleOutput, setPreviewConsoleOutput] = useState('');
  const [previewConsoleError, setPreviewConsoleError] = useState<string | null>(null);

  const handleConsoleOutput = useCallback((message: string) => {
    setPreviewConsoleOutput((prev) => (prev ? `${prev}\n${message}` : message));
  }, []);

  const handleConsoleError = useCallback((message: string) => {
    onPreviewError();
    setPreviewConsoleError(message);
    setPreviewConsoleOutput('');
  }, [onPreviewError]);

  const handleConsoleClear = useCallback(() => {
    setPreviewConsoleError(null);
    setPreviewConsoleOutput('');
  }, []);

  return (
    <ResizableSplit
      orientation="vertical"
      initialPrimaryPercent={50}
      minPrimaryPercent={20}
      maxPrimaryPercent={80}
      primaryWrapperClassName="flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10"
      secondaryWrapperClassName="h-full relative bg-white flex flex-col"
      primary={
        <EditorPanel tsxCode={tsxCode} setTsxCode={setTsxCode} cssCode={cssCode} setCssCode={setCssCode} />
      }
      secondary={
        <div className="flex flex-col h-full w-full">
          <div className="h-10 shrink-0 bg-[#0f0f0f] border-b border-[#2d2d2d] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider justify-between shadow-sm z-10 w-full relative">
            Preview Environment
          </div>
          <div className="flex-1 min-h-0 bg-white w-full h-full relative flex flex-col">
            <ResizableSplit
              orientation="horizontal"
              initialPrimaryPercent={75}
              minPrimaryPercent={35}
              maxPrimaryPercent={90}
              primaryWrapperClassName="relative min-h-0 bg-white"
              secondaryWrapperClassName="min-h-[140px] border-t border-[#2d2d2d]"
              primary={
                <PreviewPanel
                  tsxCode={compiledPreview.tsx}
                  cssCode={compiledPreview.css}
                  onConsoleOutput={handleConsoleOutput}
                  onConsoleError={handleConsoleError}
                  onConsoleClear={handleConsoleClear}
                />
              }
              secondary={
                <ConsolePanel output={previewConsoleOutput} error={previewConsoleError} onClear={handleConsoleClear} />
              }
            />
          </div>
        </div>
      }
    />
  );
}
