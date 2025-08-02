// Simplified storage service using only Supabase
import { SupabaseDatabase } from './supabaseDatabase';
import type { JournalEntry, MapPin, WishlistItem, YouTubeVideo } from '../../shared/api';

export class SupabaseStorage {
  private static listeners: (() => void)[] = [];

  // Journal Entries
  static async getJournalEntries(): Promise<JournalEntry[]> {
    return await SupabaseDatabase.getJournalEntries();
  }

  static async saveJournalEntry(entry: JournalEntry): Promise<void> {
    await SupabaseDatabase.saveJournalEntry(entry);
    this.notifyListeners();
  }

  static async deleteJournalEntry(id: string): Promise<void> {
    await SupabaseDatabase.deleteJournalEntry(id);
    this.notifyListeners();
  }

  // Map Pins
  static async getMapPins(): Promise<MapPin[]> {
    return await SupabaseDatabase.getMapPins();
  }

  static async saveMapPin(pin: MapPin): Promise<void> {
    await SupabaseDatabase.saveMapPin(pin);
    this.notifyListeners();
  }

  static async deleteMapPin(id: string): Promise<void> {
    await SupabaseDatabase.deleteMapPin(id);
    this.notifyListeners();
  }

  // Wishlist Items
  static async getWishlistItems(): Promise<WishlistItem[]> {
    return await SupabaseDatabase.getWishlistItems();
  }

  static async saveWishlistItem(item: WishlistItem): Promise<void> {
    await SupabaseDatabase.saveWishlistItem(item);
    this.notifyListeners();
  }

  static async deleteWishlistItem(id: string): Promise<void> {
    await SupabaseDatabase.deleteWishlistItem(id);
    this.notifyListeners();
  }

  // YouTube Video
  static async getYouTubeVideo(): Promise<YouTubeVideo | null> {
    return await SupabaseDatabase.getYouTubeVideo();
  }

  static async saveYouTubeVideo(video: YouTubeVideo): Promise<void> {
    await SupabaseDatabase.saveYouTubeVideo(video);
    this.notifyListeners();
  }

  static async deleteYouTubeVideo(): Promise<void> {
    await SupabaseDatabase.deleteYouTubeVideo();
    this.notifyListeners();
  }

  // Charlie Data
  static async getCharlieData(): Promise<{ image: string; description: string }> {
    return await SupabaseDatabase.getCharlieData();
  }

  static async saveCharlieData(data: { image: string; description: string }): Promise<void> {
    await SupabaseDatabase.saveCharlieData(data);
    this.notifyListeners();
  }

  // Real-time subscriptions
  static setupSubscriptions(): void {
    console.log("🔄 Setting up Supabase real-time subscriptions...");

    // Subscribe to journal entries
    SupabaseDatabase.subscribeToJournalEntries(() => {
      console.log("🔄 Journal entries updated");
      this.notifyListeners();
    });

    // Subscribe to map pins
    SupabaseDatabase.subscribeToMapPins(() => {
      console.log("🔄 Map pins updated");
      this.notifyListeners();
    });

    // Subscribe to wishlist items
    SupabaseDatabase.subscribeToWishlistItems(() => {
      console.log("🔄 Wishlist items updated");
      this.notifyListeners();
    });

    // Subscribe to YouTube video
    SupabaseDatabase.subscribeToYouTubeVideo(() => {
      console.log("🔄 YouTube video updated");
      this.notifyListeners();
    });

    // Subscribe to Charlie data
    SupabaseDatabase.subscribeToCharlieData(() => {
      console.log("🔄 Charlie data updated");
      this.notifyListeners();
    });

    console.log("✅ All Supabase subscriptions set up");
  }

  // Utility methods
  static async toggleLike(entryId: string): Promise<void> {
    try {
      const entries = await this.getJournalEntries();
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        const updatedEntry = {
          ...entry,
          likes: (entry.likes || 0) + (entry.isLiked ? -1 : 1),
          isLiked: !entry.isLiked,
          updatedAt: new Date().toISOString(),
        };
        await this.saveJournalEntry(updatedEntry);
      }
    } catch (error) {
      console.error("❌ Failed to toggle like:", error);
    }
  }

  static async markWishlistItemCompleted(itemId: string, journalEntryId?: string): Promise<void> {
    try {
      const items = await this.getWishlistItems();
      const item = items.find(i => i.id === itemId);
      if (item) {
        const updatedItem = {
          ...item,
          isCompleted: true,
          completedDate: new Date().toISOString(),
          journalEntryId: journalEntryId || item.journalEntryId,
          updatedAt: new Date().toISOString(),
        };
        await this.saveWishlistItem(updatedItem);
      }
    } catch (error) {
      console.error("❌ Failed to mark wishlist item completed:", error);
    }
  }

  // Event listeners
  static onUpdate(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach((listener) => {
      if (typeof listener === "function") {
        listener();
      }
    });
  }

  static cleanup(): void {
    this.listeners = [];
    console.log("🧹 SupabaseStorage cleanup completed");
  }

  // Export functionality
  static async exportData(): Promise<string> {
    const [entries, pins, wishlist, charlie] = await Promise.all([
      this.getJournalEntries(),
      this.getMapPins(),
      this.getWishlistItems(),
      this.getCharlieData()
    ]);

    const data = {
      entries,
      pins,
      wishlist,
      charlie,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }
}
