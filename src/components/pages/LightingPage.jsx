import { Sun, Moon, Zap, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import GlassCard from '../ui/GlassCard';

const LightingPage = ({ analytics, isDarkMode }) => {
  // حساب توفير الطاقة المحتمل
  const potentialSavings = Math.round((analytics.darknessDuration / 24) * 100);
  
  // تحليل كفاءة الإضاءة
  const lightingEfficiency = analytics.thresholdCrossings > 0 ? 
    Math.min(100, Math.round((analytics.thresholdCrossings / 10) * 100)) : 0;

  // حساب متوسط الإضاءة في النهار والليل (عكس المنطق: قراءة عالية = نهار)
  const dayReadings = analytics.ldrHistory.filter(r => r.value >= 1500);
  const nightReadings = analytics.ldrHistory.filter(r => r.value < 1500);
  const avgDayLight = dayReadings.length > 0 ? 
    Math.round(dayReadings.reduce((sum, r) => sum + r.value, 0) / dayReadings.length) : 0;
  const avgNightLight = nightReadings.length > 0 ?
    Math.round(nightReadings.reduce((sum, r) => sum + r.value, 0) / nightReadings.length) : 0;

  // مشاكل محتملة
  const issues = [];
  if (analytics.avgLdr < 500) {
    issues.push({ type: 'warning', msg: 'Very low ambient light detected - Check sensor calibration' });
  }
  if (analytics.thresholdCrossings < 2) {
    issues.push({ type: 'info', msg: 'Low day/night transitions - Sensor may need repositioning' });
  }
  if (analytics.darknessDuration > 16) {
    issues.push({ type: 'info', msg: 'Extended darkness period - Optimal for energy savings' });
  }
  if (analytics.darknessDuration < 8) {
    issues.push({ type: 'warning', msg: 'Short darkness period - Check seasonal adjustments' });
  }

  // بيانات للمقارنة
  const comparisonData = [
    { name: 'Day Avg', value: avgDayLight, fill: '#f59e0b' },
    { name: 'Night Avg', value: avgNightLight, fill: '#1e293b' },
    { name: 'Overall Avg', value: analytics.avgLdr, fill: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700 text-left">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard title="Ambient Light" icon={Sun} color="yellow" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-yellow-500">{analytics.avgLdr}</p>
          <p className="text-xs text-slate-500 mt-2">LUX - City average</p>
        </GlassCard>

        <GlassCard title="Darkness Hours" icon={Moon} color="indigo" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-indigo-500">{analytics.darknessDuration}h</p>
          <p className="text-xs text-slate-500 mt-2">Daily dark period</p>
        </GlassCard>

        <GlassCard title="Energy Savings" icon={TrendingDown} color="emerald" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-emerald-500">{potentialSavings}%</p>
          <p className="text-xs text-slate-500 mt-2">Potential reduction</p>
        </GlassCard>

        <GlassCard title="Transitions" icon={Zap} color="purple" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-purple-500">{analytics.thresholdCrossings}</p>
          <p className="text-xs text-slate-500 mt-2">Day/Night switches</p>
        </GlassCard>
      </div>

      {/* Issues Alert */}
      {issues.length > 0 && (
        <GlassCard title="System Insights" icon={AlertCircle} color="blue" isDarkMode={isDarkMode}>
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
                <AlertCircle size={18} className={
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
        
        {/* Light History */}
        <GlassCard title="24-Hour Light Intensity" icon={Activity} color="yellow" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Real-time ambient light levels throughout the day</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.ldrHistory}>
                <defs>
                  <linearGradient id="colorLdr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="time" fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <YAxis fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                <Tooltip 
                  contentStyle={{
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#eab308" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLdr)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Day/Night Distribution */}
        <GlassCard title="Day vs Night Distribution" icon={Moon} color="indigo" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Percentage of time in daylight vs darkness</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.dayNightDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#fbbf24" />
                  <Cell fill="#1e293b" />
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Lighting Efficiency Gauge */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard title="Lighting Efficiency Score" icon={Zap} color="emerald" className="xl:col-span-1" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">System responsiveness to light changes</p>
          <div className="flex flex-col items-center py-6">
            <div className="relative w-48 h-24 overflow-hidden">
              <ResponsiveContainer width="100%" height="200%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  barSize={15} 
                  data={[{value: lightingEfficiency}]} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar 
                    background 
                    dataKey="value" 
                    cornerRadius={10} 
                    fill={lightingEfficiency > 70 ? '#10b981' : lightingEfficiency > 40 ? '#f59e0b' : '#ef4444'}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <p className="text-3xl font-black">{lightingEfficiency}%</p>
                <p className="text-xs text-slate-500 uppercase font-bold">Efficiency</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Light Level Comparison" icon={Sun} color="blue" className="xl:col-span-2" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Average light intensity across different periods</p>
          <div className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
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
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Energy Savings Recommendation */}
      <GlassCard title="Smart Lighting Recommendations" icon={TrendingDown} color="emerald" isDarkMode={isDarkMode}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <Moon size={24} />
            </div>
            <h4 className="text-sm font-black mb-2">Auto-Dimming</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enable automatic dimming during {analytics.darknessDuration}h darkness period to save up to {potentialSavings}% energy
            </p>
          </div>

          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/10' : 'bg-blue-50 border-blue-200'}`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h4 className="text-sm font-black mb-2">Motion Sensors</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Integrate with IR sensors for zone-based lighting control during low-traffic hours
            </p>
          </div>

          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-purple-500/5 border-purple-500/10' : 'bg-purple-50 border-purple-200'}`}>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <h4 className="text-sm font-black mb-2">Adaptive Schedule</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Adjust lighting schedule based on {analytics.thresholdCrossings} daily transitions for optimal efficiency
            </p>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};

export default LightingPage;
