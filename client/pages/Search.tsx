import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LocalStorage } from '@/lib/storage';
import { initializeSampleData } from '@/lib/sampleData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search as SearchIcon, 
  BookOpen,
  Star,
  MapPin,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Filter,
  X,
  ArrowRight
} from 'lucide-react';
import { JournalEntry, WishlistItem, MapPin as MapPinType, MOOD_RATINGS, AREA_TYPES, WISHLIST_CATEGORIES, WISHLIST_PRIORITIES } from '@shared/api';

interface SearchResult {
  id: string;
  type: 'journal' | 'wishlist' | 'pin' | 'comment';
  title: string;
  content: string;
  location?: string;
  date?: string;
  author?: string;
  moodRating?: number;
  likes?: number;
  entryId?: string; // For comments
  parentTitle?: string; // For comments
  category?: string;
  priority?: string;
  isCompleted?: boolean;
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'rating'>('relevance');

  useEffect(() => {
    // Initialize sample data if no data exists
    initializeSampleData();
  }, []);

  const allData = useMemo(() => {
    const entries = LocalStorage.getJournalEntries();
    const wishlistItems = LocalStorage.getWishlistItems();
    const pins = LocalStorage.getMapPins();

    const searchableData: SearchResult[] = [];

    // Add journal entries
    entries.forEach(entry => {
      searchableData.push({
        id: entry.id,
        type: 'journal',
        title: entry.title,
        content: entry.content,
        location: entry.location,
        date: entry.date,
        author: entry.author,
        moodRating: entry.moodRating,
        likes: entry.likes
      });

      // Add comments as separate searchable items
      entry.comments.forEach(comment => {
        searchableData.push({
          id: comment.id,
          type: 'comment',
          title: `Comment on "${entry.title}"`,
          content: comment.content,
          author: comment.author,
          date: comment.createdAt,
          entryId: entry.id,
          parentTitle: entry.title,
          likes: comment.likes
        });
      });
    });

    // Add wishlist items
    wishlistItems.forEach(item => {
      searchableData.push({
        id: item.id,
        type: 'wishlist',
        title: item.title,
        content: item.description,
        location: item.location,
        author: item.addedBy,
        date: item.createdAt,
        category: item.category,
        priority: item.priority,
        isCompleted: item.isCompleted
      });
    });

    // Add map pins
    pins.forEach(pin => {
      searchableData.push({
        id: pin.id,
        type: 'pin',
        title: pin.title,
        content: pin.description,
        date: pin.visitDate,
        moodRating: pin.moodRating
      });
    });

    return searchableData;
  }, []);

