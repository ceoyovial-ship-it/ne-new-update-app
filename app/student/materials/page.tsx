'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, BookOpen, Video, Archive } from 'lucide-react';

interface Material {
  id: string;
  subject: string;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'archive';
  uploadedDate: string;
  size: string;
  chapter?: string;
  description: string;
  downloads?: number;
}

const MaterialsPage = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const materials: Material[] = [
    {
      id: '1',
      subject: 'Mathematics',
      title: 'Algebra Basics - Chapter 1 Notes',
      type: 'pdf',
      uploadedDate: '2026-07-05',
      size: '2.4 MB',
      chapter: 'Chapter 1',
      description: 'Comprehensive notes on algebra fundamentals including equations and expressions',
      downloads: 45,
    },
    {
      id: '2',
      subject: 'Mathematics',
      title: 'Quadratic Equations Video Lecture',
      type: 'video',
      uploadedDate: '2026-07-04',
      size: '145 MB',
      chapter: 'Chapter 3',
      description: '45-minute lecture on quadratic equations with solved examples',
      downloads: 62,
    },
    {
      id: '3',
      subject: 'English',
      title: 'Shakespearean Literature Study Guide',
      type: 'pdf',
      uploadedDate: '2026-07-03',
      size: '3.1 MB',
      chapter: 'Chapter 5',
      description: 'Complete study guide for Shakespeare with character analysis and themes',
      downloads: 38,
    },
    {
      id: '4',
      subject: 'Science',
      title: 'Physics Laboratory Manual',
      type: 'document',
      uploadedDate: '2026-07-02',
      size: '5.8 MB',
      chapter: 'Chapter 2',
      description: 'Complete lab manual with experimental procedures and data sheets',
      downloads: 52,
    },
    {
      id: '5',
      subject: 'Science',
      title: 'Electromagnetism Concept Videos',
      type: 'archive',
      uploadedDate: '2026-07-01',
      size: '342 MB',
      chapter: 'Chapter 4',
      description: 'Collection of 12 videos explaining electromagnetic concepts',
      downloads: 71,
    },
    {
      id: '6',
      subject: 'History',
      title: 'Ancient Civilizations Timeline',
      type: 'pdf',
      uploadedDate: '2026-06-30',
      size: '4.2 MB',
      chapter: 'Chapter 1',
      description: 'Interactive timeline of major ancient civilizations with key events',
      downloads: 29,
    },
    {
      id: '7',
      subject: 'Computer Science',
      title: 'Python Programming Basics',
      type: 'document',
      uploadedDate: '2026-06-29',
      size: '6.5 MB',
      chapter: 'Chapter 1',
      description: 'Comprehensive guide to Python syntax, data structures, and control flow',
      downloads: 88,
    },
    {
      id: '8',
      subject: 'Computer Science',
      title: 'Data Structures Implementations',
      type: 'archive',
      uploadedDate: '2026-06-28',
      size: '12.3 MB',
      chapter: 'Chapter 3',
      description: 'Complete code examples for linked lists, trees, and graphs',
      downloads: 94,
    },
  ];

  const subjects = ['all', ...Array.from(new Set(materials.map((m) => m.subject)))];
  const types: Array<string | 'all'> = ['all', 'pdf', 'video', 'document', 'archive'];

  const filteredMaterials = materials.filter((material) => {
    const subjectMatch = selectedSubject === 'all' || material.subject === selectedSubject;
    const typeMatch = selectedType === 'all' || material.type === selectedType;
    return subjectMatch && typeMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'document':
        return <BookOpen className="w-5 h-5 text-green-600" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      case 'archive':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Study Materials" />
      <div className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Subject Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubject === subject ? 'default' : 'outline'}
                    onClick={() => setSelectedSubject(subject)}
                    className="capitalize"
                    size="sm"
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Type Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type)}
                    className="capitalize"
                    size="sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(material.type)}
                    <Badge className={`capitalize ${getTypeBadgeColor(material.type)}`}>
                      {material.type}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-base line-clamp-2">{material.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div className="space-y-2 flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{material.subject}</span>
                    {material.chapter && <span> - {material.chapter}</span>}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{material.description}</p>
                </div>
                <div className="pt-2 space-y-1 border-t">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Uploaded: {new Date(material.uploadedDate).toLocaleDateString()}</span>
                    <span>{material.size}</span>
                  </div>
                  {material.downloads !== undefined && (
                    <p className="text-xs text-gray-600">{material.downloads} downloads</p>
                  )}
                </div>
                <Button className="w-full gap-2 mt-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <Card className="col-span-full text-center py-12">
            <CardContent>
              <p className="text-gray-600">No materials found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
