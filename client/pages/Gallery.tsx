import React, { useState, useEffect } from "react";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Calendar, MapPin } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Camera className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Family Gallery</h1>
          <p className="text-gray-600">
            Beautiful moments from our Scottish adventures
            {photos.length > 0 && (
              <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {photos.length} photos
              </span>
            )}
          </p>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Photos Yet
          </h2>
          <p className="text-gray-500 mb-6">
            Photos from your journal entries will appear here automatically.
          </p>
          <Button onClick={() => window.location.href = '/journal'} className="gap-2">
            <Camera className="h-4 w-4" />
            Create Journal Entry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              onClick={() => setSelectedPhoto(photo)}
            >
              <CardContent className="p-0">
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-medium truncate">{photo.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(photo.date).toLocaleDateString()}
                  </div>
                  {photo.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      {photo.location}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-full overflow-auto">
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              className="max-w-full max-h-full object-contain"
            />
            <div className="bg-white p-4 rounded-b">
              <h3 className="font-semibold text-lg">{selectedPhoto.title}</h3>
              <div className="flex items-center gap-4 text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedPhoto.date).toLocaleDateString()}
                </div>
                {selectedPhoto.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedPhoto.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
