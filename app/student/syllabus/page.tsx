'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface Chapter {
  id: string;
  name: string;
  topics: string[];
  duration: string;
  weightage: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor: string;
  totalHours: number;
  chapters: Chapter[];
}

const SyllabusPage = () => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>('1');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const subjects: Subject[] = [
    {
      id: '1',
      name: 'Mathematics',
      code: 'MATH-101',
      credits: 4,
      instructor: 'Dr. Rajesh Kumar',
      totalHours: 60,
      chapters: [
        {
          id: 'ch1',
          name: 'Algebra Basics',
          topics: ['Linear equations', 'Quadratic equations', 'Polynomials', 'Systems of equations'],
          duration: '12 hours',
          weightage: 20,
        },
        {
          id: 'ch2',
          name: 'Trigonometry',
          topics: ['Trigonometric ratios', 'Identities', 'Equations', 'Applications'],
          duration: '15 hours',
          weightage: 25,
        },
        {
          id: 'ch3',
          name: 'Calculus Basics',
          topics: ['Limits', 'Derivatives', 'Integration', 'Applications'],
          duration: '18 hours',
          weightage: 30,
        },
        {
          id: 'ch4',
          name: 'Statistics',
          topics: ['Mean, median, mode', 'Probability', 'Distributions', 'Hypothesis testing'],
          duration: '15 hours',
          weightage: 25,
        },
      ],
    },
    {
      id: '2',
      name: 'English Literature',
      code: 'ENG-102',
      credits: 3,
      instructor: 'Ms. Priya Sharma',
      totalHours: 45,
      chapters: [
        {
          id: 'ch1',
          name: 'Shakespearean Drama',
          topics: ['Hamlet', 'Macbeth', 'Romeo and Juliet', 'Character analysis'],
          duration: '12 hours',
          weightage: 30,
        },
        {
          id: 'ch2',
          name: 'Romantic Poetry',
          topics: ['Wordsworth', 'Keats', 'Shelley', 'Poetic devices'],
          duration: '10 hours',
          weightage: 25,
        },
        {
          id: 'ch3',
          name: 'Modern Fiction',
          topics: ['Contemporary authors', 'Narrative techniques', 'Themes', 'Critical analysis'],
          duration: '12 hours',
          weightage: 25,
        },
        {
          id: 'ch4',
          name: 'Communication Skills',
          topics: ['Essay writing', 'Presentation skills', 'Group discussion', 'Debate'],
          duration: '11 hours',
          weightage: 20,
        },
      ],
    },
    {
      id: '3',
      name: 'Physics',
      code: 'PHY-103',
      credits: 4,
      instructor: 'Prof. Arjun Verma',
      totalHours: 60,
      chapters: [
        {
          id: 'ch1',
          name: 'Mechanics',
          topics: ['Motion', 'Forces', 'Energy', 'Work and power'],
          duration: '18 hours',
          weightage: 30,
        },
        {
          id: 'ch2',
          name: 'Electricity and Magnetism',
          topics: ['Electric fields', 'Current', 'Magnetic fields', 'Electromagnetic induction'],
          duration: '15 hours',
          weightage: 25,
        },
        {
          id: 'ch3',
          name: 'Optics and Waves',
          topics: ['Light properties', 'Interference', 'Diffraction', 'Sound waves'],
          duration: '15 hours',
          weightage: 25,
        },
        {
          id: 'ch4',
          name: 'Modern Physics',
          topics: ['Atomic structure', 'Radioactivity', 'Quantum mechanics', 'Relativity'],
          duration: '12 hours',
          weightage: 20,
        },
      ],
    },
  ];

  const toggleSubject = (subjectId: string) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Syllabus" />
      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-600">{subjects.length}</p>
              <p className="text-sm text-gray-600">Total Subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-600">
                {subjects.reduce((acc, s) => acc + s.credits, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Credits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-purple-600">
                {subjects.reduce((acc, s) => acc + s.totalHours, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Subjects */}
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="space-y-2">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleSubject(subject.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Instructor: </span>
                          {subject.instructor}
                        </div>
                        <div>
                          <span className="font-semibold">Credits: </span>
                          {subject.credits}
                        </div>
                        <div>
                          <span className="font-semibold">Total Hours: </span>
                          {subject.totalHours}
                        </div>
                        <div>
                          <span className="font-semibold">Chapters: </span>
                          {subject.chapters.length}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedSubject === subject.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chapters - Expanded View */}
              {expandedSubject === subject.id && (
                <div className="space-y-2 ml-0 md:ml-4">
                  {subject.chapters.map((chapter) => (
                    <Card
                      key={chapter.id}
                      className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{chapter.name}</h4>
                              <Badge variant="outline">{chapter.weightage}%</Badge>
                              <span className="text-sm text-gray-600">{chapter.duration}</span>
                            </div>

                            {/* Topics - Expanded View */}
                            {expandedChapter === chapter.id && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="font-semibold text-sm mb-3">Topics:</p>
                                <ul className="space-y-2">
                                  {chapter.topics.map((topic, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <span className="text-blue-600 font-bold">•</span>
                                      <span>{topic}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {expandedChapter === chapter.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Download Syllabus Button */}
        <div className="mt-8 flex gap-4">
          <Button className="gap-2" size="lg">
            <FileText className="w-5 h-5" />
            Download All Syllabi
          </Button>
          <Button variant="outline" size="lg">
            Print View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SyllabusPage;
