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
          const supabaseIds = new Set(supabaseEntries.map(e => e.id));
          const localIds = new Set(localEntries.map(e => e.id));

          // Remove local entries that no longer exist in Supabase (deletions)
          localEntries.forEach(localEntry => {
            if (!supabaseIds.has(localEntry.id)) {
              console.log(`🗑️ Removing deleted entry: ${localEntry.title}`);
              LocalStorage.deleteJournalEntry(localEntry.id);
            }
          });

          // Add/update entries from Supabase
          supabaseEntries.forEach((entry) => {
            LocalStorage.saveJournalEntry(entry);
          });

          console.log(`✅ Sync complete: ${supabaseEntries.length} entries in Supabase, ${localEntries.length} were local`);

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
            `🔄 Real-time update: ${supabasePins.length} map pins from Supabase`,
          );

          // Handle deletions and updates
          const localPins = LocalStorage.getMapPins();
          const supabaseIds = new Set(supabasePins.map(p => p.id));

          // Remove deleted pins
          localPins.forEach(localPin => {
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

          // Replace all local items with fresh Supabase data
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

        // Update local storage
        entries.forEach((entry) => LocalStorage.saveJournalEntry(entry));
        pins.forEach((pin) => LocalStorage.saveMapPin(pin));
        wishlist.forEach((item) => LocalStorage.saveWishlistItem(item));
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
