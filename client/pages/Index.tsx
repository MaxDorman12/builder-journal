import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  User,
  Edit2,
  Play,
  Plus,
  Mountain,
  Star,
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
    // Load data for all users (guests and authenticated)
    loadData();

    // Only set up real-time updates for authenticated users
    if (isAuthenticated) {
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

  const totalPhotos = entries.reduce((count, entry) => count + (entry.images?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <Mountain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium">Loading our Scottish adventures...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Clean, Simple Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Mountain className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              🏴󠁧󠁢󠁳󠁣󠁴󠁿 Dorman Family Adventures
            </h1>
            <Heart className="h-12 w-12 text-red-500 fill-red-500" />
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Capturing memories across beautiful Scotland
          </p>
          
          {!isAuthenticated && (
            <div className="inline-block p-4 bg-blue-100 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                👁️ <strong>View-only mode</strong> - 
                <Link to="/login" className="text-blue-600 hover:underline ml-1">
                  Login
                </Link> to add content
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats - Simplified */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-gray-600">Journal Entries</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{pins.length}</p>
              <p className="text-sm text-gray-600">Places Visited</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Camera className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{totalPhotos}</p>
              <p className="text-sm text-gray-600">Photos</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600 fill-red-500" />
              <p className="text-2xl font-bold">
                {entries.reduce((sum, entry) => sum + (entry.likes || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Likes</p>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Section - Prominent */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <Youtube className="h-8 w-8 text-red-500" />
            Family Videos
          </h2>
          
          {youtubeVideo ? (
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-6 w-6 text-red-500" />
                  {youtubeVideo.title}
                </CardTitle>
                {isAuthenticated && (
                  <Button variant="ghost" size="sm" onClick={handleYoutubeEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <iframe
                    src={youtubeVideo.url.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allowFullScreen
                    title={youtubeVideo.title}
                  />
                </div>
                {youtubeVideo.description && (
                  <p className="text-gray-700">{youtubeVideo.description}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto border-2 border-dashed border-gray-300">
              <CardContent className="text-center py-12">
                <Youtube className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Family Video Yet</h3>
                <p className="text-gray-600 mb-6">
                  Share your Scottish adventures with a special family video
                </p>
                {isAuthenticated && (
                  <Button onClick={handleYoutubeEdit} className="bg-red-500 hover:bg-red-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Cards - Simplified */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Explore Our Adventures</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/journal">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-1">Journal</h3>
                  <Badge variant="secondary">{entries.length} entries</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link to="/map">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-10 w-10 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-1">Map</h3>
                  <Badge variant="secondary">{pins.length} places</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gallery">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Camera className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-1">Gallery</h3>
                  <Badge variant="secondary">{totalPhotos} photos</Badge>
                </CardContent>
              </Card>
            </Link>

            <Link to="/wishlist">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Star className="h-10 w-10 mx-auto mb-3 text-yellow-600" />
                  <h3 className="font-semibold mb-1">Wishlist</h3>
                  <Badge variant="secondary">Dreams</Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Adventures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0">
                  <h4 className="font-medium mb-1">{entry.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      {entry.likes || 0}
                    </div>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No adventures yet!</p>
                  <Link to="/journal">
                    <Button className="mt-4" size="sm">Start Your Journey</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charlie Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Charlie - Adventure Buddy
                </div>
                {isAuthenticated && (
                  <Button variant="ghost" size="sm" onClick={handleCharlieEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
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
              <p className="text-sm text-gray-700 line-clamp-4">
                {charlieData.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Edit Dialog */}
        <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Youtube className="h-6 w-6 text-red-500" />
                {youtubeVideo ? "Edit" : "Add"} Family Video
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
                  placeholder="Our Amazing Scottish Adventure"
                />
              </div>
              <div>
                <Label htmlFor="youtube-description">Description</Label>
                <Textarea
                  id="youtube-description"
                  value={youtubeDescription}
                  onChange={(e) => setYoutubeDescription(e.target.value)}
                  placeholder="Tell everyone about this special video..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleYoutubeSave} className="flex-1 bg-red-500 hover:bg-red-600">
                  <Youtube className="h-4 w-4 mr-2" />
                  Save Video
                </Button>
                {youtubeVideo && (
                  <Button variant="destructive" onClick={handleYoutubeDelete}>
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
              <DialogTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Edit Charlie's Information
              </DialogTitle>
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
                  rows={8}
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
