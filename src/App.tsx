import { useState } from 'react';
import { Play, Code2 } from 'lucide-react';
import * as Babel from '@babel/standalone';
import ReactSandboxView from './views/ReactSandboxView';
import AlgorithmPlaygroundView from './views/AlgorithmPlaygroundView';
import { DEFAULT_ALGO, DEFAULT_CSS, DEFAULT_TSX } from './constants/defaults';
import ModeSelector, { type SandboxMode } from './components/ModeSelector';
import './App.css';

function App() {
  const [mode, setMode] = useState<SandboxMode>('algorithm');
  const [tsxCode, setTsxCode] = useState(DEFAULT_TSX);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [compiledPreview, setCompiledPreview] = useState({ tsx: DEFAULT_TSX, css: DEFAULT_CSS });
  const [algoCode, setAlgoCode] = useState(DEFAULT_ALGO);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState<string | null>(null);

  const handleRun = () => {
    if (mode === 'react') {
      setCompiledPreview({ tsx: tsxCode, css: cssCode });
      return;
    }

    // Algorithm mode: run user code and capture console output.
    setConsoleError(null);
    setConsoleOutput('');

    try {
      const logs: string[] = [];
      const fakeConsole = Object.freeze({
        log: (...args: unknown[]) => logs.push(args.map((a) => String(a)).join(' ')),
      });

      const transpiled = Babel.transform(algoCode, {
        presets: ['env', 'typescript'],
        filename: 'Algorithm.ts',
      }).code;

      if (!transpiled) throw new Error('Failed to transpile algorithm code.');

      // eslint-disable-next-line no-new-func
      const fn = new Function('console', `"use strict";\n${transpiled}`);
      fn(fakeConsole);
      setConsoleOutput(logs.join('\n'));
    } catch (err: any) {
      setConsoleError(err?.message ?? String(err));
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-slate-200 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-[#0f0f0f] border-b border-[#2d2d2d]">
        <div className="flex items-center gap-3 text-indigo-400">
          <Code2 size={24} />
          <div className="text-md font-semibold tracking-tight text-slate-100">Frontend Interview Sandbox</div>
        </div>
        <div className="flex items-center gap-4">
          <ModeSelector mode={mode} onChange={setMode} />
          <button 
            onClick={handleRun}
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md transition-all text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] active:scale-95"
          >
            <Play size={16} className="fill-current group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all" />
            Run Code
          </button>
        </div>
      </header>
      
      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {mode === 'react' ? (
          <ReactSandboxView
            tsxCode={tsxCode}
            setTsxCode={setTsxCode}
            cssCode={cssCode}
            setCssCode={setCssCode}
            compiledPreview={compiledPreview}
          />
        ) : (
          <AlgorithmPlaygroundView
            algoCode={algoCode}
            setAlgoCode={setAlgoCode}
            consoleOutput={consoleOutput}
            consoleError={consoleError}
          />
        )}
      </div>
    </div>
  );
}

export default App;
