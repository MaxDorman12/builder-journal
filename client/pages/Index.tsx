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
  Compass,
  Users,
  Mountain,
  Waves,
  Edit2,
  User,
  Star,
  CloudRain,
  Sun,
  Trophy,
  Gift,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  JournalEntry,
  MapPin as MapPinType,
  YouTubeVideo,
} from "@shared/api";

const scottishPhrases = [
  "Haste ye back! 🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Bonnie adventures await! ✨",
  "Slàinte to family memories! 🥃",
  "Exploring the highlands together! 🏔️",
  "Making memories in bonnie Scotland! 💙"
];

const weatherEmojis = ["🌧️", "☀️", "⛅", "🌤️", "❄️"];
const adventureEmojis = ["🎒", "⛰️", "🏰", "🦌", "🌊", "🚶‍♀️", "📸", "🎯"];

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

  // Fun interactive state
  const [currentPhrase, setCurrentPhrase] = useState(scottishPhrases[0]);
  const [todayWeather, setTodayWeather] = useState(weatherEmojis[1]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [adventureCount, setAdventureCount] = useState(0);

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
      setAdventureCount(entriesData.length + pinsData.length);

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

  // Fun rotating phrases and weather
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(scottishPhrases[Math.floor(Math.random() * scottishPhrases.length)]);
    }, 5000);

    const weatherInterval = setInterval(() => {
      setTodayWeather(weatherEmojis[Math.floor(Math.random() * weatherEmojis.length)]);
    }, 10000);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(weatherInterval);
    };
  }, []);

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
  const averageRating = entries.length > 0 ? 
    entries.reduce((sum, entry) => sum + (entry.likes || 0), 0) / entries.length : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Mountain className="h-6 w-6 text-purple-600 animate-pulse" />
              </div>
            </div>
            <p className="text-lg font-medium text-purple-800">Loading our Scottish adventures...</p>
            <p className="text-sm text-purple-600 mt-2">Gathering memories from the highlands 🏔️</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 overflow-hidden">
      {/* Floating adventure emojis */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {adventureEmojis.map((emoji, index) => (
          <div
            key={index}
            className="absolute text-2xl opacity-20 animate-float"
            style={{
              left: `${(index * 15) % 100}%`,
              top: `${(index * 23) % 100}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${4 + (index % 3)}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Magical Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <Mountain className="h-16 w-16 text-purple-600 animate-bounce" style={{ animationDuration: '3s' }} />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-spin" style={{ animationDuration: '2s' }} />
              </div>
              <div className="relative">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                  🏴󠁧󠁢󠁳󠁣󠁴󠁿 Dorman Adventures 🏴󠁧󠁢󠁳󠁣󠁴󠁿
                </h1>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-blue-400 opacity-30 blur-md rounded-lg"></div>
              </div>
              <div className="relative">
                <Heart className="h-16 w-16 text-red-500 animate-pulse fill-red-500" />
                <div className="absolute inset-0 animate-ping">
                  <Heart className="h-16 w-16 text-red-400 opacity-75" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-6 text-lg">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                  {currentPhrase}
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 text-lg">
                  Today in Scotland {todayWeather}
                </Badge>
              </div>
              
              <p className="text-xl text-gray-700 font-medium">
                Capturing magical moments across the bonnie highlands! ✨
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="border-purple-300 text-purple-700 px-4 py-2">
                  🎯 {adventureCount} Adventures & Counting!
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="hover:bg-purple-100"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-purple-600" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>

              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200 rounded-xl">
                  <p className="text-blue-800 font-medium flex items-center justify-center gap-2">
                    👁️ <strong>Exploring in View-Only Mode</strong> 
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </p>
                  <p className="text-blue-600 mt-2">
                    Join our Scottish adventure! 
                    <Link to="/login" className="text-blue-800 hover:underline ml-1 font-medium">
                      🔐 Family Login
                    </Link> 
                    to add your own memories ✨
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fun Stats Dashboard */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-purple-800 flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Adventure Stats & Achievements
              <Trophy className="h-8 w-8 text-yellow-500" />
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-purple-200 to-purple-400 border-0 hover:scale-105 transition-transform cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="p-3 bg-white/60 rounded-full inline-block group-hover:animate-bounce">
                    <BookOpen className="h-8 w-8 text-purple-700" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-yellow-500 text-yellow-900 text-xs px-2">📖</Badge>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-900 mb-1">{entries.length}</p>
                <p className="text-sm text-purple-700 font-medium">Epic Journeys</p>
                <div className="flex justify-center mt-2">
                  {[...Array(Math.min(entries.length, 5))].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-200 to-green-400 border-0 hover:scale-105 transition-transform cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="p-3 bg-white/60 rounded-full inline-block group-hover:animate-bounce">
                    <MapPin className="h-8 w-8 text-green-700" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-red-500 text-white text-xs px-2">🗺️</Badge>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-900 mb-1">{pins.length}</p>
                <p className="text-sm text-green-700 font-medium">Magic Places</p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                    🏰 Discovered
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-200 to-blue-400 border-0 hover:scale-105 transition-transform cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="p-3 bg-white/60 rounded-full inline-block group-hover:animate-bounce">
                    <Camera className="h-8 w-8 text-blue-700" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-pink-500 text-white text-xs px-2">📸</Badge>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-900 mb-1">{totalPhotos}</p>
                <p className="text-sm text-blue-700 font-medium">Magical Moments</p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                    💝 Memories
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-200 to-orange-300 border-0 hover:scale-105 transition-transform cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="p-3 bg-white/60 rounded-full inline-block group-hover:animate-bounce">
                    <Heart className="h-8 w-8 text-orange-700 fill-red-500" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-purple-500 text-white text-xs px-2">💖</Badge>
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-900 mb-1">{Math.round(averageRating * 10)/10}</p>
                <p className="text-sm text-orange-700 font-medium">Love Factor</p>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`h-3 w-3 ${i < averageRating ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fun achievement banner */}
          <Card className="bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 border-2 border-dashed border-purple-300">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
                  🏆 Achievement Unlocked: Scottish Explorer Family! 🏆
                </p>
                <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-purple-700">
                  <span className="flex items-center gap-1">
                    🏴󠁧󠁢󠁳󠁣󠁴󠁿 Exploring bonnie Scotland together
                  </span>
                  <span className="flex items-center gap-1">
                    📚 {entries.length} epic tales documented
                  </span>
                  <span className="flex items-center gap-1">
                    📍 {pins.length} magical places marked
                  </span>
                  <span className="flex items-center gap-1">
                    📸 {totalPhotos} precious memories captured
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation Adventure Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-800 flex items-center justify-center gap-2">
            <Compass className="h-8 w-8 text-blue-500 animate-spin" style={{ animationDuration: '8s' }} />
            Choose Your Adventure!
            <Gift className="h-8 w-8 text-green-500 animate-bounce" />
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/journal">
              <Card className="hover:scale-110 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 hover:border-blue-500 hover:shadow-xl group">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <BookOpen className="h-12 w-12 mx-auto text-blue-600 group-hover:animate-bounce" />
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2">
                      {entries.length}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-blue-800">📖 Journal</h3>
                  <p className="text-sm text-blue-600 mt-1">Epic Adventures</p>
                  <div className="mt-3">
                    <Badge className="bg-blue-500 text-white text-xs px-3 py-1">
                      ✨ Latest Stories
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/map">
              <Card className="hover:scale-110 transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 hover:border-green-500 hover:shadow-xl group">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <MapPin className="h-12 w-12 mx-auto text-green-600 group-hover:animate-bounce" />
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2">
                      {pins.length}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-green-800">🗺️ Map</h3>
                  <p className="text-sm text-green-600 mt-1">Scottish Treasures</p>
                  <div className="mt-3">
                    <Badge className="bg-green-500 text-white text-xs px-3 py-1">
                      🏰 Explore Scotland
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/gallery">
              <Card className="hover:scale-110 transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 hover:border-purple-500 hover:shadow-xl group">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Camera className="h-12 w-12 mx-auto text-purple-600 group-hover:animate-bounce" />
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2">
                      {totalPhotos}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-purple-800">📸 Gallery</h3>
                  <p className="text-sm text-purple-600 mt-1">Picture Perfect</p>
                  <div className="mt-3">
                    <Badge className="bg-purple-500 text-white text-xs px-3 py-1">
                      💝 Memory Lane
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/wishlist">
              <Card className="hover:scale-110 transition-all duration-300 cursor-pointer bg-gradient-to-br from-pink-100 to-red-200 border-2 border-pink-300 hover:border-pink-500 hover:shadow-xl group">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Heart className="h-12 w-12 mx-auto text-red-600 group-hover:animate-pulse fill-red-500" />
                    <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-500 animate-spin" />
                  </div>
                  <h3 className="font-bold text-lg text-red-800">💖 Wishlist</h3>
                  <p className="text-sm text-red-600 mt-1">Dreams & Goals</p>
                  <div className="mt-3">
                    <Badge className="bg-red-500 text-white text-xs px-3 py-1">
                      🌟 Future Adventures
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* YouTube Section with Enhanced Design */}
        {youtubeVideo && (
          <div className="mb-12">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Youtube className="h-8 w-8" />
                  🎬 {youtubeVideo.title}
                  <Badge className="bg-white text-red-600 ml-auto">FEATURED</Badge>
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleYoutubeEdit}
                      className="text-white hover:bg-white/20"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video relative overflow-hidden">
                    <iframe
                      src={youtubeVideo.url.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allowFullScreen
                      title={youtubeVideo.title}
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/70 text-white backdrop-blur-sm">
                        <Play className="h-3 w-3 mr-1" />
                        Family Video
                      </Badge>
                    </div>
                  </div>
                </div>
                {youtubeVideo.description && (
                  <div className="p-6 bg-white">
                    <p className="text-gray-700 text-lg leading-relaxed">{youtubeVideo.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add YouTube Video Section for authenticated users */}
        {!youtubeVideo && isAuthenticated && (
          <div className="mb-12">
            <Card className="border-2 border-dashed border-red-300 bg-gradient-to-br from-red-50 to-pink-50 hover:border-red-400 transition-colors cursor-pointer" onClick={handleYoutubeEdit}>
              <CardContent className="text-center py-12">
                <Youtube className="h-16 w-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-2xl font-bold mb-3 text-red-700">🎬 Add Your Adventure Video!</h3>
                <p className="text-red-600 mb-6 text-lg">
                  Share a special family video with everyone to relive those magical Scottish moments! ✨
                </p>
                <Button onClick={handleYoutubeEdit} className="bg-red-500 hover:bg-red-600 text-white text-lg px-8 py-3">
                  <Youtube className="h-5 w-5 mr-2" />
                  🎥 Add Family Video
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Adventures with Enhanced Design */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <BookOpen className="h-7 w-7" />
                🌟 Latest Adventures
                <Badge className="bg-white text-blue-600 ml-auto">
                  {entries.length} Stories
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {entries.slice(0, 3).map((entry, index) => (
                <div key={entry.id} className={`relative p-4 rounded-xl mb-4 ${
                  index % 2 === 0 
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200' 
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200'
                } hover:scale-105 transition-transform cursor-pointer`}>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                      {index === 0 ? '🔥 Latest' : index === 1 ? '⭐ Popular' : '💎 Classic'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2 pr-16">{entry.title}</h4>
                  <p className="text-gray-700 line-clamp-3 mb-3 text-sm leading-relaxed">
                    {entry.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">
                      📅 {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      {entry.location && (
                        <Badge variant="outline" className="text-xs">
                          📍 {entry.location}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                        <span className="text-xs text-gray-600">{entry.likes || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-600 mb-2">No Adventures Yet!</h3>
                  <p className="text-blue-500 mb-6">
                    Start your Scottish journey by creating your first epic tale! 🏔️
                  </p>
                  <Link to="/journal">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      ✨ Start Your Adventure
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charlie Section with Enhanced Design */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <User className="h-7 w-7" />
                🐕 Charlie - Our Adventure Buddy
                <Badge className="bg-white text-amber-600 ml-auto">
                  Family Dog
                </Badge>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCharlieEdit}
                    className="text-white hover:bg-white/20"
                  >
                    <Edit2 className="h-4 w-4" />
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
                    className="w-full h-64 object-cover rounded-xl border-4 border-white shadow-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/60 text-white backdrop-blur-sm">
                      🐾 Adventure Companion
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Heart key={i} className="h-4 w-4 text-red-500 fill-red-500" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {charlieData.description}
                </p>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Badge className="bg-amber-500 text-white">🎾 Ball Expert</Badge>
                <Badge className="bg-green-500 text-white">🥾 Hiking Pro</Badge>
                <Badge className="bg-blue-500 text-white">📸 Photo Star</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Edit Dialog */}
        <Dialog open={isYoutubeDialogOpen} onOpenChange={setIsYoutubeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
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
              <DialogTitle className="flex items-center gap-2 text-xl">
                <User className="h-6 w-6 text-amber-500" />
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
              <Button onClick={handleCharlieSave} className="w-full bg-amber-500 hover:bg-amber-600">
                <User className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
