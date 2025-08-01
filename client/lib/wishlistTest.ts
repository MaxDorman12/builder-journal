// Test utility for wishlist deletion
import { HybridStorage } from "./hybridStorage";

declare global {
  interface Window {
    WishlistTest: {
      deleteFirstItem: () => Promise<void>;
      getItemCount: () => number;
      testDelete: (itemId: string) => Promise<void>;
    };
  }
}

export class WishlistTest {
  static async deleteFirstItem(): Promise<void> {
    console.log("🧪 TEST: Starting wishlist deletion test...");

    const itemsBefore = HybridStorage.getWishlistItems();
    console.log("🧪 TEST: Items before deletion:", itemsBefore.length);

    if (itemsBefore.length > 0) {
      const itemToDelete = itemsBefore[0];
      console.log("🧪 TEST: Deleting first wishlist item:", itemToDelete.title, "ID:", itemToDelete.id);

      await HybridStorage.deleteWishlistItem(itemToDelete.id);
      console.log("🧪 TEST: Delete operation completed");

      // Check items after deletion
      setTimeout(() => {
        const itemsAfter = HybridStorage.getWishlistItems();
        console.log("🧪 TEST: Items after deletion:", itemsAfter.length);
        console.log("🧪 TEST: Expected change:", itemsBefore.length - 1, "Actual:", itemsAfter.length);

        if (itemsAfter.length === itemsBefore.length - 1) {
          console.log("✅ TEST: Local deletion successful");
        } else {
          console.log("❌ TEST: Local deletion failed");
        }
      }, 1000);

      // Check for real-time sync after 3 seconds
      setTimeout(() => {
        console.log("🧪 TEST: Checking real-time sync after 3 seconds...");
        const itemsAfterSync = HybridStorage.getWishlistItems();
        console.log("🧪 TEST: Items after sync delay:", itemsAfterSync.length);
      }, 3000);

    } else {
      console.log("🧪 TEST: No items to delete");
    }
  }

  static getItemCount(): number {
    const count = HybridStorage.getWishlistItems().length;
    console.log("🧪 TEST: Current wishlist item count:", count);
    return count;
  }

  static checkSupabaseStatus(): void {
    console.log("🧪 STATUS: Checking Supabase and sync status...");
    const status = HybridStorage.getSupabaseStatus();
    console.log("🧪 STATUS: Supabase enabled:", status.enabled);
    console.log("🧪 STATUS: Message:", status.message);

    const localItems = HybridStorage.getWishlistItems();
    console.log("🧪 STATUS: Local wishlist items:", localItems.length);
    localItems.forEach((item, index) => {
      console.log(`🧪 STATUS: Item ${index + 1}: ${item.title} (ID: ${item.id})`);
    });
  }

  static async testDelete(itemId: string): Promise<void> {
    console.log("🧪 TEST: Testing deletion of item:", itemId);
    await HybridStorage.deleteWishlistItem(itemId);
    console.log("🧪 TEST: Delete operation completed");
  }
}

// Make available globally for browser console testing
if (typeof window !== "undefined") {
  window.WishlistTest = WishlistTest;
  console.log("🧪 WishlistTest available globally.");
  console.log("🧪 Commands: WishlistTest.deleteFirstItem(), WishlistTest.checkSupabaseStatus(), WishlistTest.getItemCount()");
}
