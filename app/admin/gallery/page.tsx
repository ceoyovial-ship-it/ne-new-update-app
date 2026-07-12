'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Button } from '@/components/ui';
import { Plus, Trash2, Image as ImageIcon, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  featured: boolean;
}

interface Album {
  name: string;
  count: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState<Album[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateCategories();
  }, [images]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('uploadDate', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategories = () => {
    const categoryCount: { [key: string]: number } = {};
    images.forEach(img => {
      categoryCount[img.category] = (categoryCount[img.category] || 0) + 1;
    });

    const categoriesArray = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
    }));

    setCategories(categoriesArray);
  };

  const filteredImages = filterCategory === 'all'
    ? images
    : images.filter(img => img.category === filterCategory);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'sports': 'bg-blue-100 text-blue-800',
      'events': 'bg-purple-100 text-purple-800',
      'school': 'bg-red-100 text-red-800',
      'sports_day': 'bg-yellow-100 text-yellow-800',
      'annual_day': 'bg-pink-100 text-pink-800',
      'academic': 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Gallery Management" />

      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Photo Gallery</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('all')}
              className="bg-gray-600"
            >
              All Photos
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.name}
                variant={filterCategory === cat.name ? 'default' : 'outline'}
                onClick={() => setFilterCategory(cat.name)}
              >
                {cat.name} ({cat.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{images.length}</div>
                <p className="text-gray-600 mt-2">Total Photos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
                <p className="text-gray-600 mt-2">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {images.filter(img => img.featured).length}
                </div>
                <p className="text-gray-600 mt-2">Featured</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {categories[0]?.count || 0}
                </div>
                <p className="text-gray-600 mt-2">Most Popular</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            className="bg-blue-600"
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading gallery...</div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No photos found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative overflow-hidden group">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-500" />
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                  {image.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{image.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                  <Badge className={`${getCategoryColor(image.category)} mb-3`}>
                    {image.category}
                  </Badge>
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
                    <span>{formatDate(image.uploadDate)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Uploaded By</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Featured</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredImages.map((image) => (
                      <tr key={image.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{image.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{image.description}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={getCategoryColor(image.category)}>
                            {image.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{image.uploadedBy}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(image.uploadDate)}</td>
                        <td className="px-6 py-4 text-sm">
                          {image.featured ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
