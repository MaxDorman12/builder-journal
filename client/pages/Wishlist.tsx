import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LocalStorage } from '@/lib/storage';
import { initializeSampleData } from '@/lib/sampleData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Heart, 
  Star,
  Calendar,
  MapPin as MapPinIcon,
  Edit2,
  Trash2,
  Check,
  Clock,
  Filter,
  User
} from 'lucide-react';
import { WishlistItem, WISHLIST_CATEGORIES, WISHLIST_PRIORITIES } from '@shared/api';

export default function Wishlist() {
  const { isFamilyMember, currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'adventure' as 'adventure' | 'culture' | 'food' | 'nature' | 'city' | 'historic',
    estimatedCost: '',
    bestTimeToVisit: '',
    notes: ''
  });

  useEffect(() => {
    // Initialize sample data if no data exists
    initializeSampleData();
    loadWishlistItems();
  }, []);

  const loadWishlistItems = () => {
    const items = LocalStorage.getWishlistItems();
    setWishlistItems(items.sort((a, b) => {
      // Sort by completion status first, then by priority, then by creation date
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));
  };

  const handleCreateItem = () => {
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
      addedBy: currentUser || 'Family Member',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    LocalStorage.saveWishlistItem(item);
    loadWishlistItems();
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditItem = () => {
    if (!editingItem || !formData.title.trim() || !formData.location.trim()) return;
    
    const updatedItem: WishlistItem = {
      ...editingItem,
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      priority: formData.priority,
      category: formData.category,
      estimatedCost: formData.estimatedCost.trim(),
      bestTimeToVisit: formData.bestTimeToVisit.trim(),
      notes: formData.notes.trim(),
      updatedAt: new Date().toISOString()
    };

    LocalStorage.saveWishlistItem(updatedItem);
    loadWishlistItems();
    setIsEditDialogOpen(false);
    setEditingItem(null);
    resetForm();
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

  const handleEdit = (item: WishlistItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      location: item.location,
      priority: item.priority,
      category: item.category,
      estimatedCost: item.estimatedCost,
      bestTimeToVisit: item.bestTimeToVisit,
      notes: item.notes
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      priority: 'medium',
      category: 'adventure',
      estimatedCost: '',
      bestTimeToVisit: '',
      notes: ''
    });
  };

  const filteredItems = wishlistItems.filter(item => {
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesPriority = !filterPriority || item.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !item.isCompleted) ||
                         (filterStatus === 'completed' && item.isCompleted);
    
    return matchesCategory && matchesPriority && matchesStatus;
  });

  const pendingItems = wishlistItems.filter(item => !item.isCompleted);
  const completedItems = wishlistItems.filter(item => item.isCompleted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🌟 Scotland Wishlist</h1>
          <p className="text-muted-foreground">
            Places we dream of visiting across beautiful Scotland
          </p>
        </div>
        
        {isFamilyMember && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center space-x-2 fun-button">
                <Plus className="h-5 w-5" />
                <span>✨ Add Dream Destination</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Dream Destination</DialogTitle>
              </DialogHeader>
              <WishlistForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateItem}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                isEdit={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="pastel-stat-card from-purple-200 to-pink-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/60 rounded-full">
              <Star className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-800">{wishlistItems.length}</p>
              <p className="text-sm text-purple-600">🌟 Total Dreams</p>
            </div>
          </div>
        </div>

        <div className="pastel-stat-card from-blue-200 to-cyan-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/60 rounded-full">
              <Clock className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800">{pendingItems.length}</p>
              <p className="text-sm text-blue-600">⏳ Still to Visit</p>
            </div>
          </div>
        </div>

        <div className="pastel-stat-card from-green-200 to-emerald-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/60 rounded-full">
              <Check className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">{completedItems.length}</p>
              <p className="text-sm text-green-600">✅ Dreams Fulfilled</p>
            </div>
          </div>
        </div>

        <div className="pastel-stat-card from-orange-200 to-red-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/60 rounded-full">
              <Heart className="h-6 w-6 text-orange-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-800">
                {pendingItems.filter(item => item.priority === 'high').length}
              </p>
              <p className="text-sm text-orange-600">🔥 High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="family-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Filter by status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="pending">⏳ Still to Visit</SelectItem>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Filter by category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {WISHLIST_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Filter by priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  {WISHLIST_PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.emoji} {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(filterCategory || filterPriority || filterStatus !== 'all') && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filterCategory && (
                <Badge variant="secondary">
                  {WISHLIST_CATEGORIES.find(c => c.value === filterCategory)?.label}
                </Badge>
              )}
              {filterPriority && (
                <Badge variant="secondary">
                  {WISHLIST_PRIORITIES.find(p => p.value === filterPriority)?.emoji} {WISHLIST_PRIORITIES.find(p => p.value === filterPriority)?.label}
                </Badge>
              )}
              {filterStatus !== 'all' && (
                <Badge variant="secondary">
                  {filterStatus === 'pending' ? '⏳ Pending' : '✅ Completed'}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setFilterCategory('');
                  setFilterPriority('');
                  setFilterStatus('all');
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <Card className="family-card">
          <CardContent className="text-center py-12">
            {wishlistItems.length === 0 ? (
              <>
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Dream Destinations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your Scotland adventure wishlist!
                </p>
                {isFamilyMember && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    ✨ Add First Dream
                  </Button>
                )}
              </>
            ) : (
              <>
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Items Match Your Filters</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filter settings
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onEdit={isFamilyMember ? handleEdit : undefined}
              onDelete={isFamilyMember ? handleDelete : undefined}
              onMarkCompleted={isFamilyMember ? handleMarkCompleted : undefined}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dream Destination</DialogTitle>
          </DialogHeader>
          <WishlistForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditItem}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingItem(null);
              resetForm();
            }}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wishlist Form Component
