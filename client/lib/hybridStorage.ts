// Hybrid storage that uses both localStorage and Firebase for real-time sync
import { LocalStorage } from "./storage";
import { SupabaseDatabase } from "./supabaseDatabase";
import { SupabaseSetupInstructions } from "./supabaseSetupInstructions";
import { JournalEntry, MapPin, WishlistItem } from "@shared/api";

export class HybridStorage {
  private static supabaseEnabled = false;
  private static listeners: (() => void)[] = [];

  static async initialize(): Promise<boolean> {
    try {
      const connectionTest = await SupabaseDatabase.testConnection();
      this.supabaseEnabled = connectionTest.success;

      if (this.supabaseEnabled) {
        console.log("🔄 Initializing Supabase sync...");
        await this.syncLocalToSupabase();
        this.setupRealtimeListeners();
        console.log(
          "🎉 Supabase auto-sync ready! Changes will sync across all devices.",
        );
      } else {
        console.log("📱 Using local storage only - Supabase not available:", connectionTest.message);
      }
      return this.supabaseEnabled;
    } catch (error) {
      console.warn(
        "⚠️ Supabase sync initialization failed, using local storage only:",
        error,
      );
      this.supabaseEnabled = false;
      return false;
    }
  }

  // Journal Entries
  static async saveJournalEntry(entry: JournalEntry): Promise<void> {
    // Always save locally first (instant)
    LocalStorage.saveJournalEntry(entry);

    // Then sync to Supabase if available
    if (this.supabaseEnabled) {
      try {
        await SupabaseDatabase.saveJournalEntry(entry);
      } catch (error) {
        console.warn("Failed to sync entry to Supabase:", error);
      }
    }
  }

  static getJournalEntries(): JournalEntry[] {
    const localEntries = LocalStorage.getJournalEntries();

    // If localStorage is disabled and we get no entries, we need to load from Firebase
    if (localEntries.length === 0 && this.supabaseEnabled) {
      console.warn(
        "��� localStorage disabled, entries should be loaded from Firebase directly",
      );
      console.warn(
        "🔄 Journal page should use direct Firebase loading when localStorage disabled",
      );
    }

    return localEntries;
  }

  static async deleteJournalEntry(id: string): Promise<void> {
    LocalStorage.deleteJournalEntry(id);
    if (this.supabaseEnabled) {
      try {
        await SupabaseDatabase.deleteJournalEntry(id);
      } catch (error) {
        console.warn("Failed to delete entry from cloud:", error);
      }
    }
  }

  // Map Pins
  static async saveMapPin(pin: MapPin): Promise<void> {
    LocalStorage.saveMapPin(pin);
    if (this.supabaseEnabled) {
      try {
        await SupabaseDatabase.saveMapPin(pin);
      } catch (error) {
        console.warn("Failed to sync pin to cloud:", error);
      }
    }
  }

  static getMapPins(): MapPin[] {
    return LocalStorage.getMapPins();
  }

  static async deleteMapPin(id: string): Promise<void> {
    LocalStorage.deleteMapPin(id);
    if (this.supabaseEnabled) {
      try {
        await SupabaseDatabase.deleteMapPin(id);
      } catch (error) {
        console.warn("Failed to delete pin from cloud:", error);
      }
    }
  }

  // Wishlist Items
  static async saveWishlistItem(item: WishlistItem): Promise<void> {
    LocalStorage.saveWishlistItem(item);
    if (this.supabaseEnabled) {
      try {
        await SupabaseDatabase.saveWishlistItem(item);
      } catch (error) {
        console.warn("Failed to sync wishlist item to cloud:", error);
      }
    }
  }

  static getWishlistItems(): WishlistItem[] {
    return LocalStorage.getWishlistItems();
  }

  static async deleteWishlistItem(id: string): Promise<void> {
    LocalStorage.deleteWishlistItem(id);
    if (this.supabaseEnabled) {
      try {
        await SupabaseDatabase.deleteWishlistItem(id);
      } catch (error) {
        console.warn("Failed to delete wishlist item from cloud:", error);
      }
    }
  }

