import React, { useState, useRef } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { PhotoStorage } from "@/lib/photoStorage";

interface CreateEntryFormProps {
  onEntryCreated: (entry: JournalEntry) => void;
  onCancel: () => void;
}

export function CreateEntryForm({
  onEntryCreated,
  onCancel,
}: CreateEntryFormProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [areaType, setAreaType] = useState<string>("");
  const [customAreaType, setCustomAreaType] = useState("");
  const [moodRating, setMoodRating] = useState<number>(5);
  const [weather, setWeather] = useState("");
  const [temperature, setTemperature] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [hasFreeParkingAvailable, setHasFreeParkingAvailable] = useState(false);
  const [parkingCost, setParkingCost] = useState("");
  const [isPaidActivity, setIsPaidActivity] = useState(false);
  const [activityCost, setActivityCost] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    fileName: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Increased limits for cloud storage
    const maxPhotos = 25; // Higher limit with cloud storage
    const currentCount = images.length;
    const totalCount = currentCount + files.length;

    if (totalCount > maxPhotos) {
      alert(
        `You can only add up to ${maxPhotos} photos per journal entry. You currently have ${currentCount} photos. Please select ${maxPhotos - currentCount} or fewer photos.`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file sizes (increased for cloud storage)
    const maxFileSize = 25 * 1024 * 1024; // 25MB per image for cloud storage
    const oversizedFiles = files.filter((file) => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      alert(
        `The following images are too large (max 25MB each):\n${oversizedFiles.map((f) => `${f.name} (${Math.round(f.size / 1024 / 1024)}MB)`).join("\n")}\n\nPlease choose smaller images.`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);

    try {
      // Skip cloud storage for now due to network issues, use base64 directly
      console.log(
        `📷 Using local base64 storage for ${files.length} photos due to network issues...`,
      );

      // Use base64 storage with reasonable limits
      const maxFiles = Math.min(files.length, 10); // Limit to 10 photos
      const allowedFiles = files
        .slice(0, maxFiles)
        .filter((f) => f.size <= 5 * 1024 * 1024); // 5MB limit

      if (allowedFiles.length < files.length) {
        alert(
          `Due to network issues, using local storage. Limited to ${allowedFiles.length} photos under 5MB each.`,
        );
      }

      // Process files with progress
      for (let i = 0; i < allowedFiles.length; i++) {
        const file = allowedFiles[i];
        setUploadProgress({
          current: i + 1,
          total: allowedFiles.length,
          fileName: file.name,
        });

        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              setImages((prev) => [...prev, result]);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      console.log(
        `✅ Successfully processed ${allowedFiles.length} photos locally`,
      );
    } catch (error) {
      console.error("❌ Photo upload failed:", error);

      // Check if it's a storage/bucket issue
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isStorageIssue =
        errorMessage.includes("bucket") ||
        errorMessage.includes("storage") ||
        errorMessage.includes("permission");

      if (isStorageIssue) {
        console.log(
          "⚠️ Cloud storage unavailable, falling back to base64 storage...",
        );

        // Use base64 fallback with size limits
        const allowedFiles = files.filter((f) => f.size <= 3 * 1024 * 1024); // 3MB limit for base64
        const oversizedFiles = files.filter((f) => f.size > 3 * 1024 * 1024);

        if (oversizedFiles.length > 0) {
          alert(
            `Cloud storage is currently unavailable. ${oversizedFiles.length} photos are too large for backup storage and will be skipped. Uploading ${allowedFiles.length} smaller photos...`,
          );
        }

        allowedFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              setImages((prev) => [...prev, result]);
            }
          };
          reader.readAsDataURL(file);
        });

        if (allowedFiles.length > 0) {
          console.log(
            `✅ Uploaded ${allowedFiles.length} photos using base64 fallback`,
          );
        }
      } else {
        // Network or other error
        alert(
          "Photo upload failed. Please check your internet connection and try again. For now, you can continue with your journal entry and add photos later.",
        );
      }
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: "" });

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    setIsSaving(true);

    try {
      const entryId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const entry: JournalEntry = {
        id: entryId,
        title: title.trim(),
        content: content.trim(),
        date,
        location: location.trim(),
        areaType: areaType as any,
        customAreaType:
          areaType === "other" ? customAreaType.trim() : undefined,
        moodRating,
        weather: weather.trim(),
        temperature: temperature.trim(),
        images,
        videos,
        isPublic,
        hasFreeParkingAvailable,
        parkingCost: hasFreeParkingAvailable ? "" : parkingCost.trim(),
        isPaidActivity,
        activityCost: isPaidActivity ? activityCost.trim() : "",
        updatedBy: "user", // You might want to get this from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      };

      // Calculate total data size
      const entryJson = JSON.stringify(entry);
      const dataSizeKB = Math.round(entryJson.length / 1024);
      const dataSizeMB =
        Math.round((entryJson.length / 1024 / 1024) * 100) / 100;

      console.log("💾 Saving journal entry:", {
        entryId: entry.id,
        title: entry.title,
        imageCount: entry.images.length,
        dataSizeKB,
        dataSizeMB,
      });

      // Warn if entry is very large (>5MB could cause issues)
      if (dataSizeMB > 5) {
        console.warn(
          `⚠️ Large journal entry (${dataSizeMB}MB) - this may cause save issues`,
        );
      }

      await SupabaseStorage.saveJournalEntry(entry);

      console.log("✅ Journal entry saved successfully");
      onEntryCreated(entry);

      // Reset form
      setTitle("");
      setContent("");
      setDate(new Date().toISOString().split("T")[0]);
      setLocation("");
      setAreaType("");
      setCustomAreaType("");
      setMoodRating(5);
      setWeather("");
      setTemperature("");
      setImages([]);
      setVideos([]);
      setIsPublic(true);
      setHasFreeParkingAvailable(false);
      setParkingCost("");
      setIsPaidActivity(false);
      setActivityCost("");
    } catch (error) {
      console.error("❌ Failed to save journal entry:", error);

      // Provide more helpful error messages
      let errorMessage = "Failed to save journal entry. ";
      if (error instanceof Error) {
        if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          errorMessage +=
            "Please check your internet connection and try again.";
        } else if (
          error.message.includes("size") ||
          error.message.includes("large") ||
          error.message.includes("limit")
        ) {
          errorMessage +=
            "The entry may be too large. Try reducing the number of photos or compressing them.";
        } else {
          errorMessage +=
            "Please try again or contact support if the problem persists.";
        }
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What did you do today?"
                required
              />
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where in Scotland?"
                />
              </div>
            </div>

            {/* Area Type and Mood */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="areaType">Area Type</Label>
                <Select value={areaType} onValueChange={setAreaType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area type" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {areaType === "other" && (
                  <div>
                    <Label htmlFor="customAreaType">Custom Area Type</Label>
                    <Input
                      id="customAreaType"
                      value={customAreaType}
                      onChange={(e) => setCustomAreaType(e.target.value)}
                      placeholder="e.g., Castle, Museum, Park, etc."
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="mood">Mood Rating</Label>
                <Select
                  value={moodRating.toString()}
                  onValueChange={(value) => setMoodRating(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_RATINGS.map((mood) => (
                      <SelectItem
                        key={mood.value}
                        value={mood.value.toString()}
                      >
                        {mood.emoji} {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weather and Temperature */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weather">Weather</Label>
                <Input
                  id="weather"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="Sunny, Rainy, etc."
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="15°C"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us about your adventure..."
                rows={6}
                required
              />
            </div>

            {/* Images */}
            <div>
              <Label>Photos ({images.length}/25) - Cloud Storage</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={images.length >= 25 || isUploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUploading
                    ? "Uploading..."
                    : images.length >= 25
                      ? "Photo limit reached"
                      : "Add Photos"}
                </Button>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span>Uploading to cloud storage...</span>
                      <span>
                        {uploadProgress.current}/{uploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    {uploadProgress.fileName && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {uploadProgress.fileName}
                      </div>
                    )}
                  </div>
                )}

                {/* Photo limit warning */}
                {images.length >= 20 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Approaching photo limit ({images.length}/25). Consider
                    creating multiple entries for very large photo sets.
                  </p>
                )}

                {/* Offline mode info */}
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Using offline mode due to network issues • 10 photos max,
                  5MB each • Will sync when connection restored
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parking Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                🚗 Parking Information
              </Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasFreeParkingAvailable"
                  checked={hasFreeParkingAvailable}
                  onCheckedChange={(checked) =>
                    setHasFreeParkingAvailable(checked as boolean)
                  }
                />
                <Label htmlFor="hasFreeParkingAvailable">
                  Free parking available
                </Label>
              </div>

              {!hasFreeParkingAvailable && (
                <div>
                  <Label htmlFor="parkingCost">Parking Cost</Label>
                  <Input
                    id="parkingCost"
                    value={parkingCost}
                    onChange={(e) => setParkingCost(e.target.value)}
                    placeholder="e.g., £5 for 2 hours, £2.50/hour"
                  />
                </div>
              )}
            </div>

            {/* Activity Cost Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                💳 Activity Information
              </Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPaidActivity"
                  checked={isPaidActivity}
                  onCheckedChange={(checked) =>
                    setIsPaidActivity(checked as boolean)
                  }
                />
                <Label htmlFor="isPaidActivity">This was a paid activity</Label>
              </div>

              {isPaidActivity && (
                <div>
                  <Label htmlFor="activityCost">Activity Cost</Label>
                  <Input
                    id="activityCost"
                    value={activityCost}
                    onChange={(e) => setActivityCost(e.target.value)}
                    placeholder="e.g., £15 per person, £45 for family ticket"
                  />
                </div>
              )}
            </div>

            {/* Privacy */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <Label htmlFor="isPublic">Make this entry public to family</Label>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? "Saving..." : "Create Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
