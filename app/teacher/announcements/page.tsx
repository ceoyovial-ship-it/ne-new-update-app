'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Eye, Edit2, Calendar, Users } from 'lucide-react';

const announcementsData = [
  {
    id: 1,
    title: 'Midterm Examination Schedule',
    class: 'All Classes',
    content:
      'The midterm examination will begin from December 18th. Please ensure all students are prepared with required study materials and books.',
    createdDate: '2024-12-10',
    views: 234,
    recipients: 'All Students & Parents',
  },
  {
    id: 2,
    title: 'Class 10-A Mathematics Lab Session',
    class: 'Class 10-A',
    content: 'Practical geometry session scheduled for tomorrow at 2:00 PM in Lab Room 3. Compasses and protractors are mandatory.',
    createdDate: '2024-12-09',
    views: 45,
    recipients: '45 Students',
  },
  {
    id: 3,
    title: 'Science Project Submission Deadline Extended',
    class: 'Class 10-B',
    content: 'The deadline for science project submission has been extended to December 25th. Late submissions will not be accepted after this date.',
    createdDate: '2024-12-08',
    views: 67,
    recipients: '43 Students',
  },
  {
    id: 4,
    title: 'Annual Sports Day - Practice Schedule',
    class: 'Class 9-A',
    content: 'Practice sessions for annual sports day will be held every Saturday from 3:00 PM to 5:00 PM. Participation is mandatory for all students.',
    createdDate: '2024-12-07',
    views: 89,
    recipients: '40 Students',
  },
];

export default function AnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);
  const [announcements, setAnnouncements] = useState(announcementsData);
  const [formData, setFormData] = useState({
    title: '',
    class: 'All Classes',
    content: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.content) {
      const newAnnouncement = {
        id: announcements.length + 1,
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        views: 0,
        recipients: formData.class === 'All Classes' ? 'All Students & Parents' : '45 Students',
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setFormData({
        title: '',
        class: 'All Classes',
        content: '',
      });
      setShowForm(false);
    }
  };

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const totalViews = announcements.reduce((sum, a) => sum + a.views, 0);
  const avgViews = announcements.length > 0 ? Math.round(totalViews / announcements.length) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Announcements" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Announcements</p>
              <p className="text-3xl font-bold text-gray-900">{announcements.length}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700">Total Views</p>
              <p className="text-3xl font-bold text-blue-900">{totalViews}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">Average Views</p>
              <p className="text-3xl font-bold text-green-900">{avgViews}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-sm text-purple-700">This Week</p>
              <p className="text-3xl font-bold text-purple-900">{announcements.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Announcement Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Important Notice for All Students"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Class</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>All Classes</option>
                      <option>Class 10-A</option>
                      <option>Class 10-B</option>
                      <option>Class 9-A</option>
                      <option>Class 9-B</option>
                      <option>All Class 10</option>
                      <option>All Class 9</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Announcement</label>
                  <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your announcement here..."
                    rows={6}
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    This announcement will be visible to {formData.class === 'All Classes' ? 'all' : 'selected'} students and
                    their parents. They will receive notifications.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Publish Announcement
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        {!showForm && (
          <div className="mb-6">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Announcement
            </Button>
          </div>
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline">{announcement.class}</Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mt-3 leading-relaxed">{announcement.content}</p>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.createdDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {announcement.views} Views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {announcement.recipients}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
