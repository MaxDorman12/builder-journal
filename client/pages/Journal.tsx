import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LocalStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Heart, 
  MessageCircle, 
  Calendar, 
  MapPin,
  Camera,
  Video,
  Filter
} from 'lucide-react';
import { JournalEntry, MOOD_RATINGS, AREA_TYPES } from '@shared/api';
import { JournalEntryCard } from '@/components/JournalEntryCard';
import { CreateEntryForm } from '@/components/CreateEntryForm';

export default function Journal() {
  const { isFamilyMember } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAreaType, setFilterAreaType] = useState<string>('');
  const [filterMoodRating, setFilterMoodRating] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const allEntries = LocalStorage.getJournalEntries();
    setEntries(allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAreaType = !filterAreaType || entry.areaType === filterAreaType;
    const matchesMoodRating = filterMoodRating === null || entry.moodRating === filterMoodRating;
    
    return matchesSearch && matchesAreaType && matchesMoodRating;
  });

  const handleEntryCreated = () => {
    loadEntries();
    setIsCreateDialogOpen(false);
  };

  const handleLike = (entryId: string) => {
    LocalStorage.toggleLike(entryId);
    loadEntries();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Family Journal</h1>
          <p className="text-muted-foreground">
            {entries.length} adventures documented and counting!
          </p>
        </div>
        
        {isFamilyMember && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Journal Entry</DialogTitle>
              </DialogHeader>
              <CreateEntryForm onEntryCreated={handleEntryCreated} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="family-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries, locations, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterAreaType}
                onChange={(e) => setFilterAreaType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Areas</option>
                {AREA_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filterMoodRating || ''}
                onChange={(e) => setFilterMoodRating(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Ratings</option>
                {MOOD_RATINGS.map(rating => (
                  <option key={rating.value} value={rating.value}>
                    {rating.emoji} {rating.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {(searchTerm || filterAreaType || filterMoodRating) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {searchTerm && (
                <Badge variant="secondary">Search: {searchTerm}</Badge>
              )}
              {filterAreaType && (
                <Badge variant="secondary">
                  {AREA_TYPES.find(t => t.value === filterAreaType)?.label}
                </Badge>
              )}
              {filterMoodRating && (
                <Badge variant="secondary">
                  {MOOD_RATINGS.find(r => r.value === filterMoodRating)?.emoji} Rating: {filterMoodRating}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterAreaType('');
                  setFilterMoodRating(null);
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">{filteredEntries.length}</p>
              <p className="text-xs text-muted-foreground">Entries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Camera className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {filteredEntries.reduce((sum, entry) => sum + entry.images.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Photos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {filteredEntries.reduce((sum, entry) => sum + entry.videos.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="family-card">
          <CardContent className="flex items-center space-x-3 p-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {filteredEntries.reduce((sum, entry) => sum + entry.likes, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <Card className="family-card">
          <CardContent className="text-center py-12">
            {entries.length === 0 ? (
              <>
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Journal Entries Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start documenting your family adventures!
                </p>
                {isFamilyMember && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Create First Entry
                  </Button>
                )}
              </>
            ) : (
              <>
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Entries Match Your Filters</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onLike={handleLike}
              isFamilyMember={isFamilyMember}
            />
          ))}
        </div>
      )}
    </div>
  );
}
