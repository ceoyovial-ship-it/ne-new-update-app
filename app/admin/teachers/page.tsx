'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  classes: string;
  status: string;
  phone: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Teachers Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teacher List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading teachers...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Classes</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No teachers found
                        </td>
                      </tr>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{teacher.subject}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{teacher.classes}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{teacher.phone}</td>
                          <td className="px-6 py-4 text-sm">
                            <Badge className={getStatusColor(teacher.status)}>
                              {teacher.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{teachers.length}</div>
                <p className="text-gray-600 mt-2">Total Teachers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {teachers.filter(t => t.status === 'active').length}
                </div>
                <p className="text-gray-600 mt-2">Active Teachers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(teachers.map(t => t.subject)).size}
                </div>
                <p className="text-gray-600 mt-2">Subjects</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