interface WishlistFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

function WishlistForm({ formData, setFormData, onSubmit, onCancel, isEdit }: WishlistFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Dream Destination *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Isle of Skye"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
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
          onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
          placeholder="What makes this place special? What do you want to do there?"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WISHLIST_CATEGORIES.map(category => (
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
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WISHLIST_PRIORITIES.map(priority => (
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, estimatedCost: e.target.value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, bestTimeToVisit: e.target.value }))}
            placeholder="e.g., Spring/Summer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
          placeholder="Any special considerations, tips, or reminders..."
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? 'Update Dream' : 'Add to Wishlist'}
        </Button>
      </div>
    </div>
  );
}

// Wishlist Item Card Component
interface WishlistItemCardProps {
  item: WishlistItem;
  onEdit?: (item: WishlistItem) => void;
  onDelete?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
}

function WishlistItemCard({ item, onEdit, onDelete, onMarkCompleted }: WishlistItemCardProps) {
  const categoryData = WISHLIST_CATEGORIES.find(c => c.value === item.category);
  const priorityData = WISHLIST_PRIORITIES.find(p => p.value === item.priority);

  return (
    <Card className={`family-card group relative ${item.isCompleted ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-lg line-clamp-2 flex-1 ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {item.isCompleted && '✅ '}{item.title}
          </h3>
          
          {(onEdit || onDelete || onMarkCompleted) && (
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
              {onEdit && (
                <button
                  onClick={() => onEdit(item)}
                  className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                  title="Edit item"
                >
                  <Edit2 className="h-3 w-3 text-blue-600" />
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

        <div className="flex items-center text-sm text-muted-foreground mb-2 space-x-3">
          <div className="flex items-center space-x-1">
            <MapPinIcon className="h-3 w-3" />
            <span>{item.location}</span>
          </div>
          {item.completedDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Completed {new Date(item.completedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {categoryData && (
            <Badge variant="outline" className="text-xs">
              {categoryData.emoji} {categoryData.label.split(' ')[1]}
            </Badge>
          )}
          {priorityData && (
            <Badge variant="secondary" className={`text-xs ${priorityData.color}`}>
              {priorityData.emoji} {priorityData.label}
            </Badge>
          )}
          {item.estimatedCost && (
            <Badge variant="outline" className="text-xs">
              💰 {item.estimatedCost}
            </Badge>
          )}
          {item.bestTimeToVisit && (
            <Badge variant="outline" className="text-xs">
              📅 {item.bestTimeToVisit}
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

        {item.notes && (
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
            <strong>Notes:</strong> {item.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
