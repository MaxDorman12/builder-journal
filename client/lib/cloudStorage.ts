// Cloud storage service for real-time syncing
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { JournalEntry, MapPin, WishlistItem } from "@shared/api";

export class CloudStorage {
  private static listeners: Unsubscribe[] = [];

  // Journal Entries
  static async saveJournalEntry(entry: JournalEntry): Promise<void> {
    await setDoc(doc(db, "journal-entries", entry.id), entry);
  }

  static async getJournalEntries(): Promise<JournalEntry[]> {
    const snapshot = await getDocs(collection(db, "journal-entries"));
    return snapshot.docs.map((doc) => doc.data() as JournalEntry);
  }

  static listenToJournalEntries(
    callback: (entries: JournalEntry[]) => void,
  ): Unsubscribe {
    const q = query(
      collection(db, "journal-entries"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc) => doc.data() as JournalEntry);
      callback(entries);
    });
  }

  static async deleteJournalEntry(id: string): Promise<void> {
    await deleteDoc(doc(db, "journal-entries", id));
  }

  // Map Pins
  static async saveMapPin(pin: MapPin): Promise<void> {
    await setDoc(doc(db, "map-pins", pin.id), pin);
  }

  static async getMapPins(): Promise<MapPin[]> {
    const snapshot = await getDocs(collection(db, "map-pins"));
    return snapshot.docs.map((doc) => doc.data() as MapPin);
  }

  static listenToMapPins(callback: (pins: MapPin[]) => void): Unsubscribe {
    return onSnapshot(collection(db, "map-pins"), (snapshot) => {
      const pins = snapshot.docs.map((doc) => doc.data() as MapPin);
      callback(pins);
    });
  }

  static async deleteMapPin(id: string): Promise<void> {
    await deleteDoc(doc(db, "map-pins", id));
  }

  // Wishlist Items
  static async saveWishlistItem(item: WishlistItem): Promise<void> {
    await setDoc(doc(db, "wishlist-items", item.id), item);
  }

  static async getWishlistItems(): Promise<WishlistItem[]> {
    const snapshot = await getDocs(collection(db, "wishlist-items"));
    return snapshot.docs.map((doc) => doc.data() as WishlistItem);
  }

  static listenToWishlistItems(
    callback: (items: WishlistItem[]) => void,
  ): Unsubscribe {
    return onSnapshot(collection(db, "wishlist-items"), (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data() as WishlistItem);
      callback(items);
    });
  }

  static async deleteWishlistItem(id: string): Promise<void> {
    await deleteDoc(doc(db, "wishlist-items", id));
  }

  // Charlie Data
  static async setCharlieData(data: {
    image: string;
    description: string;
  }): Promise<void> {
    await setDoc(doc(db, "family-data", "charlie"), data);
  }

  static async getCharlieData(): Promise<{
    image: string;
    description: string;
  }> {
    const snapshot = await getDoc(doc(db, "family-data", "charlie"));
    if (snapshot.exists()) {
      return snapshot.data() as { image: string; description: string };
    }
    return {
      image: "",
      description:
        "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾",
    };
  }

  static listenToCharlieData(
    callback: (data: { image: string; description: string }) => void,
  ): Unsubscribe {
    return onSnapshot(doc(db, "family-data", "charlie"), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as { image: string; description: string });
      }
    });
  }

  // Cleanup listeners
  static cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners = [];
  }

  // Enable/disable cloud sync
  static async enableCloudSync(): Promise<boolean> {
    try {
      // Test connection by writing a simple document
      await setDoc(doc(db, "system", "test"), {
        timestamp: new Date(),
        test: true
      });
      console.log("✅ Firebase cloud sync enabled successfully");
      return true;
    } catch (error) {
      console.warn("⚠️ Cloud sync not available:", error);
      // This is fine - the app will work with localStorage only
      return false;
    }
  }
}
