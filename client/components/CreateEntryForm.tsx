import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  Calendar,
  MapPin,
  Camera,
  Video,
  Plus,
  Star,
} from "lucide-react";
import { JournalEntry, AREA_TYPES, MOOD_RATINGS } from "@shared/api";
import { LocalStorage } from "@/lib/storage";
import { HybridStorage } from "@/lib/hybridStorage";
import { CloudStorage } from "@/lib/cloudStorage";
import { SupabaseStorage } from "@/lib/supabaseStorage";
import { MediaStorage } from "@/lib/mediaStorage";
import { useAuth } from "@/contexts/AuthContext";

interface CreateEntryFormProps {
  onEntryCreated: () => void;
}

export function CreateEntryForm({ onEntryCreated }: CreateEntryFormProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    moodRating: 3 as 1 | 2 | 3 | 4 | 5,
    areaType: "town" as any,
    isBusy: false,
    wouldReturn: true,
    wouldReturnReason: "",
    greatFor: [] as string[],
    images: [] as string[],
    videos: [] as string[],
    hasFreeParkingAvailable: true,
    parkingCost: "",
    isPaidActivity: false,
    activityCost: "",
  });
  const [newActivity, setNewActivity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [wantToPlacePin, setWantToPlacePin] = useState(false);
  const [showPinOption, setShowPinOption] = useState(false);
  const [createdEntryId, setCreatedEntryId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.location.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const entryId = Date.now().toString();
      const entry: JournalEntry = {
        id: entryId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        location: formData.location.trim(),
        date: formData.date,
        moodRating: formData.moodRating,
        areaType: formData.areaType,
        isBusy: formData.isBusy,
        wouldReturn: formData.wouldReturn,
        wouldReturnReason: formData.wouldReturnReason.trim(),
        greatFor: formData.greatFor,
        images: formData.images,
        videos: formData.videos,
        hasFreeParkingAvailable: formData.hasFreeParkingAvailable,
        parkingCost: formData.parkingCost.trim(),
        isPaidActivity: formData.isPaidActivity,
        activityCost: formData.activityCost.trim(),
        author: currentUser || "Dorman Family",
        likes: 0,
        comments: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // FORCE SAVE TO FIREBASE FIRST
      console.log("🔄 Attempting to save journal entry to Firebase...", {
        entryId: entry.id,
        title: entry.title,
        imagesCount: entry.images.length,
        videosCount: entry.videos.length,
        totalSize: JSON.stringify(entry).length,
      });

      try {
        await CloudStorage.saveJournalEntry(entry);
        LocalStorage.saveJournalEntry(entry); // Backup to local
        console.log("✅ Journal entry saved to Firebase successfully");
      } catch (error) {
        console.error("❌ Firebase save failed:", error);
        console.error("Error details:", error.message);

        // Log the error but continue with fallback
        console.warn("Firebase save failed, using local storage fallback");

        console.log("📱 Falling back to local storage only");
        LocalStorage.saveJournalEntry(entry); // Fallback to local only
      }
      setCreatedEntryId(entryId);

      // Show option to place pin on map
      setShowPinOption(true);
    } catch (err) {
      setError("Failed to create journal entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addActivity = () => {
    if (newActivity.trim() && !formData.greatFor.includes(newActivity.trim())) {
      setFormData((prev) => ({
        ...prev,
        greatFor: [...prev.greatFor, newActivity.trim()],
      }));
      setNewActivity("");
    }
  };

  const removeActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      greatFor: prev.greatFor.filter((a) => a !== activity),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      // Allow large images - Firebase Storage can handle them
      console.log(`📸 Processing image "${file.name}":`, {
        size: file.size,
        type: file.type
      });

      // Compress image for better performance
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        // Calculate new dimensions (max 1200px)
        const maxSize = 1200;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // Draw compressed image
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // For large images or better storage, use Supabase
        try {
          const entryId = `entry_${Date.now()}`;
          const publicUrl = await SupabaseStorage.uploadCompressedImage(canvas, entryId);

          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, publicUrl],
          }));

          console.log(`✅ Image "${file.name}" uploaded to Supabase:`, {
            originalSize: file.size,
            dimensions: `${width}x${height}`,
            url: publicUrl
          });
        } catch (error) {
          console.warn('Supabase upload failed, using base64 fallback:', error);
          // Fallback to base64 if Supabase fails
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, compressedDataUrl],
          }));
        }
      };

      // Load the file
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      console.log(`🎥 Processing video "${file.name}":`, {
        size: file.size,
        type: file.type,
      });

      const sizeMB = file.size / (1024 * 1024);

      // Check if file is too large for Supabase free tier (50MB limit)
      if (sizeMB > 45) {
        alert(`⚠️ Video "${file.name}" is ${sizeMB.toFixed(1)}MB\n\nOptions:\n1. Upgrade to Supabase Pro (500GB limit)\n2. Use a smaller video file\n3. Compress video before upload`);
        console.warn(`Video too large for Supabase free tier: ${sizeMB.toFixed(1)}MB`);
        continue; // Skip this file
      }

      // Upload videos to Supabase Storage
      try {
        const entryId = `entry_${Date.now()}`;
        const publicUrl = await SupabaseStorage.uploadFile(file, entryId);

        setFormData((prev) => ({
          ...prev,
          videos: [...prev.videos, publicUrl],
        }));

        console.log(`✅ Video "${file.name}" uploaded to Supabase:`, publicUrl);
      } catch (error) {
        console.warn('Supabase video upload failed, using base64 fallback:', error);
        // For small videos, fallback to base64
        if (sizeMB < 10) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setFormData((prev) => ({
                ...prev,
                videos: [...prev.videos, event.target!.result as string],
              }));
            }
          };
          reader.readAsDataURL(file);
        } else {
          alert(`❌ Upload failed for "${file.name}" (${sizeMB.toFixed(1)}MB)\n\nPlease upgrade to Supabase Pro or use a smaller video.`);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const moodData = MOOD_RATINGS.find((r) => r.value === formData.moodRating);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Adventure Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Exploring Loch Katrine"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g., Loch Katrine, Trossachs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaType">Area Type</Label>
              <Select
                value={formData.areaType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, areaType: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mood Rating</Label>
              <div className="flex items-center space-x-2">
                {MOOD_RATINGS.map((rating) => (
                  <button
                    key={rating.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        moodRating: rating.value as any,
                      }))
                    }
                    className={`text-2xl p-2 rounded-lg transition-colors ${
                      formData.moodRating === rating.value
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {rating.emoji}
                  </button>
                ))}
              </div>
              {moodData && (
                <p className="text-sm text-muted-foreground">
                  {moodData.emoji} {moodData.label}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Adventure Story *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Tell us about your adventure! What did you see? What did you do? How was the experience?"
              rows={6}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Photos & Videos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="images">Upload Photos</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videos">Upload Videos</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <input
                  id="videos"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <label htmlFor="videos" className="cursor-pointer">
                  <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload videos
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Preview uploaded media */}
          {formData.images.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Photos ({formData.images.length})</Label>
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.videos.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Videos ({formData.videos.length})</Label>
              <div className="space-y-2">
                {formData.videos.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted p-2 rounded"
                  >
                    <span className="text-sm">Video {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Adventure Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What's this place great for?</Label>
            <div className="flex space-x-2">
              <Input
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="e.g., hiking, photography, picnics"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addActivity())
                }
              />
              <Button type="button" onClick={addActivity} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.greatFor.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.greatFor.map((activity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{activity}</span>
                    <button
                      type="button"
                      onClick={() => removeActivity(activity)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isBusy"
              checked={formData.isBusy}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isBusy: checked as boolean }))
              }
            />
            <Label htmlFor="isBusy">This place was busy/crowded</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasFreeParkingAvailable"
                checked={formData.hasFreeParkingAvailable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    hasFreeParkingAvailable: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="hasFreeParkingAvailable">
                🅿️ Free parking available
              </Label>
            </div>

            {!formData.hasFreeParkingAvailable && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="parkingCost">💰 Parking cost</Label>
                <Input
                  id="parkingCost"
                  value={formData.parkingCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parkingCost: e.target.value,
                    }))
                  }
                  placeholder="e.g., £5 per hour, £15 all day"
                  className="max-w-xs"
                />
              </div>
            )}
          </div>

          {/* Paid Activity Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">💳 Activity Cost</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPaidActivity"
                checked={formData.isPaidActivity}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPaidActivity: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="isPaidActivity">💰 This is a paid activity</Label>
            </div>

            {formData.isPaidActivity && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="activityCost">💳 Activity cost</Label>
                <Input
                  id="activityCost"
                  value={formData.activityCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      activityCost: e.target.value,
                    }))
                  }
                  placeholder="e.g., £15 per person, £50 for family"
                  className="max-w-xs"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Would you return?</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="wouldReturn"
                    checked={formData.wouldReturn === true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, wouldReturn: true }))
                    }
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="wouldReturn"
                    checked={formData.wouldReturn === false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, wouldReturn: false }))
                    }
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wouldReturnReason">
              Why {formData.wouldReturn ? "would" : "wouldn't"} you return?
            </Label>
            <Textarea
              id="wouldReturnReason"
              value={formData.wouldReturnReason}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  wouldReturnReason: e.target.value,
                }))
              }
              placeholder={
                formData.wouldReturn
                  ? "What made this place special? What would you do differently next time?"
                  : "What didn't work well? What would put you off returning?"
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pin Placement Dialog */}
      {showPinOption && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📍</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  🎉 Journal Entry Created!
                </h3>
                <p className="text-gray-600">
                  Would you like to place a pin on the map for this adventure?
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Store the entry data for map pin creation
                    const entryData = {
                      title: formData.title.trim(),
                      description: formData.content.trim(),
                      location: formData.location.trim(),
                      moodRating: formData.moodRating,
                      visitDate: formData.date,
                      entryId: createdEntryId,
                    };
                    localStorage.setItem(
                      "pendingMapPin",
                      JSON.stringify(entryData),
                    );
                    navigate("/map?mode=place-pin");
                  }}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 px-4 rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  📍 Yes, Place Pin!
                </button>

                <button
                  onClick={() => {
                    setShowPinOption(false);
                    onEntryCreated();
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-full transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Entry..." : "Create Journal Entry"}
        </Button>
      </div>
    </form>
  );
}
