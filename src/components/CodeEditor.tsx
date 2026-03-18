import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";

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

/** Generate a valid HTML id from the editor path (e.g. "App.tsx" -> "monaco-editor-app-tsx") */
function pathToId(path: string): string {
	return `monaco-editor-${path.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()}`;
}

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

	const handleMount: OnMount = (editor) => {
		// Add id/name to Monaco's internal textarea to fix browser autofill warnings.
		const domNode = editor.getDomNode?.();
		if (domNode) {
			const textarea = domNode.querySelector("textarea");
			if (textarea) {
				const id = pathToId(path);
				textarea.id = id;
				textarea.name = id;
			}
		}
	};

	return (
		<Editor
			beforeMount={handleBeforeMount}
			onMount={handleMount}
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
