import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Bell, CheckCheck, CalendarCheck, XCircle, FileText, Pill, ClipboardEdit, CalendarClock } from 'lucide-react';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notificationApi';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import type { AppNotification } from '@/types';

// §27's in-app notification center — the one page shared across ALL
// three roles (patient, doctor, admin all receive notifications, per the
// backend's design), hence living in features/shared/ rather than under
// any single role's folder, matching the same reasoning that put
// NotificationController outside any role-specific base path on the backend.
const TYPE_ICONS: Record<string, React.ElementType> = {
  APPOINTMENT_BOOKED: CalendarCheck,
  APPOINTMENT_CONFIRMED: CalendarCheck,
  APPOINTMENT_CANCELLED: XCircle,
  APPOINTMENT_REMINDER: CalendarClock,
  APPOINTMENT_COMPLETED: CheckCheck,
  PRESCRIPTION_AVAILABLE: Pill,
  NEW_MEDICAL_REPORT: FileText,
  FOLLOW_UP_REMINDER: CalendarClock,
  NEW_APPOINTMENT: CalendarCheck,
  AMENDMENT_REVIEWED: ClipboardEdit,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', 'my'],
    queryFn: getMyNotifications,
  });

  const readMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) return <Loader />;

  const list = notifications ?? [];
  const hasUnread = list.some((n) => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Notifications</h1>
          <p className="text-ink-400 mt-1">Updates about your appointments and records.</p>
        </div>
        {hasUnread && (
          <button
            onClick={() => readAllMutation.mutate()}
            className="text-sm text-teal-500 font-medium hover:text-teal-600 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Bell} message="You're all caught up" subtext="New updates about your appointments and records will show up here." />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <NotificationRow key={n.id} notification={n} onRead={() => readMutation.mutate(n.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification, onRead }: { notification: AppNotification; onRead: () => void }) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell;

  return (
    <Card
      hoverable
      onClick={() => !notification.isRead && onRead()}
      className={`p-4 flex items-start gap-3 cursor-pointer ${!notification.isRead ? 'bg-teal-50/30 border-teal-100' : ''}`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.isRead ? 'bg-teal-50 text-teal-500' : 'bg-cream-200 text-ink-400'}`}>
        <Icon className="w-4 h-4" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm ${!notification.isRead ? 'font-medium text-ink' : 'text-ink-600'}`}>{notification.title}</p>
          {!notification.isRead && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />}
        </div>
        <p className="text-sm text-ink-400 mt-0.5">{notification.message}</p>
        <p className="text-xs text-ink-400 mt-1">{formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}</p>
      </div>
    </Card>
  );
}