  const performSearch = (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      const searchTermLower = term.toLowerCase();
      
      let filteredResults = allData.filter(item => {
        // Type filter
        if (filterType !== 'all' && item.type !== filterType) return false;
        
        // Text search
        const titleMatch = item.title.toLowerCase().includes(searchTermLower);
        const contentMatch = item.content.toLowerCase().includes(searchTermLower);
        const locationMatch = item.location?.toLowerCase().includes(searchTermLower);
        const authorMatch = item.author?.toLowerCase().includes(searchTermLower);
        
        return titleMatch || contentMatch || locationMatch || authorMatch;
      });

      // Sort results
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
          case 'rating':
            return (b.moodRating || 0) - (a.moodRating || 0);
          case 'relevance':
          default:
            // Simple relevance: title matches score higher than content matches
            const aScore = (a.title.toLowerCase().includes(searchTermLower) ? 2 : 0) +
                          (a.content.toLowerCase().includes(searchTermLower) ? 1 : 0);
            const bScore = (b.title.toLowerCase().includes(searchTermLower) ? 2 : 0) +
                          (b.content.toLowerCase().includes(searchTermLower) ? 1 : 0);
            return bScore - aScore;
        }
      });

      setResults(filteredResults);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, filterType, sortBy, allData]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'journal': return BookOpen;
      case 'wishlist': return Star;
      case 'pin': return MapPin;
      case 'comment': return MessageCircle;
      default: return SearchIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'journal': return 'bg-blue-100 text-blue-700';
      case 'wishlist': return 'bg-purple-100 text-purple-700';
      case 'pin': return 'bg-green-100 text-green-700';
      case 'comment': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMoodEmoji = (rating?: number) => {
    if (!rating) return null;
    const mood = MOOD_RATINGS.find(r => r.value === rating);
    return mood?.emoji;
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return null;
    const cat = WISHLIST_CATEGORIES.find(c => c.value === category);
    return cat?.label;
  };

  const getPriorityLabel = (priority?: string) => {
    if (!priority) return null;
    const pri = WISHLIST_PRIORITIES.find(p => p.value === priority);
    return pri ? `${pri.emoji} ${pri.label}` : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">🔍 Search Adventures</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Find anything across your journal entries, wishlist, and memories
        </p>
      </div>

      {/* Search Input */}
      <Card className="family-card">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for adventures, places, activities, or memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base" // Prevents zoom on iOS
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="journal">📖 Journal Entries</option>
                <option value="wishlist">⭐ Wishlist Items</option>
                <option value="pin">📍 Map Pins</option>
                <option value="comment">💬 Comments</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'rating')}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="relevance">🎯 Most Relevant</option>
                <option value="date">📅 Most Recent</option>
                <option value="rating">⭐ Highest Rated</option>
              </select>
            </div>

            {/* Search Stats */}
            {searchTerm && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {isLoading ? 'Searching...' : `Found ${results.length} result${results.length !== 1 ? 's' : ''}`}
                </span>
                {searchTerm && !isLoading && (
                  <span>for "{searchTerm}"</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {!searchTerm ? (
        <Card className="family-card">
          <CardContent className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Your Search</h3>
            <p className="text-muted-foreground mb-4">
              Search through your journal entries, wishlist, map pins, and comments
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge variant="secondary">Try: "castle"</Badge>
              <Badge variant="secondary">Try: "free parking"</Badge>
              <Badge variant="secondary">Try: "Charlotte"</Badge>
              <Badge variant="secondary">Try: "Edinburgh"</Badge>
            </div>
          </CardContent>
        </Card>
      ) : results.length === 0 && !isLoading ? (
        <Card className="family-card">
          <CardContent className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try different search terms or check your spelling
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result) => {
            const IconComponent = getTypeIcon(result.type);
            
            return (
              <Card key={`${result.type}-${result.id}`} className="family-card hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{result.title}</h3>
                          {result.parentTitle && (
                            <p className="text-sm text-muted-foreground">
                              Comment on: {result.parentTitle}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {result.moodRating && (
                            <span className="text-lg">{getMoodEmoji(result.moodRating)}</span>
                          )}
                          {result.isCompleted !== undefined && (
                            <Badge variant={result.isCompleted ? "default" : "secondary"}>
                              {result.isCompleted ? "✅ Done" : "⏳ Pending"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {result.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{result.location}</span>
                          </div>
                        )}
                        {result.date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(result.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {result.author && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{result.author}</span>
                          </div>
                        )}
                        {result.likes !== undefined && result.likes > 0 && (
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span>{result.likes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {result.type === 'journal' && '📖 Journal'}
                          {result.type === 'wishlist' && '⭐ Wishlist'}
                          {result.type === 'pin' && '📍 Map Pin'}
                          {result.type === 'comment' && '💬 Comment'}
                        </Badge>
                        
                        {result.category && (
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(result.category)}
                          </Badge>
                        )}
                        
                        {result.priority && (
                          <Badge variant="outline" className="text-xs">
                            {getPriorityLabel(result.priority)}
                          </Badge>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        {result.type === 'journal' && (
                          <Link to="/journal">
                            <Button variant="ghost" size="sm" className="group">
                              View in Journal
                              <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                        {result.type === 'wishlist' && (
                          <Link to="/wishlist">
                            <Button variant="ghost" size="sm" className="group">
                              View in Wishlist
                              <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                        {result.type === 'pin' && (
                          <Link to="/map">
                            <Button variant="ghost" size="sm" className="group">
                              View on Map
                              <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                        {result.type === 'comment' && result.entryId && (
                          <Link to="/journal">
                            <Button variant="ghost" size="sm" className="group">
                              View Original Entry
                              <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
