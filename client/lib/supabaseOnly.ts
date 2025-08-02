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
    console.log("🔄 Journal entry saved, notifying listeners...");
    this.notifyListeners();
  }

  static async deleteJournalEntry(id: string): Promise<void> {
    await SupabaseDatabase.deleteJournalEntry(id);
    console.log("🔄 Journal entry deleted, notifying listeners...");
    this.notifyListeners();
  }

  // Map Pins
  static async getMapPins(): Promise<MapPin[]> {
    return await SupabaseDatabase.getMapPins();
  }

  static async saveMapPin(pin: MapPin): Promise<void> {
    await SupabaseDatabase.saveMapPin(pin);
    console.log("🔄 Map pin saved, notifying listeners...");
    this.notifyListeners();
  }

  static async deleteMapPin(id: string): Promise<void> {
    await SupabaseDatabase.deleteMapPin(id);
    console.log("🔄 Map pin deleted, notifying listeners...");
    this.notifyListeners();
  }

  // Wishlist Items
  static async getWishlistItems(): Promise<WishlistItem[]> {
    return await SupabaseDatabase.getWishlistItems();
  }

  static async saveWishlistItem(item: WishlistItem): Promise<void> {
    await SupabaseDatabase.saveWishlistItem(item);
    console.log("🔄 Wishlist item saved, notifying listeners...");
    this.notifyListeners();
  }

  static async deleteWishlistItem(id: string): Promise<void> {
    await SupabaseDatabase.deleteWishlistItem(id);
    console.log("🔄 Wishlist item deleted, notifying listeners...");
    this.notifyListeners();
  }

  // YouTube Video
  static async getYouTubeVideo(): Promise<YouTubeVideo | null> {
    return await SupabaseDatabase.getYouTubeVideo();
  }

  static async saveYouTubeVideo(video: YouTubeVideo): Promise<void> {
    await SupabaseDatabase.saveYouTubeVideo(video);
    console.log("🔄 YouTube video saved, notifying listeners...");
    this.notifyListeners();
  }

  static async deleteYouTubeVideo(): Promise<void> {
    await SupabaseDatabase.deleteYouTubeVideo();
    console.log("🔄 YouTube video deleted, notifying listeners...");
    this.notifyListeners();
  }

  // Charlie Data
  static async getCharlieData(): Promise<{ image: string; description: string }> {
    return await SupabaseDatabase.getCharlieData();
  }

  static async saveCharlieData(data: { image: string; description: string }): Promise<void> {
    await SupabaseDatabase.saveCharlieData(data);
    console.log("🔄 Charlie data saved, notifying listeners...");
    this.notifyListeners();
  }

  // Real-time subscriptions
  static setupSubscriptions(): void {
    console.log("🔄 Setting up Supabase real-time subscriptions...");

    try {
      // Subscribe to journal entries
      SupabaseDatabase.subscribeToJournalEntries(() => {
        console.log("🔄 [REAL-TIME] Journal entries updated from another device");
        this.notifyListeners();
      });

      // Subscribe to map pins
      SupabaseDatabase.subscribeToMapPins(() => {
        console.log("🔄 [REAL-TIME] Map pins updated from another device");
        this.notifyListeners();
      });

      // Subscribe to wishlist items
      SupabaseDatabase.subscribeToWishlistItems(() => {
        console.log("🔄 [REAL-TIME] Wishlist items updated from another device");
        this.notifyListeners();
      });

      // Subscribe to YouTube video
      SupabaseDatabase.subscribeToYouTubeVideo(() => {
        console.log("🔄 [REAL-TIME] YouTube video updated from another device");
        this.notifyListeners();
      });

      // Subscribe to Charlie data
      SupabaseDatabase.subscribeToCharlieData(() => {
        console.log("🔄 [REAL-TIME] Charlie data updated from another device");
        this.notifyListeners();
      });

      console.log("✅ All Supabase real-time subscriptions set up successfully");
      console.log("🌍 Cross-device synchronization is now active!");
    } catch (error) {
      console.error("❌ Failed to set up real-time subscriptions:", error);
    }
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
    console.log(`🔔 Notifying ${this.listeners.length} real-time listeners...`);
    this.listeners.forEach((listener, index) => {
      if (typeof listener === "function") {
        console.log(`🔄 Calling listener ${index + 1}`);
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
