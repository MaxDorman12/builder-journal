import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { SimpleScotlandMap } from "@/components/SimpleScotlandMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Map as MapIcon, 
  Navigation, 
  Compass, 
  Mountain, 
  Camera,
  Star,
  Eye,
  Target
} from "lucide-react";
import { JournalEntry, MapPin as MapPinType } from "@shared/api";

export default function Map() {
  const { isAuthenticated } = useAuth();
  const [pins, setPins] = useState<MapPinType[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreatePinOpen, setIsCreatePinOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<MapPinType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const loadMapData = async () => {
    try {
      setIsLoading(true);
      const [pinsData, entriesData] = await Promise.all([
        SupabaseStorage.getMapPins(),
        SupabaseStorage.getJournalEntries(),
      ]);
      setPins(pinsData);
      setEntries(entriesData);
      console.log("🗺️ Map data loaded:", { pins: pinsData.length, entries: entriesData.length });
    } catch (error) {
      console.error("❌ Failed to load map data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load data for all users (guests and authenticated)
    loadMapData();

    // Only set up real-time updates for authenticated users
    if (isAuthenticated) {
      const unsubscribe = SupabaseStorage.onUpdate(() => {
        console.log("🔄 MAP: Real-time update received, refreshing map data...");
        loadMapData();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !latitude || !longitude) {
      alert("Please fill in all required fields");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid latitude and longitude values");
      return;
    }

    try {
      console.log("🗺️ Creating pin with data:", { title, description, lat, lng });

      const pin: MapPinType = {
        id: `pin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        description: description.trim(),
        latitude: lat,
        longitude: lng,
        images: [],
        areaType: "highlands",
        updatedBy: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("🗺️ Pin object created:", pin);

      await SupabaseStorage.saveMapPin(pin);
      console.log("✅ Pin saved to Supabase successfully");

      setPins((prev) => [pin, ...prev]);
      setIsCreatePinOpen(false);

      // Reset form
      setTitle("");
      setDescription("");
      setLatitude("");
      setLongitude("");

      console.log("✅ Map pin created successfully");
    } catch (error) {
      console.error("❌ Failed to create map pin:", error);
      console.error("❌ Error details:", error);

      // More specific error message
      let errorMessage = "Failed to create map pin. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += "Unknown error occurred.";
      }

      alert(errorMessage + "\n\nPlease check the console for more details and try again.");
    }
  };

  const handleDeletePin = async (pinId: string) => {
    if (!confirm("Are you sure you want to delete this pin?")) return;

    try {
      await SupabaseStorage.deleteMapPin(pinId);
      setPins((prev) => prev.filter(p => p.id !== pinId));
      setSelectedPin(null);
      console.log("✅ Map pin deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete map pin:", error);
      alert("Failed to delete map pin. Please try again.");
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setIsCreatePinOpen(true);
  };

  const handlePinClick = (pin: MapPinType) => {
    setSelectedPin(pin);
  };

  // Calculate stats
  const totalPhotos = entries.reduce((count, entry) => count + (entry.images?.length || 0), 0);
  const totalEntries = entries.length;
  const areasExplored = new Set(pins.map(pin => pin.areaType || 'unknown')).size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <MapIcon className="h-12 w-12 text-green-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-gray-700">Loading our Scottish map...</p>
            <p className="text-sm text-gray-500 mt-2">🗺️ Discovering highland adventures</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300 px-4 py-2 text-sm font-medium mb-6">
              🗺️ Explore our Scottish adventure map
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Scottish Explorer Map
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-6">
            Highland Adventures
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Navigate through our family's Scottish journey. Every pin marks a special place 
            where memories were made across the beautiful highlands and lowlands.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isAuthenticated && (
              <Button 
                onClick={() => setIsCreatePinOpen(true)} 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                📍 Mark New Place
              </Button>
            )}
            <Button 
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 px-8 py-3 rounded-full text-lg font-semibold"
            >
              <Eye className="h-5 w-5 mr-2" />
              🏴󠁧󠁢󠁳󠁣󠁴󠁿 Explore Scotland
            </Button>
          </div>

          {!isAuthenticated && (
            <div className="inline-block p-4 bg-green-100 border border-green-200 rounded-lg mb-8">
              <p className="text-green-800">
                👁️ <strong>Explorer mode</strong> - Discover our adventure pins and click to explore!
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-800">{pins.length}</p>
              <p className="text-sm text-green-600">Places Marked</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Mountain className="h-8 w-8 mx-auto mb-2 text-blue-700" />
              <p className="text-2xl font-bold text-blue-800">{areasExplored}</p>
              <p className="text-sm text-blue-600">Areas Explored</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Camera className="h-8 w-8 mx-auto mb-2 text-purple-700" />
              <p className="text-2xl font-bold text-purple-800">{totalPhotos}</p>
              <p className="text-sm text-purple-600">Photos Taken</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Star className="h-8 w-8 mx-auto mb-2 text-orange-700" />
              <p className="text-2xl font-bold text-orange-800">{totalEntries}</p>
              <p className="text-sm text-orange-600">Adventures</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Interactive Scotland Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center justify-between text-2xl">
                  <div className="flex items-center gap-3">
                    <Compass className="h-8 w-8" />
                    🏴󠁧󠁢󠁳󠁣󠁴󠁿 Interactive Scotland Map
                  </div>
                  <Badge className="bg-white/20 text-white font-semibold">
                    {pins.length} pins
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <SimpleScotlandMap
                    pins={pins}
                    onMapClick={isAuthenticated ? handleMapClick : undefined}
                    onPinClick={handlePinClick}
                    className="h-[500px] w-full"
                  />
                  {!isAuthenticated && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-black/60 text-white backdrop-blur-sm">
                        👁️ View-only mode
                      </Badge>
                    </div>
                  )}
                  {isAuthenticated && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-green-500/80 text-white backdrop-blur-sm">
                        📍 Click anywhere to add a pin
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Legend & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-6 w-6" />
                  Map Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Adventure Pins</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Highland Areas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Coastal Regions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Cities & Towns</span>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Button 
                      onClick={() => setIsCreatePinOpen(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Add New Pin
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Pins:</span>
                    <Badge className="bg-green-100 text-green-700">{pins.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Adventures:</span>
                    <Badge className="bg-blue-100 text-blue-700">{totalEntries}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Photos:</span>
                    <Badge className="bg-purple-100 text-purple-700">{totalPhotos}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Areas:</span>
                    <Badge className="bg-orange-100 text-orange-700">{areasExplored}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Adventure Pins Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-green-600" />
              📍 Our Adventure Pins
            </h3>
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-lg font-semibold">
              {pins.length} places discovered
            </Badge>
          </div>
          
          {pins.length === 0 ? (
            <Card className="border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="text-center py-16">
                <MapPin className="h-20 w-20 text-green-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-green-700 mb-4">No Adventure Pins Yet!</h3>
                <p className="text-green-600 mb-8 text-lg max-w-md mx-auto">
                  Start exploring Scotland by adding your first adventure pin to the map! 
                  Click anywhere on the map above to mark a special place.
                </p>
                {isAuthenticated && (
                  <Button 
                    onClick={() => setIsCreatePinOpen(true)} 
                    className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-4 rounded-full shadow-lg"
                  >
                    <Plus className="h-6 w-6 mr-2" />
                    🗺️ Add Your First Pin
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pins.map((pin, index) => {
                const colors = [
                  'from-green-100 to-green-200 border-green-300',
                  'from-blue-100 to-blue-200 border-blue-300',
                  'from-purple-100 to-purple-200 border-purple-300',
                  'from-orange-100 to-orange-200 border-orange-300',
                  'from-pink-100 to-pink-200 border-pink-300',
                  'from-indigo-100 to-indigo-200 border-indigo-300'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <Card 
                    key={pin.id} 
                    className={`bg-gradient-to-br ${colorClass} cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg`}
                    onClick={() => handlePinClick(pin)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-gray-700" />
                          <span className="font-bold text-gray-800">{pin.title}</span>
                        </div>
                        {isAuthenticated && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPin(pin)}
                              className="hover:bg-white/50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePin(pin.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-3 line-clamp-3">{pin.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="text-xs">
                          📍 {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                        </Badge>
                        {pin.images && pin.images.length > 0 && (
                          <Badge className="bg-white/50 text-gray-700 text-xs">
                            📸 {pin.images.length} photo{pin.images.length === 1 ? '' : 's'}
                          </Badge>
                        )}
                      </div>
                      
                      {pin.images && pin.images.length > 0 && (
                        <div className="mt-4">
                          <img
                            src={pin.images[0]}
                            alt={pin.title}
                            className="w-full h-32 object-cover rounded-lg shadow-md"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Pin Dialog */}
        <Dialog open={isCreatePinOpen} onOpenChange={setIsCreatePinOpen}>
          <DialogContent className="z-[10000] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <MapPin className="h-8 w-8 text-green-600" />
                📍 Add New Adventure Pin
              </DialogTitle>
            </DialogHeader>
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                💡 <strong>Pro Tip:</strong> You can click anywhere on the Scotland map above to automatically set the coordinates for your new pin!
              </p>
            </div>
            <form onSubmit={handleCreatePin} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold">Place Name *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Edinburgh Castle, Ben Nevis, Loch Ness..."
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this place special? Share your memories and experiences..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-lg font-semibold">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="56.8"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-lg font-semibold">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-4.2"
                    required
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatePinOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Add Pin to Map
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pin Details Dialog */}
        <Dialog open={!!selectedPin} onOpenChange={() => setSelectedPin(null)}>
          <DialogContent className="z-[10000] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <MapPin className="h-8 w-8 text-green-600" />
                {selectedPin?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedPin && (
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <p className="text-gray-800 text-lg leading-relaxed">{selectedPin.description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-100 text-green-700 px-4 py-2">
                    📍 {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                    🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland
                  </Badge>
                </div>
                
                {selectedPin.images && selectedPin.images.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">📸 Photos from this location:</h4>
                    <div className="grid gap-3">
                      {selectedPin.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedPin.title} ${index + 1}`}
                          className="w-full rounded-lg shadow-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {isAuthenticated && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPin(null)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeletePin(selectedPin.id)}
                      className="flex-1 font-bold"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete Pin
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the Dorman Family Adventures
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2 h-2 bg-green-300 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
