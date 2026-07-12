'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Exam {
  id: string;
  name: string;
  subject: string;
  class: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  status: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('date');

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    if (filterStatus === 'all') return true;
    return exam.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const upcomingExams = exams.filter(e => e.status === 'upcoming').length;
  const ongoingExams = exams.filter(e => e.status === 'ongoing').length;
  const completedExams = exams.filter(e => e.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Exams Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Exam
            </Button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className="bg-gray-600"
            >
              All Exams
            </Button>
            <Button
              variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filterStatus === 'ongoing' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('ongoing')}
            >
              Ongoing
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{upcomingExams}</div>
                <p className="text-gray-600 mt-2">Upcoming Exams</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{ongoingExams}</div>
                <p className="text-gray-600 mt-2">Ongoing Exams</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{completedExams}</div>
                <p className="text-gray-600 mt-2">Completed Exams</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading exams...</div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No exams found</div>
          ) : (
            filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.name}</h3>
                      <div className="flex flex-wrap gap-3 mb-3">
                        <Badge className="bg-purple-100 text-purple-800">{exam.subject}</Badge>
                        <Badge className="bg-indigo-100 text-indigo-800">{exam.class}</Badge>
                        <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>
                      </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">{formatDate(exam.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">{exam.startTime} - {exam.endTime}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Marks</p>
                      <p className="font-medium text-gray-900">{exam.totalMarks}</p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Calendar View (Mini) */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Exam Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-600 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Calendar view for exam schedule</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                View Full Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
