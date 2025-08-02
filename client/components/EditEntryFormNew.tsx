import React, { useState, useRef } from "react";
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
import {
  Upload,
  X,
  Camera,
  Edit2,
} from "lucide-react";
import { JournalEntry, AREA_TYPES, MOOD_RATINGS } from "@shared/api";
import { SupabaseStorage } from "@/lib/supabaseOnly";

interface EditEntryFormProps {
  entry: JournalEntry;
  onEntryUpdated: (entry: JournalEntry) => void;
  onCancel: () => void;
}

export function EditEntryForm({ entry, onEntryUpdated, onCancel }: EditEntryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state initialized with entry data
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [date, setDate] = useState(entry.date);
  const [location, setLocation] = useState(entry.location || "");
  const [areaType, setAreaType] = useState<string>(entry.areaType || "");
  const [moodRating, setMoodRating] = useState<number>(entry.moodRating || 5);
  const [weather, setWeather] = useState(entry.weather || "");
  const [temperature, setTemperature] = useState(entry.temperature || "");
  const [images, setImages] = useState<string[]>(entry.images || []);
  const [videos, setVideos] = useState<string[]>(entry.videos || []);
  const [isPublic, setIsPublic] = useState(entry.isPublic ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach((file) => {
      console.log(`📸 Processing image "${file.name}"`);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
          console.log(`✅ Image "${file.name}" loaded successfully`);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      const updatedEntry: JournalEntry = {
        ...entry,
        title: title.trim(),
        content: content.trim(),
        date,
        location: location.trim(),
        areaType: areaType as any,
        moodRating,
        weather: weather.trim(),
        temperature: temperature.trim(),
        images,
        videos,
        isPublic,
        updatedAt: new Date().toISOString(),
      };

      console.log("💾 Updating journal entry:", {
        entryId: updatedEntry.id,
        title: updatedEntry.title,
        imageCount: updatedEntry.images.length,
      });

      await SupabaseStorage.saveJournalEntry(updatedEntry);
      
      console.log("✅ Entry update saved successfully");
      onEntryUpdated(updatedEntry);
      
    } catch (error) {
      console.error("❌ Failed to update journal entry:", error);
      alert("Failed to update journal entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Edit Journal Entry
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
              <div>
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
                      <SelectItem key={mood.value} value={mood.value.toString()}>
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
              <Label>Photos</Label>
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
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add More Photos
                </Button>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Photo ${index + 1}`}
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
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? "Saving..." : "Update Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
