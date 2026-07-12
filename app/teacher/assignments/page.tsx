'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const assignmentsData = [
  {
    id: 1,
    title: 'Research Project - Climate Change',
    class: 'Class 10-A',
    description: 'Create a comprehensive research report on climate change impact on agriculture.',
    dueDate: '2024-12-30',
    submissionCount: 32,
    totalStudents: 45,
    status: 'active',
  },
  {
    id: 2,
    title: 'Group Presentation - Indian Independence Movement',
    class: 'Class 10-B',
    description: 'Prepare a 15-minute group presentation on key figures and events.',
    dueDate: '2024-12-22',
    submissionCount: 38,
    totalStudents: 43,
    status: 'active',
  },
  {
    id: 3,
    title: 'Creative Writing - Short Story',
    class: 'Class 9-A',
    description: 'Write an original short story with minimum 1000 words.',
    dueDate: '2024-12-18',
    submissionCount: 40,
    totalStudents: 40,
    status: 'completed',
  },
];

export default function AssignmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [assignments, setAssignments] = useState(assignmentsData);
  const [formData, setFormData] = useState({
    title: '',
    class: 'Class 10-A',
    description: '',
    dueDate: '',
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
    if (formData.title && formData.dueDate) {
      const newAssignment = {
        id: assignments.length + 1,
        ...formData,
        submissionCount: 0,
        totalStudents: 45,
        status: 'active' as const,
      };
      setAssignments([...assignments, newAssignment]);
      setFormData({
        title: '',
        class: 'Class 10-A',
        description: '',
        dueDate: '',
      });
      setShowForm(false);
    }
  };

  const handleDelete = (id: number) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const getSubmissionPercentage = (submission: number, total: number) =>
    Math.round((submission / total) * 100);

  const getStatusIcon = (status: string, submissionCount: number, totalStudents: number) => {
    if (submissionCount === totalStudents) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (submissionCount > 0) {
      return <Clock className="w-5 h-5 text-blue-500" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Assignments" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700">Active</p>
              <p className="text-3xl font-bold text-blue-900">
                {assignments.filter((a) => a.status === 'active').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-3xl font-bold text-green-900">
                {assignments.filter((a) => a.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-sm text-purple-700">Avg Submission</p>
              <p className="text-3xl font-bold text-purple-900">
                {Math.round(
                  assignments.reduce((sum, a) => sum + getSubmissionPercentage(a.submissionCount, a.totalStudents), 0) /
                    assignments.length
                )}
                %
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Assignment Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Research Project"
                      required
                    />
                  </div>

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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter assignment details..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <Input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Create Assignment
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
              Create Assignment
            </Button>
          </div>
        )}

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const percentage = getSubmissionPercentage(assignment.submissionCount, assignment.totalStudents);
            return (
              <Card key={assignment.id} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="mt-1">
                          {getStatusIcon(assignment.status, assignment.submissionCount, assignment.totalStudents)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Badge variant="outline">{assignment.class}</Badge>
                          {assignment.status === 'completed' && <Badge>Completed</Badge>}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Submissions: {assignment.submissionCount}/{assignment.totalStudents}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-3">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
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
                        onClick={() => handleDelete(assignment.id)}
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
