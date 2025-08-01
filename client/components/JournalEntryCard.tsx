import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  Camera,
  Video,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Play,
  Edit2,
  Trash2,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { JournalEntry, MOOD_RATINGS, AREA_TYPES, Comment } from "@shared/api";
import { LocalStorage } from "@/lib/storage";
import { HybridStorage } from "@/lib/hybridStorage";
import { ExportUtils } from "@/lib/exportUtils";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onLike: (entryId: string) => void;
  onComment?: (entryId: string) => void;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (entryId: string) => void;
  isFamilyMember: boolean;
}

export function JournalEntryCard({
  entry,
  onLike,
  onComment,
  onEdit,
  onDelete,
  isFamilyMember,
}: JournalEntryCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const moodData = MOOD_RATINGS.find((r) => r.value === entry.moodRating);
  const areaData = AREA_TYPES.find((t) => t.value === entry.areaType);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    // If not a family member, require visitor name
    if (!isFamilyMember && !visitorName.trim()) {
      setShowNameInput(true);
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: isFamilyMember ? "Family Member" : visitorName.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    LocalStorage.addComment(entry.id, comment);
    // Update in cloud if available
    if (HybridStorage.isCloudEnabled()) {
      const updatedEntry = HybridStorage.getJournalEntries().find(
        (e) => e.id === entry.id,
      );
      if (updatedEntry) {
        await HybridStorage.saveJournalEntry(updatedEntry);
      }
    }
    setNewComment("");
    setVisitorName("");
    setShowNameInput(false);
    // Notify parent to reload entries
    onComment?.(entry.id);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      ExportUtils.exportSingleEntry(entry.id);
    } catch (error) {
      console.error("Failed to export entry:", error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (entry.images?.length || 0) - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (entry.images?.length || 0) - 1 : prev - 1,
    );
  };

  return (
    <>
      <Card className="family-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div
          className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden"
          onClick={() => setIsDetailOpen(true)}
        >
          {entry.images && entry.images.length > 0 ? (
            <>
              <img
                src={entry.images[0]}
                alt={entry.title}
                className="w-full h-full object-cover"
              />
              {entry.images.length > 1 && (
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                  <Camera className="h-3 w-3 mr-1" />
                  {entry.images.length}
                </Badge>
              )}
            </>
          ) : entry.videos && entry.videos.length > 0 ? (
            <>
              <video
                src={entry.videos[0]}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
              {entry.videos && entry.videos.length > 1 && (
                <Badge className="absolute top-2 right-2 bg-red-600 text-white">
                  <Video className="h-3 w-3 mr-1" />
                  {entry.videos.length}
                </Badge>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {entry.videos && entry.videos.length > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-600 text-white">
              <Video className="h-3 w-3 mr-1" />
              {entry.videos.length}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">
              {entry.title}
            </h3>
            <div className="flex items-center space-x-2 ml-2">
              {moodData && <span className="text-2xl">{moodData.emoji}</span>}
              {isFamilyMember && (onEdit || onDelete) && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleExport}
                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                    title="Export entry"
                  >
                    <Download className="h-3 w-3 text-green-600" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(entry);
                      }}
                      className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                      title="Edit entry"
                    >
                      <Edit2 className="h-3 w-3 text-blue-600" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this journal entry?",
                          )
                        ) {
                          onDelete(entry.id);
                        }
                      }}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mb-2 space-x-3">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{entry.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(entry.date).toLocaleDateString()}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {entry.content}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {areaData && (
              <Badge variant="outline" className="text-xs">
                {areaData.emoji} {areaData.label.split(" ")[1]}
              </Badge>
            )}
            {entry.isBusy && (
              <Badge variant="outline" className="text-xs">
                🏃 Busy
              </Badge>
            )}
            {entry.greatFor?.slice(0, 2).map((activity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {activity}
              </Badge>
            ))}
            {entry.greatFor && entry.greatFor.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{(entry.greatFor?.length || 0) - 2} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(entry.id);
                }}
                className="flex items-center space-x-1 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart className="h-4 w-4" />
                <span>{entry.likes}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                className="flex items-center space-x-1 text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{entry.comments?.length || 0}</span>
              </button>
            </div>

            <div className="flex items-center space-x-1 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{entry.author}</span>
            </div>
          </div>

          {showComments && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {entry.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="text-xs bg-muted/50 rounded p-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-2 space-y-2">
                {showNameInput && !isFamilyMember && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-800 mb-2">
                      👋 What's your name? (So we know who's commenting!)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Your name..."
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="text-xs"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddComment()
                        }
                      />
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!visitorName.trim()}
                      >
                        ✨ Post
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Textarea
                    placeholder={
                      isFamilyMember
                        ? "Add a comment..."
                        : "Share your thoughts about this adventure..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="text-xs"
                    rows={2}
                  />
                  <Button size="sm" onClick={handleAddComment}>
                    {isFamilyMember ? "Post" : "💭 Comment"}
                  </Button>
                </div>

                {!isFamilyMember && (
                  <p className="text-xs text-muted-foreground">
                    🌟 Visitors can share their thoughts! We'd love to hear from
                    you.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{entry.title}</span>
              {moodData && (
                <Badge className={moodData.color}>
                  {moodData.emoji} {moodData.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Gallery */}
            {entry.images.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={entry.images[currentImageIndex]}
                    alt={`${entry.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {entry.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {entry.images.length}
                      </div>
                    </>
                  )}
                </div>

                {entry.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {entry.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                          index === currentImageIndex
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {entry.videos.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Videos ({entry.videos.length})</span>
                </h4>
                <div className="grid gap-4">
                  {entry.videos.map((video, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <div className="text-center">
                        <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Video {index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">{video}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p>{entry.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Location:</strong> {entry.location}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Area Type:</strong> {areaData?.label}
                </div>
                <div>
                  <strong>Busy Level:</strong>{" "}
                  {entry.isBusy ? "Busy" : "Not Busy"}
                </div>
                <div>
                  <strong>Parking:</strong>{" "}
                  {entry.hasFreeParkingAvailable
                    ? "���️ Free parking"
                    : "💰 Paid parking"}
                  {!entry.hasFreeParkingAvailable && entry.parkingCost && (
                    <span className="ml-1">({entry.parkingCost})</span>
                  )}
                </div>
                <div>
                  <strong>Activity:</strong>{" "}
                  {entry.isPaidActivity
                    ? "💳 Paid activity"
                    : "🆓 Free activity"}
                  {entry.isPaidActivity && entry.activityCost && (
                    <span className="ml-1">({entry.activityCost})</span>
                  )}
                </div>
              </div>

              {entry.greatFor && entry.greatFor.length > 0 && (
                <div>
                  <strong className="text-sm">Great For:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.greatFor?.map((activity, index) => (
                      <Badge key={index} variant="secondary">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {entry.wouldReturnReason && (
                <div>
                  <strong className="text-sm">
                    Would {entry.wouldReturn ? "Return" : "Not Return"}:
                  </strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {entry.wouldReturnReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
