'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, CheckCircle2, AlertCircle, Info, MessageSquare } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const notificationsData: Notification[] = [
  {
    id: 1,
    title: 'Assignment Submitted',
    message: 'Aarav Sharma has submitted his assignment for "Research Project - Climate Change".',
    type: 'info',
    timestamp: '2024-12-10 02:30 PM',
    read: false,
  },
  {
    id: 2,
    title: 'Exam Marks Released',
    message: 'You have successfully submitted marks for Class 10-A Midterm examination.',
    type: 'success',
    timestamp: '2024-12-10 01:15 PM',
    read: false,
  },
  {
    id: 3,
    title: 'Low Attendance Alert',
    message: 'Bhavna Kapoor has 65% attendance. Please consider sending a notice to parents.',
    type: 'warning',
    timestamp: '2024-12-09 11:45 AM',
    read: true,
  },
  {
    id: 4,
    title: 'New Message from Parent',
    message: 'Priya Gupta (Parent of Diya Patel) has sent you a message.',
    type: 'info',
    timestamp: '2024-12-09 10:20 AM',
    read: true,
  },
  {
    id: 5,
    title: 'Homework Overdue',
    message: 'Harsh Verma has not submitted homework for "Chapter 5 - Quadratic Equations Exercise".',
    type: 'warning',
    timestamp: '2024-12-08 09:30 AM',
    read: true,
  },
  {
    id: 6,
    title: 'Class Schedule Updated',
    message: 'Class 10-A schedule has been updated. Mathematics class moved to 10:00 AM.',
    type: 'info',
    timestamp: '2024-12-08 08:00 AM',
    read: true,
  },
  {
    id: 7,
    title: 'Exam Date Reminder',
    message: 'Midterm examination for Class 10-B starts tomorrow at 10:30 AM.',
    type: 'warning',
    timestamp: '2024-12-07 04:00 PM',
    read: true,
  },
  {
    id: 8,
    title: 'New Student Enrolled',
    message: 'Ravi Patel has been enrolled to Class 9-A. Attendance and marks records have been created.',
    type: 'success',
    timestamp: '2024-12-07 09:15 AM',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'success' | 'warning'>('all');

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notification.read;
    return notification.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const successCount = notifications.filter((n) => n.type === 'success').length;
  const warningCount = notifications.filter((n) => n.type === 'warning').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Notifications" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">Unread</p>
              <p className="text-3xl font-bold text-red-900">{unreadCount}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">Success</p>
              <p className="text-3xl font-bold text-green-900">{successCount}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-700">Warnings</p>
              <p className="text-3xl font-bold text-yellow-900">{warningCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filterType === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filterType === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('success')}
            >
              Success
            </Button>
            <Button
              variant={filterType === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('warning')}
            >
              Warnings
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll} className="text-red-600">
              Clear All
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition hover:shadow-md ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <Badge className={getTypeBadgeColor(notification.type)}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </span>
                        {!notification.read && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            <MessageSquare className="w-3 h-3" />
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No notifications found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
