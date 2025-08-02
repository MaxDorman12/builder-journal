import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, BookOpen, MapPin, Heart } from "lucide-react";
import { JournalEntry, MapPin as MapPinType, WishlistItem } from "@shared/api";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: "entry" | "pin" | "wishlist";
  date?: string;
  location?: string;
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allData, setAllData] = useState<{
    entries: JournalEntry[];
    pins: MapPinType[];
    wishlistItems: WishlistItem[];
  }>({ entries: [], pins: [], wishlistItems: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [entries, pins, wishlistItems] = await Promise.all([
          SupabaseStorage.getJournalEntries(),
          SupabaseStorage.getMapPins(),
          SupabaseStorage.getWishlistItems(),
        ]);
        setAllData({ entries, pins, wishlistItems });
      } catch (error) {
        console.error("❌ Failed to load search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Listen for real-time updates
    const unsubscribe = SupabaseStorage.onUpdate(() => {
      loadData();
    });

    return unsubscribe;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search journal entries
    allData.entries.forEach(entry => {
      if (
        entry.title.toLowerCase().includes(term) ||
        entry.content.toLowerCase().includes(term) ||
        entry.location?.toLowerCase().includes(term)
      ) {
        results.push({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          type: "entry",
          date: entry.date,
          location: entry.location,
        });
      }
    });

    // Search map pins
    allData.pins.forEach(pin => {
      if (
        pin.title.toLowerCase().includes(term) ||
        pin.description?.toLowerCase().includes(term)
      ) {
        results.push({
          id: pin.id,
          title: pin.title,
          content: pin.description || "",
          type: "pin",
          location: `${pin.latitude}, ${pin.longitude}`,
        });
      }
    });

    // Search wishlist items
    allData.wishlistItems.forEach(item => {
      if (
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.location?.toLowerCase().includes(term)
      ) {
        results.push({
          id: item.id,
          title: item.title,
          content: item.description || "",
          type: "wishlist",
          location: item.location,
        });
      }
    });

    return results;
  }, [searchTerm, allData]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entry":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "pin":
        return <MapPin className="h-4 w-4 text-green-600" />;
      case "wishlist":
        return <Heart className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "entry":
        return "Journal Entry";
      case "pin":
        return "Map Pin";
      case "wishlist":
        return "Wishlist Item";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <SearchIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Search</h1>
          <p className="text-gray-600">Find your family memories and plans</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search journal entries, map pins, and wishlist items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-lg py-6"
        />
      </div>

      {/* Search Results */}
      {searchTerm.trim() ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Search Results</h2>
            <Badge variant="secondary">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No results found for "{searchTerm}"</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try different keywords or check your spelling
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={`${result.type}-${result.id}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(result.type)}
                      <span className="flex-1">{result.title}</span>
                      <Badge variant="outline">
                        {getTypeLabel(result.type)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2 line-clamp-2">
                      {result.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {result.date && (
                        <span>📅 {new Date(result.date).toLocaleDateString()}</span>
                      )}
                      {result.location && (
                        <span>📍 {result.location}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Start Searching
            </h2>
            <p className="text-gray-500">
              Enter keywords to search through your journal entries, map pins, and wishlist items
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
