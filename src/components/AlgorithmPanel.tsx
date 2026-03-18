import Editor, { type Monaco } from '@monaco-editor/react';
import { useCallback } from 'react';

interface AlgorithmPanelProps {
  code: string;
  setCode: (val: string) => void;
}

export default function AlgorithmPanel({ code, setCode }: AlgorithmPanelProps) {
  const handleBeforeMount = useCallback((monaco: Monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowNonTsExtensions: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      allowJs: true,
      noEmit: true,
    });
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-10 shrink-0 bg-[#0f0f0f] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider shadow-sm z-10">
        Algorithm.ts
      </div>
      <div className="flex-1 min-h-0 bg-[#1e1e1e] pt-2">
        <Editor
          beforeMount={handleBeforeMount}
          path="Algorithm.ts"
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            wordWrap: 'on',
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
            padding: { top: 8, bottom: 8 },
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
            matchBrackets: 'always',
          }}
        />
      </div>
    </div>
  );
}

