// Test utility for map pin deletion
import { HybridStorage } from "./hybridStorage";

declare global {
  interface Window {
    MapPinTest: {
      deleteFirstPin: () => Promise<void>;
      getPinCount: () => number;
      checkSupabaseStatus: () => void;
      listPins: () => void;
    };
  }
}

export class MapPinTest {
  static async deleteFirstPin(): Promise<void> {
    console.log("🧪 MAP PIN TEST: Starting map pin deletion test...");

    const pinsBefore = HybridStorage.getMapPins();
    console.log("🧪 MAP PIN TEST: Pins before deletion:", pinsBefore.length);

    if (pinsBefore.length > 0) {
      const pinToDelete = pinsBefore[0];
      console.log(
        "🧪 MAP PIN TEST: Deleting first map pin:",
        pinToDelete.title,
        "ID:",
        pinToDelete.id,
      );

      await HybridStorage.deleteMapPin(pinToDelete.id);
      console.log("🧪 MAP PIN TEST: Delete operation completed");

      // Check pins after deletion
      setTimeout(() => {
        const pinsAfter = HybridStorage.getMapPins();
        console.log("🧪 MAP PIN TEST: Pins after deletion:", pinsAfter.length);
        console.log(
          "🧪 MAP PIN TEST: Expected change:",
          pinsBefore.length - 1,
          "Actual:",
          pinsAfter.length,
        );

        if (pinsAfter.length === pinsBefore.length - 1) {
          console.log("✅ MAP PIN TEST: Local deletion successful");
        } else {
          console.log("❌ MAP PIN TEST: Local deletion failed");
        }
      }, 1000);

      // Check for real-time sync after 3 seconds
      setTimeout(() => {
        console.log(
          "🧪 MAP PIN TEST: Checking real-time sync after 3 seconds...",
        );
        const pinsAfterSync = HybridStorage.getMapPins();
        console.log(
          "🧪 MAP PIN TEST: Pins after sync delay:",
          pinsAfterSync.length,
        );
      }, 3000);
    } else {
      console.log("🧪 MAP PIN TEST: No pins to delete");
    }
  }

  static getPinCount(): number {
    const count = HybridStorage.getMapPins().length;
    console.log("🧪 MAP PIN TEST: Current map pin count:", count);
    return count;
  }

  static checkSupabaseStatus(): void {
    console.log("🧪 MAP PIN STATUS: Checking Supabase and sync status...");
    const status = HybridStorage.getSupabaseStatus();
    console.log("🧪 MAP PIN STATUS: Supabase enabled:", status.enabled);
    console.log("🧪 MAP PIN STATUS: Message:", status.message);

    const localPins = HybridStorage.getMapPins();
    console.log("🧪 MAP PIN STATUS: Local map pins:", localPins.length);
    localPins.forEach((pin, index) => {
      console.log(
        `🧪 MAP PIN STATUS: Pin ${index + 1}: ${pin.title} (ID: ${pin.id})`,
      );
    });
  }

  static listPins(): void {
    const pins = HybridStorage.getMapPins();
    console.log("🧪 MAP PIN LIST: All current pins:");
    pins.forEach((pin, index) => {
      console.log(`  ${index + 1}. ${pin.title} (${pin.lat}, ${pin.lng})`);
    });
  }
}

// Make available globally for browser console testing
if (typeof window !== "undefined") {
  window.MapPinTest = MapPinTest;
  console.log("🧪 MapPinTest available globally.");
  console.log(
    "🧪 Commands: MapPinTest.deleteFirstPin(), MapPinTest.checkSupabaseStatus(), MapPinTest.getPinCount(), MapPinTest.listPins()",
  );
}
