'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, Eye } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'attendance',
      title: 'Attendance Alert',
      message: 'Sarah was marked absent on June 5, 2024',
      timestamp: '2024-06-07 09:30',
      read: false,
      iconName: 'AlertCircle',
    },
    {
      id: 2,
      type: 'academic',
      title: 'New Assignment Posted',
      message: 'Mrs. Smith posted a new essay assignment for English class',
      timestamp: '2024-06-07 08:15',
      read: false,
      iconName: 'Info',
    },
    {
      id: 3,
      type: 'fee',
      title: 'Fee Payment Reminder',
      message: 'Fees of ₹50,000 are due by June 30, 2024',
      timestamp: '2024-06-06 14:45',
      read: true,
      iconName: 'AlertCircle',
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'Sarah scored 95% in Mathematics - Outstanding Performance!',
      timestamp: '2024-06-06 11:20',
      read: true,
      iconName: 'CheckCircle',
    },
    {
      id: 5,
      type: 'event',
      title: 'Event Reminder',
      message: 'Sports Day is scheduled for June 15, 2024. Register now!',
      timestamp: '2024-06-05 16:00',
      read: true,
      iconName: 'Info',
    },
    {
      id: 6,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from Mr. Johnson about Sarah\'s progress',
      timestamp: '2024-06-04 13:30',
      read: true,
      iconName: 'Info',
    },
    {
      id: 7,
      type: 'holiday',
      title: 'Holiday Announcement',
      message: 'Summer vacation starting June 20, 2024',
      timestamp: '2024-06-03 10:00',
      read: true,
      iconName: 'Info',
    },
    {
      id: 8,
      type: 'assignment',
      title: 'Assignment Submitted',
      message: 'Sarah submitted her lab report for Science class',
      timestamp: '2024-06-02 15:45',
      read: true,
      iconName: 'CheckCircle',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      attendance: 'bg-red-50 border-red-200',
      academic: 'bg-blue-50 border-blue-200',
      fee: 'bg-orange-50 border-orange-200',
      achievement: 'bg-green-50 border-green-200',
      event: 'bg-purple-50 border-purple-200',
      message: 'bg-yellow-50 border-yellow-200',
      holiday: 'bg-indigo-50 border-indigo-200',
      assignment: 'bg-cyan-50 border-cyan-200',
    };
    return colors[type] || colors.academic;
  };

  const getIconColor = (type: string) => {
    const colors: Record<string, string> = {
      attendance: 'text-red-600',
      academic: 'text-blue-600',
      fee: 'text-orange-600',
      achievement: 'text-green-600',
      event: 'text-purple-600',
      message: 'text-yellow-600',
      holiday: 'text-indigo-600',
      assignment: 'text-cyan-600',
    };
    return colors[type] || colors.academic;
  };

  const renderIcon = (iconName: string, type: string) => {
    const colorClass = getIconColor(type);
    switch (iconName) {
      case 'AlertCircle':
        return <AlertCircle className={`w-5 h-5 ${colorClass}`} />;
      case 'CheckCircle':
        return <CheckCircle className={`w-5 h-5 ${colorClass}`} />;
      default:
        return <Info className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-30">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  Mark All as Read
                </Button>
              )}
              <Button variant="destructive" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border ${getNotificationColor(notification.type)} transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {renderIcon(notification.iconName, notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>

                      <p className="text-xs text-gray-500 mb-3">{notification.timestamp}</p>

                      <div className="flex flex-wrap gap-2 items-center">
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Bell className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-600 font-medium mb-2">No notifications</p>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium text-gray-900">Attendance Alerts</p>
                  <p className="text-sm text-gray-600">Get notified of attendance changes</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium text-gray-900">Academic Updates</p>
                  <p className="text-sm text-gray-600">New assignments and grades</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium text-gray-900">Fee Reminders</p>
                  <p className="text-sm text-gray-600">Payment due date notifications</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium text-gray-900">Event Notifications</p>
                  <p className="text-sm text-gray-600">School events and announcements</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>

              <Button className="w-full mt-6">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
