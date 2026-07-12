'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Award, AlertCircle, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function AcademicsPage() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId') || '1';

  // Mock data - replace with actual API calls
  const childInfo = {
    name: 'Sarah Johnson',
    grade: 'Grade 10',
    section: 'A',
    academicYear: '2023-2024',
    gpa: 8.7,
  };

  const subjects = [
    { id: 1, name: 'English', grade: 'A', marks: 92, outOf: 100, teacher: 'Mrs. Smith' },
    { id: 2, name: 'Mathematics', grade: 'A', marks: 95, outOf: 100, teacher: 'Mr. Johnson' },
    { id: 3, name: 'Science', grade: 'A', marks: 88, outOf: 100, teacher: 'Dr. Williams' },
    { id: 4, name: 'History', grade: 'B', marks: 82, outOf: 100, teacher: 'Ms. Brown' },
    { id: 5, name: 'Geography', grade: 'A', marks: 85, outOf: 100, teacher: 'Mr. Davis' },
    { id: 6, name: 'Physical Education', grade: 'A', marks: 90, outOf: 100, teacher: 'Coach Miller' },
  ];

  const termResults = [
    { term: 'Term 1', percentage: 89, status: 'Excellent', date: 'March 2024' },
    { term: 'Term 2', percentage: 91, status: 'Excellent', date: 'June 2024' },
  ];

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
    };
    return colors[grade as keyof typeof colors] || colors['C'];
  };

  const getPerformanceStatus = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { label: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 70) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Academic Progress" subtitle={`${childInfo.name} - ${childInfo.grade}`} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button className="gap-2 w-full md:w-auto">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>

        {/* Overall Performance */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">GPA</p>
                <p className="text-3xl font-bold text-blue-600">{childInfo.gpa}</p>
                <p className="text-xs text-gray-500">Out of 10</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">Average Score</p>
                <p className="text-3xl font-bold text-purple-600">89%</p>
                <p className="text-xs text-gray-500">Across all subjects</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-2">Performance</p>
                <Badge className="bg-green-100 text-green-800 mx-auto">Excellent</Badge>
                <p className="text-xs text-gray-500 mt-2">Term 2</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Term Results */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Term Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {termResults.map((term) => (
                <div key={term.term} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{term.term}</p>
                      <p className="text-sm text-gray-600">{term.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{term.percentage}%</p>
                        <Badge className={`mt-1 ${getPerformanceStatus(term.percentage).color}`}>
                          {getPerformanceStatus(term.percentage).label}
                        </Badge>
                      </div>
                      <div className="w-24 h-24 rounded-full relative flex items-center justify-center bg-gray-100">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="8"
                            strokeDasharray={`${(term.percentage / 100) * 283} 283`}
                            strokeLinecap="round"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                          />
                        </svg>
                        <span className="absolute text-sm font-bold text-gray-900">{term.percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                      <p className="text-sm text-gray-600">{subject.teacher}</p>
                    </div>
                    <Badge className={getGradeColor(subject.grade)}>{subject.grade}</Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Marks</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {subject.marks} / {subject.outOf}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${(subject.marks / subject.outOf) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    {Math.round((subject.marks / subject.outOf) * 100)}%
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Note:</span> Contact the teacher for detailed feedback and suggestions for improvement.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
