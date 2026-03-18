import AlgorithmPanel from '../components/AlgorithmPanel';
import ConsolePanel from '../components/ConsolePanel';
import ResizableSplit from '../components/ResizableSplit';

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
    <ResizableSplit
      orientation="vertical"
      initialPrimaryPercent={50}
      minPrimaryPercent={20}
      maxPrimaryPercent={80}
      primaryWrapperClassName="flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10"
      secondaryWrapperClassName="relative h-full bg-black flex flex-col"
      primary={<AlgorithmPanel code={algoCode} setCode={setAlgoCode} />}
      secondary={<ConsolePanel output={consoleOutput} error={consoleError} />}
    />
  );
}

