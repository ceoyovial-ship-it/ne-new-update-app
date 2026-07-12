'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Award, TrendingUp, Target, Trophy } from 'lucide-react';

interface MarkEntry {
  id: string;
  exam_id: string;
  marks_obtained: number | null;
  grade: string | null;
  rank_in_class: number | null;
  is_absent: boolean;
  remarks: string | null;
  exam: {
    name: string;
    exam_type: string;
    total_marks: number;
    passing_marks: number;
    exam_date: string;
    subject: { name: string } | null;
  } | null;
}

export default function StudentMarksPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    averagePercentage: 0,
    highestMarks: 0,
    classRank: '-',
  });

  useEffect(() => {
    if (user?.student) {
      fetchMarks();
    }
  }, [user]);

  const fetchMarks = async () => {
    if (!user?.student) return;

    setLoading(true);

    const { data } = await supabase
      .from('marks')
      .select(`
        *,
        exam:exams(
          name,
          exam_type,
          total_marks,
          passing_marks,
          exam_date,
          subject:subjects(name)
        )
      `)
      .eq('student_id', user.student.id)
      .order('created_at', { ascending: false });

    if (data) {
      setMarks(data);

      const validMarks = data.filter(m => m.exam && m.marks_obtained !== null && !m.is_absent);
      const totalExams = validMarks.length;
      const totalObtained = validMarks.reduce((acc, m) => acc + (m.marks_obtained || 0), 0);
      const totalMax = validMarks.reduce((acc, m) => acc + (m.exam?.total_marks || 0), 0);
      const avgPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      const highest = validMarks.length > 0
        ? Math.max(...validMarks.map(m => (m.marks_obtained || 0) / (m.exam?.total_marks || 1) * 100))
        : 0;

      setStats({
        totalExams,
        averagePercentage: avgPercentage,
        highestMarks: Math.round(highest),
        classRank: data[0]?.rank_in_class?.toString() || '-',
      });
    }

    setLoading(false);
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    const colors: Record<string, string> = {
      'A+': 'bg-green-100 text-green-700',
      'A': 'bg-green-100 text-green-600',
      'B+': 'bg-blue-100 text-blue-700',
      'B': 'bg-blue-100 text-blue-600',
      'C+': 'bg-yellow-100 text-yellow-700',
      'C': 'bg-yellow-100 text-yellow-600',
      'D': 'bg-orange-100 text-orange-600',
      'F': 'bg-red-100 text-red-600',
    };
    return colors[grade] || 'bg-gray-100 text-gray-600';
  };

  const getPercentage = (mark: MarkEntry) => {
    if (!mark.exam || mark.is_absent || mark.marks_obtained === null) return 0;
    return Math.round((mark.marks_obtained / mark.exam.total_marks) * 100);
  };

  const getStatusColor = (mark: MarkEntry) => {
    if (mark.is_absent) return 'text-gray-400';
    const percentage = getPercentage(mark);
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-30">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Marks & Grades</h1>
            <p className="text-sm text-muted-foreground">View your exam performance</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exams Taken</p>
                  <p className="text-2xl font-bold">{stats.totalExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average</p>
                  <p className="text-2xl font-bold">{stats.averagePercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-2xl font-bold">{stats.highestMarks}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class Rank</p>
                  <p className="text-2xl font-bold">{stats.classRank}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
            <CardDescription>Your performance across all examinations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : marks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No marks recorded yet</p>
                <p className="text-sm">Your exam results will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Rank</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.map((mark) => (
                      <TableRow key={mark.id}>
                        <TableCell className="font-medium">
                          {mark.exam?.name || '-'}
                          <span className="block text-xs text-muted-foreground">
                            {mark.exam?.exam_type?.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>{mark.exam?.subject?.name || '-'}</TableCell>
                        <TableCell>
                          {mark.exam?.exam_date
                            ? new Date(mark.exam.exam_date).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {mark.is_absent ? (
                            <span className="text-gray-400">Absent</span>
                          ) : (
                            <span className={getStatusColor(mark)}>
                              {mark.marks_obtained} / {mark.exam?.total_marks}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {mark.is_absent ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span className={`font-semibold ${getStatusColor(mark)}`}>
                              {getPercentage(mark)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getGradeColor(mark.grade)}>
                            {mark.grade || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {mark.rank_in_class ? (
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              #{mark.rank_in_class}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
