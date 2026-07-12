'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, StudentFee } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

export default function StudentFees() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    if (user?.student) {
      fetchFees();
    }
  }, [user]);

  const fetchFees = async () => {
    if (!user?.student) return;

    setLoading(true);

    const { data } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', user.student.id)
      .order('due_date', { ascending: true });

    if (data) {
      setFees(data);
      const total = data.reduce((acc, f) => acc + f.amount, 0);
      const paid = data.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);
      const pending = data.filter(f => f.status === 'pending').reduce((acc, f) => acc + f.amount, 0);
      const overdue = data.filter(f => f.status === 'overdue').reduce((acc, f) => acc + f.amount, 0);
      setStats({ total, paid, pending, overdue });
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
      waived: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return styles[status] || 'bg-muted';
  };

  const paidFees = fees.filter(f => f.status === 'paid');
  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue');

  return (
    <div className="min-h-screen bg-background">
      <Header title="Fee Management" subtitle="View and pay your fees" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fees</p>
                  <p className="text-2xl font-bold">
                    ${stats.total.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats.paid.toLocaleString()}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${stats.pending.toLocaleString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${stats.overdue.toLocaleString()}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending Fees ({pendingFees.length})</TabsTrigger>
            <TabsTrigger value="paid">Payment History ({paidFees.length})</TabsTrigger>
            <TabsTrigger value="all">All Records</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Fees that need to be paid</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingFees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>All fees are paid!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingFees.map((fee) => (
                      <div
                        key={fee.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          fee.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-muted/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">Quarterly Fee</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Due: {fee.due_date ? format(new Date(fee.due_date), 'MMM d, yyyy') : 'N/A'}
                            </span>
                            <Badge className={getStatusBadge(fee.status)}>
                              {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${fee.amount.toLocaleString()}</p>
                          <Button size="sm" className="mt-2">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold">Total Pending</span>
                      <span className="text-xl font-bold">${(stats.pending + stats.overdue).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Previously paid fees</CardDescription>
              </CardHeader>
              <CardContent>
                {paidFees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No payment history yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">
                            ${fee.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {fee.due_date ? format(new Date(fee.due_date), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(fee.status)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Waiver</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">
                          ${fee.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {fee.due_date ? format(new Date(fee.due_date), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {fee.waiver_amount > 0 ? `$${fee.waiver_amount}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(fee.status)}>
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
