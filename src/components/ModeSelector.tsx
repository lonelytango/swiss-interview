export type SandboxMode = 'react' | 'algorithm';

interface ModeSelectorProps {
  mode: SandboxMode;
  onChange: (mode: SandboxMode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-700 rounded-md p-1 text-xs">
      <button
        onClick={() => onChange('algorithm')}
        className={`px-3 py-1 rounded-md transition-colors ${
          mode === 'algorithm' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-gray-500'
        }`}
      >
        Algorithm Playground
      </button>
      <button
        onClick={() => onChange('react')}
        className={`px-3 py-1 rounded-md transition-colors ${
          mode === 'react' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-gray-500'
        }`}
      >
        React Sandbox
      </button>
    </div>
  );
}

