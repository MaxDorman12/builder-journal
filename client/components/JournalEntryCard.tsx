import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Heart,
  Calendar,
  MapPin,
  Camera,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { JournalEntry, MOOD_RATINGS, AREA_TYPES } from "@shared/api";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onLike: (entryId: string) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
}

export function JournalEntryCard({
  entry,
  onLike,
  onEdit,
  onDelete,
}: JournalEntryCardProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getMoodData = (rating: number) => {
    return MOOD_RATINGS.find((r) => r.value === rating) || MOOD_RATINGS[4];
  };

  const getAreaTypeData = (type: string) => {
    return AREA_TYPES.find((a) => a.value === type) || AREA_TYPES[0];
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageDialogOpen(true);
  };

  const nextImage = () => {
    if (entry.images && entry.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % entry.images.length);
    }
  };

  const prevImage = () => {
    if (entry.images && entry.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? entry.images.length - 1 : prev - 1
      );
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      onDelete(entry.id);
    }
  };

  const moodData = getMoodData(entry.moodRating || 5);
  const areaData = getAreaTypeData(entry.areaType || "highlands");

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {entry.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short", 
                    day: "numeric",
                  })}
                </div>
                {entry.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {entry.location}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
                className="text-gray-500 hover:text-blue-600"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Entry Content */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {entry.content}
          </p>

          {/* Entry Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {moodData.emoji} {moodData.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {areaData.emoji} {areaData.label}
            </Badge>
            {entry.weather && (
              <Badge variant="outline" className="text-xs">
                🌤️ {entry.weather}
              </Badge>
            )}
            {entry.temperature && (
              <Badge variant="outline" className="text-xs">
                🌡️ {entry.temperature}
              </Badge>
            )}
          </div>

          {/* Images */}
          {entry.images && entry.images.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {entry.images.length} photo{entry.images.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {entry.images.slice(0, 6).map((image, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image}
                      alt={`${entry.title} ${index + 1}`}
                      className="w-full h-24 object-cover rounded transition-transform group-hover:scale-105"
                    />
                    {index === 5 && entry.images.length > 6 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                        <span className="text-white font-medium">
                          +{entry.images.length - 6} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(entry.id)}
              className={`gap-2 ${
                entry.isLiked ? "text-red-600" : "text-gray-500"
              }`}
            >
              <Heart 
                className={`h-4 w-4 ${entry.isLiked ? "fill-current" : ""}`} 
              />
              {entry.likes || 0}
            </Button>

            <div className="text-xs text-gray-500">
              {entry.updatedBy && `By ${entry.updatedBy}`}
              {entry.updatedAt && (
                <span className="ml-2">
                  Updated {new Date(entry.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {entry.images && entry.images.length > 0 && (
            <div className="relative">
              <img
                src={entry.images[currentImageIndex]}
                alt={`${entry.title} ${currentImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {entry.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
                {currentImageIndex + 1} of {entry.images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
