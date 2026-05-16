import { Shield, TrendingUp, Clock, AlertTriangle, Users, Activity } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import GlassCard from '../ui/GlassCard';
import ChartInsight from '../ui/ChartInsight';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const RFIDPage = ({ analytics, isDarkMode }) => {
  // حساب Authorized vs Unauthorized
  const authorizedCount = analytics.rfidLast5.filter(log => log.access_granted === true).length;
  const unauthorizedCount = analytics.rfidLast5.filter(log => log.access_granted === false).length;
  const totalCount = authorizedCount + unauthorizedCount;
  const securityScore = totalCount > 0 ? 
    Math.round((authorizedCount / totalCount) * 100) : 100;

  // تحليل أوقات الذروة
  const peakHours = analytics.rfidHourly
    .map((h, i) => ({ ...h, hourNum: i }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // تحليل الأنماط
  const morningScans = analytics.rfidHourly.slice(6, 12).reduce((sum, h) => sum + h.count, 0);
  const afternoonScans = analytics.rfidHourly.slice(12, 18).reduce((sum, h) => sum + h.count, 0);
  const eveningScans = analytics.rfidHourly.slice(18, 24).reduce((sum, h) => sum + h.count, 0);
  const nightScans = [...analytics.rfidHourly.slice(0, 6), ...analytics.rfidHourly.slice(24)].reduce((sum, h) => sum + h.count, 0);

  const timeDistribution = [
    { name: 'Morning (6-12)', value: morningScans, color: '#f59e0b' },
    { name: 'Afternoon (12-18)', value: afternoonScans, color: '#3b82f6' },
    { name: 'Evening (18-24)', value: eveningScans, color: '#8b5cf6' },
    { name: 'Night (0-6)', value: nightScans, color: '#1e293b' },
  ];

  // حساب معدل النمو
  const firstHalf = analytics.rfidHourly.slice(0, 12).reduce((sum, h) => sum + h.count, 0);
  const secondHalf = analytics.rfidHourly.slice(12, 24).reduce((sum, h) => sum + h.count, 0);
  const growthRate = firstHalf > 0 ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1) : 0;

  // مشاكل محتملة
  const issues = [];
  if (analytics.rfidCount === 0) {
    issues.push({ type: 'error', msg: 'No RFID activity detected - Check reader connection' });
  }
  if (unauthorizedCount > 0) {
    issues.push({ 
      type: 'warning', 
      msg: `${unauthorizedCount} unauthorized access attempts detected - Review security logs` 
    });
  }
  if (peakHours[0]?.count > analytics.rfidCount * 0.3) {
    issues.push({ type: 'warning', msg: `High congestion at ${peakHours[0].hour} - Consider additional gates` });
  }
  if (nightScans > analytics.rfidCount * 0.2) {
    issues.push({ type: 'info', msg: 'Unusual night activity detected - Review security protocols' });
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700 text-left">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <GlassCard title="Total Scans" icon={Shield} color="blue" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-blue-500">{analytics.rfidCount}</p>
          <p className="text-xs text-slate-500 mt-2">Daily access attempts</p>
        </GlassCard>

        <GlassCard title="Authorized" icon={Users} color="emerald" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-emerald-500">{authorizedCount}</p>
          <p className="text-xs text-slate-500 mt-2">Successful entries</p>
        </GlassCard>

        <GlassCard title="Denied" icon={AlertTriangle} color="rose" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-rose-500">{unauthorizedCount}</p>
          <p className="text-xs text-slate-500 mt-2">Blocked attempts</p>
        </GlassCard>

        <GlassCard title="Peak Hour" icon={Clock} color="purple" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter text-purple-500">{peakHours[0]?.hour || 'N/A'}</p>
          <p className="text-xs text-slate-500 mt-2">{peakHours[0]?.count || 0} scans</p>
        </GlassCard>

        <GlassCard title="Security Score" icon={Activity} color="cyan" isDarkMode={isDarkMode}>
          <p className={`text-4xl font-black mt-2 tracking-tighter ${
            securityScore >= 90 ? 'text-emerald-500' : 
            securityScore >= 70 ? 'text-yellow-500' : 'text-rose-500'
          }`}>
            {securityScore}%
          </p>
          <p className="text-xs text-slate-500 mt-2">Access success rate</p>
        </GlassCard>
      </div>

      {/* Issues Alert */}
      {issues.length > 0 && (
        <GlassCard title="System Alerts" icon={AlertTriangle} color="rose" isDarkMode={isDarkMode}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hourly Trend */}
        <GlassCard title="24-Hour Access Pattern" icon={Activity} color="blue" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Hourly distribution showing peak and off-peak periods</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.rfidHourly}>
                <defs>
                  <linearGradient id="colorRfid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="hour" fontSize={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
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
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRfid)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartInsight
            chartId="rfid-hourly"
            isDarkMode={isDarkMode}
            prompt={`RFID Security data: Total scans=${analytics.rfidCount}, Authorized=${authorizedCount}, Denied=${unauthorizedCount}, Security score=${securityScore}%, Peak hour=${peakHours[0]?.hour || 'N/A'}. Analyze the 24-hour access pattern and give a short security insight.`}
          />
        </GlassCard>

        {/* Time Distribution */}
        <GlassCard title="Time Period Distribution" icon={Clock} color="purple" isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Access distribution across different time periods</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
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
          <ChartInsight
            chartId="rfid-distribution"
            isDarkMode={isDarkMode}
            prompt={`RFID time distribution: Morning=${morningScans}, Afternoon=${afternoonScans}, Evening=${eveningScans}, Night=${nightScans} scans. Analyze the time period distribution and give a short insight about access patterns.`}
          />
        </GlassCard>
      </div>

      {/* Peak Hours Analysis */}
      <GlassCard title="Top 3 Peak Hours" icon={TrendingUp} color="emerald" isDarkMode={isDarkMode}>
        <p className="text-xs text-slate-500 mb-4">Busiest hours requiring attention for capacity planning</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {peakHours.map((peak, i) => (
            <div 
              key={i}
              className={`p-6 rounded-3xl border ${
                isDarkMode ? 'bg-slate-800/30 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-black uppercase tracking-widest ${
                  i === 0 ? 'text-emerald-500' : i === 1 ? 'text-blue-500' : 'text-purple-500'
                }`}>
                  #{i + 1} Peak
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i === 0 ? 'bg-emerald-500/10 text-emerald-500' : 
                  i === 1 ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-purple-500/10 text-purple-500'
                }`}>
                  {i + 1}
                </div>
              </div>
              <p className="text-3xl font-black mb-1">{peak.hour}</p>
              <p className="text-sm text-slate-500">{peak.count} scans</p>
              <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${(peak.count / peakHours[0].count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Access Log */}
      <GlassCard title="Recent Access Log" icon={Shield} color="blue" isDarkMode={isDarkMode}>
        <p className="text-xs text-slate-500 mb-4">Last 5 successful RFID authentications</p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'text-slate-500 border-white/5' : 'text-slate-600 border-slate-200'}`}>
                <th className="pb-4 font-bold text-xs uppercase">Time</th>
                <th className="pb-4 font-bold text-xs uppercase">Card UID</th>
                <th className="pb-4 font-bold text-xs uppercase">Location</th>
                <th className="pb-4 text-right font-bold text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {analytics.rfidLast5.length > 0 ? (
                analytics.rfidLast5.map((log, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition-all">
                    <td className={`py-4 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-4 font-mono font-bold text-sm">{log.rfid_uid || log.value}</td>
                    <td className={`py-4 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Main Gate</td>
                    <td className="py-4 text-right">
                      {log.access_granted === true ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
                          ✅ Authorized
                        </span>
                      ) : log.access_granted === false ? (
                        <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase">
                          ❌ Denied
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase">
                          Unknown
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500 text-sm">
                    No RFID data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
};

export default RFIDPage;
