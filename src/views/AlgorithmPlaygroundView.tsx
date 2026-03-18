import AlgorithmPanel from '../components/AlgorithmPanel';
import ConsolePanel from '../components/ConsolePanel';

interface AlgorithmPlaygroundViewProps {
  algoCode: string;
  setAlgoCode: (val: string) => void;
  consoleOutput: string;
  consoleError: string | null;
}

export default function AlgorithmPlaygroundView({
  algoCode,
  setAlgoCode,
  consoleOutput,
  consoleError,
}: AlgorithmPlaygroundViewProps) {
  return (
    <>
      {/* Left Panel: Algorithm Editor */}
      <div className="w-1/2 flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10 basis-1/2 shrink-0 max-w-[50%]">
        <AlgorithmPanel code={algoCode} setCode={setAlgoCode} />
      </div>
      {/* Right Panel: Console */}
      <div className="flex-1 w-1/2 h-full relative bg-black flex flex-col basis-1/2 shrink-0">
        <ConsolePanel output={consoleOutput} error={consoleError} />
      </div>
    </>
  );
}

