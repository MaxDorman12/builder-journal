import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { ScotlandMap } from "@/components/ScotlandMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Plus, Edit2, Trash2, Map as MapIcon } from "lucide-react";
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
    if (isAuthenticated) {
      loadMapData();

      // Listen for real-time updates
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

      await SupabaseStorage.saveMapPin(pin);
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
      alert("Failed to create map pin. Please try again.");
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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Family Map</h1>
          <p className="text-gray-600">Please log in to view the family map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MapIcon className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold">Family Map</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-600">Our adventures across Scotland</p>
              {pins.length > 0 && (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  {pins.length} places
                </span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setIsCreatePinOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pin
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Interactive Scotland Map */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏴󠁧󠁢󠁳󠁣󠁴󠁿 <span>Scotland Adventure Map</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScotlandMap
                pins={pins}
                onMapClick={handleMapClick}
                onPinClick={handlePinClick}
                className="h-96"
              />
            </CardContent>
          </Card>

          {/* Pin Cards Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-green-600" />
              Your Adventure Pins
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pins.map((pin) => (
            <Card key={pin.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    {pin.title}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPin(pin)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePin(pin.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">{pin.description}</p>
                <p className="text-sm text-gray-500">
                  📍 {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                </p>
                {pin.images && pin.images.length > 0 && (
                  <div className="mt-3">
                    <img
                      src={pin.images[0]}
                      alt={pin.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {pins.length === 0 && (
            <div className="col-span-full text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No Map Pins Yet
              </h2>
              <p className="text-gray-500 mb-6">
                Start marking your favorite places in Scotland!
              </p>
              <Button onClick={() => setIsCreatePinOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Pin
              </Button>
            </div>
          )}
            </div>
          </div>
        </div>
      )}

      {/* Create Pin Dialog */}
      <Dialog open={isCreatePinOpen} onOpenChange={setIsCreatePinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Map Pin</DialogTitle>
          </DialogHeader>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> You can click anywhere on the Scotland map above to automatically set the coordinates!
            </p>
          </div>
          <form onSubmit={handleCreatePin} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Place name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes this place special?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="56.8"
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-4.2"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatePinOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Pin
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pin Details Dialog */}
      <Dialog open={!!selectedPin} onOpenChange={() => setSelectedPin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPin?.title}</DialogTitle>
          </DialogHeader>
          {selectedPin && (
            <div className="space-y-4">
              <p className="text-gray-700">{selectedPin.description}</p>
              <p className="text-sm text-gray-500">
                📍 {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}
              </p>
              {selectedPin.images && selectedPin.images.length > 0 && (
                <div className="space-y-2">
                  {selectedPin.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedPin.title} ${index + 1}`}
                      className="w-full rounded"
                    />
                  ))}
                </div>
              )}
              <Button
                variant="destructive"
                onClick={() => handleDeletePin(selectedPin.id)}
                className="w-full"
              >
                Delete Pin
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
