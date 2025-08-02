import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Heart, Plus, Check, Trash2 } from "lucide-react";
import { WishlistItem } from "@shared/api";

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    if (isAuthenticated) {
      loadWishlistItems();

      // Listen for real-time updates
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

  // Allow guest access to view wishlist items

  const pendingItems = wishlistItems.filter(item => !item.isCompleted);
  const completedItems = wishlistItems.filter(item => item.isCompleted);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">Family Wishlist</h1>
            <p className="text-gray-600">
              Dreams and goals for our Scottish adventures
              {wishlistItems.length > 0 && (
                <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                  {pendingItems.length} pending, {completedItems.length} completed
                </span>
              )}
            </p>
          </div>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Dream
          </Button>
        )}
        {!isAuthenticated && (
          <div className="text-center">
            <p className="text-sm text-gray-500">View-only mode</p>
            <p className="text-xs text-gray-400">Login to add dreams</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Dreams to Chase ({pendingItems.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex-1">{item.title}</span>
                        {isAuthenticated && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkCompleted(item.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="text-gray-700 mb-2">{item.description}</p>
                      )}
                      {item.location && (
                        <p className="text-sm text-gray-500">�� {item.location}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Dreams Achieved ({completedItems.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedItems.map((item) => (
                  <Card key={item.id} className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex-1 line-through text-green-700">{item.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="text-green-700 mb-2">{item.description}</p>
                      )}
                      {item.location && (
                        <p className="text-sm text-green-600">📍 {item.location}</p>
                      )}
                      {item.completedDate && (
                        <p className="text-xs text-green-500 mt-2">
                          ✅ Completed: {new Date(item.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {wishlistItems.length === 0 && (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No Dreams Yet
              </h2>
              <p className="text-gray-500 mb-6">
                Start adding places and experiences you'd love to explore in Scotland!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Dream
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Dream</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you dream of doing?"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this special to you?"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where in Scotland?"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              />
              <Label htmlFor="isPublic">Share with family</Label>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Dream
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
