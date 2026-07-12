'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, AlertCircle, FileText, Clock, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function HomeworkPage() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId') || '1';

  // Mock data - replace with actual API calls
  const childName = 'Sarah Johnson';

  const pendingHomework = [
    {
      id: 1,
      subject: 'English',
      title: 'Essay on "The Great Gatsby"',
      description: 'Write a 500-word essay analyzing the themes of the American Dream in the novel.',
      dueDate: '2024-06-10',
      status: 'pending',
      teacher: 'Mrs. Smith',
      instructions: 'Submit in PDF format',
    },
    {
      id: 2,
      subject: 'Mathematics',
      title: 'Chapter 5 - Problem Set',
      description: 'Solve problems 1-15 from Chapter 5: Quadratic Equations',
      dueDate: '2024-06-08',
      status: 'pending',
      teacher: 'Mr. Johnson',
      instructions: 'Show all working steps',
    },
    {
      id: 3,
      subject: 'Science',
      title: 'Lab Report - Photosynthesis Experiment',
      description: 'Complete the lab report and include observations and conclusions.',
      dueDate: '2024-06-12',
      status: 'pending',
      teacher: 'Dr. Williams',
      instructions: 'Include diagrams and data tables',
    },
    {
      id: 4,
      subject: 'History',
      title: 'Timeline Creation',
      description: 'Create a visual timeline of World War II major events.',
      dueDate: '2024-06-09',
      status: 'pending',
      teacher: 'Ms. Brown',
      instructions: 'Use poster board or digital format',
    },
  ];

  const completedHomework = [
    {
      id: 5,
      subject: 'Geography',
      title: 'Map Labeling - South Asia',
      description: 'Label countries, capitals, and major rivers on the South Asia map.',
      dueDate: '2024-06-05',
      submittedDate: '2024-06-04',
      status: 'completed',
      teacher: 'Mr. Davis',
      feedback: 'Well done! Very accurate labeling.',
    },
    {
      id: 6,
      subject: 'English',
      title: 'Short Story Review',
      description: 'Read and review the provided short story.',
      dueDate: '2024-06-03',
      submittedDate: '2024-06-02',
      status: 'completed',
      teacher: 'Mrs. Smith',
      feedback: 'Great insights and analysis!',
    },
  ];

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date('2024-06-07');
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyBadge = (dueDate: string) => {
    const daysLeft = getDaysUntilDue(dueDate);
    if (daysLeft <= 1) return { label: 'Due Today/Tomorrow', color: 'bg-red-100 text-red-800' };
    if (daysLeft <= 3) return { label: 'Due Soon', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Homework" subtitle={childName} />

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{pendingHomework.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedHomework.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">Overdue</p>
                <p className="text-3xl font-bold text-red-600">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Homework */}
        {pendingHomework.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Pending Homework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingHomework.map((hw) => (
                <div key={hw.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{hw.subject}</Badge>
                        <Badge className={getUrgencyBadge(hw.dueDate).color}>
                          {getUrgencyBadge(hw.dueDate).label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">{hw.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Due: {hw.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{getDaysUntilDue(hw.dueDate)} days remaining</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-900">{hw.teacher}</span> • {hw.instructions}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Homework */}
        {completedHomework.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Completed Homework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedHomework.map((hw) => (
                <div
                  key={hw.id}
                  className="p-4 border border-green-200 rounded-lg bg-green-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{hw.subject}</Badge>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">{hw.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Due: {hw.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Submitted: {hw.submittedDate}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border border-green-200">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">Teacher Feedback:</span>
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{hw.feedback}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {pendingHomework.length === 0 && completedHomework.length === 0 && (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-600 font-medium mb-2">No homework assigned</p>
                <p className="text-sm text-gray-500">Check back later for new assignments</p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
