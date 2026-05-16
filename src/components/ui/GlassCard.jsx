const GlassCard = ({ title, children, icon: Icon, color = 'blue', className = '', isDarkMode }) => (
  <div
    className={`p-6 rounded-[32px] border transition-all duration-500 ${
      isDarkMode
        ? 'bg-slate-900/40 border-white/5 shadow-2xl'
        : 'bg-white border-slate-200 shadow-xl'
    } ${className}`}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
        {Icon && <Icon size={16} className={`text-${color}-500`} />} {title}
      </h3>
      <div className={`w-2 h-2 rounded-full bg-${color}-500 shadow-[0_0_10px_rgba(0,0,0,0.2)]`} />
    </div>
    {children}
  </div>
);

export default GlassCard;
