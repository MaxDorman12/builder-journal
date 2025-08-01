import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

interface EditEntryFormProps {
  entry: JournalEntry;
  onEntryUpdated: () => void;
}

export function EditEntryForm({ entry, onEntryUpdated }: EditEntryFormProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: entry.title,
    content: entry.content,
    location: entry.location,
    date: entry.date,
    moodRating: entry.moodRating as 1 | 2 | 3 | 4 | 5,
    areaType: entry.areaType,
    isBusy: entry.isBusy,
    wouldReturn: entry.wouldReturn,
    wouldReturnReason: entry.wouldReturnReason,
    greatFor: [...entry.greatFor],
    images: [...entry.images],
    videos: [...entry.videos],
    hasFreeParkingAvailable: entry.hasFreeParkingAvailable,
    parkingCost: entry.parkingCost,
  });
  const [newActivity, setNewActivity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const updatedEntry: JournalEntry = {
        ...entry, // Keep original metadata like id, author, createdAt, likes, comments
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
        updatedAt: new Date().toISOString(),
      };

      // FORCE SAVE TO FIREBASE FIRST
      try {
        await SupabaseDatabase.saveJournalEntry(updatedEntry);
        LocalStorage.saveJournalEntry(updatedEntry); // Backup to local
        console.log("✅ Entry update saved to Firebase");
      } catch (error) {
        console.error("❌ Firebase save failed:", error);
        LocalStorage.saveJournalEntry(updatedEntry); // Fallback to local only
      }
      onEntryUpdated();
    } catch (err) {
      setError("Failed to update journal entry. Please try again.");
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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, event.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
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
    });
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <span>Edit Adventure Details</span>
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
                  setFormData((prev) => ({
                    ...prev,
                    areaType: value as any,
                  }))
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

      {/* Additional Details */}
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

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating Entry..." : "Update Journal Entry"}
        </Button>
      </div>
    </form>
  );
}
