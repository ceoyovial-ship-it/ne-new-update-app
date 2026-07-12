'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, Eye, Download, Archive } from 'lucide-react';
import { useState } from 'react';

export default function NoticesPage() {
  const [filterType, setFilterType] = useState('all');

  // Mock data - replace with actual API calls
  const notices = [
    {
      id: 1,
      title: 'Annual Sports Day - June 15, 2024',
      type: 'event',
      date: '2024-06-07',
      category: 'Event',
      priority: 'high',
      content: 'Our school is organizing the Annual Sports Day on June 15, 2024. All students are encouraged to participate in various sporting events. Participation forms are available at the school office.',
      attachments: [{ name: 'Sports_Day_Schedule.pdf', url: '#' }],
      read: false,
    },
    {
      id: 2,
      title: 'Mid-Term Examination Schedule Released',
      type: 'academic',
      date: '2024-06-06',
      category: 'Academic',
      priority: 'high',
      content: 'The mid-term examination schedule has been released. Students are requested to prepare well and report 15 minutes before the exam starts.',
      attachments: [
        { name: 'Exam_Schedule.pdf', url: '#' },
        { name: 'Hall_Ticket.pdf', url: '#' },
      ],
      read: true,
    },
    {
      id: 3,
      title: 'Holiday Announcement - Summer Vacation',
      type: 'holiday',
      date: '2024-06-05',
      category: 'Holiday',
      priority: 'medium',
      content: 'Summer vacation will commence from June 20, 2024, and school will reopen on July 15, 2024. We wish you a wonderful holiday!',
      attachments: [],
      read: true,
    },
    {
      id: 4,
      title: 'Parent-Teacher Conference Scheduled',
      type: 'meeting',
      date: '2024-06-04',
      category: 'Meeting',
      priority: 'high',
      content: 'We are scheduling parent-teacher conferences for June 10-12, 2024. Please register your preferred time slot at the school office.',
      attachments: [{ name: 'PTC_Schedule.pdf', url: '#' }],
      read: false,
    },
    {
      id: 5,
      title: 'Fee Payment Reminder',
      type: 'fees',
      date: '2024-06-03',
      category: 'Fees',
      priority: 'medium',
      content: 'Please ensure that your fees are paid by June 30, 2024. Late payment will attract a fine of ₹500 per day.',
      attachments: [],
      read: true,
    },
    {
      id: 6,
      title: 'School Closure - Teacher Training Day',
      type: 'holiday',
      date: '2024-06-02',
      category: 'Holiday',
      priority: 'medium',
      content: 'School will remain closed on June 20, 2024, for teacher training and development. This is a mandatory working day for all staff.',
      attachments: [],
      read: true,
    },
    {
      id: 7,
      title: 'New Science Lab Inauguration',
      type: 'event',
      date: '2024-06-01',
      category: 'Event',
      priority: 'low',
      content: 'We are delighted to announce the inauguration of our new Science Laboratory on June 10, 2024. All parents are invited to attend the ceremony.',
      attachments: [{ name: 'Lab_Inauguration_Invite.pdf', url: '#' }],
      read: true,
    },
  ];

  const filteredNotices = filterType === 'all'
    ? notices
    : notices.filter(notice => notice.type === filterType);

  const unreadCount = notices.filter(n => !n.read).length;

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return variants[priority as keyof typeof variants] || variants.low;
  };

  const getCategoryColor = (type: string) => {
    const colors = {
      event: 'bg-purple-100 text-purple-800',
      academic: 'bg-blue-100 text-blue-800',
      holiday: 'bg-green-100 text-green-800',
      meeting: 'bg-orange-100 text-orange-800',
      fees: 'bg-red-100 text-red-800',
    };
    return colors[type as keyof typeof colors] || colors.event;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="School Notices" subtitle={`${unreadCount > 0 ? `${unreadCount} new` : 'All'} notice${unreadCount !== 1 ? 's' : ''}`} />

      <main className="container mx-auto px-4 py-8">
        {/* Filter Buttons */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                All Notices
              </Button>
              <Button
                variant={filterType === 'event' ? 'default' : 'outline'}
                onClick={() => setFilterType('event')}
              >
                Events
              </Button>
              <Button
                variant={filterType === 'academic' ? 'default' : 'outline'}
                onClick={() => setFilterType('academic')}
              >
                Academic
              </Button>
              <Button
                variant={filterType === 'holiday' ? 'default' : 'outline'}
                onClick={() => setFilterType('holiday')}
              >
                Holidays
              </Button>
              <Button
                variant={filterType === 'meeting' ? 'default' : 'outline'}
                onClick={() => setFilterType('meeting')}
              >
                Meetings
              </Button>
              <Button
                variant={filterType === 'fees' ? 'default' : 'outline'}
                onClick={() => setFilterType('fees')}
              >
                Fees
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className={`hover:shadow-md transition-shadow ${!notice.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(notice.type)}>
                        {notice.category}
                      </Badge>
                      <Badge className={getPriorityBadge(notice.priority)}>
                        {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)} Priority
                      </Badge>
                      {!notice.read && (
                        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          New
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{notice.title}</h3>

                    <p className="text-sm text-gray-600 mb-3">{notice.content}</p>

                    {notice.attachments.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 rounded">
                        <p className="text-xs font-medium text-gray-700 mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {notice.attachments.map((attachment, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="text-xs gap-1"
                            >
                              <Download className="w-3 h-3" />
                              {attachment.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{notice.date}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Archive className="w-4 h-4" />
                          <span className="hidden sm:inline">Archive</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotices.length === 0 && (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Bell className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-600 font-medium mb-2">No notices found</p>
                <p className="text-sm text-gray-500">Check back later for updates</p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
