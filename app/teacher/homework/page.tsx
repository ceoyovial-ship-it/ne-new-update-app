'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Calendar, Users } from 'lucide-react';

const homeworkData = [
  {
    id: 1,
    title: 'Chapter 5 - Quadratic Equations Exercise',
    class: 'Class 10-A',
    description: 'Solve all problems from exercise 5.1 to 5.4. Submit before 9 AM tomorrow.',
    dueDate: '2024-12-15',
    subject: 'Mathematics',
    students: 45,
  },
  {
    id: 2,
    title: 'Properties of Matter - Observations',
    class: 'Class 10-B',
    description: 'Complete the practical observations on states of matter from the lab manual.',
    dueDate: '2024-12-16',
    subject: 'Science',
    students: 43,
  },
  {
    id: 3,
    title: 'Essay Writing - "Technology and Society"',
    class: 'Class 9-A',
    description: 'Write a 500-word essay on the impact of technology on modern society.',
    dueDate: '2024-12-20',
    subject: 'English',
    students: 40,
  },
];

export default function HomeworkPage() {
  const [showForm, setShowForm] = useState(false);
  const [homeworks, setHomeworks] = useState(homeworkData);
  const [formData, setFormData] = useState({
    title: '',
    class: 'Class 10-A',
    description: '',
    dueDate: '',
    subject: '',
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
    if (formData.title && formData.dueDate && formData.subject) {
      const newHomework = {
        id: homeworks.length + 1,
        ...formData,
        students: 45,
      };
      setHomeworks([...homeworks, newHomework]);
      setFormData({
        title: '',
        class: 'Class 10-A',
        description: '',
        dueDate: '',
        subject: '',
      });
      setShowForm(false);
    }
  };

  const handleDelete = (id: number) => {
    setHomeworks(homeworks.filter((hw) => hw.id !== id));
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  const isDueSoon = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Homework Management" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Homework</p>
              <p className="text-3xl font-bold text-gray-900">{homeworks.length}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">Active</p>
              <p className="text-3xl font-bold text-green-900">
                {homeworks.filter((hw) => !isOverdue(hw.dueDate)).length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700">Due Soon</p>
              <p className="text-3xl font-bold text-red-900">
                {homeworks.filter((hw) => isDueSoon(hw.dueDate)).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Homework Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Homework</CardTitle>
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
                      placeholder="e.g., Chapter 5 Exercise"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <Input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
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
                    placeholder="Enter homework details..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Create Homework
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
              Create Homework
            </Button>
          </div>
        )}

        {/* Homework List */}
        <div className="space-y-4">
          {homeworks.map((hw) => (
            <Card key={hw.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{hw.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{hw.subject}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {isOverdue(hw.dueDate) && <Badge variant="destructive">Overdue</Badge>}
                        {isDueSoon(hw.dueDate) && !isOverdue(hw.dueDate) && (
                          <Badge className="bg-yellow-500">Due Soon</Badge>
                        )}
                        <Badge variant="outline">{hw.class}</Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{hw.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {hw.students} Students
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(hw.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
