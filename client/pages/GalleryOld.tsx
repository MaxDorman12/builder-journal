import React, { useState, useEffect, useRef } from "react";
import { LocalStorage } from "@/lib/storage";
import { HybridStorage } from "@/lib/hybridStorage";
import { initializeSampleData } from "@/lib/sampleData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  Calendar,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Heart,
  MessageCircle,
} from "lucide-react";
import { JournalEntry, MOOD_RATINGS } from "@shared/api";

interface PhotoItem {
  id: string;
  url: string;
  entryTitle: string;
  entryId: string;
  location: string;
  date: string;
  author: string;
  moodRating: number;
  likes: number;
  commentCount: number;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "entry" | "mood">("date");

  // Touch handling for mobile swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    try {
      // Initialize sample data if no data exists
      initializeSampleData();
      loadPhotos();
    } catch (error) {
      console.error("Error loading gallery:", error);
    }
  }, [sortBy]); // Re-load when sortBy changes

  const loadPhotos = () => {
    try {
      const entries = HybridStorage.getJournalEntries();
      const allPhotos: PhotoItem[] = [];

      entries.forEach((entry) => {
        entry.images.forEach((imageUrl, index) => {
          allPhotos.push({
            id: `${entry.id}-${index}`,
            url: imageUrl,
            entryTitle: entry.title,
            entryId: entry.id,
            location: entry.location,
            date: entry.date,
            author: entry.author,
            moodRating: entry.moodRating,
            likes: entry.likes,
            commentCount: entry.comments.length,
          });
        });
      });

      // Sort photos
      const sortedPhotos = [...allPhotos].sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case "entry":
            return a.entryTitle.localeCompare(b.entryTitle);
          case "mood":
            return b.moodRating - a.moodRating;
          default:
            return 0;
        }
      });

      setPhotos(sortedPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
      setPhotos([]);
    }
  };

  const openPhotoModal = (photo: PhotoItem) => {
    const photoIndex = photos.findIndex((p) => p.id === photo.id);
    setCurrentPhotoIndex(photoIndex);
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const navigatePhoto = (direction: "next" | "prev") => {
    const newIndex =
      direction === "next"
        ? (currentPhotoIndex + 1) % photos.length
        : currentPhotoIndex === 0
          ? photos.length - 1
          : currentPhotoIndex - 1;

    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const getMoodEmoji = (rating: number) => {
    const mood = MOOD_RATINGS.find((r) => r.value === rating);
    return mood?.emoji || "😊";
  };

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && photos.length > 1) {
      navigatePhoto("next");
    }
    if (isRightSwipe && photos.length > 1) {
      navigatePhoto("prev");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            📸 Family Photo Gallery
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            All your adventure memories in one beautiful place
          </p>
        </div>

        {/* Mobile-optimized controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "entry" | "mood")
            }
            className="px-3 py-2 border border-input bg-background rounded-md text-sm w-full sm:w-auto"
          >
            <option value="date">📅 Sort by Date</option>
            <option value="entry">📝 Sort by Entry</option>
            <option value="mood">😊 Sort by Mood</option>
          </select>

          <div className="flex border border-input rounded-md w-full sm:w-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none border-r flex-1 sm:flex-none"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Grid</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none flex-1 sm:flex-none"
            >
              <List className="h-4 w-4" />
              <span className="ml-2 sm:hidden">List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="pastel-stat-card from-pink-200 to-rose-300">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-white/60 rounded-lg">
              <Camera className="h-5 w-5 text-pink-700" />
            </div>
            <div>
              <p className="text-lg font-bold text-pink-800">{photos.length}</p>
              <p className="text-xs text-pink-600">📷 Total Photos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="pastel-stat-card from-purple-200 to-violet-300">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-white/60 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-lg font-bold text-purple-800">
                {new Set(photos.map((p) => p.location)).size}
              </p>
              <p className="text-xs text-purple-600">📍 Unique Locations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="pastel-stat-card from-blue-200 to-cyan-300">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-white/60 rounded-lg">
              <Heart className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-800">
                {photos.reduce((sum, p) => sum + p.likes, 0)}
              </p>
              <p className="text-xs text-blue-600">❤️ Total Likes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="pastel-stat-card from-green-200 to-emerald-300">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-white/60 rounded-lg">
              <User className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-800">
                {new Set(photos.map((p) => p.author)).size}
              </p>
              <p className="text-xs text-green-600">👥 Contributors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery */}
      {photos.length === 0 ? (
        <Card className="family-card">
          <CardContent className="text-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start adding photos to your journal entries to see them here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4"
              : "space-y-3"
          }
        >
          {photos.map((photo) =>
            viewMode === "grid" ? (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer family-card hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => openPhotoModal(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.entryTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">
                    {photo.entryTitle}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white text-xs">
                      {getMoodEmoji(photo.moodRating)}
                    </span>
                    <div className="flex items-center space-x-1 text-white text-xs">
                      <Heart className="h-3 w-3" />
                      <span>{photo.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card
                key={photo.id}
                className="family-card group cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => openPhotoModal(photo)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={photo.url}
                        alt={photo.entryTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold line-clamp-1">
                        {photo.entryTitle}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{photo.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(photo.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{photo.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg">
                          {getMoodEmoji(photo.moodRating)}
                        </span>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{photo.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{photo.commentCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}

      {/* Photo Modal - Mobile optimized */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] p-0 m-2 md:m-8">
          {selectedPhoto && (
            <>
              <DialogHeader className="p-4 md:p-6 pb-0">
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-base md:text-lg line-clamp-2">
                    {selectedPhoto.entryTitle}
                  </span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white self-start sm:self-auto">
                    {getMoodEmoji(selectedPhoto.moodRating)}{" "}
                    {
                      MOOD_RATINGS.find(
                        (r) => r.value === selectedPhoto.moodRating,
                      )?.label
                    }
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div
                className="relative touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.entryTitle}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {photos.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                      onClick={() => navigatePhoto("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
                      onClick={() => navigatePhoto("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>

                {/* Mobile swipe hint */}
                {photos.length > 1 && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs md:hidden">
                    👈 Swipe to navigate 👉
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6 pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedPhoto.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(selectedPhoto.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Photo by {selectedPhoto.author}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{selectedPhoto.likes} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span>{selectedPhoto.commentCount} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
