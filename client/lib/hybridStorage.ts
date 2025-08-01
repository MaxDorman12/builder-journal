// Hybrid storage that uses both localStorage and Firebase for real-time sync
import { LocalStorage } from "./storage";
import { SupabaseDatabase } from "./supabaseDatabase";
import { SupabaseSetupInstructions } from "./supabaseSetupInstructions";
import { JournalEntry, MapPin, WishlistItem } from "@shared/api";
// Import test for debugging
import "./realtimeTest";

export class HybridStorage {
  private static supabaseEnabled = false;
  private static listeners: (() => void)[] = [];
  private static periodicSyncInterval: NodeJS.Timeout | null = null;

  static getSupabaseStatus(): { enabled: boolean; message: string } {
    return {
      enabled: this.supabaseEnabled,
      message: this.supabaseEnabled
        ? "Supabase is connected and ready"
        : "Supabase is not connected - deletions only affect local storage",
    };
  }

  static async reinitialize(): Promise<boolean> {
    console.log("🔄 Reinitializing Supabase connection...");
    return this.initialize();
  }

  static async initialize(): Promise<boolean> {
    try {
      const connectionTest = await SupabaseDatabase.testConnection();
      this.supabaseEnabled = connectionTest.success;

      if (this.supabaseEnabled) {
        console.log("🔄 Initializing Supabase sync...");

        // Test real-time connection
        SupabaseDatabase.testRealtime();

        await this.syncLocalToSupabase();
        this.setupRealtimeListeners();

        // Start periodic sync as backup (every 30 seconds)
        this.startPeriodicSync();

        console.log(
          "🎉 Supabase auto-sync ready! Changes will sync across all devices.",
        );
      } else {
        console.log(
          "📱 Using local storage only - Supabase not available:",
          connectionTest.message,
        );
        console.log("🔍 Connection test details:", connectionTest);

        // Show setup instructions if tables don't exist
        if (
          connectionTest.message.includes("Database tables not created yet")
        ) {
          SupabaseSetupInstructions.displayInstructions();
        }
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
    console.log("🗑️ DELETE: Starting delete process for entry:", id);
    console.log("🔍 DELETE: Supabase enabled status:", this.supabaseEnabled);

    // Delete from local storage first
    LocalStorage.deleteJournalEntry(id);
    console.log("✅ DELETE: Removed from localStorage");

    if (this.supabaseEnabled) {
      try {
        console.log("🗑️ DELETE: Removing from Supabase...");
        await SupabaseDatabase.deleteJournalEntry(id);
        console.log("✅ DELETE: Successfully removed from Supabase");
        console.log(
          "🔔 DELETE: This should trigger real-time sync on other devices",
        );
      } catch (error) {
        console.error(
          "❌ DELETE: Failed to delete entry from Supabase:",
          error,
        );
      }
    } else {
      console.log(
        "⚠️ DELETE: Supabase sync disabled - entry only deleted locally",
      );
      console.log(
        "💡 DELETE: To enable Supabase sync, check connection and call HybridStorage.initialize()",
      );
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
    console.log("🗑️ DELETE MAP PIN: Starting delete process for pin:", id);
    console.log(
      "🔍 DELETE MAP PIN: Supabase enabled status:",
      this.supabaseEnabled,
    );

    // Delete from local storage first
    LocalStorage.deleteMapPin(id);
    console.log("✅ DELETE MAP PIN: Removed from localStorage");

    if (this.supabaseEnabled) {
      try {
        console.log("🗑️ DELETE MAP PIN: Removing from Supabase...");
        await SupabaseDatabase.deleteMapPin(id);
        console.log("✅ DELETE MAP PIN: Successfully removed from Supabase");
        console.log(
          "🔔 DELETE MAP PIN: This should trigger real-time sync on other devices",
        );
      } catch (error) {
        console.error(
          "❌ DELETE MAP PIN: Failed to delete from Supabase:",
          error,
        );
      }
    } else {
      console.log(
        "⚠️ DELETE MAP PIN: Supabase sync disabled - pin only deleted locally",
      );
      console.log(
        "💡 DELETE MAP PIN: To enable Supabase sync, check connection and call HybridStorage.initialize()",
      );
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
    console.log("🗑️ DELETE WISHLIST: Starting delete process for item:", id);
    console.log(
      "🔍 DELETE WISHLIST: Supabase enabled status:",
      this.supabaseEnabled,
    );

    // Delete from local storage first
    LocalStorage.deleteWishlistItem(id);
    console.log("✅ DELETE WISHLIST: Removed from localStorage");

    if (this.supabaseEnabled) {
      try {
        console.log("🗑️ DELETE WISHLIST: Removing from Supabase...");
        await SupabaseDatabase.deleteWishlistItem(id);
        console.log("✅ DELETE WISHLIST: Successfully removed from Supabase");
        console.log(
          "🔔 DELETE WISHLIST: This should trigger real-time sync on other devices",
        );
      } catch (error) {
        console.error(
          "❌ DELETE WISHLIST: Failed to delete from Supabase:",
          error,
        );
      }
    } else {
      console.log(
        "⚠️ DELETE WISHLIST: Supabase sync disabled - item only deleted locally",
      );
      console.log(
        "💡 DELETE WISHLIST: To enable Supabase sync, check connection and call HybridStorage.initialize()",
      );
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
      console.log("🚀 Setting up real-time subscriptions...");

      // Subscribe to journal entry changes
      const entriesListener = SupabaseDatabase.subscribeToJournalEntries(
        (supabaseEntries) => {
          console.log(
            `🔄 Real-time update: ${supabaseEntries.length} journal entries from Supabase`,
          );
          console.log(
            "📝 Entry IDs received:",
            supabaseEntries.map((e) => e.id),
          );

          // Get current local entries to compare
          const localEntries = LocalStorage.getJournalEntries();
          const supabaseIds = new Set(supabaseEntries.map((e) => e.id));
          const localIds = new Set(localEntries.map((e) => e.id));

          // Remove local entries that no longer exist in Supabase (deletions)
          localEntries.forEach((localEntry) => {
            if (!supabaseIds.has(localEntry.id)) {
              console.log(`🗑️ Removing deleted entry: ${localEntry.title}`);
              LocalStorage.deleteJournalEntry(localEntry.id);
            }
          });

          // Add/update entries from Supabase
          supabaseEntries.forEach((entry) => {
            LocalStorage.saveJournalEntry(entry);
          });

          console.log(
            `✅ Sync complete: ${supabaseEntries.length} entries in Supabase, ${localEntries.length} were local`,
          );

          // Trigger update event to refresh UI
          console.log("🔔 Notifying listeners of data change...");
          this.notifyListeners();
        },
      );

      console.log("✅ Journal entries subscription set up");

      // Subscribe to map pin changes
      const pinsListener = SupabaseDatabase.subscribeToMapPins(
        (supabasePins) => {
          console.log(
            `���� Real-time update: ${supabasePins.length} map pins from Supabase`,
          );

          // Handle deletions and updates
          const localPins = LocalStorage.getMapPins();
          const supabaseIds = new Set(supabasePins.map((p) => p.id));

          // Remove deleted pins
          localPins.forEach((localPin) => {
            if (!supabaseIds.has(localPin.id)) {
              console.log(`🗑️ Removing deleted pin: ${localPin.title}`);
              LocalStorage.deleteMapPin(localPin.id);
            }
          });

          // Add/update pins from Supabase
          supabasePins.forEach((pin) => {
            LocalStorage.saveMapPin(pin);
          });

          this.notifyListeners();
        },
      );

      // Subscribe to wishlist changes
      const wishlistListener = SupabaseDatabase.subscribeToWishlistItems(
        (supabaseItems) => {
          console.log(
            `🔄 Real-time update: ${supabaseItems.length} wishlist items from Supabase`,
          );

          // Handle deletions and updates
          const localItems = LocalStorage.getWishlistItems();
          const supabaseIds = new Set(supabaseItems.map((i) => i.id));

          // Remove deleted items
          localItems.forEach((localItem) => {
            if (!supabaseIds.has(localItem.id)) {
              console.log(
                `🗑️ Removing deleted wishlist item: ${localItem.title}`,
              );
              LocalStorage.deleteWishlistItem(localItem.id);
            }
          });

          // Add/update items from Supabase
          supabaseItems.forEach((item) => {
            LocalStorage.saveWishlistItem(item);
          });

          this.notifyListeners();
        },
      );

      // Subscribe to Charlie data changes
      console.log("🔄 Setting up Charlie subscription...");
      const charlieListener = SupabaseDatabase.subscribeToCharlieData(
        (charlieData) => {
          console.log("🔄 Real-time Charlie update received:", {
            hasImage: !!charlieData.image,
            imageLength: charlieData.image?.length || 0,
          });
          LocalStorage.setCharlieData(charlieData);
          this.notifyListeners();
        },
      );
      console.log("✅ Charlie subscription set up successfully");

      this.listeners.push(
        entriesListener,
        pinsListener,
        wishlistListener,
        charlieListener,
      );
    } catch (error) {
      console.warn(
        "⚠️ Failed to setup Supabase subscriptions (network issue):",
        error,
      );
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

  // Start periodic sync as backup to real-time
  private static startPeriodicSync(): void {
    if (this.periodicSyncInterval) {
      clearInterval(this.periodicSyncInterval);
    }

    console.log("⏰ Starting periodic sync every 30 seconds as backup...");

    this.periodicSyncInterval = setInterval(async () => {
      if (!this.supabaseEnabled) return;

      try {
        console.log("⏰ Periodic sync: Checking for updates...");

        // Fetch latest data from Supabase
        const [entries, pins, wishlist, charlie] = await Promise.all([
          SupabaseDatabase.getJournalEntries(),
          SupabaseDatabase.getMapPins(),
          SupabaseDatabase.getWishlistItems(),
          SupabaseDatabase.getCharlieData(),
        ]);

        // Sync journal entries (handle deletions)
        const localEntries = LocalStorage.getJournalEntries();
        const entryIds = new Set(entries.map((e) => e.id));
        localEntries.forEach((local) => {
          if (!entryIds.has(local.id)) {
            LocalStorage.deleteJournalEntry(local.id);
          }
        });
        entries.forEach((entry) => LocalStorage.saveJournalEntry(entry));

        // Sync map pins (handle deletions)
        const localPins = LocalStorage.getMapPins();
        const pinIds = new Set(pins.map((p) => p.id));
        localPins.forEach((local) => {
          if (!pinIds.has(local.id)) {
            LocalStorage.deleteMapPin(local.id);
          }
        });
        pins.forEach((pin) => LocalStorage.saveMapPin(pin));

        // Sync wishlist (handle deletions)
        const localWishlist = LocalStorage.getWishlistItems();
        const wishlistIds = new Set(wishlist.map((i) => i.id));
        localWishlist.forEach((local) => {
          if (!wishlistIds.has(local.id)) {
            LocalStorage.deleteWishlistItem(local.id);
          }
        });
        wishlist.forEach((item) => LocalStorage.saveWishlistItem(item));

        // Update Charlie data
        LocalStorage.setCharlieData(charlie);

        // Notify listeners to refresh UI
        this.notifyListeners();

        console.log(
          `⏰ Periodic sync completed: ${entries.length} entries, ${pins.length} pins`,
        );
      } catch (error) {
        console.warn("⏰ Periodic sync failed:", error);
      }
    }, 30000); // Every 30 seconds
  }

  static cleanup(): void {
    // Clean up periodic sync
    if (this.periodicSyncInterval) {
      clearInterval(this.periodicSyncInterval);
      this.periodicSyncInterval = null;
    }

    // Clean up local listeners
    this.listeners = [];
    console.log("🧹 HybridStorage cleanup completed");
  }
}
