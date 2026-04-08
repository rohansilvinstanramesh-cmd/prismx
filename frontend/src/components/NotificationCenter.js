import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Bell, X, Check, Warning, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from './ui/button';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type, severity) => {
    if (severity === 'critical') return <Warning size={20} weight="fill" className="text-red-400" />;
    if (severity === 'warning') return <Warning size={20} weight="fill" className="text-yellow-400" />;
    return <Info size={20} weight="fill" className="text-blue-400" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
        data-testid="notification-bell"
      >
        <Bell size={24} weight={unreadCount > 0 ? 'fill' : 'regular'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-12 w-96 max-h-[600px] bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
            data-testid="notification-panel"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                    data-testid="mark-all-read"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 border-b border-white/10 hover:bg-zinc-800/50 transition-colors ${
                      !notif.read ? 'bg-indigo-500/5' : ''
                    }`}
                    data-testid="notification-item"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notif.type, notif.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="text-indigo-400 hover:text-indigo-300"
                              data-testid="mark-read-button"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 mb-2">{notif.message}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                          <button
                            onClick={() => deleteNotification(notif._id)}
                            className="text-xs text-red-400 hover:text-red-300"
                            data-testid="delete-notification"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;