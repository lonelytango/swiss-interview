import Editor, { type Monaco } from '@monaco-editor/react';

type MonacoEditorOptions = Parameters<typeof Editor>[0]['options'];

export interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  path: string;
  language: string;
  height?: string | number;
  theme?: string;
  options?: MonacoEditorOptions;
  beforeMount?: (monaco: Monaco) => void;
}

const DEFAULT_OPTIONS: MonacoEditorOptions = {
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
};

export default function CodeEditor({
  value,
  onChange,
  path,
  language,
  height = '100%',
  theme = 'devview-dark',
  options,
  beforeMount,
}: CodeEditorProps) {
  const handleBeforeMount = (monaco: Monaco) => {
    // Define once, safe to call repeatedly.
    monaco.editor.defineTheme('devview-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // JSX-ish highlighting tweaks (harmless for non-JSX languages)
        { token: 'tag', foreground: '569CD6' },
        { token: 'tag.jsx', foreground: '569CD6' },
        { token: 'delimiter.angle', foreground: '808080' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
      ],
      colors: {},
    });

    beforeMount?.(monaco);
  };

  return (
    <Editor
      beforeMount={handleBeforeMount}
      path={path}
      height={height}
      defaultLanguage={language}
      theme={theme}
      value={value}
      onChange={(val) => onChange(val || '')}
      options={{ ...DEFAULT_OPTIONS, ...options }}
    />
  );
}

