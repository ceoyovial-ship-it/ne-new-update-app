'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Homework, HomeworkSubmission } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Calendar,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface HomeworkWithDetails extends Homework {
  subject?: { name: string };
  submissions?: HomeworkSubmission[];
}

export default function StudentHomework() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState<HomeworkWithDetails[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkWithDetails | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');

  useEffect(() => {
    if (user?.student) {
      fetchHomework();
    }
  }, [user]);

  const fetchHomework = async () => {
    if (!user?.student) return;

    setLoading(true);

    // Fetch homework for student's class
    const { data: hwData } = await supabase
      .from('homework')
      .select(`
        *,
        subject:subjects(name)
      `)
      .eq('class_id', user.student.class_id)
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (hwData) {
      setHomework(hwData);
    }

    // Fetch student's submissions
    const { data: subData } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('student_id', user.student.id);

    if (subData) {
      setSubmissions(subData);
    }

    setLoading(false);
  };

  const getSubmission = (hwId: string) => {
    return submissions.find(s => s.homework_id === hwId);
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  const getDaysRemaining = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleSubmit = async () => {
    if (!selectedHomework || !user?.student) return;
    if (!submissionContent.trim()) {
      toast.error('Please add content to your submission');
      return;
    }

    const { error } = await supabase.from('homework_submissions').insert({
      homework_id: selectedHomework.id,
      student_id: user.student.id,
      content: submissionContent,
      status: 'submitted',
    });

    if (error) {
      toast.error('Failed to submit homework');
    } else {
      toast.success('Homework submitted successfully!');
      setSubmitDialogOpen(false);
      setSubmissionContent('');
      fetchHomework();
    }
  };

  const pendingHomework = homework.filter(hw => !getSubmission(hw.id));
  const submittedHomework = homework.filter(hw => getSubmission(hw.id));

  return (
    <div className="min-h-screen bg-background">
      <Header title="Homework" subtitle="Your assignments and submissions" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{homework.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingHomework.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-bold text-green-600">{submittedHomework.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {pendingHomework.filter(hw => isOverdue(hw.due_date)).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending ({pendingHomework.length})
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({submittedHomework.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({homework.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingHomework.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>All homework submitted! Great job!</p>
                </CardContent>
              </Card>
            ) : (
              pendingHomework.map((hw) => {
                const overdue = isOverdue(hw.due_date);
                const daysRemaining = getDaysRemaining(hw.due_date);

                return (
                  <Card key={hw.id} className={`card-hover ${overdue ? 'border-red-200 bg-red-50/50' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {hw.title}
                            {overdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {hw.subject?.name} - Max marks: {hw.max_marks}
                          </CardDescription>
                        </div>
                        <Dialog open={submitDialogOpen && selectedHomework?.id === hw.id} onOpenChange={(open) => {
                          setSubmitDialogOpen(open);
                          if (open) setSelectedHomework(hw);
                        }}>
                          <DialogTrigger asChild>
                            <Button disabled={overdue}>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit Homework</DialogTitle>
                              <DialogDescription>
                                {hw.title} - {hw.subject?.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Your Answer</Label>
                                <Textarea
                                  placeholder="Type your answer here..."
                                  value={submissionContent}
                                  onChange={(e) => setSubmissionContent(e.target.value)}
                                  rows={6}
                                />
                              </div>
                              <Button onClick={handleSubmit} className="w-full">
                                Submit Homework
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{hw.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due: {format(new Date(hw.due_date), 'MMM d, yyyy')}
                        </span>
                        {!overdue && (
                          <Badge variant="secondary">
                            {daysRemaining === 0 ? 'Due today' : `${daysRemaining} day(s) left`}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedHomework.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No submitted homework yet</p>
                </CardContent>
              </Card>
            ) : (
              submittedHomework.map((hw) => {
                const submission = getSubmission(hw.id);
                return (
                  <Card key={hw.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{hw.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {hw.subject?.name}
                          </CardDescription>
                        </div>
                        {submission?.marks_obtained !== null && submission?.marks_obtained !== undefined ? (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {submission.marks_obtained}/{hw.max_marks}
                            </p>
                            <p className="text-xs text-muted-foreground">Marks obtained</p>
                          </div>
                        ) : (
                          <Badge>Submitted</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {submission?.teacher_feedback && (
                        <div className="bg-muted/50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium mb-1">Teacher Feedback</p>
                          <p className="text-sm text-muted-foreground">{submission.teacher_feedback}</p>
                        </div>
                      )}
                      {submission?.content && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-1">Your Submission</p>
                          <p className="text-sm text-muted-foreground">{submission.content}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted: {format(new Date(submission?.submitted_at || new Date()), 'MMM d, yyyy h:mm a')}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {homework.map((hw) => {
              const submission = getSubmission(hw.id);
              const overdue = isOverdue(hw.due_date) && !submission;

              return (
                <Card key={hw.id} className={`card-hover ${overdue ? 'border-red-200 bg-red-50/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{hw.title}</CardTitle>
                        <CardDescription>{hw.subject?.name}</CardDescription>
                      </div>
                      {submission ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Submitted
                        </Badge>
                      ) : overdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{hw.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(hw.due_date), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
