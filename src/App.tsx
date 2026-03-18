import { useState } from 'react';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import { Play, Code2 } from 'lucide-react';
import './App.css';

const DEFAULT_TSX = 
`import { useState } from "react";

const Counter = () => {
  const [count, setCount] = useState<number>(0);
  return <div>
    <div>{\`Counter: \${count}\`}</div>
    <button style={{
      padding: "4px",
      border: "1px solid #000000" 
    }} onClick={() => {setCount(count+1)}}>Add Count</button>
  </div>
}

export default function App() {
  return <div className="container">
    <div className="welcome">Welcome to DevView</div>
    <div className="text-3xl font-bold">Tailwind Hello World</div>
    <hr />
    <Counter />
  </div>
}
`;

const DEFAULT_CSS = 
`/* CSS Sandbox */

.welcome {
  font-weight: bold;
}

.container {
  display: flex;
  flex-direction: column;
}
`;

function App() {
  const [tsxCode, setTsxCode] = useState(DEFAULT_TSX);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [compiledPreview, setCompiledPreview] = useState({ tsx: DEFAULT_TSX, css: DEFAULT_CSS });

  const handleRun = () => {
    setCompiledPreview({ tsx: tsxCode, css: cssCode });
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
        {/* Left Panel: Editors */}
        <div className="w-1/2 flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10 basis-1/2 shrink-0 max-w-[50%]">
           <EditorPanel 
              tsxCode={tsxCode} setTsxCode={setTsxCode} 
              cssCode={cssCode} setCssCode={setCssCode} 
           />
        </div>
        
        {/* Right Panel: Preview */}
        <div className="flex-1 w-1/2 h-full relative bg-white flex flex-col basis-1/2 shrink-0">
           {/* Preview Toolbar */}
           <div className="h-10 shrink-0 bg-[#0f0f0f] border-b border-[#2d2d2d] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider justify-between shadow-sm z-10 w-full relative">
             <span>Preview Environment</span>
             <span className="text-[10px] text-slate-600 flex items-center gap-1.5 bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333]">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                Live
             </span>
           </div>
           
           <div className="flex-1 min-h-0 bg-white w-full h-full relative">
             <PreviewPanel tsxCode={compiledPreview.tsx} cssCode={compiledPreview.css} />
           </div>
        </div>
      </div>
    </div>
  );
}

export default App;
