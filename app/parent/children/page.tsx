'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ChildrenPage() {
  const children = [
    {
      id: 1,
      name: 'Sarah Johnson',
      grade: 'Grade 10',
      section: 'A',
      rollNumber: '101',
      status: 'Active',
      joinDate: '2023-06-15',
      attendance: 92,
    },
    {
      id: 2,
      name: 'Michael Johnson',
      grade: 'Grade 8',
      section: 'B',
      rollNumber: '205',
      status: 'Active',
      joinDate: '2023-06-15',
      attendance: 88,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-30">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">My Children</h1>
            <p className="text-sm text-muted-foreground">Manage and view information about your linked children</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <p className="text-sm text-gray-500">Roll No: {child.rollNumber}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Grade</span>
                    <Badge variant="outline">{child.grade}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Section</span>
                    <span className="text-sm font-semibold">{child.section}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">{child.status}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Attendance</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${child.attendance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{child.attendance}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Link href={`/parent/attendance?childId=${child.id}`}>
                    <Button variant="outline" className="w-full text-left" asChild>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        View Attendance
                      </span>
                    </Button>
                  </Link>
                  <Link href={`/parent/academics?childId=${child.id}`}>
                    <Button variant="outline" className="w-full text-left" asChild>
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        View Academics
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {children.length === 0 && (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-600 font-medium mb-2">No children linked</p>
                <p className="text-sm text-gray-500">Link your children to view their information</p>
              </div>
              <Button className="mt-4">Link a Child</Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
