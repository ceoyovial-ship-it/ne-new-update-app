'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Plus, Edit2, Trash2, Users, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Class {
  id: string;
  name: string;
  section: string;
  classTeacher: string;
  studentCount: number;
  totalStudents: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityColor = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Classes Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading classes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">No classes found</div>
            ) : (
              classes.map((classItem) => (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {classItem.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Section {classItem.section}</p>
                      </div>
                      <div className="flex gap-2">
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Class Teacher</p>
                      </div>
                      <p className="font-medium text-gray-900">{classItem.classTeacher}</p>
                    </div>

                    <div className={`p-4 rounded-lg ${getCapacityColor(classItem.studentCount, classItem.totalStudents)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        <p className="text-sm font-medium">Student Capacity</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{classItem.studentCount}</span>
                        <span className="text-sm">/ {classItem.totalStudents}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-current h-2 rounded-full"
                          style={{
                            width: `${(classItem.studentCount / classItem.totalStudents) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="outline" className="text-xs">
                        View Students
                      </Button>
                      <Button variant="outline" className="text-xs">
                        Assignments
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
                <p className="text-gray-600 mt-2">Total Classes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                </div>
                <p className="text-gray-600 mt-2">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(
                    (classes.reduce((sum, c) => sum + c.studentCount, 0) /
                      classes.reduce((sum, c) => sum + c.totalStudents, 0)) * 100
                  ) || 0}%
                </div>
                <p className="text-gray-600 mt-2">Occupancy Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {classes.reduce((sum, c) => sum + (c.totalStudents - c.studentCount), 0)}
                </div>
                <p className="text-gray-600 mt-2">Available Seats</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
