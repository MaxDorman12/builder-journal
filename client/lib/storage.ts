import { JournalEntry, MapPin, Comment, WishlistItem, YouTubeVideo } from "@shared/api";

export class LocalStorage {
  private static localStorageDisabled = false;
  private static initChecked = false;

  private static getKey(key: string): string {
    return `familyjournal_${key}`;
  }

  // Initialize and check localStorage availability
  private static initialize(): void {
    if (this.initChecked) return;
    this.initChecked = true;

    try {
      // Check sessionStorage flag from previous failures
      if (sessionStorage.getItem("localStorage_disabled") === "true") {
        this.localStorageDisabled = true;
        console.warn("📵 localStorage previously disabled, keeping disabled");
        return;
      }

      const testKey = "__test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
    } catch (error) {
      console.warn("📵 localStorage completely full, disabling permanently");
      this.localStorageDisabled = true;
      sessionStorage.setItem("localStorage_disabled", "true");
    }
  }

  // Check if localStorage is completely unusable
  private static isLocalStorageUsable(): boolean {
    this.initialize();
    return !this.localStorageDisabled;
  }

  // Override localStorage methods when disabled
  private static safeLocalStorageSet(key: string, value: string): boolean {
    if (!this.isLocalStorageUsable()) {
      console.warn(
        `📵 Skipping localStorage.setItem(${key}) - storage disabled`,
      );
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`❌ localStorage.setItem failed for ${key}`);
      this.localStorageDisabled = true;
      sessionStorage.setItem("localStorage_disabled", "true");
      return false;
    }
  }

  private static safeLocalStorageGet(key: string): string | null {
    if (!this.isLocalStorageUsable()) {
      console.warn(
        `📵 Skipping localStorage.getItem(${key}) - storage disabled`,
      );
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`⚠️ localStorage.getItem failed for ${key}`);
      return null;
    }
  }

  // Handle localStorage quota exceeded errors
  private static handleQuotaExceeded(key: string, data: any): void {
    console.log("🧹 Auto-cleanup triggered due to quota exceeded");

    // Emergency cleanup of large base64 data
    this.emergencyCleanup();

    // Immediately disable localStorage - don't even try to save again
    this.localStorageDisabled = true;
    console.warn(
      "📵 localStorage completely full and disabled for this session",
    );

    // Show one-time alert about storage being disabled
    if (!sessionStorage.getItem("storage_alert_shown")) {
      sessionStorage.setItem("storage_alert_shown", "true");
      alert(
        `📵 Device Storage Full!\n\nYour family journal will work but changes won't save locally on this device.\n\n✅ Data WILL sync to cloud (Firebase/Supabase)\n✅ Other devices will still work normally\n\n🔧 To fix: Click "🧹 CLEAN" or clear browser data`,
      );
    }

    // Don't throw error - just continue without localStorage
    console.log("🌥️ Continuing with cloud-only storage mode");
  }

  // Emergency cleanup of large files
  private static emergencyCleanup(): void {
    let clearedCount = 0;
    let clearedSize = 0;
    const keys = Object.keys(localStorage);

    console.log(
      `🧹 Starting emergency cleanup of ${keys.length} localStorage items`,
    );

    // Phase 1: Remove ALL base64 images/videos regardless of size
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (
          value &&
          (value.startsWith("data:image/") || value.startsWith("data:video/"))
        ) {
          console.log(
            `🗑️ Removing media file: ${key} (${(value.length / 1024).toFixed(1)}KB)`,
          );
          clearedSize += value.length;
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        // Skip problematic items
      }
    }

    // Phase 2: If still having issues, remove non-essential family journal data
    if (clearedCount === 0) {
      console.log(`⚠️ No media files found, removing old journal entries`);
      try {
        // Remove old journal entries (keep only last 5)
        const entries = this.getJournalEntries();
        if (entries.length > 5) {
          const recentEntries = entries.slice(-5); // Keep last 5
          localStorage.setItem(
            this.getKey("entries"),
            JSON.stringify(recentEntries),
          );
          console.log(`🗑️ Reduced journal entries from ${entries.length} to 5`);
          clearedCount += entries.length - 5;
        }
      } catch (error) {
        console.error("Failed to reduce journal entries:", error);
      }
    }

    console.log(
      `🧹 Emergency cleanup complete: ${clearedCount} items, ${(clearedSize / 1024 / 1024).toFixed(1)}MB freed`,
    );
  }

  static getJournalEntries(): JournalEntry[] {
    const data = this.safeLocalStorageGet(this.getKey("entries"));
    return data ? JSON.parse(data) : [];
  }

  static saveJournalEntry(entry: JournalEntry): void {
    const entries = this.getJournalEntries();
    const existingIndex = entries.findIndex((e) => e.id === entry.id);

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    const success = this.safeLocalStorageSet(
      this.getKey("entries"),
      JSON.stringify(entries),
    );
    if (!success) {
      console.warn(
        "📵 Journal entry not saved locally - using cloud sync only",
      );
    }
  }

  static deleteJournalEntry(id: string): void {
    const entries = this.getJournalEntries().filter((e) => e.id !== id);
    const success = this.safeLocalStorageSet(
      this.getKey("entries"),
      JSON.stringify(entries),
    );
    if (!success) {
      console.warn(
        "📵 Journal entry deletion not saved locally - using cloud sync only",
      );
    }
  }

  static getMapPins(): MapPin[] {
    const data = localStorage.getItem(this.getKey("map_pins"));
    return data ? JSON.parse(data) : [];
  }

  static saveMapPin(pin: MapPin): void {
    const pins = this.getMapPins();
    const existingIndex = pins.findIndex((p) => p.id === pin.id);

    if (existingIndex >= 0) {
      pins[existingIndex] = pin;
    } else {
      pins.push(pin);
    }

    try {
      localStorage.setItem(this.getKey("map_pins"), JSON.stringify(pins));
    } catch (error) {
      console.error("❌ localStorage quota exceeded when saving map pin");
      this.handleQuotaExceeded("map_pins", pins);
    }
  }

  static deleteMapPin(id: string): void {
    const pins = this.getMapPins().filter((p) => p.id !== id);
    try {
      localStorage.setItem(this.getKey("map_pins"), JSON.stringify(pins));
    } catch (error) {
      console.error("❌ localStorage quota exceeded when deleting map pin");
      this.handleQuotaExceeded("map_pins", pins);
    }
  }

  static addComment(entryId: string, comment: Comment): void {
    const entries = this.getJournalEntries();
    const entry = entries.find((e) => e.id === entryId);

    if (entry) {
      entry.comments.push(comment);
      entry.updatedAt = new Date().toISOString();
      this.saveJournalEntry(entry);
    }
  }

  static toggleLike(entryId: string): void {
    const entries = this.getJournalEntries();
    const entry = entries.find((e) => e.id === entryId);

    if (entry) {
      entry.likes = Math.max(0, entry.likes + 1);
      entry.updatedAt = new Date().toISOString();
      this.saveJournalEntry(entry);
    }
  }

  static addLike(entryId: string): void {
    this.toggleLike(entryId); // For now, just use the same logic
  }

  static getWishlistItems(): WishlistItem[] {
    const data = localStorage.getItem(this.getKey("wishlist"));
    return data ? JSON.parse(data) : [];
  }

  static saveWishlistItem(item: WishlistItem): void {
    const items = this.getWishlistItems();
    const existingIndex = items.findIndex((i) => i.id === item.id);

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    try {
      localStorage.setItem(this.getKey("wishlist"), JSON.stringify(items));
    } catch (error) {
      console.error("❌ localStorage quota exceeded when saving wishlist");
      this.handleQuotaExceeded("wishlist", items);
    }
  }

  static deleteWishlistItem(id: string): void {
    const items = this.getWishlistItems().filter((i) => i.id !== id);
    try {
      localStorage.setItem(this.getKey("wishlist"), JSON.stringify(items));
    } catch (error) {
      console.error(
        "❌ localStorage quota exceeded when deleting wishlist item",
      );
      this.handleQuotaExceeded("wishlist", items);
    }
  }

  static markWishlistItemCompleted(id: string, journalEntryId?: string): void {
    const items = this.getWishlistItems();
    const item = items.find((i) => i.id === id);

    if (item) {
      item.isCompleted = true;
      item.completedDate = new Date().toISOString();
      item.journalEntryId = journalEntryId;
      item.updatedAt = new Date().toISOString();
      this.saveWishlistItem(item);
    }
  }

  static exportData(): string {
    const data = {
      entries: this.getJournalEntries(),
      pins: this.getMapPins(),
      wishlist: this.getWishlistItems(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.entries) {
        localStorage.setItem(
          this.getKey("entries"),
          JSON.stringify(data.entries),
        );
      }
      if (data.pins) {
        localStorage.setItem(
          this.getKey("map_pins"),
          JSON.stringify(data.pins),
        );
      }
      if (data.wishlist) {
        localStorage.setItem(
          this.getKey("wishlist"),
          JSON.stringify(data.wishlist),
        );
      }
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  static getCharlieData(): { image: string; description: string } {
    const data = this.safeLocalStorageGet(this.getKey("charlie_data"));
    return data
      ? JSON.parse(data)
      : {
          image: "",
          description:
            "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾",
        };
  }

  static setCharlieData(data: { image: string; description: string }): void {
    const success = this.safeLocalStorageSet(
      this.getKey("charlie_data"),
      JSON.stringify(data),
    );
    if (!success) {
      console.warn("📵 Charlie data not saved locally - using cloud sync only");
    }
  }

  // OneDrive-compatible sync methods
  static createSyncFile(): string {
    const timestamp = new Date().toISOString();
    const syncData = {
      timestamp,
      deviceId: this.getDeviceId(),
      data: {
        entries: this.getJournalEntries(),
        pins: this.getMapPins(),
        wishlist: this.getWishlistItems(),
        charlie: this.getCharlieData(),
      },
    };
    return JSON.stringify(syncData, null, 2);
  }

  static importSyncFile(jsonContent: string): boolean {
    try {
      const syncData = JSON.parse(jsonContent);

      // Import all data
      if (syncData.data?.entries) {
        syncData.data.entries.forEach((entry: any) =>
          this.saveJournalEntry(entry),
        );
      }
      if (syncData.data?.pins) {
        syncData.data.pins.forEach((pin: any) => this.saveMapPin(pin));
      }
      if (syncData.data?.wishlist) {
        syncData.data.wishlist.forEach((item: any) =>
          this.saveWishlistItem(item),
        );
      }
      if (syncData.data?.charlie) {
        this.setCharlieData(syncData.data.charlie);
      }

      return true;
    } catch (error) {
      console.error("Failed to import sync file:", error);
      return false;
    }
  }

  private static getDeviceId(): string {
    let deviceId = localStorage.getItem(this.getKey("device_id"));
    if (!deviceId) {
      deviceId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.getKey("device_id"), deviceId);
    }
    return deviceId;
  }

  // YouTube Video methods
  static getYouTubeVideo(): YouTubeVideo | null {
    this.initialize();
    if (this.localStorageDisabled) return null;

    try {
      const data = localStorage.getItem(this.getKey("youtube_video"));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to parse YouTube video data:", error);
      return null;
    }
  }

  static saveYouTubeVideo(video: YouTubeVideo): void {
    this.initialize();
    if (this.localStorageDisabled) return;

    try {
      localStorage.setItem(this.getKey("youtube_video"), JSON.stringify(video));
    } catch (error) {
      console.error("❌ localStorage quota exceeded when saving YouTube video");
      this.handleQuotaExceeded("youtube_video", video);
    }
  }

  static deleteYouTubeVideo(): void {
    this.initialize();
    if (this.localStorageDisabled) return;

    try {
      localStorage.removeItem(this.getKey("youtube_video"));
    } catch (error) {
      console.error("�� Failed to delete YouTube video from localStorage");
    }
  }
}
