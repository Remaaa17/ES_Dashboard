import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { 
  Activity, Trash2, Sprout, Shield, LayoutDashboard, 
  Database, Sun, Moon, Sparkles, BrainCircuit, 
  FileText, Download, RefreshCw, Cpu, Battery, 
  Network, Thermometer, ChevronRight, Bell, Zap
} from 'lucide-react';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsight, setAiInsight] = useState({});
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- STYLING CONSTANTS (The "Classy" Palette) ---
  const theme = {
    primary: "#6366F1", // Indigo
    success: "#10B981", // Emerald
    danger: "#F43F5E",  // Rose
    warning: "#F59E0B", // Amber
    bgDark: "#020617",
    cardDark: "rgba(15, 23, 42, 0.6)",
    borderDark: "rgba(255, 255, 255, 0.06)"
  };

  // --- UI COMPONENTS ---
  
  const SidebarItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)} 
        className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all duration-300 rounded-xl mb-1 ${
          isActive 
            ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-500/20' 
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
        }`}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        <span className={`text-[13px] font-semibold tracking-tight ${!isActive && 'opacity-70'}`}>{label}</span>
        {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
      </button>
    );
  };

  const GlassCard = ({ title, children, icon: Icon, color = "primary", subtitle }) => (
    <div className={`relative overflow-hidden p-6 rounded-[24px] border transition-all duration-500 ${
      isDarkMode 
        ? 'bg-slate-900/40 border-white/5 shadow-2xl' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">{title}</h3>
          {subtitle && <p className="text-[12px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
          {Icon && <Icon size={18} className="text-indigo-500" />}
        </div>
      </div>
      {children}
    </div>
  );

  // --- MOCK ANALYTICS (Matches your logic) ---
  const analytics = useMemo(() => ({
    uptime: 99.98,
    temp: 38,
    failureRisk: "Low",
    dataVolume: "1.2 TB",
    chartData: Array.from({ length: 12 }, (_, i) => ({
      name: `${i}:00`,
      value: Math.floor(Math.random() * 100) + 20,
      efficiency: Math.floor(Math.random() * 40) + 60
    }))
  }), []);

  return (
    <div className={`min-h-screen flex font-sans ${isDarkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside className={`fixed left-0 top-0 h-full w-72 hidden lg:flex flex-col p-6 border-r ${
        isDarkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-200'
      }`}>
        <div className="px-4 py-8 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tighter">Smart<span className="text-indigo-500">OS</span></h1>
        </div>

        <nav className="flex-1">
          <SidebarItem id="overview" icon={LayoutDashboard} label="Fleet Overview" />
          <SidebarItem id="predictions" icon={Sparkles} label="AI Intelligence" />
          <SidebarItem id="security" icon={Shield} label="Network Security" />
          <SidebarItem id="system" icon={Database} label="Node Infrastructure" />
        </nav>

        <div className={`mt-auto p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">System Stable</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            {isDarkMode ? 'LIGHT MODE' : 'DARK MODE'}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:ml-72 p-8 lg:p-14">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-2">
              {activeTab === 'predictions' ? 'Predictive Analysis' : 'Operational Dashboard'}
            </h2>
            <p className="text-slate-500 font-medium">Real-time telemetry and AI-driven node diagnostics.</p>
          </div>

          <div className="flex items-center gap-3">
            <button className={`p-3 rounded-xl border ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}>
              <Bell size={20} className="text-slate-400" />
            </button>
            <div className="h-10 w-px bg-slate-800 mx-2" />
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-transform">
              <Sparkles size={16} />
              AI FORECAST
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm">
              <Download size={16} />
              REPORT
            </button>
          </div>
        </header>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chart Card */}
          <div className="lg:col-span-8">
            <GlassCard title="Network Efficiency Over Time" subtitle="Data ingestion vs Processing Speed">
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#6366F1' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Side Stat Stack */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard title="Thermal Load" icon={Thermometer}>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black mb-1">38.2°C</p>
                  <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <Activity size={12} /> Optimal Range
                  </p>
                </div>
                <div className="w-24 h-12 bg-indigo-500/10 rounded-lg overflow-hidden">
                   {/* Mini sparkline logic here */}
                </div>
              </div>
            </GlassCard>

            <GlassCard title="System Uptime" icon={Zap}>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-black">99.98%</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">LIFETIME</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[99%]" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Bottom Row */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
             <GlassCard title="Failure Risk" icon={Shield}>
                <p className="text-2xl font-bold text-emerald-500 tracking-tight">EXCEPTIONAL</p>
                <p className="text-xs text-slate-500 mt-2">Zero critical anomalies detected in last 48h.</p>
             </GlassCard>
             <GlassCard title="Node Load" icon={Cpu}>
                <p className="text-2xl font-bold tracking-tight">14.2% AVG</p>
                <p className="text-xs text-slate-500 mt-2">Distributed across 12 active clusters.</p>
             </GlassCard>
             <GlassCard title="Network Latency" icon={Network}>
                <p className="text-2xl font-bold text-indigo-500 tracking-tight">12ms</p>
                <p className="text-xs text-slate-500 mt-2">Peak performance on Fiber-Optic Backhaul.</p>
             </GlassCard>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
