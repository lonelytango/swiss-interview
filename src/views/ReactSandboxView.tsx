import EditorPanel from '../components/EditorPanel';
import PreviewPanel from '../components/PreviewPanel';
import { useCallback, useState } from 'react';
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

  return (
    <>
      {/* Left Panel: React Editors */}
      <div className="w-1/2 flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10 basis-1/2 shrink-0 max-w-[50%]">
        <EditorPanel tsxCode={tsxCode} setTsxCode={setTsxCode} cssCode={cssCode} setCssCode={setCssCode} />
      </div>
      {/* Right Panel: React Preview */}
      <div className="flex-1 w-1/2 h-full relative bg-white flex flex-col basis-1/2 shrink-0">
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
    </>
  );
}

