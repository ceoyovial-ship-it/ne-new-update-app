'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Calendar } from 'lucide-react';

const classesData = [
  {
    id: 1,
    name: 'Class 10-A',
    subject: 'Mathematics',
    studentCount: 45,
    schedule: 'Mon, Wed, Fri - 9:00 AM',
    room: 'Room 201',
    academicYear: '2024-2025',
  },
  {
    id: 2,
    name: 'Class 10-B',
    subject: 'Science',
    studentCount: 43,
    schedule: 'Tue, Thu - 10:30 AM',
    room: 'Room 202',
    academicYear: '2024-2025',
  },
  {
    id: 3,
    name: 'Class 9-A',
    subject: 'English',
    studentCount: 40,
    schedule: 'Mon, Wed, Fri - 11:00 AM',
    room: 'Room 301',
    academicYear: '2024-2025',
  },
  {
    id: 4,
    name: 'Class 9-B',
    subject: 'History',
    studentCount: 38,
    schedule: 'Tue, Thu - 2:00 PM',
    room: 'Room 302',
    academicYear: '2024-2025',
  },
];

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Assigned Classes" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <p className="text-3xl font-bold text-gray-900">{classesData.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {classesData.reduce((sum, c) => sum + c.studentCount, 0)}
                  </p>
                </div>
                <Users className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Class Size</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(classesData.reduce((sum, c) => sum + c.studentCount, 0) / classesData.length)}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {classesData.map((cls) => (
            <Card
              key={cls.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedClass === cls.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedClass(cls.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{cls.subject}</p>
                  </div>
                  <Badge variant="default">{cls.academicYear}</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Students
                    </span>
                    <span className="font-semibold text-gray-900">{cls.studentCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </span>
                    <span className="text-sm text-gray-900">{cls.schedule}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Room</span>
                    <span className="font-semibold text-gray-900">{cls.room}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Students
                  </Button>
                  <Button size="sm" className="flex-1">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
