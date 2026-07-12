'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Plus, Edit2, Trash2, Bell, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  priority: string;
  targetAudience: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = filterPriority === 'all'
    ? announcements
    : announcements.filter(a => a.priority === filterPriority);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'holiday':
        return 'bg-purple-100 text-purple-800';
      case 'academic':
        return 'bg-indigo-100 text-indigo-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const highPriorityCount = announcements.filter(a => a.priority === 'high').length;
  const eventCount = announcements.filter(a => a.category === 'event').length;
  const holidayCount = announcements.filter(a => a.category === 'holiday').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Announcements Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Announcements & Notices</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterPriority === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('all')}
              className="bg-gray-600"
            >
              All Announcements
            </Button>
            <Button
              variant={filterPriority === 'high' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('high')}
            >
              High Priority
            </Button>
            <Button
              variant={filterPriority === 'medium' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('medium')}
            >
              Medium Priority
            </Button>
            <Button
              variant={filterPriority === 'low' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('low')}
            >
              Low Priority
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{announcements.length}</div>
                <p className="text-gray-600 mt-2">Total Announcements</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{highPriorityCount}</div>
                <p className="text-gray-600 mt-2">High Priority</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{eventCount}</div>
                <p className="text-gray-600 mt-2">Events</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{holidayCount}</div>
                <p className="text-gray-600 mt-2">Holidays</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading announcements...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No announcements found</div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className={`hover:shadow-lg transition-shadow border-l-4 ${getPriorityColor(announcement.priority)}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <Bell className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge className={getCategoryColor(announcement.category)}>
                              {announcement.category}
                            </Badge>
                            <Badge className={getPriorityColor(announcement.priority)}>
                              {announcement.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-3 mb-4 leading-relaxed">{announcement.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{announcement.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(announcement.date)}</span>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-gray-100 text-gray-800">
                        For: {announcement.targetAudience}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recent Announcements Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Most Recent</p>
                {announcements.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-900">{announcements[0].title}</p>
                    <p className="text-xs text-gray-600 mt-1">{formatDate(announcements[0].date)}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Priority Distribution</p>
                <div className="space-y-1 text-sm">
                  <p className="text-red-600">High: {announcements.filter(a => a.priority === 'high').length}</p>
                  <p className="text-yellow-600">Medium: {announcements.filter(a => a.priority === 'medium').length}</p>
                  <p className="text-green-600">Low: {announcements.filter(a => a.priority === 'low').length}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Category Distribution</p>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-600">Events: {eventCount}</p>
                  <p className="text-purple-600">Holidays: {holidayCount}</p>
                  <p className="text-indigo-600">Academic: {announcements.filter(a => a.category === 'academic').length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
