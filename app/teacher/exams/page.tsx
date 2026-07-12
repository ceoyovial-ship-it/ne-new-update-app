'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Calendar, Clock, Users, BookOpen } from 'lucide-react';

const examsData = [
  {
    id: 1,
    title: 'Midterm Examination - Mathematics',
    class: 'Class 10-A',
    subject: 'Mathematics',
    examDate: '2024-12-20',
    startTime: '09:00',
    duration: '3 hours',
    totalMarks: 100,
    totalStudents: 45,
    submittedMarks: 32,
    description: 'Comprehensive midterm exam covering chapters 1-6.',
  },
  {
    id: 2,
    title: 'Unit Test 2 - Science',
    class: 'Class 10-B',
    subject: 'Science',
    examDate: '2024-12-18',
    startTime: '10:30',
    duration: '2 hours',
    totalMarks: 80,
    totalStudents: 43,
    submittedMarks: 43,
    description: 'Unit test covering physics and chemistry concepts.',
  },
  {
    id: 3,
    title: 'Final Exam - English',
    class: 'Class 9-A',
    subject: 'English',
    examDate: '2024-12-25',
    startTime: '11:00',
    duration: '2.5 hours',
    totalMarks: 100,
    totalStudents: 40,
    submittedMarks: 0,
    description: 'Final examination covering entire year curriculum.',
  },
];

export default function ExamsPage() {
  const [showForm, setShowForm] = useState(false);
  const [exams, setExams] = useState(examsData);
  const [formData, setFormData] = useState({
    title: '',
    class: 'Class 10-A',
    subject: '',
    examDate: '',
    startTime: '',
    duration: '',
    totalMarks: '',
    description: '',
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
    if (formData.title && formData.examDate && formData.subject) {
      const newExam = {
        id: exams.length + 1,
        ...formData,
        totalMarks: parseInt(formData.totalMarks) || 100,
        totalStudents: 45,
        submittedMarks: 0,
      };
      setExams([...exams, newExam]);
      setFormData({
        title: '',
        class: 'Class 10-A',
        subject: '',
        examDate: '',
        startTime: '',
        duration: '',
        totalMarks: '',
        description: '',
      });
      setShowForm(false);
    }
  };

  const handleDelete = (id: number) => {
    setExams(exams.filter((e) => e.id !== id));
  };

  const isUpcoming = (examDate: string) => new Date(examDate) > new Date();
  const isToday = (examDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return examDate === today;
  };

  const getExamStatus = (examDate: string, submittedMarks: number, totalStudents: number) => {
    if (submittedMarks === totalStudents) {
      return 'Completed';
    } else if (submittedMarks > 0) {
      return 'In Progress';
    } else if (isUpcoming(examDate)) {
      return 'Upcoming';
    } else {
      return 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Exam Management" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900">{exams.length}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700">Upcoming</p>
              <p className="text-3xl font-bold text-blue-900">
                {exams.filter((e) => isUpcoming(e.examDate)).length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-3xl font-bold text-green-900">
                {exams.filter((e) => e.submittedMarks === e.totalStudents).length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-sm text-purple-700">Total Marks</p>
              <p className="text-3xl font-bold text-purple-900">
                {exams.reduce((sum, e) => sum + (typeof e.totalMarks === 'number' ? e.totalMarks : parseInt(e.totalMarks || '0')), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Exam Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Exam</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Midterm Examination"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Class 10-A</option>
                      <option>Class 10-B</option>
                      <option>Class 9-A</option>
                      <option>Class 9-B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                    <Input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                    <Input
                      type="date"
                      name="examDate"
                      value={formData.examDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <Input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <Input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 hours"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter exam details, instructions, etc."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Create Exam
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
              Create Exam
            </Button>
          </div>
        )}

        {/* Exams List */}
        <div className="space-y-4">
          {exams.map((exam) => {
            const status = getExamStatus(exam.examDate, exam.submittedMarks, exam.totalStudents);
            const statusColor = {
              Completed: 'bg-green-100 text-green-800',
              'In Progress': 'bg-blue-100 text-blue-800',
              Upcoming: 'bg-yellow-100 text-yellow-800',
              Pending: 'bg-gray-100 text-gray-800',
            }[status] || 'bg-gray-100 text-gray-800';

            return (
              <Card key={exam.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{exam.subject}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Badge variant="outline">{exam.class}</Badge>
                          <Badge className={statusColor}>{status}</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{exam.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(exam.examDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {exam.startTime} ({exam.duration})
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          {exam.totalStudents} Students
                        </div>
                        <div className="text-gray-600 font-semibold">
                          Marks: {exam.submittedMarks}/{exam.totalMarks}
                        </div>
                      </div>

                      {exam.submittedMarks > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Marks Submitted</span>
                            <span className="font-semibold">
                              {Math.round((exam.submittedMarks / exam.totalStudents) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${(exam.submittedMarks / exam.totalStudents) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
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
                        onClick={() => handleDelete(exam.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
