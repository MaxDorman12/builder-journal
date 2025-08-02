import React, { useState, useEffect } from "react";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Calendar, 
  MapPin, 
  Image,
  Eye,
  Grid3X3,
  Download,
  Heart,
  Star,
  Clock,
  Filter,
  Search,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { JournalEntry } from "@shared/api";

interface PhotoItem {
  id: string;
  src: string;
  title: string;
  date: string;
  location?: string;
  entryId: string;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const entries = await SupabaseStorage.getJournalEntries();
      const allPhotos: PhotoItem[] = [];

      entries.forEach((entry) => {
        if (entry.images && entry.images.length > 0) {
          entry.images.forEach((image, index) => {
            allPhotos.push({
              id: `${entry.id}-${index}`,
              src: image,
              title: entry.title,
              date: entry.date,
              location: entry.location,
              entryId: entry.id,
            });
          });
        }
      });

      // Sort by date (newest first)
      allPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPhotos(allPhotos);
      console.log("📸 Gallery loaded:", allPhotos.length, "photos");
    } catch (error) {
      console.error("❌ Failed to load gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();

    // Listen for real-time updates
    const unsubscribe = SupabaseStorage.onUpdate(() => {
      console.log("🔄 Real-time update received, reloading gallery...");
      loadPhotos();
    });

    return unsubscribe;
  }, []);

  const handlePhotoClick = (photo: PhotoItem, index: number) => {
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(index);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto?.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedPhoto(photos[newIndex]);
    setSelectedPhotoIndex(newIndex);
  };

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    switch (selectedFilter) {
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(photo.date) >= weekAgo;
      case "withLocation":
        return photo.location;
      case "thisMonth":
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const photoDate = new Date(photo.date);
        return photoDate.getMonth() === thisMonth && photoDate.getFullYear() === thisYear;
      default:
        return true;
    }
  });

  // Group photos by month for timeline
  const photosByMonth = photos.reduce((acc, photo) => {
    const month = new Date(photo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(photo);
    return acc;
  }, {} as Record<string, PhotoItem[]>);

  // Calculate stats
  const uniqueLocations = new Set(photos.filter(p => p.location).map(p => p.location)).size;
  const uniqueAdventures = new Set(photos.map(p => p.entryId)).size;
  const photosThisMonth = photos.filter(photo => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const photoDate = new Date(photo.date);
    return photoDate.getMonth() === thisMonth && photoDate.getFullYear() === thisYear;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <Camera className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-gray-700">Loading our photo memories...</p>
            <p className="text-sm text-gray-500 mt-2">📸 Gathering Scottish moments</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300 px-4 py-2 text-sm font-medium mb-6">
              📸 Explore our Scottish photo collection
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Family Photo Gallery
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
            Highland Memories
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Every photo tells a story of our Scottish adventures. From breathtaking landscapes 
            to precious family moments, our gallery captures the magic of exploring Scotland together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-full text-lg font-semibold"
            >
              <Eye className="h-5 w-5 mr-2" />
              📷 Browse Photos
            </Button>
            <Button 
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-full text-lg font-semibold"
              onClick={() => window.location.href = '/journal'}
            >
              <Camera className="h-5 w-5 mr-2" />
              📝 Add New Photos
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Camera className="h-8 w-8 mx-auto mb-2 text-purple-700" />
              <p className="text-2xl font-bold text-purple-800">{photos.length}</p>
              <p className="text-sm text-purple-600">Total Photos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-700" />
              <p className="text-2xl font-bold text-blue-800">{uniqueLocations}</p>
              <p className="text-sm text-blue-600">Locations Captured</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Star className="h-8 w-8 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-800">{uniqueAdventures}</p>
              <p className="text-sm text-green-600">Adventures Documented</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-700" />
              <p className="text-2xl font-bold text-orange-800">{photosThisMonth}</p>
              <p className="text-sm text-orange-600">This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* View Controls */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-6 w-6" />
                  View Options
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setViewMode("grid")}
                  >
                    📷 Grid View
                  </Button>
                  <Button 
                    variant={viewMode === "masonry" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setViewMode("masonry")}
                  >
                    🖼️ Masonry View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-6 w-6" />
                  Filter Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    variant={selectedFilter === "all" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("all")}
                  >
                    📸 All Photos ({photos.length})
                  </Button>
                  <Button 
                    variant={selectedFilter === "recent" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("recent")}
                  >
                    🆕 Recent (7 days)
                  </Button>
                  <Button 
                    variant={selectedFilter === "thisMonth" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("thisMonth")}
                  >
                    📅 This Month ({photosThisMonth})
                  </Button>
                  <Button 
                    variant={selectedFilter === "withLocation" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("withLocation")}
                  >
                    📍 With Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Photo Timeline */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  Photo Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(photosByMonth)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([month, monthPhotos]) => (
                      <div key={month} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">{month}</span>
                        <Badge variant="outline" className="text-xs">
                          {monthPhotos.length} photos
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Photo Gallery */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Camera className="h-8 w-8 text-purple-600" />
                📸 {selectedFilter === "all" ? "All Photos" : 
                     selectedFilter === "recent" ? "Recent Photos" :
                     selectedFilter === "thisMonth" ? "This Month's Photos" :
                     "Photos with Location"}
              </h3>
              <Badge className="bg-purple-100 text-purple-700 px-4 py-2 text-lg font-semibold">
                {filteredPhotos.length} photos
              </Badge>
            </div>

            {filteredPhotos.length === 0 ? (
              <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="text-center py-16">
                  <Camera className="h-20 w-20 text-purple-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-purple-700 mb-4">
                    {photos.length === 0 ? "No Photos Yet!" : `No ${selectedFilter} photos found`}
                  </h3>
                  <p className="text-purple-600 mb-8 text-lg max-w-md mx-auto">
                    {photos.length === 0 
                      ? "Photos from your journal entries will automatically appear here. Start documenting your Scottish adventures!"
                      : `Try adjusting your filter or add new photos to see them here.`
                    }
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/journal'} 
                    className="bg-purple-500 hover:bg-purple-600 text-white text-lg px-8 py-4 rounded-full shadow-lg"
                  >
                    <Camera className="h-6 w-6 mr-2" />
                    📝 {photos.length === 0 ? "Create First Journal Entry" : "Add More Photos"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                : "columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
              }>
                {filteredPhotos.map((photo, index) => {
                  const colors = [
                    'from-purple-100 to-purple-200 border-purple-300',
                    'from-blue-100 to-blue-200 border-blue-300',
                    'from-green-100 to-green-200 border-green-300',
                    'from-pink-100 to-pink-200 border-pink-300',
                    'from-orange-100 to-orange-200 border-orange-300',
                    'from-indigo-100 to-indigo-200 border-indigo-300'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <Card
                      key={photo.id}
                      className={`bg-gradient-to-br ${colorClass} cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden shadow-lg ${
                        viewMode === "masonry" ? "break-inside-avoid mb-4" : ""
                      }`}
                      onClick={() => handlePhotoClick(photo, index)}
                    >
                      <CardContent className="p-0">
                        <div className="relative group">
                          <img
                            src={photo.src}
                            alt={photo.title}
                            className={`w-full object-cover ${
                              viewMode === "grid" ? "h-48" : "h-auto"
                            }`}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 truncate mb-2">{photo.title}</h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {new Date(photo.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            {photo.location && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="h-3 w-3" />
                                {photo.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-6xl max-h-full w-full">
              {/* Navigation Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigatePhoto('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigatePhoto('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Photo Counter */}
              <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedPhotoIndex + 1} of {photos.length}
              </div>

              {/* Main Photo */}
              <div className="flex items-center justify-center h-full">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Photo Details */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold mb-2">{selectedPhoto.title}</h3>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {selectedPhoto.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedPhoto.location}
                      </div>
                    )}
                    <Badge className="bg-white/20 text-white">
                      📸 Photo {selectedPhotoIndex + 1}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the Dorman Family Adventures
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2 h-2 bg-purple-300 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
