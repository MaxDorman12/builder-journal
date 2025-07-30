import { JournalEntry, MapPin, Comment, WishlistItem } from "@shared/api";

export class LocalStorage {
  private static getKey(key: string): string {
    return `familyjournal_${key}`;
  }

  static getJournalEntries(): JournalEntry[] {
    const data = localStorage.getItem(this.getKey("entries"));
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

    localStorage.setItem(this.getKey("entries"), JSON.stringify(entries));
  }

  static deleteJournalEntry(id: string): void {
    const entries = this.getJournalEntries().filter((e) => e.id !== id);
    localStorage.setItem(this.getKey("entries"), JSON.stringify(entries));
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

    localStorage.setItem(this.getKey("map_pins"), JSON.stringify(pins));
  }

  static deleteMapPin(id: string): void {
    const pins = this.getMapPins().filter((p) => p.id !== id);
    localStorage.setItem(this.getKey("map_pins"), JSON.stringify(pins));
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
      entry.likes = Math.max(0, entry.likes + (Math.random() > 0.5 ? 1 : -1));
      entry.updatedAt = new Date().toISOString();
      this.saveJournalEntry(entry);
    }
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

    localStorage.setItem(this.getKey("wishlist"), JSON.stringify(items));
  }

  static deleteWishlistItem(id: string): void {
    const items = this.getWishlistItems().filter((i) => i.id !== id);
    localStorage.setItem(this.getKey("wishlist"), JSON.stringify(items));
  }

  static markWishlistItemCompleted(
    id: string,
    journalEntryId?: string,
  ): void {
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
      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }
}
