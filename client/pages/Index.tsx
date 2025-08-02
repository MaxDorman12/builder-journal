import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
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
import {
  JournalEntry,
  MapPin as MapPinType,
  YouTubeVideo,
} from "@shared/api";

export default function Index() {
  const { isAuthenticated, isFamilyMember } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [pins, setPins] = useState<MapPinType[]>([]);
  const [youtubeVideo, setYoutubeVideo] = useState<YouTubeVideo | null>(null);
  const [charlieData, setCharlieData] = useState<{
    image: string;
    description: string;
  }>({
    image: "",
    description: "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾",
  });

  // YouTube video editing state
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeDescription, setYoutubeDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Charlie editing state
  const [isCharlieDialogOpen, setIsCharlieDialogOpen] = useState(false);
  const [charlieImage, setCharlieImage] = useState("");
  const [charlieDescription, setCharlieDescription] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // Load all data from Supabase
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading data from Supabase...");
      
      const [entriesData, pinsData, charlieData, youtubeData] = await Promise.all([
        SupabaseStorage.getJournalEntries(),
        SupabaseStorage.getMapPins(),
        SupabaseStorage.getCharlieData(),
        SupabaseStorage.getYouTubeVideo(),
      ]);

      setEntries(entriesData);
      setPins(pinsData);
      setCharlieData(charlieData);
      setYoutubeVideo(youtubeData);

      console.log("✅ Data loaded successfully", {
        entries: entriesData.length,
        pins: pinsData.length,
        hasCharlieImage: !!charlieData.image,
        hasYoutube: !!youtubeData,
      });
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();

      // Set up real-time listener
      const unsubscribe = SupabaseStorage.onUpdate(() => {
        console.log("🔄 Real-time update received, reloading data...");
        loadData();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  // YouTube video handlers
  const handleYoutubeEdit = () => {
    setYoutubeTitle(youtubeVideo?.title || "");
    setYoutubeDescription(youtubeVideo?.description || "");
    setYoutubeUrl(youtubeVideo?.url || "");
    setIsYoutubeDialogOpen(true);
  };

  const handleYoutubeSave = async () => {
    if (!youtubeUrl.trim()) return;

    try {
      const newVideo: YouTubeVideo = {
        id: youtubeVideo?.id || "family-youtube-video",
        url: youtubeUrl,
        title: youtubeTitle || "Family YouTube Video",
        description: youtubeDescription || "",
        updatedBy: isFamilyMember || "anonymous",
        createdAt: youtubeVideo?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await SupabaseStorage.saveYouTubeVideo(newVideo);
      setYoutubeVideo(newVideo);
      setIsYoutubeDialogOpen(false);
      console.log("✅ YouTube video saved");
    } catch (error) {
      console.error("❌ Failed to save YouTube video:", error);
    }
  };

  const handleYoutubeDelete = async () => {
    try {
      await SupabaseStorage.deleteYouTubeVideo();
      setYoutubeVideo(null);
      console.log("✅ YouTube video deleted");
    } catch (error) {
      console.error("❌ Failed to delete YouTube video:", error);
    }
  };

  // Charlie handlers
  const handleCharlieEdit = () => {
    setCharlieImage(charlieData.image || "");
    setCharlieDescription(charlieData.description || "");
    setIsCharlieDialogOpen(true);
  };

  const handleCharlieSave = async () => {
    try {
      const dataToSave = {
        image: charlieImage,
        description: charlieDescription,
      };

      await SupabaseStorage.saveCharlieData(dataToSave);
      setCharlieData(dataToSave);
      setIsCharlieDialogOpen(false);
      console.log("✅ Charlie data saved");
    } catch (error) {
      console.error("❌ Failed to save Charlie data:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🏔️ Dorman Family Journal</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to access the family journal
            </p>
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading family data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            🏔️ Welcome to the Dorman Family Journal
          </h1>
          <p className="text-gray-600 text-lg">
            Capturing our adventures across beautiful Scotland! 🏴󠁧󠁢󠁳󠁣󠁴󠁿
          </p>
        </div>

        {/* Family Stats */}
        <FamilyStats entries={entries} pins={pins} />

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/journal">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Journal</h3>
                <p className="text-sm text-gray-600">{entries.length} entries</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/map">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Map</h3>
                <p className="text-sm text-gray-600">{pins.length} places</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/gallery">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Gallery</h3>
                <p className="text-sm text-gray-600">Photos</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/wishlist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold">Wishlist</h3>
                <p className="text-sm text-gray-600">Dreams</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Recent Journal Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Adventures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{entry.title}</h4>
                  <p className="text-sm text-gray-600 truncate">
                    {entry.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{entry.date}</p>
                </div>
              ))}
              {entries.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No adventures yet! Start your journey by creating your first
                  journal entry.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Charlie Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Charlie - Our Adventure Buddy
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCharlieEdit}
                  className="ml-auto"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {charlieData.image && (
                <img
                  src={charlieData.image}
                  alt="Charlie"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {charlieData.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Section */}
        {youtubeVideo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                {youtubeVideo.title}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleYoutubeEdit}
                  className="ml-auto"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video">
                <iframe
                  src={youtubeVideo.url.replace("watch?v=", "embed/")}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title={youtubeVideo.title}
                />
              </div>
              {youtubeVideo.description && (
                <p className="mt-4 text-gray-700">{youtubeVideo.description}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add YouTube Video Button */}
        {!youtubeVideo && (
          <Card className="mb-8 border-dashed border-2">
            <CardContent className="text-center py-8">
              <Youtube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Add a YouTube Video</h3>
              <p className="text-gray-600 mb-4">
                Share a special family video with everyone
              </p>
              <Button onClick={handleYoutubeEdit}>
                <Youtube className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </CardContent>
          </Card>
        )}

        {/* YouTube Edit Dialog */}
        <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {youtubeVideo ? "Edit" : "Add"} YouTube Video
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="youtube-title">Title</Label>
                <Input
                  id="youtube-title"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="Video title"
                />
              </div>
              <div>
                <Label htmlFor="youtube-description">Description</Label>
                <Textarea
                  id="youtube-description"
                  value={youtubeDescription}
                  onChange={(e) => setYoutubeDescription(e.target.value)}
                  placeholder="Video description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleYoutubeSave} className="flex-1">
                  Save
                </Button>
                {youtubeVideo && (
                  <Button
                    variant="destructive"
                    onClick={handleYoutubeDelete}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Charlie Edit Dialog */}
        <Dialog open={isCharlieDialogOpen} onOpenChange={setIsCharlieDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Charlie's Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="charlie-image">Image URL</Label>
                <Input
                  id="charlie-image"
                  value={charlieImage}
                  onChange={(e) => setCharlieImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="charlie-description">Description</Label>
                <Textarea
                  id="charlie-description"
                  value={charlieDescription}
                  onChange={(e) => setCharlieDescription(e.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={handleCharlieSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
