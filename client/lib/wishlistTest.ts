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
    const items = HybridStorage.getWishlistItems();
    if (items.length > 0) {
      console.log("🧪 TEST: Deleting first wishlist item:", items[0].title);
      await HybridStorage.deleteWishlistItem(items[0].id);
      console.log("🧪 TEST: Delete operation completed");
    } else {
      console.log("🧪 TEST: No items to delete");
    }
  }

  static getItemCount(): number {
    const count = HybridStorage.getWishlistItems().length;
    console.log("🧪 TEST: Current wishlist item count:", count);
    return count;
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
  console.log(
    "🧪 WishlistTest available globally. Use WishlistTest.deleteFirstItem() to test.",
  );
}
