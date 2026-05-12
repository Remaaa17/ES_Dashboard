import { AlertTriangle } from 'lucide-react';

const NotificationItem = ({ notification }) => (
  <div
    className={`p-4 rounded-2xl border flex gap-4 ${
      notification.type === 'error'
        ? 'bg-rose-500/5 border-rose-500/20'
        : 'bg-blue-500/5 border-blue-500/20'
    }`}
  >
    <div className={notification.type === 'error' ? 'text-rose-500' : 'text-blue-500'}>
      <AlertTriangle size={18} />
    </div>
    <div className="flex-1">
      <p className="text-xs font-bold leading-tight">{notification.msg}</p>
      <p className="text-[10px] opacity-50 mt-1">
        {new Date(notification.time).toLocaleTimeString()}
      </p>
    </div>
  </div>
);

export default NotificationItem;
