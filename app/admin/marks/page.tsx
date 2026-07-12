'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Plus, Download, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Mark {
  id: string;
  studentName: string;
  studentRoll: string;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
}

interface FilterOptions {
  class: string;
  subject: string;
  exam: string;
}

export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    class: '',
    subject: '',
    exam: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMarks();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      // Fetch classes
      const { data: classData } = await supabase
        .from('classes')
        .select('name')
        .order('name');

      if (classData) {
        setClasses(classData.map(c => c.name));
      }

      // Fetch subjects
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('name')
        .order('name');

      if (subjectData) {
        setSubjects(subjectData.map(s => s.name));
      }

      // Fetch exams
      const { data: examData } = await supabase
        .from('exams')
        .select('name')
        .order('name');

      if (examData) {
        setExams(examData.map(e => e.name));
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const fetchMarks = async () => {
    try {
      setLoading(true);
      let query = supabase.from('marks').select('*');

      if (filters.class) {
        query = query.eq('class', filters.class);
      }
      if (filters.subject) {
        query = query.eq('subject', filters.subject);
      }
      if (filters.exam) {
        query = query.eq('exam', filters.exam);
      }

      const { data, error } = await query.order('studentRoll');

      if (error) throw error;
      setMarks(data || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'bg-green-100 text-green-800';
      case 'B':
      case 'B+':
        return 'bg-blue-100 text-blue-800';
      case 'C':
      case 'C+':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
      case 'D+':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const averageMarks = marks.length > 0
    ? Math.round(
        (marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length) * 10
      ) / 10
    : 0;

  const topPerformer = marks.length > 0
    ? marks.reduce((prev, current) => (prev.percentage > current.percentage) ? prev : current)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Marks Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Marks Entry</h1>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Marks
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
              <select
                value={filters.exam}
                onChange={(e) => setFilters({ ...filters, exam: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Exams</option>
                {exams.map(exam => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{marks.length}</div>
                <p className="text-gray-600 mt-2">Total Records</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getPercentageColor(averageMarks)}`}>
                  {averageMarks}%
                </div>
                <p className="text-gray-600 mt-2">Average Marks</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {marks.filter(m => m.percentage >= 80).length}
                </div>
                <p className="text-gray-600 mt-2">Passed (80%+)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {marks.filter(m => m.percentage < 40).length}
                </div>
                <p className="text-gray-600 mt-2">Failed (&lt;40%)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Marks List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading marks...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Roll No.</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Marks</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Percentage</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Grade</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {marks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No marks found
                        </td>
                      </tr>
                    ) : (
                      marks.map((mark) => (
                        <tr key={mark.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{mark.studentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{mark.studentRoll}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{mark.subjectName}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {mark.marksObtained} / {mark.totalMarks}
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold ${getPercentageColor(mark.percentage)}`}>
                            {mark.percentage}%
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge className={getGradeColor(mark.grade)}>
                              {mark.grade}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performer */}
        {topPerformer && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Student Name</p>
                  <p className="font-bold text-gray-900 text-lg">{topPerformer.studentName}</p>
                  <p className="text-gray-600 text-sm mt-1">{topPerformer.subjectName}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">Score</p>
                  <p className={`font-bold text-3xl ${getPercentageColor(topPerformer.percentage)}`}>
                    {topPerformer.percentage}%
                  </p>
                  <Badge className={`mt-2 ${getGradeColor(topPerformer.grade)}`}>
                    {topPerformer.grade}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
