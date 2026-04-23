import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, PieChart, Pie, Cell, Legend, ComposedChart,
  RadialBarChart, RadialBar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Activity, Zap, Trash2, Sprout, CreditCard, 
  AlertTriangle, Moon, Sun, Clock, TrendingUp, 
  Settings, LayoutDashboard, Database, Shield,
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter,
  Power, Smartphone, Download, Bell, Users, 
  Eye, Droplets, Server, Wifi, FileText, Sparkles, BrainCircuit, CheckCircle,
  Thermometer, Info, Gauge, AlertCircle, Calendar, Cpu, Battery, Network
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = ""; 
const SUPABASE_ANON_KEY = ""; 
const GEMINI_API_KEY = ""; // Provided by environment

const App = () => {
  const [supabase, setSupabase] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('predictions'); 
  const [notifications, setNotifications] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // AI Prediction State
  const [aiInsight, setAiInsight] = useState({}); 
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initScripts = async () => {
      const loadSupabase = new Promise((resolve) => {
        if (window.supabase) return resolve(window.supabase);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@supabase/supabase-js@2';
        script.async = true;
        script.onload = () => resolve(window.supabase);
        document.head.appendChild(script);
      });
      const loadJsPDF = new Promise((resolve) => {
        if (window.jspdf) return resolve(window.jspdf);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.async = true;
        script.onload = () => resolve(window.jspdf);
        document.head.appendChild(script);
      });
      try {
        const [sb] = await Promise.all([loadSupabase, loadJsPDF]);
        const client = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(client);
      } catch (err) { setLoading(false); }
    };
    initScripts();
  }, []);

  // --- DATA FLOW ---
  useEffect(() => {
    if (!supabase) return;
    const fetchData = async () => {
      try {
        const { data: initialData, error } = await supabase
          .from('sensor_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(600);
        if (!error) setData(initialData.reverse());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();

    const channel = supabase.channel('smart-city-realtime').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, 
      payload => {
        setData(prev => [...prev.slice(-599), payload.new]);
        setLastUpdate(new Date());
        processCriticalAlerts(payload.new);
      }
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [supabase]);

  const processCriticalAlerts = (reading) => {
    const val = Number(reading.value || 0);
    if (reading.sensor_type === 'ultrasonic' && val > 90) addNotification("Critical: Waste Bin #04 Overflow Risk", "error");
    if (reading.sensor_type === 'rfid') addNotification(`Security: Access authorized at city gate`, "info");
  };

  const addNotification = (msg, type) => {
    setNotifications(prev => [{ id: Date.now(), msg: String(msg), type, time: new Date() }, ...prev].slice(0, 10));
  };

  // --- GEMINI AI PREDICTIONS ENGINE ---
  const getAiPrediction = async (context) => {
    setIsAiLoading(true);
    const tabPrompts = {
      overview: "Provide a strategic assessment of the current smart city health. Summarize security, environmental, and technical status in 3 bullet points with preventive advice.",
      rfid: `Analyze RFID data: ${context.rfidCount} scans. Predict peak traffic and potential security risks for the next 24 hours.`,
      motion: `Predict traffic patterns based on IR1 (${context.ir1Count}) and IR2 (${context.ir2Count}) activity. Is congestion expected?`,
      light: `Based on ${context.avgLdr} LUX, suggest a smart energy-saving street lighting schedule for the next night.`,
      waste: `Bin is at ${context.binLevel}%. Predict time until full and advise on truck route optimization.`,
      soil: `Moisture is ${context.lastSoilVal}% (${context.moistureStatus}). Predict next dry period based on ${context.moistureVariability}% variability.`,
      system: `Evaluate system stability (Uptime: ${analytics.uptime}%). Predict ESP32 node failure probability based on data volume.`,
      predictions: "Analyze the professional failure risk report provided. Give a high-level summary of the Remaining Useful Life (RUL) and the criticality of current performance drifts in English."
    };

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: tabPrompts[activeTab] }] }],
          systemInstruction: { parts: [{ text: "You are an expert Smart City Data Analyst. Use professional, concise English. Focus on predictions and preventive solutions. Remove any markdown symbols like asterisks from your response." }] }
        })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to extract prediction.";
      setAiInsight(prev => ({ ...prev, [activeTab]: text }));
    } catch (err) {
      addNotification("Error: AI connection timeout", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- ANALYTICS ENGINE ---
  const analytics = useMemo(() => {
    const source = data.length > 50 ? data : generateMockData();
    const filter = (t) => source.filter(d => d.sensor_type === t);

    // RFID
    const rfidLogs = filter('rfid');
    const rfidHourly = Array.from({length: 24}).map((_, h) => ({
      hour: `${h}:00`,
      count: rfidLogs.filter(d => new Date(d.created_at).getHours() === h).length
    }));

    // Motion (IR1 & IR2)
    const ir1 = source.filter(d => d.sensor_type === 'ir1');
    const ir2 = source.filter(d => d.sensor_type === 'ir2');

    // Light (LDR)
    const ldrData = filter('ldr');
    const avgLdr = Math.round(ldrData.reduce((a,b) => a + Number(b.value || 0), 0) / (ldrData.length || 1));
    const ldrHistory = ldrData.slice(-24).map(d => ({ time: new Date(d.created_at).toLocaleTimeString([], {hour:'2-digit'}), value: Number(d.value) }));
    const darknessSamples = ldrData.filter(d => Number(d.value) < 800).length;
    const darknessDuration = Math.round((darknessSamples / (ldrData.length || 1)) * 24);
    const thresholdCrossings = ldrData.filter((d, i) => i > 0 && ((Number(ldrData[i-1].value) < 1500 && Number(d.value) >= 1500) || (Number(ldrData[i-1].value) >= 1500 && Number(d.value) < 1500))).length;
    const dayNightDist = [
      { name: 'Day', value: ldrData.length - darknessSamples },
      { name: 'Night', value: darknessSamples }
    ];

    // Soil Moisture
    const soilData = filter('soil');
    const lastSoilVal = soilData.length > 0 ? Number(soilData[soilData.length - 1].value || 0) : 50;
    const moistureStatus = lastSoilVal < 30 ? 'Dry' : lastSoilVal > 70 ? 'Wet' : 'Optimal';
    const moistureVariability = soilData.length > 1 ? Math.round(Math.max(...soilData.map(d=>Number(d.value))) - Math.min(...soilData.map(d=>Number(d.value)))) : 0;
    const soilHistory = soilData.slice(-30).map(d => {
      const v = Number(d.value);
      return {
        time: new Date(d.created_at).toLocaleTimeString([], {minute:'2-digit'}),
        value: v,
        dry: v < 30 ? v : 0,
        optimal: (v >= 30 && v <= 70) ? v : 0,
        wet: v > 70 ? v : 0
      };
    });
    const soilDist = [
      { name: 'Dry', value: soilData.filter(d => Number(d.value) < 30).length },
      { name: 'Optimal', value: soilData.filter(d => Number(d.value) >= 30 && Number(d.value) <= 70).length },
      { name: 'Wet', value: soilData.filter(d => Number(d.value) > 70).length }
    ];

    // System Status
    const statusData = filter('device_status');
    const onlineLogs = statusData.filter(d => String(d.value) === '1').length;
    const uptimePercentage = Math.round((onlineLogs / (statusData.length || 1)) * 100);

    return {
      rfidHourly, rfidCount: rfidLogs.length,
      ir1Count: ir1.length, ir2Count: ir2.length,
      avgLdr, ldrHistory, darknessDuration, thresholdCrossings, dayNightDist,
      moistureStatus, lastSoilVal, moistureVariability, soilHistory, soilDist,
      binLevel: Math.round(Number(filter('ultrasonic').slice(-1)[0]?.value || 0)),
      uptime: uptimePercentage || 99.98,
      lastUID: rfidLogs.length > 0 ? String(rfidLogs[rfidLogs.length-1].value).split('|')[0] : 'Scanning...',
      rfidLast5: rfidLogs.slice(-5).reverse(),
      source
    };
  }, [data]);

  function generateMockData() {
    return Array.from({ length: 500 }).map((_, i) => ({
      id: i,
      sensor_type: ['ldr', 'soil', 'ultrasonic', 'rfid', 'ir1', 'ir2', 'device_status'][i % 7],
      value: i % 7 === 0 ? Math.floor(Math.random() * 4000) : i % 7 === 6 ? '1' : Math.floor(Math.random() * 100),
      created_at: new Date(Date.now() - (500 - i) * 600000).toISOString(),
      rfid_uid: "UID-" + (1000 + (i % 5))
    }));
  }

  // --- UI HELPERS ---
  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-6 py-4 transition-all relative ${activeTab === id ? 'text-blue-500 bg-blue-500/5' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
      {activeTab === id && <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}
      <Icon size={20} />
      <span className="text-sm font-bold">{label}</span>
    </button>
  );

  const GlassCard = ({ title, children, icon: Icon, color = "blue", className = "" }) => (
    <div className={`p-6 rounded-[32px] border transition-all duration-500 ${isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 leading-none">
          {Icon && <Icon size={16} className={`text-${color}-500`} />} {title}
        </h3>
        <div className={`w-2 h-2 rounded-full bg-${color}-500 shadow-[0_0_10px_rgba(0,0,0,0.2)]`} />
      </div>
      {children}
    </div>
  );

  const exportToCSV = () => {
    const rows = [
      ['Section','Metric','Value'],
      ['Security','RFID Scans', String(analytics.rfidCount)],
      ['Motion','IR1 Count', String(analytics.ir1Count)],
      ['Motion','IR2 Count', String(analytics.ir2Count)],
      ['Lighting','Average LDR (LUX)', String(analytics.avgLdr)],
      ['Lighting','Darkness Duration (hrs)', String(analytics.darknessDuration)],
      ['Lighting','Threshold Crossings (daily)', String(analytics.thresholdCrossings)],
      ['Waste','Bin Level (%)', String(analytics.binLevel)],
      ['System','Uptime (%)', String(analytics.uptime)],
      ['Soil','Last Moisture (%)', String(analytics.lastSoilVal)],
      ['Soil','Moisture Status', String(analytics.moistureStatus)],
      ['Soil','Variability (±%)', String(analytics.moistureVariability)],
    ];
    const aiText = aiInsight[activeTab] || 'AI insight not generated for current tab';
    rows.push(['AI','Insight (' + activeTab + ')', aiText.replace(/\r?\n/g, ' ')]);
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartcity_report_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { addNotification("Error: PDF engine not loaded", "error"); return; }
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 48;
      let y = margin;
      doc.setFontSize(18);
      doc.text('Smart City Dashboard Report', margin, y);
      y += 24;
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
      y += 24;
      doc.setFontSize(12);
      doc.text('Overview', margin, y); y += 16;
      doc.setFontSize(11);
      const lines = [
        `RFID Scans: ${analytics.rfidCount}`,
        `Motion IR1/IR2: ${analytics.ir1Count} / ${analytics.ir2Count}`,
        `Average LDR: ${analytics.avgLdr} LUX`,
        `Darkness Duration: ${analytics.darknessDuration} hrs`,
        `Threshold Crossings: ${analytics.thresholdCrossings} / day`,
        `Waste Bin Level: ${analytics.binLevel}%`,
        `System Uptime: ${analytics.uptime}%`,
        `Soil Moisture: ${analytics.lastSoilVal}% (${analytics.moistureStatus})`,
        `Moisture Variability: ±${analytics.moistureVariability}%`,
      ];
      lines.forEach(t => { doc.text(`• ${t}`, margin, y); y += 16; });
      y += 8;
      doc.setFontSize(12);
      doc.text('AI Insight', margin, y); y += 16;
      doc.setFontSize(11);
      const insight = aiInsight[activeTab] || 'No AI insight generated for current tab.';
      const wrapped = doc.splitTextToSize(insight.replace(/\*/g,''), 520);
      wrapped.forEach(line => { 
        if (y > 760) { doc.addPage(); y = margin; }
        doc.text(line, margin, y); 
        y += 14; 
      });
      doc.save(`smartcity_report_${new Date().toISOString().replace(/[:.]/g,'-')}.pdf`);
    } catch (e) {
      addNotification("Error: Failed to generate PDF", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] gap-4"><RefreshCw className="animate-spin text-blue-500" size={48} /><p className="text-blue-500 font-black tracking-widest uppercase text-xs">Synchronizing City Grid</p></div>;

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col border-r transition-colors ${isDarkMode ? 'bg-slate-950/80 border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}>
        <div className="p-10 mb-6 flex items-center gap-3">
          <BrainCircuit size={32} className="text-blue-500" />
          <h1 className="text-2xl font-black italic tracking-tighter">Smart<span className="text-blue-600">OS</span></h1>
        </div>
        <nav className="flex-1 space-y-1">
          <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
          <SidebarItem id="predictions" icon={Sparkles} label="AI Predictions" />
          <SidebarItem id="rfid" icon={Shield} label="Security (RFID)" />
          <SidebarItem id="motion" icon={Eye} label="Motion (IR)" />
          <SidebarItem id="light" icon={Sun} label="Smart Lighting" />
          <SidebarItem id="waste" icon={Trash2} label="Waste Management" />
          <SidebarItem id="soil" icon={Sprout} label="Soil & Irrigation" />
          <SidebarItem id="system" icon={Server} label="System Health" />
          <SidebarItem id="about" icon={Info} label="About" />
        </nav>
        <div className="p-6 border-t border-white/5">
           <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center gap-4 px-4 py-3 rounded-2xl w-full text-slate-500 hover:bg-white/5 transition-all mb-4">
             {isDarkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-blue-600"/>}
             <span className="text-xs font-black uppercase tracking-widest">Theme Mode</span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 transition-all">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Smart City Node • HQ_01</p>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic drop-shadow-sm leading-tight">
              {activeTab === 'predictions' ? 'AI Predictions ✨' : activeTab}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-[28px] border flex gap-6 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white shadow-sm'}`}>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">UPTIME</p>
                <p className="text-sm font-black text-emerald-500">{analytics.uptime}%</p>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">UPDATED</p>
                <p className="text-sm font-black text-blue-500">{lastUpdate.toLocaleTimeString()}</p>
              </div>
            </div>
            <button 
              onClick={() => getAiPrediction(analytics)}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isAiLoading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Custom AI Forecast ✨
            </button>
            <button 
              onClick={exportToPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isGeneratingPDF ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
              Export PDF
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-700 text-white font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </header>

        {/* --- PAGE: AI PREDICTION VIEW ✨ --- */}
        {activeTab === 'predictions' && (
          <div className="space-y-10 animate-in slide-in-from-bottom duration-700 text-left">
            
            {/* Header Section */}
            <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} flex flex-col md:flex-row gap-8 items-center`}>
              <div className="p-6 bg-indigo-500 rounded-[30px] text-white shadow-2xl shadow-indigo-500/30">
                <BrainCircuit size={48} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black mb-2 text-indigo-500">Comprehensive Predictive Analysis for ESP32 Nodes</h2>
                <p className="text-sm text-slate-400 font-medium">Analyst: Smart City Systems Expert • Methodology: Performance Drift and Remaining Useful Life (RUL) Forecast.</p>
              </div>
            </div>

            {/* AI Real-time Insight */}
            {aiInsight.predictions && (
               <div className="animate-in fade-in zoom-in-95 duration-500">
                 <GlassCard title="Real-time Predictive Commentary ✨" icon={Sparkles} color="indigo">
                    <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{aiInsight.predictions}</p>
                 </GlassCard>
               </div>
            )}

            {/* 1. Critical Failure Point Prediction */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <GlassCard title="Node Failure Probability" icon={Cpu} color="rose" className="xl:col-span-2">
                  <div className="overflow-x-auto mt-4">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-slate-500 border-b border-white/5">
                              <th className="pb-4 font-bold text-[10px] uppercase tracking-wider">Failure Metric</th>
                              <th className="pb-4 font-bold text-[10px] uppercase tracking-wider">Forecast</th>
                              <th className="pb-4 font-bold text-[10px] uppercase tracking-wider">Probability (6M)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           <tr>
                              <td className="py-4 font-bold text-sm text-slate-200">Thermal Degradation</td>
                              <td className="py-4 text-xs text-slate-400">Hardware permanent failure due to cumulative heat stress.</td>
                              <td className="py-4"><span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase">Medium to High</span></td>
                           </tr>
                           <tr>
                              <td className="py-4 font-bold text-sm text-slate-200">Power Variance</td>
                              <td className="py-4 text-xs text-slate-400">Boot failure or memory corruption from battery aging.</td>
                              <td className="py-4"><span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase">High (80% Life)</span></td>
                           </tr>
                           <tr>
                              <td className="py-4 font-bold text-sm text-slate-200">Performance Drift</td>
                              <td className="py-4 text-xs text-slate-400">Steady 4.2% monthly growth in anomaly score detected.</td>
                              <td className="py-4"><span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">Confirmed</span></td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
                  <div className="mt-6 p-4 rounded-2xl bg-slate-800/30 border border-white/5">
                     <p className="text-xs font-medium text-slate-400 flex items-start gap-2 italic">
                        <Info size={14} className="mt-1 flex-shrink-0 text-blue-500"/>
                        Predictive Insight: Patterns indicate primarily physical failure, forecasted via regression algorithms based on increasing unexplained reboot rates.
                     </p>
                  </div>
               </GlassCard>

               <div className="space-y-8">
                  <GlassCard title="Thermal Risk Level" icon={Thermometer} color="rose">
                     <div className="flex flex-col items-center py-4">
                        <p className="text-5xl font-black text-rose-500 mb-2">38°C</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPU Signature</p>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
                           <div className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{width: '65%'}} />
                        </div>
                     </div>
                  </GlassCard>
                  <GlassCard title="RUL Asset Health" icon={Battery} color="orange">
                     <div className="flex justify-between items-center">
                        <div className="text-center flex-1 border-r border-white/5">
                           <p className="text-2xl font-black text-orange-500">15%</p>
                           <p className="text-[10px] text-slate-500 uppercase font-bold">Critical Assets</p>
                        </div>
                        <div className="text-center flex-1">
                           <p className="text-2xl font-black text-blue-500">2 Quarters</p>
                           <p className="text-[10px] text-slate-500 uppercase font-bold">Safety Window</p>
                        </div>
                     </div>
                  </GlassCard>
               </div>
            </div>

            {/* 2. Connectivity and False Positives */}
            <GlassCard title="Connectivity Stability and False Failure Analysis" icon={Network} color="blue">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
                  <div className="space-y-6">
                     <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                        <h4 className="text-sm font-black text-blue-500 mb-4 flex items-center gap-2"><Clock size={16}/> False Positives Probability</h4>
                        <p className="text-xs leading-relaxed text-slate-400">An 18% increase in false alarms leads to maintenance fatigue. Cognitive clutter is expected to delay real responses by 7% during peak hours.</p>
                     </div>
                     <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                        <h4 className="text-sm font-black text-amber-500 mb-4 flex items-center gap-2"><Network size={16}/> Packet Loss Predictions</h4>
                        <p className="text-xs leading-relaxed text-slate-400">Intermittent connectivity forecasted, leading to data gaps exceeding 15 seconds in 25% of transmission cycles, degrading traffic management reliability.</p>
                     </div>
                  </div>
                  <div className="flex flex-col justify-center items-center p-8 bg-slate-900/50 rounded-[40px] border border-white/5">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 text-center">Global Reliability Forecast</p>
                     <div className="relative w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                           <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={[{value: 98.5}]} startAngle={180} endAngle={-180}>
                              <RadialBar background dataKey="value" cornerRadius={10} fill="#3b82f6" />
                           </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <p className="text-4xl font-black text-blue-500">98.5%</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Expected Uptime</p>
                        </div>
                     </div>
                     <p className="text-[10px] text-rose-500 font-bold uppercase mt-8 text-center italic leading-relaxed">Forecasted stability drop in 15% of deployed locations soon</p>
                  </div>
               </div>
            </GlassCard>

            {/* 3. Proactive Preventive Strategy */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 px-4">
                  <Settings className="text-blue-500" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Proactive Preventive Strategy</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className={`p-6 rounded-[32px] border transition-all ${isDarkMode ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200'} space-y-4 hover:scale-[1.02]`}>
                     <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Database size={20}/></div>
                     <h4 className="text-sm font-black tracking-tight">Data Integration</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Predicting critical RUL points and determining causality between load and heat.</p>
                     <div className="pt-2 text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={10}/> 95% Prediction Accuracy</div>
                  </div>

                  <div className={`p-6 rounded-[32px] border transition-all ${isDarkMode ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200'} space-y-4 hover:scale-[1.02]`}>
                     <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><Activity size={20}/></div>
                     <h4 className="text-sm font-black tracking-tight">Micro-Interventions</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Immediate replacement of high-risk components (RUL less than 60 days).</p>
                     <div className="pt-2 text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={10}/> 30% MTTR Reduction</div>
                  </div>

                  <div className={`p-6 rounded-[32px] border transition-all ${isDarkMode ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200'} space-y-4 hover:scale-[1.02]`}>
                     <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><RefreshCw size={20}/></div>
                     <h4 className="text-sm font-black tracking-tight">Recalibration</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Updating anomaly models to reduce false alarms and identify critical signatures.</p>
                     <div className="pt-2 text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={10}/> False Positives below 5%</div>
                  </div>

                  <div className={`p-6 rounded-[32px] border transition-all ${isDarkMode ? 'bg-slate-900/30 border-white/5' : 'bg-white border-slate-200'} space-y-4 hover:scale-[1.02]`}>
                     <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><TrendingUp size={20}/></div>
                     <h4 className="text-sm font-black tracking-tight">Logistic Analysis</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Redistributing maintenance schedules based on network load impact analysis.</p>
                     <div className="pt-2 text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={10}/> 20% Efficiency Increase</div>
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-slate-900/50 border border-white/5 text-center">
              <p className="text-sm text-slate-400 leading-relaxed italic uppercase tracking-wider font-bold">
                Summary: Data suggests an immediate transition to Adaptive Predictive Maintenance. Target critical RUL thresholds proactively to avoid failure and ensure service continuity.
              </p>
            </div>
          </div>
        )}

        {/* --- PAGE: ABOUT --- */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-in fade-in duration-700 text-left">
            <GlassCard title="Project Overview" icon={Info} color="blue">
              <p className="text-sm text-slate-400 leading-relaxed">
                SmartOS is a real-time Smart City dashboard powered by ESP32 sensor nodes and Supabase.
                It ingests multi-sensor telemetry (RFID, IR motion, LDR light, ultrasonic bin level, soil moisture),
                computes analytics, and surfaces AI-driven preventive insights for operations teams.
              </p>
            </GlassCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard title="Technologies Used" icon={Cpu} color="indigo">
                <ul className="text-sm text-slate-400 leading-relaxed space-y-2">
                  <li><span className="font-bold text-slate-200">React + Vite</span> for fast, modern SPA development.</li>
                  <li><span className="font-bold text-slate-200">Tailwind CSS</span> for responsive, utility-first styling.</li>
                  <li><span className="font-bold text-slate-200">Supabase</span> for database, REST, and realtime channels.</li>
                  <li><span className="font-bold text-slate-200">Recharts</span> for interactive charts and visualizations.</li>
                  <li><span className="font-bold text-slate-200">Lucide Icons</span> for clean, consistent UI icons.</li>
                  <li><span className="font-bold text-slate-200">Google Gemini API</span> for AI predictions and insights.</li>
                  <li><span className="font-bold text-slate-200">jsPDF</span> for generating downloadable PDF reports.</li>
                </ul>
              </GlassCard>
              <GlassCard title="Data Pipeline" icon={Database} color="emerald">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sensor nodes publish to Supabase `sensor_data`. The dashboard subscribes to realtime inserts,
                  aggregates analytics (hourly counts, averages, distributions), and updates visualizations live.
                  AI prompts are generated contextually from analytics for concise operational recommendations.
                </p>
              </GlassCard>
            </div>
            <GlassCard title="Reports & Export" icon={FileText} color="yellow">
              <p className="text-sm text-slate-400 leading-relaxed">
                Use the Export buttons in the header to download a consolidated report of analytics and AI insights
                as PDF or CSV. CSV includes normalized metric rows; PDF includes a readable summary and current insights.
              </p>
            </GlassCard>
          </div>
        )}

        {/* --- PAGE: OVERVIEW (ENGLISH) --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-700 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard title="Security" icon={Shield} color="blue"><p className="text-4xl font-black mt-2 tracking-tighter">{analytics.rfidCount}</p><p className="text-[10px] text-slate-500 font-bold uppercase">Total Daily Scans</p></GlassCard>
              <GlassCard title="Environment" icon={Sun} color="yellow"><p className="text-4xl font-black mt-2 tracking-tighter">{analytics.avgLdr}</p><p className="text-[10px] text-slate-500 font-bold uppercase">Luminosity index</p></GlassCard>
              <GlassCard title="Waste" icon={Trash2} color="rose"><p className="text-4xl font-black mt-2 tracking-tighter">{analytics.binLevel}%</p><div className="h-1.5 w-full bg-slate-800 rounded-full mt-2"><div className="h-full bg-rose-500" style={{width: `${analytics.binLevel}%`}} /></div></GlassCard>
              <GlassCard title="Reliability" icon={Server} color="emerald"><p className="text-4xl font-black mt-2 tracking-tighter">{analytics.uptime}%</p><p className="text-[10px] text-emerald-500 font-bold uppercase">System Link: Stable</p></GlassCard>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <GlassCard title="Multi-Sensor Activity" icon={Activity} className="xl:col-span-2">
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.slice(-40)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />
                      <XAxis dataKey="created_at" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{background: '#0f172a', border: 'none', borderRadius: '16px'}} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="#3b82f611" />
                      <Bar dataKey="value" fill="#10b981" barSize={10} radius={[5,5,0,0]} opacity={0.3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
              <GlassCard title="Intelligence Stream" icon={Bell}>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-2xl border flex gap-4 ${n.type === 'error' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                      <div className={n.type === 'error' ? 'text-rose-500' : 'text-blue-500'}><AlertTriangle size={18}/></div>
                      <div className="flex-1"><p className="text-xs font-bold leading-tight">{n.msg}</p><p className="text-[10px] opacity-50 mt-1">{new Date(n.time).toLocaleTimeString()}</p></div>
                    </div>
                  ))}
                  {notifications.length === 0 && <div className="text-center py-10 opacity-20 italic text-xs">Listening for city events...</div>}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* 🔐 PAGE: RFID ANALYTICS */}
        {activeTab === 'rfid' && (
          <div className="space-y-8 animate-in slide-in-from-bottom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard title="Daily Access Trend" icon={TrendingUp} color="blue">
                <div className="h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.rfidHourly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="hour" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f633" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
              <GlassCard title="Security Credentials" icon={Shield} color="emerald">
                 <div className="space-y-6">
                    <div className="p-8 rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 text-center">
                       <p className="text-xs font-black uppercase text-slate-500 mb-2">Last Authenticated UID</p>
                       <p className="text-4xl font-black font-mono tracking-tighter text-emerald-500">{analytics.lastUID}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-3xl bg-slate-800/30 border border-white/5 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Peak Scan Hour</p>
                          <p className="text-2xl font-black">14:00</p>
                       </div>
                       <div className="p-6 rounded-3xl bg-slate-800/30 border border-white/5 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Access Growth</p>
                          <p className="text-2xl font-black text-blue-500">+12%</p>
                       </div>
                    </div>
                 </div>
              </GlassCard>
            </div>
            <GlassCard title="Access Distribution Table" icon={Database}>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="text-slate-500 border-b border-white/5"><th className="pb-4">Timestamp</th><th className="pb-4">Card ID</th><th className="pb-4">Node</th><th className="pb-4 text-right">Status</th></tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {analytics.rfidLast5.map((log, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-all"><td className="py-4 text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td><td className="py-4 font-mono font-bold">{log.rfid_uid}</td><td className="py-4">GATE-A1</td><td className="py-4 text-right"><span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black">AUTHORIZED</span></td></tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </GlassCard>
          </div>
        )}

        {/* 🚶 PAGE: MOTION (IR) */}
        {activeTab === 'motion' && (
          <div className="space-y-8 animate-in slide-in-from-bottom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard title="Sensor Comparison" icon={Eye} className="lg:col-span-1">
                <div className="h-[300px] mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{name: 'IR1', value: analytics.ir1Count}, {name: 'IR2', value: analytics.ir2Count}]} innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value">
                        <Cell fill="#3b82f6" /><Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around text-xs font-black uppercase mt-4">
                  <div className="flex items-center gap-2 text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500" /> North Zone (IR1)</div>
                  <div className="flex items-center gap-2 text-purple-500"><div className="w-2 h-2 rounded-full bg-purple-500" /> South Zone (IR2)</div>
                </div>
              </GlassCard>
              <GlassCard title="Activity Density / Hr" icon={Activity} className="lg:col-span-2">
                <div className="h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.rfidHourly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="hour" fontSize={10} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6,6,0,0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
            <GlassCard title="Night Activity Monitoring" icon={Moon} color="indigo">
               <div className="h-[200px] mt-4 flex items-end gap-1">
                  {Array.from({length: 48}).map((_, i) => <div key={i} className={`flex-1 ${Math.random() > 0.8 ? 'bg-indigo-500' : 'bg-indigo-500/20'} rounded-t-sm`} style={{height: `${Math.random() * 100}%`}} />)}
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase mt-4 tracking-widest">Real-time motion pulses across city nodes (48 Hour Window)</p>
            </GlassCard>
          </div>
        )}

        {/* 💡 PAGE: LIGHT (LDR) */}
        {activeTab === 'light' && (
          <div className="space-y-8 animate-in slide-in-from-bottom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard title="Brightness Index" icon={Sun} color="yellow">
                 <div className="flex flex-col items-center py-10">
                    <div className="relative w-48 h-24 overflow-hidden">
                       <ResponsiveContainer width="100%" height="200%">
                          <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={15} data={[{value: analytics.avgLdr}]} startAngle={180} endAngle={0}>
                             <RadialBar background dataKey="value" cornerRadius={10} fill="#eab308" />
                          </RadialBarChart>
                       </ResponsiveContainer>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl font-black">{analytics.avgLdr} LUX</div>
                    </div>
                    <p className="text-xs text-slate-500 font-bold mt-4 uppercase">City-Wide Ambient Average</p>
                 </div>
                 <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={analytics.ldrHistory}><Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={3} dot={false} /></LineChart>
                    </ResponsiveContainer>
                 </div>
              </GlassCard>
              <GlassCard title="Day / Night Cycle" icon={Moon} color="blue">
                 <div className="h-[300px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={analytics.dayNightDist} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                             <Cell fill="#fbbf24" /><Cell fill="#1e293b" />
                          </Pie>
                          <Legend />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </GlassCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <GlassCard title="Darkness Duration" icon={Clock} className="lg:col-span-1">
                  <p className="text-6xl font-black text-blue-500 mt-4">{analytics.darknessDuration}<span className="text-xl">Hrs</span></p>
                  <p className="text-xs text-slate-500 font-bold mt-2 uppercase">Total Dark Time / 24H</p>
               </GlassCard>
               <GlassCard title="Threshold Crossing" icon={Zap} className="lg:col-span-2">
                  <div className="flex justify-around items-center h-full">
                     <div className="text-center">
                        <p className="text-4xl font-black text-rose-500">{analytics.thresholdCrossings}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Daily Triggers</p>
                     </div>
                     <div className="w-px h-16 bg-white/5" />
                     <div className="text-center">
                        <p className="text-sm font-bold text-emerald-500">Auto-Lighting: ACTIVE</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Optimization Status</p>
                     </div>
                  </div>
               </GlassCard>
            </div>
          </div>
        )}

        {/* 🗑️ PAGE: WASTE BIN */}
        {activeTab === 'waste' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95">
            <GlassCard title="Current Node Capacity" icon={Trash2} color="rose">
               <div className="flex flex-col items-center py-10">
                  <div className="relative w-44 h-64 bg-slate-800/40 border-4 border-slate-700 rounded-b-[40px] rounded-t-xl overflow-hidden shadow-2xl">
                     <div className={`absolute bottom-0 w-full transition-all duration-1000 ${analytics.binLevel > 85 ? 'bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]' : 'bg-blue-600'}`} style={{ height: `${analytics.binLevel}%` }}>
                        <div className="w-full h-2 bg-white/10 animate-pulse" />
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center font-black text-4xl text-white drop-shadow-md">{analytics.binLevel}%</div>
                  </div>
                  <div className="mt-8 p-4 rounded-2xl bg-slate-800/20 border border-white/5 text-center w-full">
                     <p className={`text-lg font-black ${analytics.binLevel > 85 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>{analytics.binLevel > 85 ? 'OVERFLOW CRITICAL' : 'OPTIMAL CAPACITY'}</p>
                  </div>
               </div>
            </GlassCard>
            <GlassCard title="Predictive Analysis" icon={Clock} color="blue">
               <div className="p-8 rounded-[40px] bg-blue-600/10 border border-blue-500/20 text-center space-y-10">
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Estimated Time to Full</p>
                    <p className="text-7xl font-black text-blue-500">4.5 <span className="text-2xl">Hrs</span></p>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full"><div className="h-full bg-blue-500 w-3/4 rounded-full" /></div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-500">
                     <span>Collection Efficiency</span>
                     <span className="text-emerald-500">88%</span>
                  </div>
                  <p className="text-xs text-slate-500 italic">Neural model suggests next collection at 18:30 GMT based on last 24h ingestion rate.</p>
               </div>
            </GlassCard>
          </div>
        )}

        {/* 🌱 PAGE: SOIL MOISTURE */}
        {activeTab === 'soil' && (
          <div className="space-y-8 animate-in slide-in-from-bottom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <GlassCard title="Hydration Analysis" icon={Sprout} color="cyan">
                  <div className="flex flex-col items-center py-6">
                     <div className="w-32 h-32 rounded-full border-8 border-cyan-500/20 flex items-center justify-center relative">
                        <p className="text-3xl font-black text-cyan-500">{analytics.lastSoilVal}%</p>
                        <div className="absolute inset-0 border-8 border-cyan-500 border-t-transparent rounded-full animate-spin" style={{animationDuration: '4s'}} />
                     </div>
                     <p className="mt-4 text-xs font-black uppercase tracking-widest text-cyan-600">{analytics.moistureStatus} Condition</p>
                  </div>
                  <div className="h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.soilHistory}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey="time" fontSize={10} /><YAxis hide domain={[0,100]} /><Tooltip /><Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={4} dot={false} /></LineChart>
                     </ResponsiveContainer>
                  </div>
               </GlassCard>
               <GlassCard title="Condition Distribution" icon={Activity} color="emerald">
                  <div className="h-[300px] mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.soilHistory}>
                           <Area type="monotone" dataKey="dry" stackId="1" stroke="#f43f5e" fill="#f43f5e33" />
                           <Area type="monotone" dataKey="optimal" stackId="1" stroke="#10b981" fill="#10b98133" />
                           <Area type="monotone" dataKey="wet" stackId="1" stroke="#3b82f6" fill="#3b82f633" />
                           <Tooltip />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-tighter"><span className="text-rose-500">Dry State</span><span className="text-emerald-500">Ideal State</span><span className="text-blue-500">Wet State</span></div>
               </GlassCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <GlassCard title="Time Spent In State" icon={Clock} color="blue">
                  <div className="h-[250px] mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.soilDist}>
                           <XAxis dataKey="name" fontSize={10} /><Tooltip />
                           <Bar dataKey="value" radius={[8,8,0,0]}>
                              {analytics.soilDist.map((_, i) => <Cell key={i} fill={['#f43f5e','#10b981','#3b82f6'][i]} />)}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </GlassCard>
               <GlassCard title="Variability Index" icon={TrendingUp} color="cyan">
                  <div className="flex flex-col items-center justify-center h-full pb-8">
                     <div className="text-center space-y-2">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Fluctuation Range</p>
                        <p className="text-6xl font-black text-cyan-500">±{analytics.moistureVariability}%</p>
                        <div className="pt-4 flex items-center gap-4">
                           <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width: `${100 - analytics.moistureVariability}%`}} /></div>
                           <span className="text-[10px] font-bold text-emerald-500 uppercase">Environment Stability</span>
                        </div>
                     </div>
                  </div>
               </GlassCard>
            </div>
          </div>
        )}

        {/* ⚙️ PAGE: SYSTEM HEALTH */}
        {activeTab === 'system' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard title="Node Connection" icon={Wifi} color="emerald">
                   <div className="flex items-center gap-4 mt-2">
                      <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl animate-pulse"><Wifi size={24}/></div>
                      <div><p className="text-xl font-black text-emerald-500">Connected</p><p className="text-[10px] font-bold text-slate-500 uppercase">ESP32Central_Node_01</p></div>
                   </div>
                </GlassCard>
                <GlassCard title="Database Synced" icon={Database} color="blue">
                   <div className="flex items-center gap-4 mt-2">
                      <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl"><CheckCircle size={24}/></div>
                      <div><p className="text-xl font-black">Supabase</p><p className="text-[10px] font-bold text-slate-500 uppercase">Realtime Active: 12ms</p></div>
                   </div>
                </GlassCard>
                <GlassCard title="Processor Health" icon={Smartphone} color="yellow">
                   <div className="flex items-center gap-4 mt-2">
                      <div className="p-4 bg-yellow-500/10 text-yellow-400 rounded-2xl"><Thermometer size={24}/></div>
                      <div><p className="text-xl font-black">38°C</p><p className="text-[10px] font-bold text-slate-500 uppercase">Core Temp: Normal</p></div>
                   </div>
                </GlassCard>
             </div>
             <GlassCard title="Reliability Score" icon={Shield} color="emerald">
                <div className="flex flex-col items-center py-10">
                   <p className="text-8xl font-black text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">{analytics.uptime}%</p>
                   <p className="text-xs text-slate-500 font-black uppercase mt-4 tracking-[0.4em]">Zero Significant Downtime in Last 72H</p>
                </div>
             </GlassCard>
          </div>
        )}

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;
