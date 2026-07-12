'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Exam, Mark } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Calendar,
  Clock,
  Award,
  FileText,
  Download,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface ExamWithDetails extends Exam {
  subject?: { name: string };
  marks?: Mark[];
}

export default function StudentExams() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamWithDetails[]>([]);
  const [hallTicket, setHallTicket] = useState<{ hall_number: string; seat_number: string } | null>(null);

  useEffect(() => {
    if (user?.student) {
      fetchExams();
    }
  }, [user]);

  const fetchExams = async () => {
    if (!user?.student) return;

    setLoading(true);

    const { data } = await supabase
      .from('exams')
      .select(`
        *,
        subject:subjects(name)
      `)
      .eq('class_id', user.student.class_id)
      .eq('is_published', true)
      .order('exam_date', { ascending: true });

    if (data) {
      setExams(data);
    }

    setLoading(false);
  };

  const getExamTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      unit_test: 'bg-blue-100 text-blue-700',
      mid_term: 'bg-purple-100 text-purple-700',
      final: 'bg-red-100 text-red-700',
      practical: 'bg-green-100 text-green-700',
      internal: 'bg-yellow-100 text-yellow-700',
      olympiad: 'bg-accent text-accent-foreground',
    };
    return styles[type] || 'bg-muted';
  };

  const upcomingExams = exams.filter(e => e.exam_date && new Date(e.exam_date) >= new Date());
  const pastExams = exams.filter(e => e.exam_date && new Date(e.exam_date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <Header title="Examinations" subtitle="Exam schedules and results" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Exams</p>
                  <p className="text-2xl font-bold">{exams.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-orange-600">{upcomingExams.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{pastExams.length}</p>
                </div>
                <Award className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hall Ticket</p>
                  <p className="text-2xl font-bold">
                    {hallTicket ? 'Ready' : 'N/A'}
                  </p>
                </div>
                <Download className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingExams.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({pastExams.length})
            </TabsTrigger>
            <TabsTrigger value="all">All Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingExams.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming exams</p>
                </CardContent>
              </Card>
            ) : (
              upcomingExams.map((exam) => (
                <Card key={exam.id} className="card-hover">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-lg p-3">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{exam.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getExamTypeBadge(exam.exam_type)}>
                              {exam.exam_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {exam.subject && (
                              <Badge variant="outline">{exam.subject.name}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end gap-2 text-sm">
                        {exam.exam_date && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(exam.exam_date), 'EEEE, MMMM d, yyyy')}
                          </div>
                        )}
                        {exam.start_time && exam.end_time && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {exam.start_time} - {exam.end_time}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award className="h-4 w-4" />
                          Total: {exam.total_marks} | Pass: {exam.passing_marks}
                        </div>
                      </div>
                    </div>
                    {exam.syllabus_covered && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Syllabus Covered</p>
                        <p className="text-sm text-muted-foreground">{exam.syllabus_covered}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed">
            <Card className="card-hover">
              <CardContent className="pt-6">
                {pastExams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No completed exams yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Marks</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {exam.name}
                              <Badge variant="outline" className="text-xs">
                                {exam.exam_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{exam.subject?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {exam.exam_date ? format(new Date(exam.exam_date), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">{exam.total_marks}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">
                              Completed
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total Marks</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => {
                      const isUpcoming = exam.exam_date && new Date(exam.exam_date) >= new Date();
                      return (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.name}</TableCell>
                          <TableCell>
                            <Badge className={getExamTypeBadge(exam.exam_type)}>
                              {exam.exam_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{exam.subject?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {exam.exam_date ? format(new Date(exam.exam_date), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">{exam.total_marks}</TableCell>
                          <TableCell>
                            {isUpcoming ? (
                              <Badge variant="secondary">Upcoming</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">Completed</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
