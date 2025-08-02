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
  Compass,
  Users,
  Trophy,
  Gift,
  Sun,
  CloudRain,
  Waves,
  TreePine,
  Home,
  Map,
  Image,
  Settings,
} from "lucide-react";
import { JournalEntry, MapPin as MapPinType, YouTubeVideo } from "@shared/api";

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
    description: "Charlie's data is temporarily unavailable.",
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

  // Load all data from Supabase with improved error handling
  const loadData = async (retryCount = 0) => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading data from Supabase...");

      // Load data with individual error handling for each service
      const [entriesData, pinsData, charlieData, youtubeData] = await Promise.allSettled([
        SupabaseStorage.getJournalEntries(),
        SupabaseStorage.getMapPins(),
        SupabaseStorage.getCharlieData(),
        SupabaseStorage.getYouTubeVideo(),
      ]);

      // Handle entries
      if (entriesData.status === 'fulfilled') {
        setEntries(entriesData.value);
      } else {
        console.warn("⚠️ Failed to load journal entries, using empty array");
        setEntries([]);
      }

      // Handle pins
      if (pinsData.status === 'fulfilled') {
        setPins(pinsData.value);
      } else {
        console.warn("⚠️ Failed to load map pins, using empty array");
        setPins([]);
      }

      // Handle Charlie data with fallback
      if (charlieData.status === 'fulfilled') {
        setCharlieData(charlieData.value);
      } else {
        console.warn("⚠️ Failed to load Charlie data, using fallback");
        setCharlieData({
          image: "",
          description: "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾"
        });
      }

      // Handle YouTube data
      if (youtubeData.status === 'fulfilled') {
        setYoutubeVideo(youtubeData.value);
      } else {
        console.warn("⚠️ Failed to load YouTube data, using null");
        setYoutubeVideo(null);
      }

      console.log("✅ Data loading completed with fallbacks where needed");
    } catch (error) {
      console.error("❌ Failed to load data:", error);

      // If this is a network error and we haven't retried, try again
      if (retryCount < 1 && error instanceof Error && error.message.includes('fetch')) {
        console.log("🔄 Retrying data load due to network error...");
        setTimeout(() => loadData(retryCount + 1), 2000);
        return;
      }

      // Set fallback data if everything fails
      setEntries([]);
      setPins([]);
      setCharlieData({
        image: "",
        description: "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾"
      });
      setYoutubeVideo(null);
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

  const totalPhotos = entries.reduce(
    (count, entry) => count + (entry.images?.length || 0),
    0,
  );
  const wishlistItems = 5; // Placeholder

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <Mountain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium">
              Loading our Scottish adventures...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 border-pink-300 px-4 py-2 text-sm font-medium mb-6">
              💜 Welcome to our magical adventure!
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            The Dorman Family
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
            Scottish Adventures
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Follow Max, Charlotte, Oscar, Rose, and Lola as they explore the
            beautiful landscapes of Scotland, creating memories and sharing
            their amazing journeys together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/journal">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg">
                📖 Read Our Journal
              </Button>
            </Link>
            <Link to="/map">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg">
                🗺️ Explore Our Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300 text-center">
            <CardContent className="p-6">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-pink-700" />
              <p className="text-2xl font-bold text-pink-800">
                {entries.length}
              </p>
              <p className="text-sm text-pink-600">Posts Visited</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-700" />
              <p className="text-2xl font-bold text-purple-800">5</p>
              <p className="text-sm text-purple-600">Family Explorers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-center">
            <CardContent className="p-6">
              <Mountain className="h-8 w-8 mx-auto mb-2 text-blue-700" />
              <p className="text-2xl font-bold text-blue-800">{pins.length}</p>
              <p className="text-sm text-blue-600">Family Adventures</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-center">
            <CardContent className="p-6">
              <Star className="h-8 w-8 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-800">4/5</p>
              <p className="text-sm text-green-600">Adventure Joy Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* View All Family Stats Link */}
        <div className="text-center mb-12">
          <Link
            to="/calendar"
            className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
          >
            📊 View All Family Stats →
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* About Our Family */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              About Our Family
            </h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We are the Dorman family - Max and Charlotte, along with our
                three wonderful children Oscar, Rose, and Lola. Living in
                beautiful Scotland, we're passionate about exploring the diverse
                landscapes our country offers, from rugged highlands to towering
                Munros.
              </p>
              <p>
                Each journal captures our adventures as we discover hidden gems,
                bustling cities, and picturesque villages throughout Scotland.
                Each day brings new memories, challenges, and stories to share.
              </p>
              <p>
                Join us as we document our journey filled our experiences, and
                build our trove of family memories that we'll cherish forever.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                🏔️ Highland Hikers
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                🌊 Loch Explorers
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-300">
                📝 Memory Makers
              </Badge>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-4">✨ Follow Our Family</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-pink-500 text-white">
                  💜 Dorman Family Adventures 💜
                </Badge>
              </div>
            </div>
          </div>

          {/* Our Scotland Adventures */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                🎬 Our Scotland Adventures
              </h3>
              {isAuthenticated && (
                <Button variant="ghost" size="sm" onClick={handleYoutubeEdit}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {youtubeVideo ? (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                    <iframe
                      src={youtubeVideo.url.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                      title={youtubeVideo.title}
                    />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      {youtubeVideo.title}
                    </h4>
                    <p className="text-sm text-purple-600 mb-4">
                      Click to open in YouTube
                    </p>
                    {youtubeVideo.description && (
                      <p className="text-gray-600 text-sm">
                        {youtubeVideo.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="aspect-video rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Youtube className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                      <h4 className="font-semibold text-purple-800 mb-2">
                        Watch Our Latest Adventure
                      </h4>
                      <p className="text-sm text-purple-600">
                        Click to open in YouTube
                      </p>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <Button
                      onClick={handleYoutubeEdit}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Video
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Charlie Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Charlie Image */}
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {charlieData.image ? (
                  <img
                    src={charlieData.image}
                    alt="Charlie in a field of flowers"
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-green-100 flex items-center justify-center">
                    <div className="text-center">
                      <User className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600">
                        Charlie's photo coming soon!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Meet Charlie */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                🐕 Meet Charlie
              </h3>
              {isAuthenticated && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-green-600">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" className="text-yellow-600">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-orange-600">
                    Clean
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Reset
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCharlieEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-6">
              {charlieData.description ||
                "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland."}
            </p>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-red-100 text-red-700">
                  ❤️ Adventure Buddy
                </Badge>
                <Badge className="bg-green-100 text-green-700">
                  🌿 Trail Explorer
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  📸 Photo Star
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-pink-100 text-pink-700">
                  💖 Family Heart
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Adventures */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Recent Adventures
            </h3>
            <Link
              to="/journal"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View All Entries →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {entries.slice(0, 3).map((entry, index) => (
              <Card
                key={entry.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0
                          ? "bg-red-500"
                          : index === 1
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                      }`}
                    >
                      {index === 0 ? "🏠" : index === 1 ? "🏰" : "🥾"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {entry.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {entry.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>👥 {entry.likes || 0} likes</span>
                    <span>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {entries.length === 0 && (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="opacity-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        <div>
                          <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the Dorman Family Adventures
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2 h-2 bg-purple-300 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* YouTube Edit Dialog */}
        <Dialog
          open={isYoutubeDialogOpen}
          onOpenChange={setIsYoutubeDialogOpen}
        >
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
                <Button
                  onClick={handleYoutubeSave}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
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
        <Dialog
          open={isCharlieDialogOpen}
          onOpenChange={setIsCharlieDialogOpen}
        >
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
