'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, AlertCircle, RotateCcw } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: 'available' | 'issued';
  quantity: number;
  copies: number;
  publishYear: number;
  rating?: number;
}

interface IssuedBook {
  id: string;
  title: string;
  author: string;
  issueDate: string;
  dueDate: string;
  renewals: number;
  maxRenewals: number;
  fine: number;
}

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'issued'>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const books: Book[] = [
    {
      id: '1',
      title: 'Advanced Mathematics',
      author: 'R. K. Jain',
      isbn: '978-8173713798',
      category: 'Mathematics',
      status: 'available',
      quantity: 5,
      copies: 3,
      publishYear: 2020,
      rating: 4.5,
    },
    {
      id: '2',
      title: 'Physics Fundamentals',
      author: 'H. C. Verma',
      isbn: '978-8177091205',
      category: 'Physics',
      status: 'available',
      quantity: 4,
      copies: 2,
      publishYear: 2019,
      rating: 4.7,
    },
    {
      id: '3',
      title: 'English Literature',
      author: 'William Shakespeare',
      isbn: '978-0141043999',
      category: 'English',
      status: 'available',
      quantity: 8,
      copies: 5,
      publishYear: 2018,
      rating: 4.8,
    },
    {
      id: '4',
      title: 'Organic Chemistry',
      author: 'Morrison & Boyd',
      isbn: '978-8119192890',
      category: 'Chemistry',
      status: 'available',
      quantity: 6,
      copies: 4,
      publishYear: 2021,
      rating: 4.3,
    },
    {
      id: '5',
      title: 'Data Structures and Algorithms',
      author: 'Thomas H. Cormen',
      isbn: '978-0262033848',
      category: 'Computer Science',
      status: 'available',
      quantity: 7,
      copies: 6,
      publishYear: 2020,
      rating: 4.9,
    },
    {
      id: '6',
      title: 'Biology: The Study of Life',
      author: 'Martha Davis',
      isbn: '978-0132429139',
      category: 'Biology',
      status: 'available',
      quantity: 5,
      copies: 3,
      publishYear: 2019,
      rating: 4.4,
    },
    {
      id: '7',
      title: 'World History Chronicles',
      author: 'Mark Kurlansky',
      isbn: '978-0743277990',
      category: 'History',
      status: 'available',
      quantity: 3,
      copies: 1,
      publishYear: 2017,
      rating: 4.2,
    },
    {
      id: '8',
      title: 'Economics Explained',
      author: 'Paul Krugman',
      isbn: '978-0393346657',
      category: 'Economics',
      status: 'available',
      quantity: 4,
      copies: 2,
      publishYear: 2020,
      rating: 4.6,
    },
  ];

  const issuedBooks: IssuedBook[] = [
    {
      id: 'i1',
      title: 'Python Programming',
      author: 'Guido van Rossum',
      issueDate: '2026-06-20',
      dueDate: '2026-07-20',
      renewals: 0,
      maxRenewals: 2,
      fine: 0,
    },
    {
      id: 'i2',
      title: 'Calculus Made Easy',
      author: 'Silvanus Thompson',
      issueDate: '2026-06-15',
      dueDate: '2026-07-15',
      renewals: 1,
      maxRenewals: 2,
      fine: 50,
    },
  ];

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const daysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'text-red-600';
    if (daysLeft < 3) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Library" />
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-600">{books.length}</p>
              <p className="text-sm text-gray-600">Total Books</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-600">{issuedBooks.length}</p>
              <p className="text-sm text-gray-600">Books Issued</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-orange-600">
                {issuedBooks.reduce((acc, b) => acc + b.fine, 0)}
              </p>
              <p className="text-sm text-gray-600">Pending Fine (in Rs)</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <Button
            variant={activeTab === 'available' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('available')}
            className="rounded-none border-b-2"
          >
            Available Books
          </Button>
          <Button
            variant={activeTab === 'issued' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('issued')}
            className="rounded-none border-b-2"
          >
            My Issued Books ({issuedBooks.length})
          </Button>
        </div>

        {/* Available Books Tab */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Search Books</label>
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline">{book.category}</Badge>
                      {book.rating && (
                        <span className="text-sm font-semibold text-yellow-600">★ {book.rating}</span>
                      )}
                    </div>
                    <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3">
                    <div className="space-y-2 flex-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Author:</span> {book.author}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">ISBN:</span> {book.isbn}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Year:</span> {book.publishYear}
                      </p>
                      <div className="pt-2 border-t">
                        <p className="text-sm">
                          <span className="font-semibold">{book.copies}</span> of{' '}
                          <span className="font-semibold">{book.quantity}</span> copies available
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" disabled={book.copies === 0}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      {book.copies > 0 ? 'Issue Book' : 'Not Available'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-600">No books found matching your search.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Issued Books Tab */}
        {activeTab === 'issued' && (
          <div className="space-y-4">
            {issuedBooks.length > 0 ? (
              issuedBooks.map((book) => {
                const daysLeft = daysUntilDue(book.dueDate);
                return (
                  <Card key={book.id} className={daysLeft < 0 ? 'border-red-300 bg-red-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-semibold">Author:</span> {book.author}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Issued: </span>
                              <span className="font-medium">{new Date(book.issueDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due: </span>
                              <span className={`font-medium ${getDueDateColor(daysLeft)}`}>
                                {new Date(book.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Days Left: </span>
                              <span className={`font-medium ${getDueDateColor(daysLeft)}`}>
                                {daysLeft > 0 ? daysLeft : `Overdue by ${Math.abs(daysLeft)}`}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Renewals: </span>
                              <span className="font-medium">
                                {book.renewals}/{book.maxRenewals}
                              </span>
                            </div>
                          </div>
                          {book.fine > 0 && (
                            <div className="mt-3 p-2 bg-red-100 rounded-md flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-800">Fine: Rs {book.fine}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 md:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={book.renewals >= book.maxRenewals}
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Renew
                          </Button>
                          <Button variant="outline" size="sm">
                            Return
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-gray-600">You have no issued books at the moment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
