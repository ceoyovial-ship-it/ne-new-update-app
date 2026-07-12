'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Trash2, Download, FileText, Video, Volume2, Eye } from 'lucide-react';

const materialsData = [
  {
    id: 1,
    title: 'Quadratic Equations - Complete Notes',
    class: 'Class 10-A',
    subject: 'Mathematics',
    type: 'pdf',
    fileSize: '2.5 MB',
    uploadedDate: '2024-12-10',
    downloads: 156,
    description: 'Comprehensive notes covering all concepts of quadratic equations.',
  },
  {
    id: 2,
    title: 'Photosynthesis Process - Video Tutorial',
    class: 'Class 10-B',
    subject: 'Science',
    type: 'video',
    fileSize: '125 MB',
    uploadedDate: '2024-12-08',
    downloads: 89,
    description: 'Visual explanation of photosynthesis with diagrams and examples.',
  },
  {
    id: 3,
    title: 'English Grammar - Audio Lessons',
    class: 'Class 9-A',
    subject: 'English',
    type: 'audio',
    fileSize: '45 MB',
    uploadedDate: '2024-12-05',
    downloads: 67,
    description: 'Audio lessons on fundamental grammar rules and usage.',
  },
  {
    id: 4,
    title: 'History Timeline - Interactive Presentation',
    class: 'Class 9-B',
    subject: 'History',
    type: 'presentation',
    fileSize: '8.3 MB',
    uploadedDate: '2024-12-01',
    downloads: 112,
    description: 'Interactive timeline of major historical events with details.',
  },
];

export default function MaterialsPage() {
  const [showForm, setShowForm] = useState(false);
  const [materials, setMaterials] = useState(materialsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    class: 'Class 10-A',
    subject: '',
    type: 'pdf',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.subject) {
      const newMaterial = {
        id: materials.length + 1,
        ...formData,
        fileSize: '0 MB',
        uploadedDate: new Date().toISOString().split('T')[0],
        downloads: 0,
      };
      setMaterials([...materials, newMaterial]);
      setFormData({
        title: '',
        class: 'Class 10-A',
        subject: '',
        type: 'pdf',
        description: '',
      });
      setShowForm(false);
    }
  };

  const handleDelete = (id: number) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || material.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Volume2 className="w-5 h-5 text-green-500" />;
      case 'presentation':
        return <Eye className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'audio':
        return 'bg-green-100 text-green-800';
      case 'presentation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Study Materials" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Materials</p>
              <p className="text-3xl font-bold text-gray-900">{materials.length}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-700">Total Downloads</p>
              <p className="text-3xl font-bold text-blue-900">
                {materials.reduce((sum, m) => sum + m.downloads, 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700">PDFs</p>
              <p className="text-3xl font-bold text-green-900">{materials.filter((m) => m.type === 'pdf').length}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-sm text-purple-700">Videos</p>
              <p className="text-3xl font-bold text-purple-900">
                {materials.filter((m) => m.type === 'video').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Material Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload New Material</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Chapter 5 Notes"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Class 10-A</option>
                      <option>Class 10-B</option>
                      <option>Class 9-A</option>
                      <option>Class 9-B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="presentation">Presentation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter material details..."
                    rows={3}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Maximum file size: 500 MB</p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Upload Material
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        {!showForm && (
          <div className="mb-6">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Upload Material
            </Button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="presentation">Presentation</option>
          </select>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded">
                    {getTypeIcon(material.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{material.title}</h3>
                    <p className="text-sm text-gray-600">{material.subject}</p>
                  </div>
                  <Badge className={getTypeBadgeColor(material.type)}>
                    {material.type.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 mb-3">{material.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                  <div>Class: {material.class}</div>
                  <div>Size: {material.fileSize}</div>
                  <div>Uploaded: {new Date(material.uploadedDate).toLocaleDateString()}</div>
                  <div>Downloads: {material.downloads}</div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 gap-1"
                    onClick={() => handleDelete(material.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600">No materials found. Try adjusting your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
