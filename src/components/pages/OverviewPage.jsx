import { Shield, Sun, Server, Activity, Bell } from 'lucide-react';
import { ComposedChart, Area, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';
import NotificationItem from '../ui/NotificationItem';
import ChartInsight from '../ui/ChartInsight';

const OverviewPage = ({ analytics, data, notifications, isDarkMode }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard title="Security" icon={Shield} color="blue" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter">{analytics.rfidCount}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Total Daily Scans</p>
        </GlassCard>

        <GlassCard title="Environment" icon={Sun} color="yellow" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter">{analytics.avgLdr}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Luminosity index</p>
        </GlassCard>

        <GlassCard title="Reliability" icon={Server} color="emerald" isDarkMode={isDarkMode}>
          <p className="text-4xl font-black mt-2 tracking-tighter">{analytics.uptime}%</p>
          <p className="text-[10px] text-emerald-500 font-bold uppercase">System Link: Stable</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard
          title="Multi-Sensor Activity"
          icon={Activity}
          className="lg:col-span-2"
          isDarkMode={isDarkMode}
        >
          <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Real-time sensor readings showing combined data from all connected devices</p>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.slice(-40)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
                />
                <XAxis dataKey="created_at" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: '16px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="#3b82f611"
                />
                <Bar dataKey="value" fill="#10b981" barSize={10} radius={[5, 5, 0, 0]} opacity={0.3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ChartInsight
            chartId="overview-activity"
            isDarkMode={isDarkMode}
            prompt={`SmartOS sensor data: RFID scans=${analytics.rfidCount}, Avg light=${analytics.avgLdr} LUX, Uptime=${analytics.uptime}%. Analyze the multi-sensor activity chart and give a short operational insight.`}
          />
        </GlassCard>

        <GlassCard title="Intelligence Stream" icon={Bell} isDarkMode={isDarkMode}>
          <p className="text-xs text-slate-500 mb-4">Live system alerts and security notifications</p>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
            {notifications.length === 0 && (
              <div className={`text-center py-10 opacity-40 italic text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Listening for city events...
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default OverviewPage;
