// Hybrid storage that uses both localStorage and Firebase for real-time sync
import { LocalStorage } from "./storage";
import { CloudStorage } from "./cloudStorage";
import { JournalEntry, MapPin, WishlistItem } from "@shared/api";

export class HybridStorage {
  private static cloudEnabled = false;
  private static listeners: (() => void)[] = [];

  static async initialize(): Promise<boolean> {
    try {
      this.cloudEnabled = await CloudStorage.enableCloudSync();
      if (this.cloudEnabled) {
        console.log("🔄 Initializing cloud sync...");
        await this.syncLocalToCloud();
        this.setupRealtimeListeners();
        console.log("🎉 Auto-sync ready! Changes will sync across all devices.");
      } else {
        console.log("📱 Using local storage only - Firebase not configured");
      }
      return this.cloudEnabled;
    } catch (error) {
      console.warn(
        "⚠️ Cloud sync initialization failed, using local storage only:",
        error,
      );
      this.cloudEnabled = false;
      return false;
    }
  }

  // Journal Entries
  static async saveJournalEntry(entry: JournalEntry): Promise<void> {
    // Always save locally first (instant)
    LocalStorage.saveJournalEntry(entry);

    // Then sync to cloud if available
    if (this.cloudEnabled) {
      try {
        await CloudStorage.saveJournalEntry(entry);
      } catch (error) {
        console.warn("Failed to sync entry to cloud:", error);
      }
    }
  }

  static getJournalEntries(): JournalEntry[] {
    return LocalStorage.getJournalEntries();
  }

  static async deleteJournalEntry(id: string): Promise<void> {
    LocalStorage.deleteJournalEntry(id);
    if (this.cloudEnabled) {
      try {
        await CloudStorage.deleteJournalEntry(id);
      } catch (error) {
        console.warn("Failed to delete entry from cloud:", error);
      }
    }
  }

  // Map Pins
  static async saveMapPin(pin: MapPin): Promise<void> {
    LocalStorage.saveMapPin(pin);
    if (this.cloudEnabled) {
      try {
        await CloudStorage.saveMapPin(pin);
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
    if (this.cloudEnabled) {
      try {
        await CloudStorage.deleteMapPin(id);
      } catch (error) {
        console.warn("Failed to delete pin from cloud:", error);
      }
    }
  }

  // Wishlist Items
  static async saveWishlistItem(item: WishlistItem): Promise<void> {
    LocalStorage.saveWishlistItem(item);
    if (this.cloudEnabled) {
      try {
        await CloudStorage.saveWishlistItem(item);
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
    if (this.cloudEnabled) {
      try {
        await CloudStorage.deleteWishlistItem(id);
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
    if (this.cloudEnabled) {
      try {
        await CloudStorage.setCharlieData(data);
      } catch (error) {
        console.warn("Failed to sync Charlie data to cloud:", error);
      }
    }
  }

  static getCharlieData(): { image: string; description: string } {
    return LocalStorage.getCharlieData();
  }

  // Sync local data to cloud
  private static async syncLocalToCloud(): Promise<void> {
    try {
      const entries = LocalStorage.getJournalEntries();
      const pins = LocalStorage.getMapPins();
      const wishlist = LocalStorage.getWishlistItems();
      const charlie = LocalStorage.getCharlieData();

      // Sync all data to cloud
      for (const entry of entries) {
        await CloudStorage.saveJournalEntry(entry);
      }
      for (const pin of pins) {
        await CloudStorage.saveMapPin(pin);
      }
      for (const item of wishlist) {
        await CloudStorage.saveWishlistItem(item);
      }
      await CloudStorage.setCharlieData(charlie);

      console.log("Local data synced to cloud successfully");
    } catch (error) {
      console.warn("Failed to sync local data to cloud:", error);
    }
  }

  // Setup real-time listeners for cloud updates
  private static setupRealtimeListeners(): void {
    if (!this.cloudEnabled) return;

    // Listen for journal entry changes
    const entriesListener = CloudStorage.listenToJournalEntries(
      (cloudEntries) => {
        const localEntries = LocalStorage.getJournalEntries();
        const localIds = new Set(localEntries.map((e) => e.id));

        // Add new entries from cloud
        cloudEntries.forEach((entry) => {
          if (!localIds.has(entry.id)) {
            LocalStorage.saveJournalEntry(entry);
          }
        });

        // Trigger update event
        this.notifyListeners();
      },
    );

    // Listen for map pin changes
    const pinsListener = CloudStorage.listenToMapPins((cloudPins) => {
      const localPins = LocalStorage.getMapPins();
      const localIds = new Set(localPins.map((p) => p.id));

      cloudPins.forEach((pin) => {
        if (!localIds.has(pin.id)) {
          LocalStorage.saveMapPin(pin);
        }
      });

      this.notifyListeners();
    });

    // Listen for wishlist changes
    const wishlistListener = CloudStorage.listenToWishlistItems(
      (cloudItems) => {
        const localItems = LocalStorage.getWishlistItems();
        const localIds = new Set(localItems.map((i) => i.id));

        cloudItems.forEach((item) => {
          if (!localIds.has(item.id)) {
            LocalStorage.saveWishlistItem(item);
          }
        });

        this.notifyListeners();
      },
    );

    // Listen for Charlie data changes
    const charlieListener = CloudStorage.listenToCharlieData((charlieData) => {
      LocalStorage.setCharlieData(charlieData);
      this.notifyListeners();
    });

    this.listeners.push(
      entriesListener,
      pinsListener,
      wishlistListener,
      charlieListener,
    );
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

  static isCloudEnabled(): boolean {
    return this.cloudEnabled;
  }

  static cleanup(): void {
    CloudStorage.cleanup();
    this.listeners = [];
  }
}
