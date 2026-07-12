'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

interface Assignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'submitted' | 'pending' | 'overdue';
  submittedDate?: string;
  marks?: number;
  totalMarks: number;
  description: string;
}

const AssignmentsPage = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'pending' | 'overdue'>('all');

  const assignments: Assignment[] = [
    {
      id: '1',
      subject: 'Mathematics',
      title: 'Quadratic Equations Problem Set',
      dueDate: '2026-07-15',
      status: 'pending',
      marks: undefined,
      totalMarks: 50,
      description: 'Solve 20 problems on quadratic equations and inequalities',
    },
    {
      id: '2',
      subject: 'English',
      title: 'Essay on Shakespeare',
      dueDate: '2026-07-20',
      status: 'pending',
      marks: undefined,
      totalMarks: 30,
      description: 'Write a 2000-word essay analyzing Hamlet',
    },
    {
      id: '3',
      subject: 'Science',
      title: 'Physics Lab Report',
      dueDate: '2026-07-10',
      status: 'overdue',
      marks: undefined,
      totalMarks: 40,
      description: 'Complete lab report on electromagnetic induction',
    },
    {
      id: '4',
      subject: 'History',
      title: 'Ancient Civilizations Project',
      dueDate: '2026-07-08',
      status: 'submitted',
      submittedDate: '2026-07-07',
      marks: 28,
      totalMarks: 30,
      description: 'Create a presentation on ancient Egyptian civilization',
    },
    {
      id: '5',
      subject: 'Computer Science',
      title: 'Python Programming Assignment',
      dueDate: '2026-07-12',
      status: 'submitted',
      submittedDate: '2026-07-11',
      marks: 48,
      totalMarks: 50,
      description: 'Implement sorting algorithms and analyze complexity',
    },
  ];

  const filteredAssignments = assignments.filter((assignment) => {
    if (filterStatus === 'all') return true;
    return assignment.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: assignments.length,
    submitted: assignments.filter((a) => a.status === 'submitted').length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    overdue: assignments.filter((a) => a.status === 'overdue').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Assignments" />
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Assignments</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-600">{stats.submitted}</p>
              <p className="text-sm text-gray-600">Submitted</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'submitted', 'pending', 'overdue'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status)}
              className="capitalize whitespace-nowrap"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(assignment.status)}
                      <h3 className="font-semibold text-lg">{assignment.title}</h3>
                      <Badge className={`capitalize ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assignment.subject}</p>
                    <p className="text-sm text-gray-700 mb-3">{assignment.description}</p>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Due Date: </span>
                        <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      {assignment.status === 'submitted' && assignment.submittedDate && (
                        <div>
                          <span className="text-gray-600">Submitted: </span>
                          <span className="font-medium text-green-600">{new Date(assignment.submittedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {assignment.marks !== undefined && (
                        <div>
                          <span className="text-gray-600">Marks: </span>
                          <span className="font-medium">{assignment.marks}/{assignment.totalMarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      View
                    </Button>
                    {assignment.status !== 'submitted' && (
                      <Button size="sm" className="gap-2">
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
