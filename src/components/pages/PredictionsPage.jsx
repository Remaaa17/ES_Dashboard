import { Sparkles, Brain, TrendingUp, AlertTriangle, Zap, Shield, Droplets, Sun, Activity } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const PredictionsPage = ({ analytics, aiInsight, isAiLoading, onAIForecast, isDarkMode }) => {
  const activeInsight = aiInsight.predictions || '';

  // Parse AI response sections
  const parseAIResponse = (text) => {
    const sections = {
      summary: '',
      realtime: '',
      predictions: '',
      anomalies: '',
      lighting: '',
      security: '',
      irrigation: '',
      traffic: '',
      deviceHealth: '',
      recommendations: [],
      energySavings: '',
      riskLevel: '',
      confidence: ''
    };

    if (!text) return sections;

    const lines = text.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('SYSTEM SUMMARY:')) {
        currentSection = 'summary';
      } else if (trimmed.startsWith('REALTIME ANALYSIS:')) {
        currentSection = 'realtime';
      } else if (trimmed.startsWith('PREDICTIONS:')) {
        currentSection = 'predictions';
      } else if (trimmed.startsWith('ANOMALIES DETECTED:')) {
        currentSection = 'anomalies';
      } else if (trimmed.startsWith('SMART LIGHTING INSIGHTS:')) {
        currentSection = 'lighting';
      } else if (trimmed.startsWith('SECURITY ANALYSIS:')) {
        currentSection = 'security';
      } else if (trimmed.startsWith('IRRIGATION ANALYSIS:')) {
        currentSection = 'irrigation';
      } else if (trimmed.startsWith('TRAFFIC ANALYSIS:')) {
        currentSection = 'traffic';
      } else if (trimmed.startsWith('DEVICE HEALTH:')) {
        currentSection = 'deviceHealth';
      } else if (trimmed.startsWith('RECOMMENDATIONS:')) {
        currentSection = 'recommendations';
      } else if (trimmed.startsWith('ESTIMATED ENERGY SAVINGS:')) {
        currentSection = 'energySavings';
      } else if (trimmed.startsWith('RISK LEVEL:')) {
        currentSection = 'riskLevel';
      } else if (trimmed.startsWith('CONFIDENCE:')) {
        currentSection = 'confidence';
      } else if (trimmed && currentSection) {
        if (currentSection === 'recommendations' && trimmed.startsWith('-')) {
          sections.recommendations.push(trimmed.substring(1).trim());
        } else if (currentSection !== 'recommendations') {
          sections[currentSection] += (sections[currentSection] ? ' ' : '') + trimmed;
        }
      }
    });

    return sections;
  };

  const sections = parseAIResponse(activeInsight);

  // Determine risk color
  const getRiskColor = (risk) => {
    const r = risk.toUpperCase();
    if (r.includes('CRITICAL')) return 'rose';
    if (r.includes('HIGH')) return 'orange';
    if (r.includes('MEDIUM')) return 'yellow';
    return 'emerald';
  };

  const riskColor = getRiskColor(sections.riskLevel);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      
      {/* Header Section */}
      <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'} flex flex-col md:flex-row gap-8 items-center shadow-xl`}>
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[30px] text-white shadow-2xl shadow-indigo-500/30">
          <Brain size={48} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            SmartOS AI Core - Predictive Intelligence
          </h2>
          <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Advanced AI-powered analytics for smart city operations • Real-time anomaly detection • Predictive maintenance • Energy optimization
          </p>
        </div>
        <button
          onClick={onAIForecast}
          disabled={isAiLoading}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAiLoading ? (
            <>
              <Activity className="animate-spin" size={20} />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate AI Forecast
            </>
          )}
        </button>
      </div>

      {!activeInsight && !isAiLoading && (
        <div className={`p-16 rounded-[32px] border ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-lg'} text-center`}>
          <div className="max-w-md mx-auto">
            <Sparkles size={64} className="mx-auto mb-6 text-indigo-500 opacity-50" />
            <h3 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>No AI Analysis Generated Yet</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">Click "Generate AI Forecast" to analyze current system data and receive intelligent predictions</p>
            <button
              onClick={onAIForecast}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all"
            >
              <Sparkles size={18} />
              Generate Now
            </button>
          </div>
        </div>
      )}

      {isAiLoading && (
        <div className={`p-16 rounded-[32px] border ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-lg'} text-center`}>
          <Activity size={64} className="mx-auto mb-6 text-indigo-500 animate-spin" />
          <h3 className="text-2xl font-black mb-3">Analyzing System Data...</h3>
          <p className="text-sm text-slate-500">SmartOS AI Core is processing sensor data and generating predictions</p>
        </div>
      )}

      {activeInsight && !isAiLoading && (
        <>
          {/* System Summary & Risk Level */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard title="System Summary" icon={Brain} color="indigo" className="lg:col-span-2" isDarkMode={isDarkMode}>
              <p className={`text-sm leading-relaxed mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.summary || 'No summary available'}</p>
            </GlassCard>

            <div className="space-y-6">
              <GlassCard title="Risk Level" icon={AlertTriangle} color={riskColor} isDarkMode={isDarkMode}>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-3xl font-black text-${riskColor}-500`}>
                    {sections.riskLevel || 'N/A'}
                  </span>
                  <div className={`px-4 py-2 rounded-full bg-${riskColor}-500/10 text-${riskColor}-500 text-xs font-bold`}>
                    {sections.confidence || 'N/A'}
                  </div>
                </div>
              </GlassCard>

              {sections.energySavings && (
                <GlassCard title="Energy Savings" icon={Zap} color="emerald" isDarkMode={isDarkMode}>
                  <p className="text-2xl font-black text-emerald-500 mt-2">{sections.energySavings}</p>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Realtime Analysis */}
          {sections.realtime && (
            <GlassCard title="Realtime Analysis" icon={Activity} color="blue" isDarkMode={isDarkMode}>
              <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.realtime}</p>
            </GlassCard>
          )}

          {sections.predictions && (
            <GlassCard title="AI Predictions" icon={TrendingUp} color="purple" isDarkMode={isDarkMode}>
              <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.predictions}</p>
            </GlassCard>
          )}

          {sections.anomalies && (
            <GlassCard title="Anomalies Detected" icon={AlertTriangle} color="rose" isDarkMode={isDarkMode}>
              <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.anomalies}</p>
            </GlassCard>
          )}

          {/* Domain-Specific Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.lighting && (
              <GlassCard title="Smart Lighting Insights" icon={Sun} color="yellow" isDarkMode={isDarkMode}>
                <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.lighting}</p>
              </GlassCard>
            )}

            {sections.security && (
              <GlassCard title="Security Analysis" icon={Shield} color="blue" isDarkMode={isDarkMode}>
                <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.security}</p>
              </GlassCard>
            )}

            {sections.irrigation && (
              <GlassCard title="Irrigation Analysis" icon={Droplets} color="cyan" isDarkMode={isDarkMode}>
                <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.irrigation}</p>
              </GlassCard>
            )}

            {sections.traffic && (
              <GlassCard title="Traffic Analysis" icon={Activity} color="purple" isDarkMode={isDarkMode}>
                <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.traffic}</p>
              </GlassCard>
            )}
          </div>

          {/* Device Health */}
          {sections.deviceHealth && (
            <GlassCard title="Device Health Status" icon={Zap} color="emerald" isDarkMode={isDarkMode}>
              <p className={`text-sm leading-relaxed mt-2 whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sections.deviceHealth}</p>
            </GlassCard>
          )}

          {/* Recommendations */}
          {sections.recommendations.length > 0 && (
            <GlassCard title="AI Recommendations" icon={Sparkles} color="indigo" isDarkMode={isDarkMode}>
              <div className="space-y-3 mt-4">
                {sections.recommendations.map((rec, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className={`text-sm font-medium pt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{rec}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Raw AI Output (for debugging) */}
          <details className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <summary className={`text-xs font-bold uppercase cursor-pointer ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>View Raw AI Output</summary>
            <pre className={`text-xs mt-4 whitespace-pre-wrap font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{activeInsight}</pre>
          </details>
        </>
      )}
    </div>
  );
};

export default PredictionsPage;
