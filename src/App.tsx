import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Code2 } from 'lucide-react';
import * as Babel from '@babel/standalone';
import type { PyodideInterface } from 'pyodide';
import ReactSandboxView from './views/ReactSandboxView';
import AlgorithmPlaygroundView from './views/AlgorithmPlaygroundView';
import PythonPlaygroundView from './views/PythonPlaygroundView';
import { DEFAULT_ALGO, DEFAULT_CSS, DEFAULT_PYTHON, DEFAULT_TSX } from './constants/defaults';
import { PYODIDE_INDEX_URL } from './constants/pyodide';
import ModeSelector, { type SandboxMode } from './components/ModeSelector';
import './App.css';

function App() {
  const [mode, setMode] = useState<SandboxMode>('algorithm');
  const [tsxCode, setTsxCode] = useState(DEFAULT_TSX);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [compiledPreview, setCompiledPreview] = useState({ tsx: DEFAULT_TSX, css: DEFAULT_CSS });
  const [algoCode, setAlgoCode] = useState(DEFAULT_ALGO);
  const [pythonCode, setPythonCode] = useState(DEFAULT_PYTHON);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState<string | null>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  const handleRun = useCallback(() => {
    void (async () => {
      if (mode === 'react') {
        setCompiledPreview({ tsx: tsxCode, css: cssCode });
        return;
      }

      setConsoleError(null);
      setConsoleOutput('');

      if (mode === 'algorithm') {
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

          const fn = new Function('console', `"use strict";\n${transpiled}`);
          fn(fakeConsole);
          setConsoleOutput(logs.join('\n'));
        } catch (err: unknown) {
          setConsoleError(err instanceof Error ? err.message : String(err));
        }
        return;
      }

      if (mode === 'python') {
        const stdoutChunks: string[] = [];
        const stderrChunks: string[] = [];
        try {
          if (!pyodideRef.current) {
            setConsoleOutput('Loading Python runtime…');
            const { loadPyodide } = await import('pyodide');
            pyodideRef.current = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
          }
          const pyodide = pyodideRef.current;
          pyodide.setStdout({ batched: (s: string) => stdoutChunks.push(s) });
          pyodide.setStderr({ batched: (s: string) => stderrChunks.push(s) });
          await pyodide.runPythonAsync(pythonCode, { filename: 'main.py' });
          const parts: string[] = [];
          if (stdoutChunks.length) parts.push(stdoutChunks.join(''));
          if (stderrChunks.length) {
            parts.push(stderrChunks.map((line) => `[stderr] ${line}`).join('\n'));
          }
          setConsoleOutput(parts.filter(Boolean).join('\n'));
        } catch (err: unknown) {
          setConsoleError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
  }, [mode, tsxCode, cssCode, algoCode, pythonCode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 's') return;
      if (!(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      event.stopPropagation();
      handleRun();
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [handleRun]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-slate-200 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-[#0f0f0f] border-b border-[#2d2d2d]">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3 text-indigo-400">
          <Code2 size={24} />
          <div className="text-md font-semibold tracking-tight text-slate-100">Frontend Interview Sandbox</div>
        </div>
        <button 
            onClick={handleRun}
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md transition-all text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] active:scale-95"
          >
            <Play size={16} className="fill-current group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all" />
            Run Code
          </button>
        </div>
          <ModeSelector mode={mode} onChange={setMode} />
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
        ) : mode === 'python' ? (
          <PythonPlaygroundView
            pythonCode={pythonCode}
            setPythonCode={setPythonCode}
            consoleOutput={consoleOutput}
            consoleError={consoleError}
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
