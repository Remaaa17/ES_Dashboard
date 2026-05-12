import { Sprout, Droplets, TrendingUp, AlertTriangle, Activity, Gauge } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import GlassCard from '../ui/GlassCard';

const SoilPage = ({ analytics, isDarkMode }) => {
  // حساب توصيات الري
  const irrigationNeeded = analytics.lastSoilVal < 30;
  const wateringRecommendation = irrigationNeeded ? 
    'Immediate irrigation required' : 
    analytics.lastSoilVal > 70 ? 
    'Reduce watering - Risk of overwatering' :
    'Optimal moisture - Maintain current schedule';

  // حساب استقرار الرطوبة
  const stabilityScore = Math.max(0, 100 - analytics.moistureVariability);

  // تحليل الاتجاه
  const recentReadings = analytics.soilHistory.slice(-10);
  const trend = recentReadings.length > 1 ? 
    recentReadings[recentReadings.length - 1].value - recentReadings[0].value : 0;
  const trendDirection = trend > 5 ? 'Increasing' : trend < -5 ? 'Decreasing' : 'Stable';

  // حساب أيام حتى الري التالي
  const daysUntilIrrigation = analytics.lastSoilVal > 30 ? 
    Math.round((analytics.lastSoilVal - 30) / 5) : 0;

  // مشاكل محتملة
  const issues = [];
  if (analytics.lastSoilVal < 20) {
    issues.push({ type: 'error', msg: 'Critical: Severe drought conditions - Immediate irrigation required' });
  } else if (analytics.lastSoilVal < 30) {
    issues.push({ type: 'warning', msg: 'Low moisture detected - Schedule irrigation within 24 hours' });
  }
  
  if (analytics.lastSoilVal > 80) {
    issues.push({ type: 'warning', msg: 'Excessive moisture - Risk of root rot and fungal growth' });
  }
  
  if (analytics.moistureVariability > 40) {
    issues.push({ type: 'info', msg: 'High variability detected - Check irrigation system consistency' });
  }

  if (trendDirection === 'Decreasing' && analytics.lastSoilVal < 40) {
    issues.push({ type: 'warning', msg: 'Rapid moisture loss - Increase watering frequency' });
  }

  // بيانات الحالة
  const statusColor = analytics.lastSoilVal < 30 ? '#ef4444' : 
                      analytics.lastSoilVal > 70 ? '#3b82f6' : '#10b981';

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700 text-left">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard title="Current Moisture" icon={Droplets} color="cyan" isDarkMode={isDarkMode}>
          <p className={`text-4xl font-black mt-2 tracking-tighter`} style={{ color: statusColor }}>
            {analytics.lastSoilVal}%
          </p>
          <p className="text-xs text-slate-500 mt-2">{analytics.moistureStatus} level</p>
        </GlassCard>

        <GlassCard title="Stability Score" icon={Gauge} color="emerald" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-emerald-500">{stabilityScore}%</p>
          <p className="text-xs text-slate-500 mt-2">System consistency</p>
        </GlassCard>

        <GlassCard title="Variability" icon={TrendingUp} color="purple" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-purple-500">±{analytics.moistureVariability}%</p>
          <p className="text-xs text-slate-500 mt-2">Fluctuation range</p>
        </GlassCard>

        <GlassCard title="Next Irrigation" icon={Sprout} color="blue" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-blue-500">
            {daysUntilIrrigation > 0 ? `${daysUntilIrrigation}d` : 'Now'}
          </p>
          <p className="text-xs text-slate-500 mt-2">{trendDirection} trend</p>
        </GlassCard>
      </div>

      {/* Issues Alert */}
      {issues.length > 0 && (
        <GlassCard title="Irrigation Alerts" icon={AlertTriangle} color="rose" isDarkMode={isDarkMode}>
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <div 
                key={i}
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  issue.type === 'error' ? 'bg-rose-500/10 border-rose-500/20' :
                  issue.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <AlertTriangle size={18} className={
                  issue.type === 'error' ? 'text-rose-500' :
                  issue.type === 'warning' ? 'text-amber-500' :
                  'text-blue-500'
                } />
                <p className="text-sm font-medium">{issue.msg}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Moisture History */}
        <GlassCard title="Moisture Trend (30 Readings)" icon={Activity} color="cyan" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Real-time soil moisture levels with optimal zones highlighted</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.soilHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="time" fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <YAxis domain={[0, 100]} fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <Tooltip 
                  contentStyle={{
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 4 }}
                />
                {/* Optimal zone reference lines */}
                <Line type="monotone" dataKey={() => 30} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey={() => 70} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4 text-xs">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-slate-500">Dry (&lt;30%)</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-500">Optimal (30-70%)</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-500">Wet (&gt;70%)</span>
            </span>
          </div>
        </GlassCard>

        {/* Condition Distribution */}
        <GlassCard title="Moisture State Distribution" icon={Droplets} color="emerald" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Time spent in different moisture conditions</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.soilDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" fontSize={11} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <YAxis fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <Tooltip 
                  contentStyle={{
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Moisture Gauge */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard title="Current Status Gauge" icon={Gauge} color="cyan" className="xl:col-span-1" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Visual indicator of current moisture level</p>
          <div className="flex flex-col items-center py-6">
            <div className="relative w-48 h-24 overflow-hidden">
              <ResponsiveContainer width="100%" height="200%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  barSize={15} 
                  data={[{value: analytics.lastSoilVal}]} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar 
                    background 
                    dataKey="value" 
                    cornerRadius={10} 
                    fill={statusColor}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p className="text-3xl font-black" style={{ color: statusColor }}>{analytics.lastSoilVal}%</p>
                <p className="text-xs text-slate-500 uppercase font-bold">{analytics.moistureStatus}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Stacked Moisture Analysis" icon={Activity} color="purple" className="xl:col-span-2" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Detailed breakdown of moisture states over time</p>
          <div className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.soilHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="time" fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <YAxis fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <Tooltip 
                  contentStyle={{
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px'
                  }}
                />
                <Area type="monotone" dataKey="dry" stackId="1" stroke="#ef4444" fill="#ef444433" />
                <Area type="monotone" dataKey="optimal" stackId="1" stroke="#10b981" fill="#10b98133" />
                <Area type="monotone" dataKey="wet" stackId="1" stroke="#3b82f6" fill="#3b82f633" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Irrigation Recommendations */}
      <GlassCard title="Smart Irrigation Recommendations" icon={Sprout} color="emerald" isDarkMode={isDarkMode}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className={`p-6 rounded-3xl border ${
            irrigationNeeded ? 
            (isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200') :
            (isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-200')
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              irrigationNeeded ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              <Droplets size={24} />
            </div>
            <h4 className="text-sm font-black mb-2">Watering Status</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{wateringRecommendation}</p>
          </div>

          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-200'}`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-sm font-black mb-2">Trend Analysis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Moisture is {trendDirection.toLowerCase()} with ±{analytics.moistureVariability}% variability. 
              {stabilityScore > 70 ? ' System is stable.' : ' Consider adjusting irrigation schedule.'}
            </p>
          </div>

          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-purple-500/5 border-purple-500/10' : 'bg-purple-50 border-purple-200'}`}>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Gauge size={24} />
            </div>
            <h4 className="text-sm font-black mb-2">Optimization</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {daysUntilIrrigation > 0 ? 
                `Next irrigation in ${daysUntilIrrigation} days. Monitor daily for changes.` :
                'Immediate action required. Check irrigation system status.'}
            </p>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};

export default SoilPage;
