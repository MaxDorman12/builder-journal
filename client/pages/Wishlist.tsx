import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Heart, 
  Plus, 
  Check, 
  Trash2, 
  Star,
  Target,
  Trophy,
  Clock,
  MapPin,
  Eye,
  Gift,
  Sparkles,
  Filter,
  Calendar,
  TrendingUp,
  Zap
} from "lucide-react";
import { WishlistItem } from "@shared/api";

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const loadWishlistItems = async () => {
    try {
      setIsLoading(true);
      const items = await SupabaseStorage.getWishlistItems();
      setWishlistItems(items);
      console.log("🎯 Wishlist items loaded:", items.length);
    } catch (error) {
      console.error("❌ Failed to load wishlist items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load data for all users (guests and authenticated)
    loadWishlistItems();

    // Only set up real-time updates for authenticated users
    if (isAuthenticated) {
      const unsubscribe = SupabaseStorage.onUpdate(() => {
        console.log("🔄 Real-time update received, reloading wishlist...");
        loadWishlistItems();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wishlist item?")) return;

    try {
      await SupabaseStorage.deleteWishlistItem(id);
      setWishlistItems((prev) => prev.filter(item => item.id !== id));
      console.log("✅ Wishlist item deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete wishlist item:", error);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await SupabaseStorage.markWishlistItemCompleted(id);
      // Update local state
      setWishlistItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, isCompleted: true, completedDate: new Date().toISOString() }
            : item
        )
      );
      console.log("✅ Wishlist item marked as completed");
    } catch (error) {
      console.error("❌ Failed to mark item as completed:", error);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      const item: WishlistItem = {
        id: `wishlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        isCompleted: false,
        isPublic,
        priority: "medium",
        updatedBy: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await SupabaseStorage.saveWishlistItem(item);
      setWishlistItems((prev) => [item, ...prev]);
      setIsCreateDialogOpen(false);

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setIsPublic(true);

      console.log("✅ Wishlist item created successfully");
    } catch (error) {
      console.error("❌ Failed to create wishlist item:", error);
      alert("Failed to create wishlist item. Please try again.");
    }
  };

  const pendingItems = wishlistItems.filter(item => !item.isCompleted);
  const completedItems = wishlistItems.filter(item => item.isCompleted);
  const recentItems = wishlistItems.filter(item => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(item.createdAt) >= weekAgo;
  });

  // Filter items
  const filteredItems = wishlistItems.filter(item => {
    switch (selectedFilter) {
      case "pending":
        return !item.isCompleted;
      case "completed":
        return item.isCompleted;
      case "recent":
        return recentItems.includes(item);
      case "withLocation":
        return item.location && item.location.trim() !== "";
      default:
        return true;
    }
  });

  // Calculate completion rate
  const completionRate = wishlistItems.length > 0 
    ? Math.round((completedItems.length / wishlistItems.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <Heart className="h-12 w-12 text-pink-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium text-gray-700">Loading our Scottish dreams...</p>
            <p className="text-sm text-gray-500 mt-2">🌟 Gathering adventure wishes</p>
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
            <Badge className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 border-pink-300 px-4 py-2 text-sm font-medium mb-6">
              ⭐ Dream big and explore Scotland's wonders
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Family Dream List
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent mb-6">
            Scottish Adventure Goals
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Every great adventure starts with a dream. Our family wishlist captures all the magical 
            places and experiences we hope to discover across beautiful Scotland.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isAuthenticated && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                ✨ Add New Dream
              </Button>
            )}
            <Button 
              variant="outline"
              className="border-pink-300 text-pink-700 hover:bg-pink-50 px-8 py-3 rounded-full text-lg font-semibold"
            >
              <Eye className="h-5 w-5 mr-2" />
              🌟 Explore Dreams
            </Button>
          </div>

          {!isAuthenticated && (
            <div className="inline-block p-4 bg-pink-100 border border-pink-200 rounded-lg mb-8">
              <p className="text-pink-800">
                👁️ <strong>Dream explorer mode</strong> - Discover our family's Scottish adventure wishlist!
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-700" />
              <p className="text-2xl font-bold text-pink-800">{wishlistItems.length}</p>
              <p className="text-sm text-pink-600">Total Dreams</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-800">{completedItems.length}</p>
              <p className="text-sm text-green-600">Dreams Achieved</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-700" />
              <p className="text-2xl font-bold text-blue-800">{pendingItems.length}</p>
              <p className="text-sm text-blue-600">Dreams to Chase</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <Zap className="h-8 w-8 mx-auto mb-2 text-orange-700" />
              <p className="text-2xl font-bold text-orange-800">{completionRate}%</p>
              <p className="text-sm text-orange-600">Success Rate</p>
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
                  Filter Dreams
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    variant={selectedFilter === "all" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("all")}
                  >
                    ⭐ All Dreams ({wishlistItems.length})
                  </Button>
                  <Button 
                    variant={selectedFilter === "pending" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("pending")}
                  >
                    🎯 To Chase ({pendingItems.length})
                  </Button>
                  <Button 
                    variant={selectedFilter === "completed" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("completed")}
                  >
                    🏆 Achieved ({completedItems.length})
                  </Button>
                  <Button 
                    variant={selectedFilter === "recent" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("recent")}
                  >
                    ✨ Recent Dreams
                  </Button>
                  <Button 
                    variant={selectedFilter === "withLocation" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter("withLocation")}
                  >
                    📍 With Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Dream Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate:</span>
                    <Badge className="bg-green-100 text-green-700">{completionRate}%</Badge>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total Dreams:</span>
                      <span className="font-medium">{wishlistItems.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Achieved:</span>
                      <span className="text-green-600 font-medium">{completedItems.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="text-blue-600 font-medium">{pendingItems.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {isAuthenticated && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-6 w-6" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Dream
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Star className="h-8 w-8 text-pink-600" />
                ⭐ {selectedFilter === "all" ? "All Dreams" : 
                     selectedFilter === "pending" ? "Dreams to Chase" :
                     selectedFilter === "completed" ? "Dreams Achieved" :
                     selectedFilter === "recent" ? "Recent Dreams" :
                     "Dreams with Location"}
              </h3>
              <Badge className="bg-pink-100 text-pink-700 px-4 py-2 text-lg font-semibold">
                {filteredItems.length} dreams
              </Badge>
            </div>

            {filteredItems.length === 0 ? (
              <Card className="border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-pink-100">
                <CardContent className="text-center py-16">
                  <Heart className="h-20 w-20 text-pink-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-pink-700 mb-4">
                    {wishlistItems.length === 0 ? "No Dreams Yet!" : `No ${selectedFilter} dreams found`}
                  </h3>
                  <p className="text-pink-600 mb-8 text-lg max-w-md mx-auto">
                    {wishlistItems.length === 0 
                      ? "Start building your Scottish adventure wishlist! Every great journey begins with a dream."
                      : `Try adjusting your filter or add new dreams to see them here.`
                    }
                  </p>
                  {isAuthenticated && (
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)} 
                      className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-4 rounded-full shadow-lg"
                    >
                      <Sparkles className="h-6 w-6 mr-2" />
                      ✨ {wishlistItems.length === 0 ? "Add Your First Dream" : "Create New Dream"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Pending Dreams */}
                {selectedFilter === "all" || selectedFilter === "pending" ? (
                  filteredItems.filter(item => !item.isCompleted).length > 0 && (
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Target className="h-6 w-6 text-blue-600" />
                        🎯 Dreams to Chase ({filteredItems.filter(item => !item.isCompleted).length})
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.filter(item => !item.isCompleted).map((item, index) => {
                          const colors = [
                            'from-pink-100 to-pink-200 border-pink-300',
                            'from-blue-100 to-blue-200 border-blue-300',
                            'from-purple-100 to-purple-200 border-purple-300',
                            'from-indigo-100 to-indigo-200 border-indigo-300',
                            'from-orange-100 to-orange-200 border-orange-300',
                            'from-green-100 to-green-200 border-green-300'
                          ];
                          const colorClass = colors[index % colors.length];
                          
                          return (
                            <Card 
                              key={item.id} 
                              className={`bg-gradient-to-br ${colorClass} hover:scale-105 transition-all duration-300 shadow-lg`}
                            >
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <span className="font-bold text-gray-800 flex-1">{item.title}</span>
                                  {isAuthenticated && (
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkCompleted(item.id)}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        title="Mark as completed"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Delete dream"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {item.description && (
                                  <p className="text-gray-700 mb-3 line-clamp-3">{item.description}</p>
                                )}
                                <div className="flex items-center justify-between">
                                  {item.location && (
                                    <Badge variant="outline" className="text-xs">
                                      📍 {item.location}
                                    </Badge>
                                  )}
                                  <Badge className="bg-white/50 text-gray-700 text-xs">
                                    ⭐ Dream
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )
                ) : null}

                {/* Completed Dreams */}
                {selectedFilter === "all" || selectedFilter === "completed" ? (
                  filteredItems.filter(item => item.isCompleted).length > 0 && (
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-green-600" />
                        🏆 Dreams Achieved ({filteredItems.filter(item => item.isCompleted).length})
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.filter(item => item.isCompleted).map((item, index) => (
                          <Card 
                            key={item.id} 
                            className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 hover:scale-105 transition-all duration-300 shadow-lg"
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span className="font-bold text-green-800 flex-1 line-through">{item.title}</span>
                                {isAuthenticated && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete dream"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {item.description && (
                                <p className="text-green-700 mb-3 line-clamp-3">{item.description}</p>
                              )}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  {item.location && (
                                    <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                      📍 {item.location}
                                    </Badge>
                                  )}
                                  <Badge className="bg-green-500 text-white text-xs">
                                    ✅ Achieved
                                  </Badge>
                                </div>
                                {item.completedDate && (
                                  <p className="text-xs text-green-600 font-medium">
                                    🎉 Completed: {new Date(item.completedDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                ) : null}

                {/* Filtered Dreams (for other filters) */}
                {!["all", "pending", "completed"].includes(selectedFilter) && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item, index) => {
                      const colors = [
                        'from-pink-100 to-pink-200 border-pink-300',
                        'from-blue-100 to-blue-200 border-blue-300',
                        'from-purple-100 to-purple-200 border-purple-300',
                        'from-indigo-100 to-indigo-200 border-indigo-300',
                        'from-orange-100 to-orange-200 border-orange-300',
                        'from-green-100 to-green-200 border-green-300'
                      ];
                      const colorClass = item.isCompleted 
                        ? 'from-green-100 to-green-200 border-green-300' 
                        : colors[index % colors.length];
                      
                      return (
                        <Card 
                          key={item.id} 
                          className={`bg-gradient-to-br ${colorClass} hover:scale-105 transition-all duration-300 shadow-lg`}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className={`font-bold flex-1 ${item.isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                                {item.title}
                              </span>
                              {isAuthenticated && (
                                <div className="flex gap-1">
                                  {!item.isCompleted && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkCompleted(item.id)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {item.description && (
                              <p className={`mb-3 line-clamp-3 ${item.isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                                {item.description}
                              </p>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                {item.location && (
                                  <Badge variant="outline" className="text-xs">
                                    📍 {item.location}
                                  </Badge>
                                )}
                                <Badge className={`text-xs ${item.isCompleted ? 'bg-green-500 text-white' : 'bg-white/50 text-gray-700'}`}>
                                  {item.isCompleted ? '✅ Achieved' : '⭐ Dream'}
                                </Badge>
                              </div>
                              {item.completedDate && (
                                <p className="text-xs text-green-600 font-medium">
                                  🎉 Completed: {new Date(item.completedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Dream Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-8 w-8 text-pink-600" />
                ✨ Add New Scottish Dream
              </DialogTitle>
            </DialogHeader>
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
              <p className="text-pink-700 font-medium">
                🌟 <strong>Dream Big!</strong> What Scottish adventure would make your heart sing? Share your vision and we'll make it happen together.
              </p>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold">Dream Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Visit the Isle of Skye, Highland Games Experience..."
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-lg font-semibold">Why is this special?</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this dream meaningful to your family? Share the story behind your wish..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-lg font-semibold">Location in Scotland</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Edinburgh, Highlands, Isle of Skye..."
                  className="mt-2"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                />
                <Label htmlFor="isPublic" className="font-medium">Share this dream with the family</Label>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Add to Dream List
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Made with ❤️ by the Dorman Family Adventures
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2 h-2 bg-pink-300 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
