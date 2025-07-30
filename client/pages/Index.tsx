import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LocalStorage } from "@/lib/storage";
import { initializeSampleData } from "@/lib/sampleData";
import { FamilyStats } from "@/components/FamilyStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MapPin,
  Calendar,
  BookOpen,
  Youtube,
  Camera,
  Compass,
  Users,
  Mountain,
  Waves,
  Edit2,
  User,
} from "lucide-react";
import { MOOD_RATINGS, JournalEntry, MapPin as MapPinType } from "@shared/api";

export default function Index() {
  const { isAuthenticated, isFamilyMember } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [pins, setPins] = useState<MapPinType[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [tempYoutubeUrl, setTempYoutubeUrl] = useState<string>("");
  const [showAllStats, setShowAllStats] = useState(false);
  const [charlieData, setCharlieData] = useState({
    image: "",
    description: "",
  });
  const [isCharlieDialogOpen, setIsCharlieDialogOpen] = useState(false);
  const [tempCharlieData, setTempCharlieData] = useState({
    image: "",
    description: "",
  });

  useEffect(() => {
    // Initialize sample data if no data exists
    initializeSampleData();

    setEntries(LocalStorage.getJournalEntries());
    setPins(LocalStorage.getMapPins());

    // Load YouTube URL from localStorage
    const savedYoutubeUrl = localStorage.getItem("familyjournal_youtube_url");
    const defaultUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    setYoutubeUrl(savedYoutubeUrl || defaultUrl);

    // Load Charlie data
    const charlieInfo = LocalStorage.getCharlieData();
    setCharlieData(charlieInfo);
  }, []);

  const recentEntries = entries
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const totalTrips = pins.length;
  const averageMood =
    pins.length > 0
      ? Math.round(
          pins.reduce((sum, pin) => sum + pin.moodRating, 0) / pins.length,
        )
      : 0;

  const handleYoutubeEdit = () => {
    setTempYoutubeUrl(youtubeUrl);
    setIsYoutubeDialogOpen(true);
  };

  const handleYoutubeSave = () => {
    if (tempYoutubeUrl.trim()) {
      localStorage.setItem("familyjournal_youtube_url", tempYoutubeUrl.trim());
      setYoutubeUrl(tempYoutubeUrl.trim());
      setIsYoutubeDialogOpen(false);
      setTempYoutubeUrl("");
    }
  };

  const handleYoutubeCancel = () => {
    setIsYoutubeDialogOpen(false);
    setTempYoutubeUrl("");
  };

  const handleCharlieSave = () => {
    if (tempCharlieData.description.trim()) {
      LocalStorage.setCharlieData({
        image: tempCharlieData.image.trim(),
        description: tempCharlieData.description.trim(),
      });
      setCharlieData({
        image: tempCharlieData.image.trim(),
        description: tempCharlieData.description.trim(),
      });
      setIsCharlieDialogOpen(false);
      setTempCharlieData({ image: "", description: "" });
    }
  };

  const handleCharlieCancel = () => {
    setIsCharlieDialogOpen(false);
    setTempCharlieData({ image: "", description: "" });
  };

  const handleCharlieEdit = () => {
    setTempCharlieData(charlieData);
    setIsCharlieDialogOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempCharlieData({
          ...tempCharlieData,
          image: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full shadow-lg bouncy">
          <Heart className="h-5 w-5 text-purple-600 fill-purple-600" />
          <span className="text-purple-700 font-medium">
            �� Welcome to our magical adventures! ✨
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
          The Dorman Family
          <span className="block text-primary">Scottish Adventures</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Follow Max, Charlotte, Oscar, Rose, and Lola as they explore the
          beautiful landscapes of Scotland, creating memories and sharing their
          amazing journeys together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/journal">
            <button className="fun-button flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>📖 Read Our Journal</span>
            </button>
          </Link>

          <Link to="/map">
            <button className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-full transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>🗺️ Explore Our Map</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Family Stats Section */}
      <section>
        <FamilyStats
          showAll={showAllStats}
          onViewAll={() => setShowAllStats(true)}
          onClose={() => setShowAllStats(false)}
        />
      </section>

      {/* About Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            About Our Family
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              We're the Dorman family - Max and Charlotte, along with our three
              wonderful children Oscar, Rose, and Lola. Living in beautiful
              Scotland, we're passionate about exploring our homeland's
              incredible landscapes, from the mysterious lochs to the towering
              Munros.
            </p>
            <p>
              This journal captures our adventures as we discover hidden gems,
              bustling cities, peaceful villages, and breathtaking natural
              wonders across Scotland. Each trip brings new memories,
              challenges, and stories to share.
            </p>
            <p>
              Join us as we document our journeys, rate our experiences, and
              build a treasure trove of family memories that we'll cherish
              forever.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-gradient-to-r from-orange-200 to-red-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <Mountain className="h-3 w-3 text-orange-700" />
              <span className="text-orange-800 font-medium">
                🏔️ Highland Hikers
              </span>
            </div>
            <div className="bg-gradient-to-r from-blue-200 to-cyan-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <Waves className="h-3 w-3 text-blue-700" />
              <span className="text-blue-800 font-medium">
                🌊 Loch Explorers
              </span>
            </div>
            <div className="bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <Camera className="h-3 w-3 text-pink-700" />
              <span className="text-pink-800 font-medium">
                📸 Memory Makers
              </span>
            </div>
            <div className="bg-gradient-to-r from-green-200 to-teal-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <Compass className="h-3 w-3 text-green-700" />
              <span className="text-green-800 font-medium">
                🧭 Adventure Seekers
              </span>
            </div>
          </div>
        </div>

        <Card className="family-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Youtube className="h-5 w-5 text-red-500" />
                <span>Our Scotland Adventures</span>
              </div>
              {isFamilyMember && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleYoutubeEdit}
                  className="h-8 w-8 p-0"
                  title="Edit YouTube video"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 text-center p-6 hover:scale-105 transition-transform"
              >
                <Youtube className="h-12 w-12 text-red-500" />
                <p className="font-medium">Watch Our Latest Adventure</p>
                <p className="text-sm text-muted-foreground">
                  Click to open in YouTube
                </p>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Meet Charlie Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <Card className="family-card overflow-hidden">
          <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden relative flex items-center justify-center">
            {charlieData.image ? (
              <img
                src={charlieData.image}
                alt="Charlie the dog"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<div class="text-8xl">🐕</div><p class="text-lg font-medium text-amber-800 mt-4">Charlie</p>';
                }}
              />
            ) : (
              <>
                <div className="text-8xl">🐕</div>
                <p className="text-lg font-medium text-amber-800 mt-4 absolute bottom-4">
                  Charlie
                </p>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent"></div>
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="text-4xl">🐕</span>
            Meet Charlie
            {isFamilyMember && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCharlieEdit}
                className="h-8 w-8 p-0 ml-auto"
                title="Edit Charlie's section"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            {charlieData.description.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-gradient-to-r from-amber-200 to-yellow-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <span className="text-amber-800 font-medium">
                🎾 Adventure Buddy
              </span>
            </div>
            <div className="bg-gradient-to-r from-green-200 to-emerald-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <span className="text-green-800 font-medium">
                🥾 Trail Explorer
              </span>
            </div>
            <div className="bg-gradient-to-r from-blue-200 to-cyan-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <span className="text-blue-800 font-medium">📸 Photo Star</span>
            </div>
            <div className="bg-gradient-to-r from-purple-200 to-pink-200 px-4 py-2 rounded-full flex items-center space-x-1 shadow-md">
              <span className="text-purple-800 font-medium">
                ❤️ Family Heart
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">
              Recent Adventures
            </h2>
            <Link to="/journal">
              <Button variant="outline">View All Entries</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recentEntries.map((entry) => {
              const moodData = MOOD_RATINGS.find(
                (r) => r.value === entry.moodRating,
              );
              return (
                <Card
                  key={entry.id}
                  className="family-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden relative">
                    {entry.images.length > 0 ? (
                      <img
                        src={entry.images[0]}
                        alt={entry.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    )}
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-2 flex-1 mr-2">
                        {entry.title}
                      </h3>
                      {moodData && (
                        <span className="text-xl flex-shrink-0">
                          {moodData.emoji}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.location}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {entry.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{entry.author}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="text-center space-y-6 py-12">
          <Card className="family-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Join Our Adventure</h2>
              <p className="text-muted-foreground mb-6">
                You're viewing our family journal as a visitor. Dorman family
                can log in to add new entries, upload photos and videos, and
                update our adventure map!
              </p>
              <Link to="/login">
                <Button size="lg">Family Member Login</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* YouTube Edit Dialog */}
      <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                value={tempYoutubeUrl}
                onChange={(e) => setTempYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                📝 Paste a YouTube video URL to update your latest adventure
                video.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleYoutubeCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleYoutubeSave}
                disabled={!tempYoutubeUrl.trim()}
              >
                Update Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charlie Edit Dialog */}
      <Dialog open={isCharlieDialogOpen} onOpenChange={setIsCharlieDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Charlie's Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Charlie's Photo</Label>

              {/* Image Preview */}
              {tempCharlieData.image && (
                <div className="w-full max-w-sm mx-auto">
                  <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg overflow-hidden">
                    <img
                      src={tempCharlieData.image}
                      alt="Charlie preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><div class="text-6xl">🐕</div></div>';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* File Upload Option */}
              <div className="space-y-2">
                <Label htmlFor="charlie-file-upload" className="text-sm font-medium">
                  📱 Upload from Device
                </Label>
                <Input
                  id="charlie-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Upload directly from your phone or computer (max 5MB)
                </p>
              </div>

              {/* URL Option */}
              <div className="space-y-2">
                <Label htmlFor="charlie-image-url" className="text-sm font-medium">
                  🔗 Or paste image URL
                </Label>
                <Input
                  id="charlie-image-url"
                  value={tempCharlieData.image.startsWith('data:') ? '' : tempCharlieData.image}
                  onChange={(e) =>
                    setTempCharlieData({
                      ...tempCharlieData,
                      image: e.target.value,
                    })
                  }
                  placeholder="https://example.com/charlie-photo.jpg"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Alternative: paste an image URL from the web
                </p>
              </div>

              {/* Clear Image Button */}
              {tempCharlieData.image && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTempCharlieData({...tempCharlieData, image: ''})}
                  className="w-full"
                >
                  🗑️ Remove Photo
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="charlie-description">Description</Label>
              <Textarea
                id="charlie-description"
                value={tempCharlieData.description}
                onChange={(e) =>
                  setTempCharlieData({
                    ...tempCharlieData,
                    description: e.target.value,
                  })
                }
                placeholder="Tell everyone about Charlie and your adventures together..."
                className="w-full min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground">
                🐕 Share Charlie's story and his role in your family adventures
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCharlieCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleCharlieSave}
                disabled={!tempCharlieData.description.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
