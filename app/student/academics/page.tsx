'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Exam } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { GraduationCap, TrendingUp, Award, BookOpen, Target } from 'lucide-react';

interface MarkWithExam {
  id: string;
  exam_id: string;
  marks_obtained: number | null;
  grade: string | null;
  rank_in_class: number | null;
  is_absent: boolean;
  exam: {
    name: string;
    exam_type: string;
    total_marks: number;
    passing_marks: number;
    subject: { name: string } | null;
  } | null;
}

export default function StudentAcademics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<MarkWithExam[]>([]);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [classRank, setClassRank] = useState<number | null>(null);

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
          subject:subjects(name)
        )
      `)
      .eq('student_id', user.student.id)
      .order('created_at', { ascending: false });

    if (data) {
      const validMarks = data.filter(m => m.exam && m.marks_obtained !== null);
      setMarks(data);
      const total = validMarks.reduce((acc, m) => acc + (m.marks_obtained || 0), 0);
      const maxTotal = validMarks.reduce((acc, m) => acc + (m.exam?.total_marks || 0), 0);
      setOverallPercentage(maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0);
      if (data.length > 0 && data[0].rank_in_class) {
        setClassRank(data[0].rank_in_class);
      }
    }

    setLoading(false);
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-muted-foreground';
    const colors: Record<string, string> = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-50',
      'B': 'text-blue-600 bg-blue-50',
      'C': 'text-yellow-600 bg-yellow-50',
      'D': 'text-orange-600 bg-orange-50',
      'F': 'text-red-600 bg-red-50',
    };
    return colors[grade] || 'text-muted-foreground';
  };

  const subjectWiseData = marks.reduce((acc: any[], m) => {
    if (!m.exam?.subject?.name) return acc;
    const existing = acc.find(s => s.subject === m.exam?.subject?.name);
    const percentage = m.exam.total_marks > 0
      ? ((m.marks_obtained || 0) / m.exam.total_marks) * 100
      : 0;
    if (existing) {
      existing.total += percentage;
      existing.count += 1;
      existing.average = Math.round(existing.total / existing.count);
    } else {
      acc.push({
        subject: m.exam.subject.name,
        average: Math.round(percentage),
        total: percentage,
        count: 1,
      });
    }
    return acc;
  }, []);

  const examTypeData = marks.reduce((acc: { name: string; value: number }[], m) => {
    if (!m.exam?.exam_type) return acc;
    const existing = acc.find(e => e.name === m.exam?.exam_type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: m.exam.exam_type.replace('_', ' ').toUpperCase(), value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Academics" subtitle="View your academic performance" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{overallPercentage}%</div>
              <Progress value={overallPercentage} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" />
                Class Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {classRank ? `#${classRank}` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Out of 35 students</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                Exams Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{marks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">This academic year</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Best Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {subjectWiseData.length > 0
                  ? subjectWiseData.sort((a, b) => b.average - a.average)[0].subject
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Highest average score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Subject-wise Performance Chart */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Subject Performance
              </CardTitle>
              <CardDescription>Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent>
              {subjectWiseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectWiseData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="subject" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                      {subjectWiseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.average >= 75 ? '#22c55e' : entry.average >= 50 ? '#3b82f6' : '#f59e0b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No subject data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exam Distribution */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Exam Distribution</CardTitle>
              <CardDescription>Tests taken by type</CardDescription>
            </CardHeader>
            <CardContent>
              {examTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={examTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {examTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No exam data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Marks Table */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Detailed Marks</CardTitle>
            <CardDescription>All examination results</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unit_test">Unit Tests</TabsTrigger>
                <TabsTrigger value="mid_term">Mid Term</TabsTrigger>
                <TabsTrigger value="final">Final</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right">Obtained</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Rank</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No marks available
                        </TableCell>
                      </TableRow>
                    ) : (
                      marks.map((mark) => {
                        const percentage = mark.exam?.total_marks
                          ? Math.round(((mark.marks_obtained || 0) / mark.exam.total_marks) * 100)
                          : 0;
                        return (
                          <TableRow key={mark.id}>
                            <TableCell className="font-medium">{mark.exam?.name || 'N/A'}</TableCell>
                            <TableCell>{mark.exam?.subject?.name || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              {mark.is_absent ? 'Absent' : mark.marks_obtained}
                            </TableCell>
                            <TableCell className="text-right">{mark.exam?.total_marks}</TableCell>
                            <TableCell className="text-right">
                              <span className={percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-blue-600' : 'text-orange-600'}>
                                {mark.is_absent ? 'N/A' : `${percentage}%`}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getGradeColor(mark.grade)}>
                                {mark.grade || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {mark.rank_in_class ? `#${mark.rank_in_class}` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
