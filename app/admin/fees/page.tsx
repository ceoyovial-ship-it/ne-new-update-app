'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Users, Clock, CheckCircle, Search, Download, Eye } from 'lucide-react';

export default function AdminFeesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const feeRecords = [
    { id: 'F001', student: 'Amit Sharma', class: 'Class 10-A', totalFee: 50000, paid: 35000, due: 15000, dueDate: '2024-12-15', status: 'partial' },
    { id: 'F002', student: 'Priya Singh', class: 'Class 10-B', totalFee: 50000, paid: 50000, due: 0, dueDate: '2024-12-15', status: 'paid' },
    { id: 'F003', student: 'Rahul Kumar', class: 'Class 9-A', totalFee: 45000, paid: 20000, due: 25000, dueDate: '2024-12-10', status: 'overdue' },
    { id: 'F004', student: 'Sneha Verma', class: 'Class 10-A', totalFee: 50000, paid: 50000, due: 0, dueDate: '2024-12-15', status: 'paid' },
    { id: 'F005', student: 'Karan Mehta', class: 'Class 9-B', totalFee: 45000, paid: 0, due: 45000, dueDate: '2024-12-10', status: 'overdue' },
  ];

  const filteredRecords = feeRecords.filter(r =>
    r.student.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = feeRecords.reduce((sum, r) => sum + r.paid, 0);
  const totalPending = feeRecords.reduce((sum, r) => sum + r.due, 0);
  const totalStudents = feeRecords.length;
  const paidCount = feeRecords.filter(r => r.status === 'paid').length;

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      paid: 'default',
      partial: 'secondary',
      overdue: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Fee Management" subtitle="Track and manage student fees" />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-2xl font-bold">₹{(totalCollected / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">₹{(totalPending / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fully Paid</p>
                  <p className="text-2xl font-bold">{paidCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fee Records</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Total Fee</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.student}</TableCell>
                    <TableCell>{record.class}</TableCell>
                    <TableCell className="text-right">₹{record.totalFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">₹{record.paid.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">₹{record.due.toLocaleString()}</TableCell>
                    <TableCell>{record.dueDate}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
