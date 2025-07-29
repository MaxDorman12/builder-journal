import React, { useState, useEffect } from 'react';
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
  Edit
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

  // Scotland regions with approximate coordinates (simplified)
  const scotlandRegions = [
    { name: 'Highlands', lat: 57.4, lng: -4.4, x: 45, y: 25 },
    { name: 'Lowlands', lat: 55.5, lng: -3.5, x: 55, y: 65 },
    { name: 'Orkney', lat: 59.0, lng: -3.0, x: 60, y: 5 },
    { name: 'Shetland', lat: 60.3, lng: -1.3, x: 75, y: 0 },
    { name: 'Outer Hebrides', lat: 57.7, lng: -7.3, x: 15, y: 20 },
    { name: 'Inner Hebrides', lat: 56.5, lng: -6.2, x: 25, y: 35 },
    { name: 'Aberdeen', lat: 57.1, lng: -2.1, x: 75, y: 35 },
    { name: 'Edinburgh', lat: 55.9, lng: -3.2, x: 60, y: 60 },
    { name: 'Glasgow', lat: 55.8, lng: -4.2, x: 45, y: 62 },
    { name: 'Stirling', lat: 56.1, lng: -3.9, x: 50, y: 55 },
    { name: 'Perth', lat: 56.4, lng: -3.4, x: 55, y: 50 },
    { name: 'Inverness', lat: 57.5, lng: -4.2, x: 50, y: 30 },
    { name: 'Fort William', lat: 56.8, lng: -5.1, x: 40, y: 40 },
    { name: 'Oban', lat: 56.4, lng: -5.5, x: 35, y: 50 },
    { name: 'Ullapool', lat: 57.9, lng: -5.2, x: 35, y: 25 },
    { name: 'Thurso', lat: 58.6, lng: -3.5, x: 55, y: 15 }
  ];

  useEffect(() => {
    setPins(LocalStorage.getMapPins());
    setEntries(LocalStorage.getJournalEntries());
  }, []);

  const handleMapClick = (e: React.MouseEvent<SVGElement>) => {
    if (!isFamilyMember) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Convert to approximate lat/lng (simplified conversion)
    const lat = 60.5 - (y / 100) * 7; // Scotland roughly spans 53.5 to 60.5 lat
    const lng = -8 + (x / 100) * 10; // Scotland roughly spans -8 to 2 lng
    
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

  const getPinPosition = (pin: MapPin) => {
    // Convert lat/lng back to SVG coordinates (simplified)
    const x = ((pin.lng + 8) / 10) * 100;
    const y = ((60.5 - pin.lat) / 7) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
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
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-96 cursor-pointer"
              onClick={handleMapClick}
            >
              {/* Scotland outline (simplified) */}
              <path
                d="M 20 90 L 15 85 L 10 75 L 8 60 L 12 45 L 18 35 L 25 25 L 35 15 L 45 10 L 55 8 L 65 12 L 75 18 L 85 25 L 90 35 L 88 45 L 85 55 L 80 65 L 75 75 L 70 85 L 60 90 Z"
                fill="rgba(34, 197, 94, 0.1)"
                stroke="rgba(34, 197, 94, 0.3)"
                strokeWidth="0.5"
              />
              
              {/* Region labels */}
              {scotlandRegions.map((region, index) => (
                <g key={index}>
                  <circle
                    cx={region.x}
                    cy={region.y}
                    r="1"
                    fill="rgba(107, 114, 128, 0.3)"
                  />
                  <text
                    x={region.x}
                    y={region.y - 2}
                    fontSize="2"
                    textAnchor="middle"
                    fill="rgb(107, 114, 128)"
                    className="font-medium"
                  >
                    {region.name}
                  </text>
                </g>
              ))}
              
              {/* Adventure pins */}
              {pins.map((pin) => {
                const position = getPinPosition(pin);
                const moodData = MOOD_RATINGS.find(r => r.value === pin.moodRating);
                
                return (
                  <g key={pin.id}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="2"
                      fill={getMoodColor(pin.moodRating)}
                      stroke="white"
                      strokeWidth="0.5"
                      className="cursor-pointer hover:r-3 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPin(pin);
                      }}
                    />
                    <text
                      x={position.x}
                      y={position.y - 3}
                      fontSize="3"
                      textAnchor="middle"
                    >
                      {moodData?.emoji}
                    </text>
                  </g>
                );
              })}
            </svg>
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
