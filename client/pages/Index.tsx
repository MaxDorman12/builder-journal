import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LocalStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Waves
} from 'lucide-react';
import { MOOD_RATINGS, JournalEntry, MapPin as MapPinType } from '@shared/api';

export default function Index() {
  const { isAuthenticated, isFamilyMember } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [pins, setPins] = useState<MapPinType[]>([]);

  useEffect(() => {
    setEntries(LocalStorage.getJournalEntries());
    setPins(LocalStorage.getMapPins());
  }, []);

  const recentEntries = entries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const totalTrips = pins.length;
  const averageMood = pins.length > 0 
    ? Math.round(pins.reduce((sum, pin) => sum + pin.moodRating, 0) / pins.length)
    : 0;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
          <Heart className="h-5 w-5 text-primary fill-primary" />
          <span className="text-primary font-medium">Welcome to our family adventures</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
          The MacLeod Family
          <span className="block text-primary">Scottish Adventures</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Follow Max, Charlotte, Oscar, Rose, and Lola as they explore the beautiful landscapes 
          of Scotland, creating memories and sharing their amazing journeys together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/journal">
            <Button size="lg" className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Read Our Journal</span>
            </Button>
          </Link>
          
          <Link to="/map">
            <Button variant="outline" size="lg" className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Explore Our Map</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalTrips}</p>
              <p className="text-sm text-muted-foreground">Places Visited</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-6">
            <div className="p-3 bg-accent/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-muted-foreground">Journal Entries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Family Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-6">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">
                {averageMood > 0 ? MOOD_RATINGS.find(r => r.value === averageMood)?.emoji : '😊'}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold">{averageMood > 0 ? `${averageMood}/5` : 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Average Trip Rating</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* About Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">About Our Family</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              We're the MacLeod family - Max and Charlotte, along with our three wonderful 
              children Oscar, Rose, and Lola. Living in beautiful Scotland, we're passionate 
              about exploring our homeland's incredible landscapes, from the mysterious lochs 
              to the towering Munros.
            </p>
            <p>
              This journal captures our adventures as we discover hidden gems, bustling cities, 
              peaceful villages, and breathtaking natural wonders across Scotland. Each trip 
              brings new memories, challenges, and stories to share.
            </p>
            <p>
              Join us as we document our journeys, rate our experiences, and build a treasure 
              trove of family memories that we'll cherish forever.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Mountain className="h-3 w-3" />
              <span>Highland Hikers</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Waves className="h-3 w-3" />
              <span>Loch Explorers</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Camera className="h-3 w-3" />
              <span>Memory Makers</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Compass className="h-3 w-3" />
              <span>Adventure Seekers</span>
            </Badge>
          </div>
        </div>

        <Card className="family-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Youtube className="h-5 w-5 text-red-500" />
              <span>Our Scotland Adventures</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <a 
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 text-center p-6 hover:scale-105 transition-transform"
              >
                <Youtube className="h-12 w-12 text-red-500" />
                <p className="font-medium">Watch Our Latest Adventure</p>
                <p className="text-sm text-muted-foreground">Click to open in YouTube</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Recent Adventures</h2>
            <Link to="/journal">
              <Button variant="outline">View All Entries</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentEntries.map((entry) => {
              const moodData = MOOD_RATINGS.find(r => r.value === entry.moodRating);
              return (
                <Card key={entry.id} className="family-card overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    {entry.images.length > 0 ? (
                      <img 
                        src={entry.images[0]} 
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold truncate">{entry.title}</h3>
                      {moodData && (
                        <span className="text-lg">{moodData.emoji}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.location}
                    </p>
                    <p className="text-sm line-clamp-2">{entry.content}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span>by {entry.author}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="text-center space-y-6 py-12">
          <Card className="family-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Join Our Adventure</h2>
              <p className="text-muted-foreground mb-6">
                You're viewing our family journal as a visitor. Family members can log in to 
                add new entries, upload photos and videos, and update our adventure map!
              </p>
              <Link to="/login">
                <Button size="lg">Family Member Login</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
