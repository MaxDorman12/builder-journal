import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LocalStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin as MapPinIcon, 
  Plus, 
  Mountain, 
  Calendar,
  Camera,
  Star,
  Eye,
  Edit,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { MapPin, MOOD_RATINGS, JournalEntry } from '@shared/api';

export default function Map() {
  const { isFamilyMember } = useAuth();
  const [pins, setPins] = useState<MapPin[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [isCreatePinOpen, setIsCreatePinOpen] = useState(false);
  const [newPin, setNewPin] = useState({
    title: '',
    description: '',
    moodRating: 3 as 1 | 2 | 3 | 4 | 5,
    visitDate: new Date().toISOString().split('T')[0],
    lat: 0,
    lng: 0
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setPins(LocalStorage.getMapPins());
    setEntries(LocalStorage.getJournalEntries());
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isFamilyMember || isDragging) return;
    
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Convert image coordinates to approximate lat/lng for Scotland
    const relativeX = x / img.offsetWidth;
    const relativeY = y / img.offsetHeight;
    
    // Scotland spans roughly: lat 54.6 to 60.9, lng -8.2 to 1.8
    const lat = 60.9 - (relativeY * 6.3);
    const lng = -8.2 + (relativeX * 10);
    
    setNewPin(prev => ({ ...prev, lat, lng }));
    setIsCreatePinOpen(true);
  };

  const handleCreatePin = () => {
    if (!newPin.title.trim()) return;
    
    const pin: MapPin = {
      id: Date.now().toString(),
      title: newPin.title.trim(),
      description: newPin.description.trim(),
      lat: newPin.lat,
      lng: newPin.lng,
      moodRating: newPin.moodRating,
      visitDate: newPin.visitDate,
      images: []
    };

    LocalStorage.saveMapPin(pin);
    setPins(LocalStorage.getMapPins());
    setIsCreatePinOpen(false);
    setNewPin({
      title: '',
      description: '',
      moodRating: 3,
      visitDate: new Date().toISOString().split('T')[0],
      lat: 0,
      lng: 0
    });
  };

  const getPinPosition = (pin: MapPin, imgWidth: number, imgHeight: number) => {
    // Convert lat/lng back to image coordinates
    const relativeX = (pin.lng + 8.2) / 10;
    const relativeY = (60.9 - pin.lat) / 6.3;
    
    const x = relativeX * imgWidth;
    const y = relativeY * imgHeight;
    
    return { 
      x: Math.max(10, Math.min(imgWidth - 10, x)), 
      y: Math.max(10, Math.min(imgHeight - 10, y)) 
    };
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(4, prev * delta)));
  };

  const getMoodColor = (rating: number) => {
    const colors = {
      1: '#EF4444', // red
      2: '#F97316', // orange
      3: '#EAB308', // yellow
      4: '#22C55E', // green
      5: '#8B5CF6'  // purple
    };
    return colors[rating as keyof typeof colors] || colors[3];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scotland Adventure Map</h1>
          <p className="text-muted-foreground">
            Explore the places we've visited across beautiful Scotland
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <MapPinIcon className="h-3 w-3" />
            <span>{pins.length} Places Visited</span>
          </Badge>
          
          {isFamilyMember && (
            <p className="text-sm text-muted-foreground">
              Click anywhere on the map to add a pin
            </p>
          )}
        </div>
      </div>

      {/* Map */}
      <Card className="family-card">
        <CardContent className="p-6">
          <div className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 rounded-lg overflow-hidden shadow-inner">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
              <button
                onClick={handleZoomIn}
                className="bg-white/90 hover:bg-white shadow-lg rounded-lg p-2 transition-all hover:scale-105"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleZoomOut}
                className="bg-white/90 hover:bg-white shadow-lg rounded-lg p-2 transition-all hover:scale-105"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleResetView}
                className="bg-white/90 hover:bg-white shadow-lg rounded-lg p-2 transition-all hover:scale-105"
                title="Reset View"
              >
                <RotateCcw className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            
            {/* Map Container */}
            <div
              ref={mapContainerRef}
              className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'top left',
                  transition: isDragging ? 'none' : 'transform 0.1s ease'
                }}
                className="relative"
              >
                <img
                  ref={mapImageRef}
                  src="https://cdn.builder.io/api/v1/image/assets%2Fcfcab9c7e41c4c598843808fb9cdccfb%2F352f46e4d03e44daab35503198480309?format=webp&width=800"
                  alt="Detailed map of Scotland"
                  className="w-full h-auto min-h-96 object-contain"
                  onClick={handleMapClick}
                  draggable={false}
                  onLoad={() => {
                    // Force re-render of pins when image loads
                    setPins(LocalStorage.getMapPins());
                  }}
                />
                
                {/* Adventure pins overlay */}
                {mapImageRef.current && pins.map((pin) => {
                  const position = getPinPosition(pin, mapImageRef.current!.offsetWidth, mapImageRef.current!.offsetHeight);
                  const moodData = MOOD_RATINGS.find(r => r.value === pin.moodRating);
                  
                  return (
                    <div
                      key={pin.id}
                      className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`
                      }}
                    >
                      {/* Pin circle */}
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-all"
                        style={{ backgroundColor: getMoodColor(pin.moodRating) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPin(pin);
                        }}
                      />
                      
                      {/* Emoji above pin */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg pointer-events-none">
                        {moodData?.emoji}
                      </div>
                      
                      {/* Pulse effect */}
                      <div 
                        className="absolute inset-0 rounded-full border-2 animate-ping opacity-30"
                        style={{ borderColor: getMoodColor(pin.moodRating) }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Zoom indicator */}
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg shadow-md text-sm font-medium">
              {Math.round(zoom * 100)}%
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-lg shadow-md text-xs text-gray-600">
              🖱️ Click to add pin • 🔍 Scroll to zoom • ✋ Drag to pan
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="text-sm text-muted-foreground">Mood Ratings:</div>
            {MOOD_RATINGS.map((rating) => (
              <div key={rating.value} className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getMoodColor(rating.value) }}
                />
                <span className="text-sm">{rating.emoji} {rating.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">{pins.length}</p>
              <p className="text-xs text-muted-foreground">Places Visited</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mountain className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {pins.filter(p => p.moodRating >= 4).length}
              </p>
              <p className="text-xs text-muted-foreground">Great Trips</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {pins.length > 0 ? (pins.reduce((sum, p) => sum + p.moodRating, 0) / pins.length).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {pins.length > 0 ? new Date().getFullYear() - Math.min(...pins.map(p => new Date(p.visitDate).getFullYear())) + 1 : 0}
              </p>
              <p className="text-xs text-muted-foreground">Years Exploring</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pins */}
      {pins.length > 0 && (
        <Card className="family-card">
          <CardHeader>
            <CardTitle>Recent Adventures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pins
                .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                .slice(0, 6)
                .map((pin) => {
                  const moodData = MOOD_RATINGS.find(r => r.value === pin.moodRating);
                  const relatedEntry = entries.find(e => e.journalEntryId === pin.id);
                  
                  return (
                    <Card key={pin.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{pin.title}</h4>
                          {moodData && (
                            <span className="text-lg">{moodData.emoji}</span>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(pin.visitDate).toLocaleDateString()}
                        </p>
                        
                        {pin.description && (
                          <p className="text-xs line-clamp-2 mb-2">{pin.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <button
                            onClick={() => setSelectedPin(pin)}
                            className="flex items-center space-x-1 text-primary hover:underline"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Details</span>
                          </button>
                          
                          {relatedEntry && (
                            <Badge variant="secondary" className="text-xs">
                              <Camera className="h-2 w-2 mr-1" />
                              Journal Entry
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Pin Dialog */}
      <Dialog open={isCreatePinOpen} onOpenChange={setIsCreatePinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Adventure Pin</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pinTitle">Adventure Title</Label>
              <Input
                id="pinTitle"
                value={newPin.title}
                onChange={(e) => setNewPin(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Amazing hike up Ben Nevis"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pinDescription">Description</Label>
              <Textarea
                id="pinDescription"
                value={newPin.description}
                onChange={(e) => setNewPin(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell us about this adventure..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pinDate">Visit Date</Label>
                <Input
                  id="pinDate"
                  type="date"
                  value={newPin.visitDate}
                  onChange={(e) => setNewPin(prev => ({ ...prev, visitDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Mood Rating</Label>
                <div className="flex space-x-1">
                  {MOOD_RATINGS.map((rating) => (
                    <button
                      key={rating.value}
                      type="button"
                      onClick={() => setNewPin(prev => ({ ...prev, moodRating: rating.value as any }))}
                      className={`text-lg p-1 rounded transition-colors ${
                        newPin.moodRating === rating.value 
                          ? 'bg-primary/20 ring-2 ring-primary' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {rating.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreatePinOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePin}>
                Add Pin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pin Detail Dialog */}
      {selectedPin && (
        <Dialog open={!!selectedPin} onOpenChange={() => setSelectedPin(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedPin.title}</span>
                {MOOD_RATINGS.find(r => r.value === selectedPin.moodRating) && (
                  <Badge className={MOOD_RATINGS.find(r => r.value === selectedPin.moodRating)!.color}>
                    {MOOD_RATINGS.find(r => r.value === selectedPin.moodRating)!.emoji}{' '}
                    {MOOD_RATINGS.find(r => r.value === selectedPin.moodRating)!.label}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Visited on {new Date(selectedPin.visitDate).toLocaleDateString()}
              </div>
              
              {selectedPin.description && (
                <p className="text-sm">{selectedPin.description}</p>
              )}
              
              <div className="text-xs text-muted-foreground">
                Coordinates: {selectedPin.lat.toFixed(2)}, {selectedPin.lng.toFixed(2)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
