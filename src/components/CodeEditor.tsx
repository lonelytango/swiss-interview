import Editor, { type Monaco } from "@monaco-editor/react";

type MonacoEditorOptions = Parameters<typeof Editor>[0]["options"];

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
	fontSize: 12,
	fontFamily: '"JetBrains Mono", "Fira Code", monospace',
	wordWrap: "on",
	formatOnPaste: true,
	scrollBeyondLastLine: false,
	tabSize: 2,
	padding: { top: 8, bottom: 8 },
	bracketPairColorization: { enabled: true },
	guides: { bracketPairs: true },
	matchBrackets: "always",
};

export default function CodeEditor({
	value,
	onChange,
	path,
	language,
	height = "100%",
	theme = "vs-dark",
	options,
	beforeMount,
}: CodeEditorProps) {
	const handleBeforeMount = (monaco: Monaco) => {
		// Keep Monaco setup (TS compiler options, extra libs, etc.) in callers.
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
			onChange={(val) => onChange(val || "")}
			options={{ ...DEFAULT_OPTIONS, ...options }}
		/>
	);
}
