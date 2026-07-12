'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Homework {
  id: string;
  title: string;
  subject: string;
  class: string;
  description: string;
  dueDate: string;
  submissionCount: number;
  totalStudents: number;
  status: string;
}

export default function HomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterHomework();
  }, [filterClass, filterStatus, homework]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch classes
      const { data: classData } = await supabase
        .from('classes')
        .select('name')
        .order('name');

      if (classData) {
        setClasses(['all', ...classData.map(c => c.name)]);
      }

      // Fetch homework
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('dueDate');

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHomework = () => {
    // Filtering is handled by the map function below
  };

  const getFilteredHomework = () => {
    return homework.filter(hw => {
      if (filterClass !== 'all' && hw.class !== filterClass) return false;
      if (filterStatus !== 'all' && hw.status !== filterStatus) return false;
      return true;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'evaluated':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'evaluated':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredData = getFilteredHomework();
  const pendingCount = homework.filter(hw => hw.status === 'pending').length;
  const submittedCount = homework.filter(hw => hw.status === 'submitted').length;
  const evaluatedCount = homework.filter(hw => hw.status === 'evaluated').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Homework Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Homework</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Assign Homework
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'all' ? 'All Classes' : cls}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="evaluated">Evaluated</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{homework.length}</div>
                <p className="text-gray-600 mt-2">Total Assignments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-gray-600 mt-2">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{submittedCount}</div>
                <p className="text-gray-600 mt-2">Submitted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{evaluatedCount}</div>
                <p className="text-gray-600 mt-2">Evaluated</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Homework List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading homework...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No assignments found</div>
          ) : (
            filteredData.map((hw) => (
              <Card key={hw.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(hw.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{hw.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{hw.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className="bg-purple-100 text-purple-800">{hw.subject}</Badge>
                        <Badge className="bg-indigo-100 text-indigo-800">{hw.class}</Badge>
                        <Badge className={getStatusColor(hw.status)}>{hw.status}</Badge>
                      </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">{formatDate(hw.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submissions</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(hw.submissionCount / hw.totalStudents) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {hw.submissionCount}/{hw.totalStudents}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        View Submissions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
