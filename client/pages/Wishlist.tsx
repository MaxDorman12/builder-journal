import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LocalStorage } from '@/lib/storage';
import { initializeSampleData } from '@/lib/sampleData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Star, Trash2, Check, User, MapPin as MapPinIcon } from 'lucide-react';
import { WishlistItem, WISHLIST_CATEGORIES, WISHLIST_PRIORITIES } from '@shared/api';

export default function Wishlist() {
  const { isFamilyMember } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      // Initialize sample data if no data exists
      initializeSampleData();
      loadWishlistItems();
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  const loadWishlistItems = () => {
    try {
      const items = LocalStorage.getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      setWishlistItems([]);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      LocalStorage.deleteWishlistItem(id);
      loadWishlistItems();
    }
  };

  const handleMarkCompleted = (id: string) => {
    LocalStorage.markWishlistItemCompleted(id);
    loadWishlistItems();
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
          <Button size="lg" className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Dream Destination</span>
          </Button>
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
            <h3 className="text-lg font-semibold mb-2">No Dream Destinations Yet</h3>
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

function WishlistItemCard({ item, onDelete, onMarkCompleted }: WishlistItemCardProps) {
  const categoryData = WISHLIST_CATEGORIES.find(c => c.value === item.category);
  const priorityData = WISHLIST_PRIORITIES.find(p => p.value === item.priority);

  return (
    <Card className={`group relative ${item.isCompleted ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-lg line-clamp-2 flex-1 ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {item.isCompleted && '✅ '}{item.title}
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
