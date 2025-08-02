import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateEntryForm } from "@/components/CreateEntryForm";
import { EditEntryForm } from "@/components/EditEntryForm";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import {
  BookOpen,
  Plus,
  Heart,
  Calendar,
  MapPin,
  Camera,
  Star,
  Clock,
  Feather,
  PenTool,
  Filter,
  Search,
  Eye,
  TrendingUp,
} from "lucide-react";
import { JournalEntry } from "@shared/api";
import { DatabaseTest } from "@/components/DatabaseTest";

export default function Journal() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showMapPinDialog, setShowMapPinDialog] = useState(false);
  const [createdEntry, setCreatedEntry] = useState<JournalEntry | null>(null);

  const loadEntries = async () => {
    try {
      setIsLoading(true);

      // Try Supabase first
      try {
        const allEntries = await SupabaseStorage.getJournalEntries();
        setEntries(allEntries);
        console.log("📖 Entries loaded from Supabase:", {
          count: allEntries.length,
          entries: allEntries,
        });
        return;
      } catch (supabaseError) {
        console.warn("⚠️ Supabase failed, trying local storage fallback:", supabaseError);

        // Fallback to local storage
        const localEntries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
        setEntries(localEntries);
        console.log("📱 Entries loaded from local storage:", {
          count: localEntries.length,
        });

        if (localEntries.length === 0) {
          console.log("💡 No local entries found. You can still create new entries offline.");
        }
      }
    } catch (error) {
      console.error("❌ Failed to load entries from any source:", error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load data for all users (guests and authenticated)
    loadEntries();

    // Only set up real-time updates for authenticated users
    if (isAuthenticated) {
      const unsubscribe = SupabaseStorage.onUpdate(() => {
        console.log("🔄 Real-time update received, reloading entries...");
        loadEntries();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  const handleLike = async (entryId: string) => {
    try {
      // Get current entry, toggle like, and save back
      const entry = entries.find((e) => e.id === entryId);
      if (entry) {
        const updatedEntry = {
          ...entry,
          likes: (entry.likes || 0) + (entry.isLiked ? -1 : 1),
          isLiked: !entry.isLiked,
          updatedAt: new Date().toISOString(),
        };
        await SupabaseStorage.saveJournalEntry(updatedEntry);
        // Update local state immediately
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? updatedEntry : e)),
        );
      }
    } catch (error) {
      console.error("❌ Failed to toggle like:", error);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await SupabaseStorage.deleteJournalEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error("❌ Failed to delete entry:", error);
    }
  };

  const handleEntryCreated = async (entry: JournalEntry) => {
    try {
      // Try Supabase first
      try {
        await SupabaseStorage.saveJournalEntry(entry);
        console.log("✅ Entry saved to Supabase");
      } catch (supabaseError) {
        console.warn("⚠️ Supabase save failed, saving locally:", supabaseError);

        // Fallback to local storage
        const localEntries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
        localEntries.unshift(entry);
        localStorage.setItem('journal_entries', JSON.stringify(localEntries));
        console.log("📱 Entry saved to local storage");
      }

      // Update UI regardless of where it was saved
      setEntries((prev) => [entry, ...prev]);
      setIsCreateFormOpen(false);

      // Show map pin dialog after successful creation
      setCreatedEntry(entry);
      setShowMapPinDialog(true);
    } catch (error) {
      console.error("❌ Failed to create entry:", error);
    }
  };

  const handleEntryUpdated = async (updatedEntry: JournalEntry) => {
    try {
      await SupabaseStorage.saveJournalEntry(updatedEntry);
      setEntries((prev) =>
        prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
      );
      setEditingEntry(null);
    } catch (error) {
      console.error("❌ Failed to update entry:", error);
    }
  };

  const handleCreateMapPin = () => {
    if (createdEntry) {
      // Navigate to map page with prefilled data
      navigate('/map', {
        state: {
          createPin: true,
          prefillData: {
            title: createdEntry.title,
            description: `Journal entry: ${createdEntry.content.substring(0, 100)}${createdEntry.content.length > 100 ? '...' : ''}`,
            journalEntryId: createdEntry.id,
            location: createdEntry.location
          }
        }
      });
    }
    setShowMapPinDialog(false);
    setCreatedEntry(null);
  };

  const handleSkipMapPin = () => {
    setShowMapPinDialog(false);
    setCreatedEntry(null);
  };

  // Calculate stats
  const totalPhotos = entries.reduce(
    (count, entry) => count + (entry.images?.length || 0),
    0,
  );
  const totalLikes = entries.reduce(
    (sum, entry) => sum + (entry.likes || 0),
    0,
  );
  const entriesWithPhotos = entries.filter(
    (entry) => entry.images && entry.images.length > 0,
  ).length;
  const averageLikes =
    entries.length > 0
      ? Math.round((totalLikes / entries.length) * 10) / 10
      : 0;

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    switch (selectedFilter) {
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(entry.createdAt) >= weekAgo;
      case "photos":
        return entry.images && entry.images.length > 0;
      case "popular":
        return (entry.likes || 0) > 0;
      default:
        return true;
    }
  });

  // Get unique months for timeline
  const entriesByMonth = entries.reduce(
    (acc, entry) => {
      const month = new Date(entry.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(entry);
      return acc;
    },
    {} as Record<string, JournalEntry[]>,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-gray-700">
              Loading our adventure stories...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              📖 Gathering family memories
            </p>
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
            <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300 px-4 py-2 text-sm font-medium mb-6">
              📖 Dive into our family adventure stories
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Family Adventure Journal
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
            Scottish Story Collection
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Every adventure tells a story. From highland hikes to coastal
            discoveries, our family journal captures the magic of exploring
            Scotland together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isAuthenticated && (
              <Button
                onClick={() => setIsCreateFormOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
              >
                <Feather className="h-5 w-5 mr-2" />
                ✍️ Write New Story
              </Button>
            )}
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-full text-lg font-semibold"
            >
              <Eye className="h-5 w-5 mr-2" />
              📚 Read Adventures
            </Button>
          </div>

          {!isAuthenticated && (
            <div className="inline-block p-4 bg-blue-100 border border-blue-200 rounded-lg mb-8">
              <p className="text-blue-800">
                👁️ <strong>Reader mode</strong> - Explore our family's Scottish
                adventure stories!
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-700" />
              <p className="text-2xl font-bold text-blue-800">
                {entries.length}
              </p>
              <p className="text-sm text-blue-600">Adventure Stories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Camera className="h-8 w-8 mx-auto mb-2 text-purple-700" />
              <p className="text-2xl font-bold text-purple-800">
                {totalPhotos}
              </p>
              <p className="text-sm text-purple-600">Photos Shared</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-700" />
              <p className="text-2xl font-bold text-pink-800">{totalLikes}</p>
              <p className="text-sm text-pink-600">Family Loves</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Star className="h-8 w-8 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-800">
                {averageLikes}
              </p>
              <p className="text-sm text-green-600">Avg. Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-6 w-6" />
                  Filter Stories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    variant={selectedFilter === "all" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("all")}
                  >
                    📚 All Stories ({entries.length})
                  </Button>
                  <Button
                    variant={selectedFilter === "recent" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("recent")}
                  >
                    🆕 Recent Stories
                  </Button>
                  <Button
                    variant={selectedFilter === "photos" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("photos")}
                  >
                    📸 With Photos ({entriesWithPhotos})
                  </Button>
                  <Button
                    variant={selectedFilter === "popular" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("popular")}
                  >
                    ❤️ Popular Stories
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Story Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Total Stories:
                    </span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {entries.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">With Photos:</span>
                    <Badge className="bg-purple-100 text-purple-700">
                      {entriesWithPhotos}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Likes:</span>
                    <Badge className="bg-pink-100 text-pink-700">
                      {totalLikes}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Rating:</span>
                    <Badge className="bg-green-100 text-green-700">
                      {averageLikes}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  Adventure Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(entriesByMonth)
                    .sort(
                      ([a], [b]) =>
                        new Date(b).getTime() - new Date(a).getTime(),
                    )
                    .map(([month, monthEntries]) => (
                      <div
                        key={month}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-600 font-medium">
                          {month}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {monthEntries.length} stories
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                📖{" "}
                {selectedFilter === "all"
                  ? "All Adventures"
                  : selectedFilter === "recent"
                    ? "Recent Adventures"
                    : selectedFilter === "photos"
                      ? "Adventures with Photos"
                      : "Popular Adventures"}
              </h3>
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-lg font-semibold">
                {filteredEntries.length} stories
              </Badge>
            </div>

            {filteredEntries.length === 0 ? (
              <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="text-center py-16">
                  <BookOpen className="h-20 w-20 text-blue-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-blue-700 mb-4">
                    {entries.length === 0
                      ? "No Adventure Stories Yet!"
                      : `No ${selectedFilter} stories found`}
                  </h3>
                  <p className="text-blue-600 mb-8 text-lg max-w-md mx-auto">
                    {entries.length === 0
                      ? "Start documenting your Scottish family adventures! Every journey has a story worth telling."
                      : `Try adjusting your filter or create new ${selectedFilter} stories to see them here.`}
                  </p>
                  {isAuthenticated && (
                    <Button
                      onClick={() => setIsCreateFormOpen(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-full shadow-lg"
                    >
                      <PenTool className="h-6 w-6 mr-2" />
                      📝{" "}
                      {entries.length === 0
                        ? "Write Your First Story"
                        : "Create New Adventure"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredEntries.map((entry, index) => {
                  const colors = [
                    "from-blue-100 to-blue-200 border-blue-300",
                    "from-purple-100 to-purple-200 border-purple-300",
                    "from-green-100 to-green-200 border-green-300",
                    "from-pink-100 to-pink-200 border-pink-300",
                    "from-orange-100 to-orange-200 border-orange-300",
                    "from-indigo-100 to-indigo-200 border-indigo-300",
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <Card
                      key={entry.id}
                      className={`bg-gradient-to-br ${colorClass} hover:scale-[1.02] transition-all duration-300 shadow-lg`}
                    >
                      <div className="p-6">
                        <JournalEntryCard
                          entry={entry}
                          onLike={isAuthenticated ? handleLike : undefined}
                          onEdit={isAuthenticated ? setEditingEntry : undefined}
                          onDelete={isAuthenticated ? handleDelete : undefined}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Create Entry Form */}
        {isCreateFormOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Feather className="h-8 w-8 text-blue-600" />
                    ✍️ Write New Adventure Story
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreateFormOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <CreateEntryForm
                  onEntryCreated={handleEntryCreated}
                  onCancel={() => setIsCreateFormOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Entry Form */}
        {editingEntry && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <PenTool className="h-8 w-8 text-purple-600" />
                    📝 Edit Adventure Story
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingEntry(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                <EditEntryForm
                  entry={editingEntry}
                  onEntryUpdated={handleEntryUpdated}
                  onCancel={() => setEditingEntry(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the Dorman Family Adventures
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2 h-2 bg-blue-300 rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Map Pin Creation Dialog */}
        <Dialog open={showMapPinDialog} onOpenChange={setShowMapPinDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                📍 Add Map Pin?
              </DialogTitle>
              <DialogDescription>
                Would you like to add a map pin for this journal entry? You can mark the location on the map.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">"{createdEntry?.title}"</h4>
                <p className="text-sm text-blue-600">
                  {createdEntry?.location && `📍 ${createdEntry.location}`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkipMapPin}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleCreateMapPin}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  📍 Add Pin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
