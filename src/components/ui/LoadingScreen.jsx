import { RefreshCw } from 'lucide-react';

const LoadingScreen = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] gap-4">
    <RefreshCw className="animate-spin text-blue-500" size={48} />
    <p className="text-blue-500 font-black tracking-widest uppercase text-xs">
      Synchronizing City Grid
    </p>
  </div>
);

export default LoadingScreen;
