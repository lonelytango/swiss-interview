import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ConsolePanelProps {
	output: string;
	error: string | null;
	onClear?: () => void;
}

export default function ConsolePanel({ output, error, onClear }: ConsolePanelProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [output, error]);

	return (
		<div className="w-full h-full bg-[#050816] text-slate-100 flex flex-col">
			<div className="h-10 shrink-0 bg-[#0f0f0f] border-b border-[#2d2d2d] flex items-center px-4 text-xs font-mono text-slate-400 uppercase tracking-wider justify-between shadow-sm z-10">
				<span>Console</span>
				{onClear && (
					<button
						type="button"
						onClick={onClear}
						title="Clear console"
						className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
					>
						<X size={14} />
					</button>
				)}
			</div>

			<div
				ref={scrollRef}
				className="flex-1 min-h-0 p-3 font-mono text-xs overflow-auto bg-[#050816] scroll-smooth"
			>
				{error ? (
					<pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
				) : output ? (
					<pre className="text-emerald-300 whitespace-pre-wrap">{output}</pre>
				) : (
					<span className="text-slate-500">
						Console output will appear here.
					</span>
				)}
			</div>
		</div>
	);
}
