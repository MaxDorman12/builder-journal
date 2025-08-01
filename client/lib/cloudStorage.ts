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
    try {
      const entrySize = JSON.stringify(entry).length;
      const entrySizeMB = entrySize / (1024 * 1024);

      console.log("💾 Saving journal entry to Firebase:", {
        id: entry.id,
        title: entry.title,
        imagesCount: entry.images?.length || 0,
        videosCount: entry.videos?.length || 0,
        totalSize: entrySize,
        sizeMB: entrySizeMB.toFixed(2),
      });

      // Reject entries over 50MB immediately - Firebase will never accept these
      if (entrySizeMB > 50) {
        console.error(`🚨 MASSIVE ENTRY REJECTED: ${entrySizeMB.toFixed(2)}MB`);
        console.error(
          "❗ This indicates Supabase Storage is completely broken",
        );
        console.error(
          "📸 Images/videos are being stored as base64 instead of Supabase URLs",
        );

        throw new Error(
          `Entry way too large: ${entrySizeMB.toFixed(2)}MB - Supabase Storage must be fixed`,
        );
      }

      // Check if entry is too large for Firebase (1MB limit)
      if (entrySizeMB > 0.9) {
        // 900KB threshold to be safe
        console.error(
          `❌ Entry too large for Firebase: ${entrySizeMB.toFixed(2)}MB - creating lightweight version`,
        );

        // Create lightweight version without base64 data
        const lightEntry = {
          ...entry,
          images: entry.images?.filter((img) => !img.startsWith("data:")) || [],
          videos: entry.videos?.filter((vid) => !vid.startsWith("data:")) || [],
        };

        const lightSize = JSON.stringify(lightEntry).length / (1024 * 1024);
        console.log(`🪶 Lightweight version: ${lightSize.toFixed(2)}MB`);

        if (lightSize < 0.9) {
          await setDoc(doc(db, "journal-entries", entry.id), lightEntry);
          console.log(
            "✅ Lightweight journal entry saved (Supabase URLs only)",
          );
          console.warn(
            "⚠️ Base64 media excluded - ensure Supabase Storage works for full experience",
          );

          // Alert user about the situation
          if (typeof window !== "undefined") {
            setTimeout(() => {
              alert(
                `⚠️ Entry Saved with Reduced Quality\n\nOriginal: ${entrySizeMB.toFixed(1)}MB (too large)\nSaved: ${lightSize.toFixed(1)}MB (text + Supabase links only)\n\n🔧 To fix: Ensure Supabase Storage is working\nThen your photos/videos will upload properly!`,
              );
            }, 1000);
          }
        } else {
          throw new Error(`Entry still too large: ${lightSize.toFixed(2)}MB`);
        }
      } else {
        await setDoc(doc(db, "journal-entries", entry.id), entry);
        console.log("✅ Journal entry saved to Firebase successfully");
      }
    } catch (error) {
      console.error("❌ Firebase journal entry save failed:", error);

      // Check if it's a size/fetch error
      if (
        error.toString().includes("Failed to fetch") ||
        error.toString().includes("payload") ||
        error.toString().includes("size")
      ) {
        console.error(
          "🚨 Firebase refusing the document - likely too large even after cleanup",
        );
        console.error("📊 Original entry size:", entrySize, "bytes");

        // Try to save a minimal version with just text
        try {
          const minimalEntry = {
            id: entry.id,
            title: entry.title,
            content: entry.content,
            location: entry.location,
            createdAt: entry.createdAt,
            moodRating: entry.moodRating,
            areaType: entry.areaType,
            images: [], // No images at all
            videos: [], // No videos at all
            comments: [],
          };

          const minimalSize =
            JSON.stringify(minimalEntry).length / (1024 * 1024);
          console.log(
            `💡 Trying minimal text-only version: ${minimalSize.toFixed(2)}MB`,
          );

          if (minimalSize < 0.1) {
            // Under 100KB
            await setDoc(doc(db, "journal-entries", entry.id), minimalEntry);
            console.log("✅ Minimal text-only entry saved to Firebase");

            // Alert user about the issue
            if (typeof window !== "undefined") {
              setTimeout(() => {
                alert(
                  `⚠️ Entry Saved as Text Only\n\nYour photos/videos couldn't be saved due to Supabase Storage issues.\n\nTo fix:\n1. Check Supabase bucket exists\n2. Verify RLS policies are working\n3. Entry saved with title: "${entry.title}"`,
                );
              }, 1000);
            }
          } else {
            throw new Error(
              `Even minimal entry too large: ${minimalSize.toFixed(2)}MB`,
            );
          }
        } catch (minimalError) {
          console.error("❌ Even minimal save failed:", minimalError);
          throw new Error(
            `Complete save failure - entry too large even without media`,
          );
        }
      } else if (error.message?.includes('Failed to fetch') ||
                 error.message?.includes('network') ||
                 error.code === 'unavailable') {
        console.warn("🌐 Network connectivity issue - journal entry not saved to cloud");
        throw new Error(`Network connectivity issue. Entry not saved to cloud. Please try again when connection is restored.`);
      } else {
        throw error;
      }
    }
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
    return onSnapshot(q,
      (snapshot) => {
        const entries = snapshot.docs.map((doc) => doc.data() as JournalEntry);
        callback(entries);
      },
      (error) => {
        console.warn("⚠️ Journal entries listener error (network issue):", error);
        // Continue with empty array to prevent crashes
        callback([]);
      }
    );
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
    return onSnapshot(collection(db, "map-pins"),
      (snapshot) => {
        const pins = snapshot.docs.map((doc) => doc.data() as MapPin);
        callback(pins);
      },
      (error) => {
        console.warn("⚠️ Map pins listener error (network issue):", error);
        callback([]);
      }
    );
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
    return onSnapshot(collection(db, "wishlist-items"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data() as WishlistItem);
        callback(items);
      },
      (error) => {
        console.warn("⚠️ Wishlist items listener error (network issue):", error);
        callback([]);
      }
    );
  }

  static async deleteWishlistItem(id: string): Promise<void> {
    await deleteDoc(doc(db, "wishlist-items", id));
  }

  // Charlie Data
  static async setCharlieData(data: {
    image: string;
    description: string;
  }): Promise<void> {
    console.log("💾 Saving to Firebase path: family-data/charlie");
    console.log("💾 Data being saved:", {
      hasImage: !!data.image,
      imageLength: data.image?.length || 0,
      descriptionLength: data.description?.length || 0,
    });

    try {
      const docRef = doc(db, "family-data", "charlie");
      await setDoc(docRef, {
        ...data,
        lastUpdated: new Date().toISOString(),
        updatedBy:
          window.location.hostname + "-" + navigator.userAgent.substring(0, 50),
      });
      console.log("✅ Save to Firebase completed successfully");

      // Immediately read back to verify
      const verifyDoc = await getDoc(docRef);
      if (verifyDoc.exists()) {
        const savedData = verifyDoc.data();
        console.log("✅ Verification read successful:", {
          hasImage: !!savedData.image,
          lastUpdated: savedData.lastUpdated,
          updatedBy: savedData.updatedBy,
        });
      } else {
        console.error("❌ Document doesn't exist after save!");
      }
    } catch (error) {
      console.error("❌ Firebase save error:", error);

      // Check if it's a network connectivity issue
      if (error.message?.includes('Failed to fetch') ||
          error.message?.includes('network') ||
          error.code === 'unavailable') {
        console.warn("🌐 Network connectivity issue - Charlie data saved locally only");
        // Don't throw error for network issues - app should continue working offline
        return;
      }

      // For other errors, still throw to maintain error handling
      throw error;
    }
  }

  static async getCharlieData(): Promise<{
    image: string;
    description: string;
  }> {
    console.log("📖 Reading from Firebase path: family-data/charlie");
    const snapshot = await getDoc(doc(db, "family-data", "charlie"));
    console.log("📖 Firebase read result:", { exists: snapshot.exists() });
    if (snapshot.exists()) {
      const data = snapshot.data() as { image: string; description: string };
      console.log("📖 Data retrieved from Firebase:", {
        hasImage: !!data.image,
        imageLength: data.image?.length || 0,
        descriptionLength: data.description?.length || 0,
      });
      return data;
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
    return onSnapshot(doc(db, "family-data", "charlie"),
      (snapshot) => {
        console.log("🔥 Charlie Firebase snapshot:", {
          exists: snapshot.exists(),
        });
        if (snapshot.exists()) {
          const data = snapshot.data() as { image: string; description: string };
          console.log("🔥 Charlie data from Firebase:", {
            hasImage: !!data.image,
            imageLength: data.image?.length || 0,
          });
          callback(data);
        } else {
          console.log("🔥 Charlie document doesn't exist in Firebase yet");
          // Call with default data if document doesn't exist
          callback({
            image: "",
            description:
              "No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.\n\nWhether it's hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.\n\nHis favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾",
          });
        }
      },
      (error) => {
        console.warn("⚠️ Charlie data listener error (network issue):", error);
        // Use default data when Firebase is unavailable
        callback({
          image: "",
          description: "Charlie's data is temporarily unavailable due to network issues. The app will work offline until connection is restored."
        });
      }
    );
  }

  // Cleanup listeners
  static cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners = [];
  }

  // Enable/disable cloud sync
  static async enableCloudSync(): Promise<boolean> {
    try {
      // First test basic network connectivity
      await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-cache',
        timeout: 5000
      });

      // Then test Firebase connection with timeout
      const testPromise = setDoc(doc(db, "system", "test"), {
        timestamp: new Date(),
        test: true,
      });

      // Add 10 second timeout for Firebase test
      await Promise.race([
        testPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase connection timeout')), 10000)
        )
      ]);

      console.log("✅ Firebase cloud sync enabled successfully");
      return true;
    } catch (error) {
      console.warn("⚠️ Cloud sync not available:", error);
      // This is fine - the app will work with localStorage only
      return false;
    }
  }
}
