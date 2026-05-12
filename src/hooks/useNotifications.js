import { useState } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (msg, type = 'info') => {
    setNotifications((prev) =>
      [
        { id: Date.now(), msg: String(msg), type, time: new Date() },
        ...prev,
      ].slice(0, 10)
    );
  };

  return { notifications, addNotification };
};