  // Charlie Data
  static async setCharlieData(data: {
    image: string;
    description: string;
  }): Promise<void> {
    LocalStorage.setCharlieData(data);
    if (this.supabaseEnabled) {
      try {
        await SupabaseDatabase.setCharlieData(data);
      } catch (error) {
        console.warn("Failed to sync Charlie data to cloud:", error);
      }
    }
  }

  static getCharlieData(): { image: string; description: string } {
    return LocalStorage.getCharlieData();
  }

  // Sync local data to Supabase
  private static async syncLocalToSupabase(): Promise<void> {
    try {
      const entries = LocalStorage.getJournalEntries();
      const pins = LocalStorage.getMapPins();
      const wishlist = LocalStorage.getWishlistItems();
      const charlie = LocalStorage.getCharlieData();

      // Sync all data to Supabase
      for (const entry of entries) {
        await SupabaseDatabase.saveJournalEntry(entry);
      }
      for (const pin of pins) {
        await SupabaseDatabase.saveMapPin(pin);
      }
      for (const item of wishlist) {
        await SupabaseDatabase.saveWishlistItem(item);
      }
      await SupabaseDatabase.setCharlieData(charlie);

      console.log("Local data synced to Supabase successfully");
    } catch (error) {
      console.warn("Failed to sync local data to Supabase:", error);
    }
  }

  // Setup real-time listeners for Supabase updates
  private static setupRealtimeListeners(): void {
    if (!this.supabaseEnabled) {
      console.log("⚠️ Supabase not enabled, skipping real-time listeners");
      return;
    }
    console.log("🔄 Setting up Supabase real-time subscriptions...");

    try {
      // Subscribe to journal entry changes
      const entriesListener = SupabaseDatabase.subscribeToJournalEntries(
        (supabaseEntries) => {
          const localEntries = LocalStorage.getJournalEntries();
          const localIds = new Set(localEntries.map((e) => e.id));

          // Add new entries from Supabase
          supabaseEntries.forEach((entry) => {
            if (!localIds.has(entry.id)) {
              LocalStorage.saveJournalEntry(entry);
            }
          });

          // Trigger update event
          this.notifyListeners();
        },
      );

      // Subscribe to map pin changes
      const pinsListener = SupabaseDatabase.subscribeToMapPins((supabasePins) => {
        const localPins = LocalStorage.getMapPins();
        const localIds = new Set(localPins.map((p) => p.id));

        supabasePins.forEach((pin) => {
          if (!localIds.has(pin.id)) {
            LocalStorage.saveMapPin(pin);
          }
        });

        this.notifyListeners();
      });

      // Subscribe to wishlist changes
      const wishlistListener = SupabaseDatabase.subscribeToWishlistItems(
        (supabaseItems) => {
          const localItems = LocalStorage.getWishlistItems();
          const localIds = new Set(localItems.map((i) => i.id));

          supabaseItems.forEach((item) => {
            if (!localIds.has(item.id)) {
              LocalStorage.saveWishlistItem(item);
            }
          });

          this.notifyListeners();
        },
      );

      // Subscribe to Charlie data changes
      console.log("🔄 Setting up Charlie subscription...");
      const charlieListener = SupabaseDatabase.subscribeToCharlieData((charlieData) => {
        console.log("🔄 Supabase Charlie update received:", {
          hasImage: !!charlieData.image,
          imageLength: charlieData.image?.length || 0,
        });
        LocalStorage.setCharlieData(charlieData);
        this.notifyListeners();
      });
      console.log("✅ Charlie subscription set up successfully");

      this.listeners.push(
        entriesListener,
        pinsListener,
        wishlistListener,
        charlieListener,
      );
    } catch (error) {
      console.warn("⚠️ Failed to setup Supabase subscriptions (network issue):", error);
      console.log("📱 App will work in offline mode with localStorage only");

      // Disable Supabase sync to prevent further connection attempts
      this.supabaseEnabled = false;
    }
  }

  // Add listener for updates
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

  static isSupabaseEnabled(): boolean {
    return this.supabaseEnabled;
  }

  static cleanup(): void {
    // Clean up local listeners
    this.listeners = [];
    console.log("🧹 HybridStorage cleanup completed");
  }
}
