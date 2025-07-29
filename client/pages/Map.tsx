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
    const x = ((e.clientX - rect.left) / rect.width) * 400; // Scale to SVG viewBox width
    const y = ((e.clientY - rect.top) / rect.height) * 600; // Scale to SVG viewBox height

    // Convert SVG coordinates to approximate lat/lng for Scotland
    // Scotland spans roughly: lat 54.6 to 60.9, lng -8.2 to 1.8
    const lat = 60.9 - (y / 600) * 6.3; // Map height to latitude range
    const lng = -8.2 + (x / 400) * 10; // Map width to longitude range

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
    // Convert lat/lng back to SVG coordinates for detailed Scotland map
    const x = ((pin.lng + 8.2) / 10) * 400; // Convert longitude to x position
    const y = ((60.9 - pin.lat) / 6.3) * 600; // Convert latitude to y position
    return {
      x: Math.max(20, Math.min(380, x)),
      y: Math.max(20, Math.min(580, y))
    };
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
            <svg
              viewBox="0 0 400 600"
              className="w-full h-96 cursor-pointer"
              onClick={handleMapClick}
            >
              {/* Water/Sea background */}
              <rect x="0" y="0" width="400" height="600" fill="#e0f2fe" />

              {/* Scotland mainland */}
              <path
                d="M 180 580 L 170 570 L 160 550 L 155 530 L 150 510 L 148 490 L 152 470 L 160 450 L 175 430 L 190 410 L 200 390 L 205 370 L 210 350 L 215 330 L 220 310 L 225 290 L 230 270 L 235 250 L 240 230 L 245 210 L 250 190 L 255 170 L 260 150 L 265 130 L 270 110 L 275 90 L 280 70 L 285 50 L 290 30 L 295 20 L 300 15 L 310 12 L 320 15 L 330 20 L 335 30 L 340 40 L 345 50 L 350 60 L 355 70 L 360 80 L 365 90 L 370 100 L 375 110 L 380 120 L 385 130 L 390 140 L 395 150 L 398 160 L 396 170 L 394 180 L 392 190 L 390 200 L 388 210 L 386 220 L 384 230 L 382 240 L 380 250 L 378 260 L 376 270 L 374 280 L 372 290 L 370 300 L 368 310 L 366 320 L 364 330 L 362 340 L 360 350 L 358 360 L 356 370 L 354 380 L 352 390 L 350 400 L 348 410 L 346 420 L 344 430 L 342 440 L 340 450 L 338 460 L 336 470 L 334 480 L 332 490 L 330 500 L 328 510 L 326 520 L 324 530 L 322 540 L 320 550 L 318 560 L 316 570 L 314 580 L 310 585 L 300 580 L 290 575 L 280 570 L 270 565 L 260 560 L 250 555 L 240 550 L 230 545 L 220 540 L 210 535 L 200 530 L 190 535 L 185 545 L 182 555 L 180 565 Z"
                fill="#22c55e"
                fillOpacity="0.2"
                stroke="#16a34a"
                strokeWidth="1"
              />

              {/* Highlands region */}
              <path
                d="M 200 300 L 180 280 L 170 260 L 165 240 L 170 220 L 180 200 L 200 180 L 220 170 L 240 165 L 260 170 L 280 180 L 300 200 L 320 220 L 340 240 L 350 260 L 345 280 L 335 300 L 320 315 L 300 325 L 280 330 L 260 325 L 240 315 L 220 305 Z"
                fill="#10b981"
                fillOpacity="0.15"
                stroke="#059669"
                strokeWidth="0.8"
              />

              {/* Southern Uplands */}
              <path
                d="M 160 450 L 180 430 L 200 415 L 220 410 L 240 415 L 260 425 L 280 435 L 300 445 L 320 455 L 340 465 L 350 475 L 345 485 L 335 495 L 320 500 L 300 495 L 280 490 L 260 485 L 240 480 L 220 475 L 200 470 L 180 465 L 165 455 Z"
                fill="#84cc16"
                fillOpacity="0.12"
                stroke="#65a30d"
                strokeWidth="0.6"
              />

              {/* Western Isles - Outer Hebrides */}
              <g>
                <ellipse cx="70" cy="180" rx="8" ry="40" fill="#22c55e" fillOpacity="0.3" stroke="#16a34a" strokeWidth="0.8" />
                <ellipse cx="60" cy="220" rx="5" ry="25" fill="#22c55e" fillOpacity="0.3" stroke="#16a34a" strokeWidth="0.8" />
                <ellipse cx="50" cy="160" rx="6" ry="30" fill="#22c55e" fillOpacity="0.3" stroke="#16a34a" strokeWidth="0.8" />
              </g>

              {/* Inner Hebrides - Skye, Mull, etc */}
              <g>
                <path d="M 120 200 L 140 195 L 145 210 L 140 225 L 125 230 L 110 225 L 105 210 L 110 195 Z" fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="0.8" />
                <ellipse cx="100" cy="250" rx="12" ry="8" fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="0.8" />
                <ellipse cx="90" cy="280" rx="8" ry="6" fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="0.8" />
                <ellipse cx="110" cy="290" rx="6" ry="4" fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="0.8" />
              </g>

              {/* Orkney Islands */}
              <g>
                <ellipse cx="280" cy="40" rx="15" ry="8" fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="0.8" />
                <circle cx="275" cy="35" r="3" fill="#22c55e" fillOpacity="0.5" stroke="#16a34a" strokeWidth="0.6" />
                <circle cx="285" cy="32" r="2" fill="#22c55e" fillOpacity="0.5" stroke="#16a34a" strokeWidth="0.6" />
                <circle cx="290" cy="45" r="2.5" fill="#22c55e" fillOpacity="0.5" stroke="#16a34a" strokeWidth="0.6" />
              </g>

              {/* Shetland Islands */}
              <g>
                <ellipse cx="320" cy="15" rx="8" ry="12" fill="#22c55e" fillOpacity="0.4" stroke="#16a34a" strokeWidth="0.8" />
                <circle cx="315" cy="10" r="2" fill="#22c55e" fillOpacity="0.5" stroke="#16a34a" strokeWidth="0.6" />
                <circle cx="325" cy="8" r="1.5" fill="#22c55e" fillOpacity="0.5" stroke="#16a34a" strokeWidth="0.6" />
                <circle cx="322" cy="22" r="2" fill="#22c55e" fillOpacity="0.5" stroke="#16a34a" strokeWidth="0.6" />
              </g>

              {/* Lochs */}
              <ellipse cx="200" cy="350" rx="8" ry="3" fill="#3b82f6" fillOpacity="0.6" />  {/* Loch Lomond */}
              <ellipse cx="160" cy="240" rx="4" ry="15" fill="#3b82f6" fillOpacity="0.6" />  {/* Loch Ness */}
              <ellipse cx="190" cy="280" rx="6" ry="4" fill="#3b82f6" fillOpacity="0.6" />   {/* Loch Katrine */}
              <ellipse cx="140" cy="200" rx="3" ry="8" fill="#3b82f6" fillOpacity="0.6" />   {/* Loch Maree */}
              
              {/* Major Cities and Towns */}
              <g className="text-labels">
                <circle cx="250" cy="370" r="2" fill="#dc2626" />
                <text x="255" y="375" fontSize="8" fill="#374151" className="font-medium">Edinburgh</text>

                <circle cx="220" cy="380" r="2" fill="#dc2626" />
                <text x="195" y="385" fontSize="8" fill="#374151" className="font-medium">Glasgow</text>

                <circle cx="160" cy="240" r="1.5" fill="#dc2626" />
                <text x="135" y="235" fontSize="7" fill="#374151" className="font-medium">Inverness</text>

                <circle cx="340" cy="300" r="1.5" fill="#dc2626" />
                <text x="345" y="305" fontSize="7" fill="#374151" className="font-medium">Aberdeen</text>

                <circle cx="130" cy="290" r="1" fill="#059669" />
                <text x="105" y="285" fontSize="6" fill="#374151" className="font-medium">Fort William</text>

                <circle cx="240" cy="330" r="1" fill="#059669" />
                <text x="245" y="325" fontSize="6" fill="#374151" className="font-medium">Stirling</text>

                <circle cx="280" cy="340" r="1" fill="#059669" />
                <text x="285" y="335" fontSize="6" fill="#374151" className="font-medium">Perth</text>

                <text x="280" y="45" fontSize="6" fill="#6b7280" className="font-medium">Orkney</text>
                <text x="315" y="20" fontSize="6" fill="#6b7280" className="font-medium">Shetland</text>
                <text x="35" y="185" fontSize="6" fill="#6b7280" className="font-medium">Outer Hebrides</text>
                <text x="85" y="255" fontSize="6" fill="#6b7280" className="font-medium">Inner Hebrides</text>

                <text x="220" y="250" fontSize="9" fill="#059669" className="font-bold">HIGHLANDS</text>
                <text x="200" y="460" fontSize="8" fill="#65a30d" className="font-semibold">Southern Uplands</text>
              </g>
              
              {/* Adventure pins */}
              {pins.map((pin) => {
                const position = getPinPosition(pin);
                const moodData = MOOD_RATINGS.find(r => r.value === pin.moodRating);

                return (
                  <g key={pin.id}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="4"
                      fill={getMoodColor(pin.moodRating)}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:scale-110 transition-all shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPin(pin);
                      }}
                    />
                    <text
                      x={position.x}
                      y={position.y - 8}
                      fontSize="12"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {moodData?.emoji}
                    </text>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="6"
                      fill="none"
                      stroke={getMoodColor(pin.moodRating)}
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      className="animate-pulse"
                    />
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
