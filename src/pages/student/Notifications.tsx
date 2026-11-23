import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ArrowRight,
  Check,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { notificationService } from '../../services/notification.service';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types';
import { toast } from 'sonner';

export const StudentNotifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifs = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await notificationService.getForUser(user.id);
        setNotifications(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifs();
  }, [user]);

  const handleMarkAsRead = async (id: string, link?: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (link) navigate(link);
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => notificationService.markAsRead(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Student Notifications"
        description="Official placement communications, letter issuance alerts, and review updates from the Directorate."
        actions={
          notifications.some((n) => !n.isRead) ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              leftIcon={<Check className="w-4 h-4 text-teal" />}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You are completely caught up with institutional alerts."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id, notif.link)}
                className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                  !notif.isRead ? 'bg-teal-50/30' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-border shadow-xs shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-teal" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-navy text-xs sm:text-sm">
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {notif.createdAt}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-teal hover:underline">
                      <span>View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-teal shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
