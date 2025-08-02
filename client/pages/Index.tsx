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
} from "lucide-react";
import {
  JournalEntry,
  MapPin as MapPinType,
  YouTubeVideo,
} from "@shared/api";

const scottishColors = [
  'from-indigo-600 to-purple-600',
  'from-emerald-500 to-teal-600', 
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-blue-600 to-indigo-600',
  'from-green-500 to-emerald-600'
];

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
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="text-center p-8">
            <div className="relative mb-6">
              <Mountain className="h-16 w-16 text-purple-600 mx-auto animate-bounce" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 rounded-full blur-xl"></div>
            </div>
            <p className="text-xl font-bold text-purple-800 mb-2">Loading Scottish Adventures...</p>
            <p className="text-purple-600">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Gathering Highland memories</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 via-blue-500 to-green-500 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-green-300/20 rounded-full blur-lg animate-bounce" style={{ animationDuration: '4s', animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-8 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-3xl opacity-30 blur-xl animate-pulse"></div>
            <div className="relative bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="relative">
                  <Mountain className="h-20 w-20 text-white drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-0 bg-blue-400 opacity-50 rounded-full blur-md"></div>
                </div>
                <div>
                  <h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl mb-2">
                    🏴󠁧󠁢󠁳󠁣󠁴󠁿 DORMAN
                  </h1>
                  <p className="text-3xl md:text-4xl font-bold text-yellow-200 drop-shadow-lg">
                    Adventures
                  </p>
                </div>
                <div className="relative">
                  <Heart className="h-20 w-20 text-red-400 fill-red-400 drop-shadow-lg animate-pulse" />
                  <div className="absolute inset-0 bg-red-400 opacity-30 rounded-full blur-lg"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-2xl text-white font-semibold drop-shadow-lg">
                  ✨ Capturing Highland Magic ✨
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Badge className="bg-white/30 text-white border-white/40 backdrop-blur-sm px-4 py-2 text-lg font-semibold">
                    🏔️ Scottish Explorers
                  </Badge>
                  <Badge className="bg-green-500/70 text-white border-green-400/40 backdrop-blur-sm px-4 py-2 text-lg font-semibold">
                    🌟 {entries.length + pins.length} Adventures
                  </Badge>
                  <Badge className="bg-blue-500/70 text-white border-blue-400/40 backdrop-blur-sm px-4 py-2 text-lg font-semibold">
                    📸 {totalPhotos} Memories
                  </Badge>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mt-8 p-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl">
                  <p className="text-white font-bold text-lg flex items-center justify-center gap-2">
                    👁️ <span>Exploring in Guest Mode</span> ✨
                  </p>
                  <p className="text-white/90 mt-2">
                    Join the adventure! 
                    <Link to="/login" className="text-yellow-200 hover:text-yellow-100 ml-2 font-bold underline">
                      🔐 Family Login
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colorful Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 border-0 shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-white group-hover:animate-bounce" />
              <p className="text-4xl font-black text-white drop-shadow-lg">{entries.length}</p>
              <p className="text-blue-100 font-semibold">Epic Tales</p>
              <div className="mt-2">
                <Badge className="bg-white/30 text-white text-xs px-3 py-1">
                  📖 Stories
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-700 border-0 shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-white group-hover:animate-bounce" />
              <p className="text-4xl font-black text-white drop-shadow-lg">{pins.length}</p>
              <p className="text-green-100 font-semibold">Magic Places</p>
              <div className="mt-2">
                <Badge className="bg-white/30 text-white text-xs px-3 py-1">
                  🗺️ Explored
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 border-0 shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-white group-hover:animate-bounce" />
              <p className="text-4xl font-black text-white drop-shadow-lg">{totalPhotos}</p>
              <p className="text-purple-100 font-semibold">Memories</p>
              <div className="mt-2">
                <Badge className="bg-white/30 text-white text-xs px-3 py-1">
                  📸 Captured
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-pink-700 border-0 shadow-xl hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-white fill-white group-hover:animate-pulse" />
              <p className="text-4xl font-black text-white drop-shadow-lg">
                {entries.reduce((sum, entry) => sum + (entry.likes || 0), 0)}
              </p>
              <p className="text-red-100 font-semibold">Love Points</p>
              <div className="mt-2">
                <Badge className="bg-white/30 text-white text-xs px-3 py-1">
                  💖 Loved
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Youtube className="h-12 w-12 text-red-500 animate-pulse" />
              <h2 className="text-5xl font-black text-white drop-shadow-2xl">
                🎬 Family Cinema
              </h2>
              <Play className="h-12 w-12 text-red-500 animate-bounce" />
            </div>
            <p className="text-xl text-white/90 font-semibold">Our Scottish Adventure Films</p>
          </div>
          
          {youtubeVideo ? (
            <Card className="max-w-5xl mx-auto bg-gradient-to-br from-red-100 to-pink-100 border-4 border-red-300 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-2xl">
                  <div className="flex items-center gap-3">
                    <Youtube className="h-8 w-8" />
                    {youtubeVideo.title}
                    <Badge className="bg-white text-red-600 font-bold">FEATURED</Badge>
                  </div>
                  {isAuthenticated && (
                    <Button variant="ghost" size="sm" onClick={handleYoutubeEdit} className="text-white hover:bg-white/20">
                      <Edit2 className="h-5 w-5" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="aspect-video rounded-xl overflow-hidden mb-6 shadow-lg">
                  <iframe
                    src={youtubeVideo.url.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allowFullScreen
                    title={youtubeVideo.title}
                  />
                </div>
                {youtubeVideo.description && (
                  <div className="bg-white/50 rounded-lg p-4">
                    <p className="text-gray-800 text-lg leading-relaxed">{youtubeVideo.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-red-50 to-pink-100 border-4 border-dashed border-red-300 shadow-xl hover:border-red-400 transition-colors">
              <CardContent className="text-center py-16">
                <Youtube className="h-24 w-24 mx-auto mb-6 text-red-400" />
                <h3 className="text-3xl font-bold mb-4 text-red-700">🎥 No Family Video Yet!</h3>
                <p className="text-red-600 mb-8 text-lg">
                  Ready to share your epic Scottish adventures? Upload your family video! 🏴󠁧󠁢󠁳󠁣󠁴󠁿
                </p>
                {isAuthenticated && (
                  <Button onClick={handleYoutubeEdit} className="bg-red-500 hover:bg-red-600 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-6 w-6 mr-2" />
                    🎬 Add Adventure Video
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Adventure Navigation */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white drop-shadow-2xl mb-2">
              🧭 Choose Your Adventure!
            </h2>
            <p className="text-xl text-white/90">Explore our Highland journeys</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link to="/journal">
              <Card className="bg-gradient-to-br from-blue-400 to-indigo-600 border-0 shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-white group-hover:animate-bounce" />
                  <h3 className="font-black text-xl text-white mb-2">📖 Journal</h3>
                  <Badge className="bg-white/30 text-white font-semibold">
                    {entries.length} Adventures
                  </Badge>
                  <p className="text-blue-100 text-sm mt-2">Epic Stories</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/map">
              <Card className="bg-gradient-to-br from-green-400 to-emerald-600 border-0 shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-white group-hover:animate-bounce" />
                  <h3 className="font-black text-xl text-white mb-2">🗺️ Map</h3>
                  <Badge className="bg-white/30 text-white font-semibold">
                    {pins.length} Places
                  </Badge>
                  <p className="text-green-100 text-sm mt-2">Highland Spots</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gallery">
              <Card className="bg-gradient-to-br from-purple-400 to-violet-600 border-0 shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-8 text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-white group-hover:animate-bounce" />
                  <h3 className="font-black text-xl text-white mb-2">📸 Gallery</h3>
                  <Badge className="bg-white/30 text-white font-semibold">
                    {totalPhotos} Photos
                  </Badge>
                  <p className="text-purple-100 text-sm mt-2">Memory Lane</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/wishlist">
              <Card className="bg-gradient-to-br from-yellow-400 to-orange-600 border-0 shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group h-full">
                <CardContent className="p-8 text-center">
                  <Star className="h-16 w-16 mx-auto mb-4 text-white group-hover:animate-spin" style={{ animationDuration: '3s' }} />
                  <h3 className="font-black text-xl text-white mb-2">🌟 Wishlist</h3>
                  <Badge className="bg-white/30 text-white font-semibold">
                    Dream Big
                  </Badge>
                  <p className="text-yellow-100 text-sm mt-2">Future Fun</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Adventures */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <BookOpen className="h-8 w-8" />
                🌟 Latest Adventures
                <Badge className="bg-white/30 text-white ml-auto">
                  {entries.length} Stories
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entries.slice(0, 3).map((entry, index) => (
                <div key={entry.id} className={`p-4 rounded-xl mb-4 last:mb-0 ${
                  index % 2 === 0 
                    ? 'bg-gradient-to-r from-blue-100/80 to-purple-100/80' 
                    : 'bg-gradient-to-r from-green-100/80 to-blue-100/80'
                } backdrop-blur-sm border border-white/30 hover:scale-105 transition-all duration-300`}>
                  <h4 className="font-bold text-lg text-gray-800 mb-2">{entry.title}</h4>
                  <p className="text-gray-700 line-clamp-3 mb-3 text-sm">
                    {entry.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 font-medium">
                      📅 {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      {entry.location && (
                        <Badge className="bg-white/50 text-gray-700 text-xs">
                          📍 {entry.location}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        <span className="text-sm font-bold text-gray-700">{entry.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-20 w-20 text-white/50 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Adventures Yet!</h3>
                  <p className="text-white/80 mb-6 text-lg">
                    Start your epic Scottish journey! 🏔️
                  </p>
                  <Link to="/journal">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-full">
                      ✨ Begin Adventure
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charlie Section */}
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white backdrop-blur-sm">
              <CardTitle className="flex items-center justify-between text-2xl font-bold">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8" />
                  🐕 Charlie - Adventure Buddy
                </div>
                {isAuthenticated && (
                  <Button variant="ghost" size="sm" onClick={handleCharlieEdit} className="text-white hover:bg-white/20">
                    <Edit2 className="h-5 w-5" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {charlieData.image && (
                <div className="relative mb-6">
                  <img
                    src={charlieData.image}
                    alt="Charlie"
                    className="w-full h-64 object-cover rounded-xl shadow-lg border-4 border-white/30"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/60 text-white backdrop-blur-sm font-bold">
                      🐾 Adventure Pro
                    </Badge>
                  </div>
                </div>
              )}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <p className="text-white text-sm leading-relaxed line-clamp-6">
                  {charlieData.description}
                </p>
              </div>
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">🎾 Ball Master</Badge>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">🥾 Hiking Hero</Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">📸 Photo Star</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Edit Dialog */}
        <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Youtube className="h-8 w-8 text-red-500" />
                {youtubeVideo ? "Edit" : "Add"} Family Video
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="youtube-url" className="text-lg font-semibold">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="youtube-title" className="text-lg font-semibold">Title</Label>
                <Input
                  id="youtube-title"
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="Our Amazing Scottish Adventure"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="youtube-description" className="text-lg font-semibold">Description</Label>
                <Textarea
                  id="youtube-description"
                  value={youtubeDescription}
                  onChange={(e) => setYoutubeDescription(e.target.value)}
                  placeholder="Tell everyone about this special video..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleYoutubeSave} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold">
                  <Youtube className="h-5 w-5 mr-2" />
                  Save Video
                </Button>
                {youtubeVideo && (
                  <Button variant="destructive" onClick={handleYoutubeDelete} className="font-bold">
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Charlie Edit Dialog */}
        <Dialog open={isCharlieDialogOpen} onOpenChange={setIsCharlieDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <User className="h-8 w-8 text-amber-500" />
                Edit Charlie's Information
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="charlie-image" className="text-lg font-semibold">Image URL</Label>
                <Input
                  id="charlie-image"
                  value={charlieImage}
                  onChange={(e) => setCharlieImage(e.target.value)}
                  placeholder="https://..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="charlie-description" className="text-lg font-semibold">Description</Label>
                <Textarea
                  id="charlie-description"
                  value={charlieDescription}
                  onChange={(e) => setCharlieDescription(e.target.value)}
                  rows={8}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleCharlieSave} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
                <User className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
