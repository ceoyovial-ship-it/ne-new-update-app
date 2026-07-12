'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Search, Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  studentName: string;
  studentClass: string;
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .order('name');

      if (error) throw error;
      setParents(data || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const relationColors: { [key: string]: string } = {
    'Father': 'bg-blue-100 text-blue-800',
    'Mother': 'bg-pink-100 text-pink-800',
    'Guardian': 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Parents Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Parents</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Parent
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-8">Loading parents...</div>
          ) : filteredParents.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">No parents found</div>
          ) : (
            filteredParents.map((parent) => (
              <Card key={parent.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{parent.name}</h3>
                      <Badge className={relationColors[parent.relation] || 'bg-gray-100 text-gray-800'}>
                        {parent.relation}
                      </Badge>
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

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{parent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{parent.phone}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">Student</p>
                      <p className="font-medium text-gray-900">{parent.studentName}</p>
                      <p className="text-sm text-gray-600">{parent.studentClass}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{parents.length}</div>
                <p className="text-gray-600 mt-2">Total Parents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">
                  {parents.filter(p => p.relation === 'Mother').length}
                </div>
                <p className="text-gray-600 mt-2">Mothers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">
                  {parents.filter(p => p.relation === 'Father').length}
                </div>
                <p className="text-gray-600 mt-2">Fathers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
