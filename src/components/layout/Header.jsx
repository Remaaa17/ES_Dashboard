import { FileText, Download, RefreshCw } from 'lucide-react';

const Header = ({
  activeTab,
  analytics,
  lastUpdate,
  isAiLoading,
  isGeneratingPDF,
  onAIForecast,
  onExportPDF,
  onExportCSV,
  isDarkMode,
}) => {
  return (
    <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">
            Smart City Node • HQ_01
          </p>
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic drop-shadow-sm leading-tight">
          {activeTab}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`p-4 rounded-[28px] border flex gap-6 ${
            isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white shadow-sm'
          }`}
        >
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">UPTIME</p>
            <p className="text-sm font-black text-emerald-500">{analytics.uptime}%</p>
          </div>
          <div className={`w-px h-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">UPDATED</p>
            <p className="text-sm font-black text-blue-500">{lastUpdate.toLocaleTimeString()}</p>
          </div>
        </div>

        <button
          onClick={onExportPDF}
          disabled={isGeneratingPDF}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50 ${
            isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-700 text-white'
          }`}
        >
          {isGeneratingPDF ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
          Export PDF
        </button>

        <button
          onClick={onExportCSV}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all ${
            isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-600 text-white'
          }`}
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>
    </header>
  );
};

export default Header;
