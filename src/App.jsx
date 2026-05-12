import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from './hooks/useSupabase';
import { useSensorData } from './hooks/useSensorData';
import { useNotifications } from './hooks/useNotifications';
import { useAI } from './hooks/useAI';
import { processCriticalAlerts } from './utils/alerts';
import { calculateAnalytics } from './utils/analytics';
import { exportToCSV, exportToPDF, loadJsPDF } from './utils/export';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoadingScreen from './components/ui/LoadingScreen';
import OverviewPage from './components/pages/OverviewPage';
import RFIDPage from './components/pages/RFIDPage';
import LightingPage from './components/pages/LightingPage';
import SoilPage from './components/pages/SoilPage';

// Import icons
import { Info, Cpu, Database } from 'lucide-react';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Custom Hooks
  const { supabase, loading: supabaseLoading } = useSupabase();
  const { notifications, addNotification } = useNotifications();
  const { aiInsight, isAiLoading, getAiPrediction } = useAI(addNotification);
  
  const handleCriticalAlert = (reading) => {
    processCriticalAlerts(reading, addNotification);
  };
  
  const { data, loading: dataLoading, lastUpdate } = useSensorData(supabase, handleCriticalAlert);

  // Analytics
  const analytics = useMemo(() => calculateAnalytics(data), [data]);

  // Load jsPDF on mount
  useEffect(() => {
    loadJsPDF();
  }, []);

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(analytics, aiInsight, activeTab);
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    await exportToPDF(analytics, aiInsight, activeTab, addNotification);
    setIsGeneratingPDF(false);
  };

  const handleAIForecast = () => {
    getAiPrediction(activeTab, analytics);
  };

  if (supabaseLoading || dataLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <main className="flex-1 lg:ml-64 p-6 lg:p-12 transition-all">
        <Header
          activeTab={activeTab}
          analytics={analytics}
          lastUpdate={lastUpdate}
          isAiLoading={isAiLoading}
          isGeneratingPDF={isGeneratingPDF}
          onAIForecast={handleAIForecast}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          isDarkMode={isDarkMode}
        />

        {/* Overview Page */}
        {activeTab === 'overview' && (
          <OverviewPage
            analytics={analytics}
            data={data}
            notifications={notifications}
            isDarkMode={isDarkMode}
          />
        )}

        {/* RFID Page */}
        {activeTab === 'rfid' && (
          <RFIDPage
            analytics={analytics}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Lighting Page */}
        {activeTab === 'lighting' && (
          <LightingPage
            analytics={analytics}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Soil Page */}
        {activeTab === 'soil' && (
          <SoilPage
            analytics={analytics}
            isDarkMode={isDarkMode}
          />
        )}

        {/* About Page */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-in fade-in duration-700 text-left">
            <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex items-center gap-3 mb-6">
                <Info size={24} className="text-blue-500" />
                <h3 className="text-xl font-black uppercase tracking-tight">Project Overview</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                SmartOS is a real-time Smart City dashboard powered by ESP32 sensor nodes and Supabase.
                It ingests multi-sensor telemetry (RFID, IR motion, LDR light, soil moisture),
                computes analytics, and surfaces AI-driven preventive insights for operations teams.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <Cpu size={24} className="text-indigo-500" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Technologies Used</h3>
                </div>
                <ul className="text-sm text-slate-400 leading-relaxed space-y-2">
                  <li><span className="font-bold text-slate-200">React + Vite</span> - Fast, modern SPA development</li>
                  <li><span className="font-bold text-slate-200">Tailwind CSS</span> - Responsive, utility-first styling</li>
                  <li><span className="font-bold text-slate-200">Supabase</span> - Database, REST, and realtime channels</li>
                  <li><span className="font-bold text-slate-200">Recharts</span> - Interactive charts and visualizations</li>
                  <li><span className="font-bold text-slate-200">Lucide Icons</span> - Clean, consistent UI icons</li>
                  <li><span className="font-bold text-slate-200">Google Gemini API</span> - AI predictions and insights</li>
                </ul>
              </div>

              <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-slate-900/40 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <Database size={24} className="text-emerald-500" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Data Pipeline</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sensor nodes publish to Supabase `sensor_readings`. The dashboard subscribes to realtime inserts,
                  aggregates analytics (hourly counts, averages, distributions), and updates visualizations live.
                  AI prompts are generated contextually from analytics for concise operational recommendations.
                </p>
              </div>
            </div>
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
