import PythonPanel from '../components/PythonPanel';
import ConsolePanel from '../components/ConsolePanel';
import ResizableSplit from '../components/ResizableSplit';

interface PythonPlaygroundViewProps {
  pythonCode: string;
  setPythonCode: (val: string) => void;
  consoleOutput: string;
  consoleError: string | null;
}

export default function PythonPlaygroundView({
  pythonCode,
  setPythonCode,
  consoleOutput,
  consoleError,
}: PythonPlaygroundViewProps) {
  return (
    <ResizableSplit
      orientation="vertical"
      initialPrimaryPercent={50}
      minPrimaryPercent={20}
      maxPrimaryPercent={80}
      primaryWrapperClassName="flex flex-col border-r border-[#2d2d2d] h-full shadow-2xl z-10"
      secondaryWrapperClassName="relative h-full bg-black flex flex-col"
      primary={<PythonPanel code={pythonCode} setCode={setPythonCode} />}
      secondary={<ConsolePanel output={consoleOutput} error={consoleError} />}
    />
  );
}
