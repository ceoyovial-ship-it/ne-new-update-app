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
import { Library, Search, BookOpen, Users, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const books = [
    { id: 'B001', title: 'Introduction to Physics', author: 'Halliday & Resnick', category: 'Science', available: 5, total: 10, isbn: '978-0471420638' },
    { id: 'B002', title: 'Chemistry Made Easy', author: 'John Green', category: 'Science', available: 8, total: 12, isbn: '978-0471434567' },
    { id: 'B003', title: 'Advanced Mathematics', author: 'RD Sharma', category: 'Mathematics', available: 3, total: 15, isbn: '978-8189642345' },
    { id: 'B004', title: 'English Literature', author: 'William Wordsworth', category: 'English', available: 7, total: 10, isbn: '978-0192834567' },
    { id: 'B005', title: 'World History', author: 'E.H. Carr', category: 'History', available: 4, total: 8, isbn: '978-0334567890' },
    { id: 'B006', title: 'Computer Fundamentals', author: 'Pradeep Sinha', category: 'Computer', available: 6, total: 10, isbn: '978-8170085678' },
  ];

  const issuedBooks = [
    { id: 'I001', book: 'Introduction to Physics', student: 'Amit Sharma', class: 'Class 10-A', issueDate: '2024-06-01', dueDate: '2024-06-15', status: 'issued' },
    { id: 'I002', book: 'Chemistry Made Easy', student: 'Priya Singh', class: 'Class 10-B', issueDate: '2024-05-28', dueDate: '2024-06-12', status: 'overdue' },
    { id: 'I003', book: 'Advanced Mathematics', student: 'Rahul Kumar', class: 'Class 9-A', issueDate: '2024-06-03', dueDate: '2024-06-17', status: 'issued' },
    { id: 'I004', book: 'English Literature', student: 'Sneha Verma', class: 'Class 10-A', issueDate: '2024-06-02', dueDate: '2024-06-16', status: 'issued' },
  ];

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBooks = books.reduce((sum, b) => sum + b.total, 0);
  const availableBooks = books.reduce((sum, b) => sum + b.available, 0);
  const issuedCount = issuedBooks.length;
  const overdueCount = issuedBooks.filter(i => i.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Library Management" subtitle="Manage books and issued records" />

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Books</p>
                  <p className="text-2xl font-bold">{totalBooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Library className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{availableBooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issued</p>
                  <p className="text-2xl font-bold">{issuedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Inventory */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Book Inventory</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Book
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.id}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{book.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{book.isbn}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
                        {book.available}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{book.total}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Issued Books */}
        <Card>
          <CardHeader>
            <CardTitle>Issued Books</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issuedBooks.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.book}</TableCell>
                    <TableCell>{issue.student}</TableCell>
                    <TableCell>{issue.class}</TableCell>
                    <TableCell>{issue.issueDate}</TableCell>
                    <TableCell>{issue.dueDate}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={issue.status === 'overdue' ? 'destructive' : 'default'}>
                        {issue.status}
                      </Badge>
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
