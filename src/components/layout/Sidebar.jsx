import { 
  BrainCircuit, LayoutDashboard, Info, Moon, Sun, Shield, Sprout, Lightbulb, Sparkles, MessageSquare
} from 'lucide-react';

const SidebarItem = ({ id, icon: Icon, label, activeTab, setActiveTab, isDarkMode }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all relative ${
      activeTab === id
        ? 'text-blue-500 bg-blue-500/5'
        : isDarkMode
          ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
    }`}
  >
    {activeTab === id && (
      <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
    )}
    <Icon size={20} />
    <span className="text-sm font-bold">{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab, isDarkMode, setIsDarkMode }) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col border-r transition-colors ${
        isDarkMode
          ? 'bg-slate-950/80 border-white/5'
          : 'bg-white border-slate-200 shadow-2xl'
      }`}
    >
      <div className="p-10 mb-6 flex items-center gap-3">
        <BrainCircuit size={32} className="text-blue-500" />
        <h1 className="text-2xl font-black italic tracking-tighter">
          Smart<span className="text-blue-600">OS</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
        <SidebarItem id="predictions" icon={Sparkles} label="AI Predictions" activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
        <SidebarItem id="chatbot" icon={MessageSquare} label="AI Chat" activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
        <SidebarItem id="rfid" icon={Shield} label="RFID Security" activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
        <SidebarItem id="lighting" icon={Lightbulb} label="Smart Lighting" activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
        <SidebarItem id="soil" icon={Sprout} label="Soil & Irrigation" activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
        <SidebarItem id="about" icon={Info} label="About" activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
      </nav>

      <div className={`p-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-4 px-4 py-3 rounded-2xl w-full transition-all mb-4 ${
            isDarkMode ? 'text-slate-500 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isDarkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-blue-600" />
          )}
          <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>Theme Mode</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
