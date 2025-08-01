import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LocalStorage } from "@/lib/storage";
import { HybridStorage } from "@/lib/hybridStorage";
import { initializeSampleData } from "@/lib/sampleData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Star,
  Trash2,
  Check,
  User,
  MapPin as MapPinIcon,
} from "lucide-react";
import {
  WishlistItem,
  WISHLIST_CATEGORIES,
  WISHLIST_PRIORITIES,
} from "@shared/api";

export default function Wishlist() {
  const { isFamilyMember, currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: "medium" as "low" | "medium" | "high",
    category: "adventure" as
      | "adventure"
      | "culture"
      | "food"
      | "nature"
      | "city"
      | "historic",
    estimatedCost: "",
    bestTimeToVisit: "",
    notes: "",
  });

  useEffect(() => {
    try {
      // Initialize sample data if no data exists
      initializeSampleData();
      loadWishlistItems();

      // Listen for real-time updates from HybridStorage
      const unsubscribe = HybridStorage.onUpdate(() => {
        console.log(
          "🔄 Real-time update received, refreshing wishlist items...",
        );
        loadWishlistItems();
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, []);

  const loadWishlistItems = () => {
    try {
      const items = HybridStorage.getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error("Error loading wishlist items:", error);
      setWishlistItems([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your wishlist?",
      )
    ) {
      await HybridStorage.deleteWishlistItem(id);
      loadWishlistItems();
    }
  };

  const handleMarkCompleted = async (id: string) => {
    LocalStorage.markWishlistItemCompleted(id);
    // Update in cloud if available
    if (HybridStorage.isCloudEnabled()) {
      const item = HybridStorage.getWishlistItems().find((i) => i.id === id);
      if (item) {
        await HybridStorage.saveWishlistItem(item);
      }
    }
    loadWishlistItems();
  };

  const handleCreateItem = async () => {
    if (!formData.title.trim() || !formData.location.trim()) return;

    const item: WishlistItem = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      priority: formData.priority,
      category: formData.category,
      estimatedCost: formData.estimatedCost.trim(),
      bestTimeToVisit: formData.bestTimeToVisit.trim(),
      notes: formData.notes.trim(),
      isCompleted: false,
      addedBy: currentUser || "Dorman Family",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await HybridStorage.saveWishlistItem(item);
    loadWishlistItems();
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      priority: "medium",
      category: "adventure",
      estimatedCost: "",
      bestTimeToVisit: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🌟 Scotland Wishlist</h1>
          <p className="text-muted-foreground">
            Places we dream of visiting across beautiful Scotland
          </p>
        </div>

        {isFamilyMember && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>✨ Add Dream Destination</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Dream Destination</DialogTitle>
                <DialogDescription>
                  Add a new place to your Scotland adventure wishlist with
                  details about location, activities, and planning information.
                </DialogDescription>
              </DialogHeader>
              <WishlistForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateItem}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{wishlistItems.length}</p>
              <p className="text-sm text-muted-foreground">Total Dreams</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Dream Destinations Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start building your Scotland adventure wishlist!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onDelete={isFamilyMember ? handleDelete : undefined}
              onMarkCompleted={isFamilyMember ? handleMarkCompleted : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Wishlist Item Card Component
interface WishlistItemCardProps {
  item: WishlistItem;
  onDelete?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
}

function WishlistItemCard({
  item,
  onDelete,
  onMarkCompleted,
}: WishlistItemCardProps) {
  const categoryData = WISHLIST_CATEGORIES.find(
    (c) => c.value === item.category,
  );
  const priorityData = WISHLIST_PRIORITIES.find(
    (p) => p.value === item.priority,
  );

  return (
    <Card className={`group relative ${item.isCompleted ? "opacity-75" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3
            className={`font-semibold text-lg line-clamp-2 flex-1 ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}
          >
            {item.isCompleted && "✅ "}
            {item.title}
          </h3>

          {(onDelete || onMarkCompleted) && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              {!item.isCompleted && onMarkCompleted && (
                <button
                  onClick={() => onMarkCompleted(item.id)}
                  className="p-1 hover:bg-green-100 rounded-full transition-colors"
                  title="Mark as completed"
                >
                  <Check className="h-3 w-3 text-green-600" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPinIcon className="h-3 w-3 mr-1" />
          <span>{item.location}</span>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {categoryData && (
            <Badge variant="outline" className="text-xs">
              {categoryData.emoji} {categoryData.label}
            </Badge>
          )}
          {priorityData && (
            <Badge variant="secondary" className="text-xs">
              {priorityData.emoji} {priorityData.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>Added by {item.addedBy}</span>
          </div>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Wishlist Form Component
interface WishlistFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function WishlistForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: WishlistFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Dream Destination *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., Isle of Skye"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            placeholder="e.g., Inner Hebrides, Scotland"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          placeholder="What makes this place special? What do you want to do there?"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WISHLIST_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WISHLIST_PRIORITIES.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.emoji} {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Estimated Cost</Label>
          <Input
            id="estimatedCost"
            value={formData.estimatedCost}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                estimatedCost: e.target.value,
              }))
            }
            placeholder="e.g., £200-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bestTimeToVisit">Best Time to Visit</Label>
          <Input
            id="bestTimeToVisit"
            value={formData.bestTimeToVisit}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                bestTimeToVisit: e.target.value,
              }))
            }
            placeholder="e.g., Spring/Summer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Any special considerations, tips, or reminders..."
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>Add to Wishlist</Button>
      </div>
    </div>
  );
}
