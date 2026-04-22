import CodeEditor from './CodeEditor';

interface PythonPanelProps {
  code: string;
  setCode: (val: string) => void;
}

export default function PythonPanel({ code, setCode }: PythonPanelProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-10 shrink-0 bg-[#0f0f0f] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider shadow-sm z-10">
        main.py
      </div>
      <div className="flex-1 min-h-0 bg-[#1e1e1e] pt-2">
        <CodeEditor path="main.py" language="python" value={code} onChange={setCode} />
      </div>
    </div>
  );
}
