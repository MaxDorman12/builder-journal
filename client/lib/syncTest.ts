// Comprehensive sync testing utility
import { HybridStorage } from "./hybridStorage";

declare global {
  interface Window {
    SyncTest: {
      checkAllStatus: () => void;
      testWishlistSync: () => Promise<void>;
      testMapPinSync: () => Promise<void>;
      testJournalSync: () => Promise<void>;
      runFullSyncTest: () => Promise<void>;
      monitorRealTime: () => void;
    };
  }
}

export class SyncTest {
  static checkAllStatus(): void {
    console.log("🔍 SYNC TEST: Comprehensive status check...");
    console.log("=" .repeat(60));
    
    // Supabase status
    const status = HybridStorage.getSupabaseStatus();
    console.log("📡 SUPABASE STATUS:");
    console.log(`   Enabled: ${status.enabled}`);
    console.log(`   Message: ${status.message}`);
    console.log("");

    // Data counts
    const journals = HybridStorage.getJournalEntries();
    const pins = HybridStorage.getMapPins();
    const wishlist = HybridStorage.getWishlistItems();
    
    console.log("📊 LOCAL DATA COUNTS:");
    console.log(`   Journal Entries: ${journals.length}`);
    console.log(`   Map Pins: ${pins.length}`);
    console.log(`   Wishlist Items: ${wishlist.length}`);
    console.log("");

    // Sample data
    console.log("📝 SAMPLE DATA:");
    if (journals.length > 0) {
      console.log(`   Latest Journal: "${journals[0].title}" (${journals[0].id})`);
    }
    if (pins.length > 0) {
      console.log(`   Latest Pin: "${pins[0].title}" (${pins[0].id})`);
    }
    if (wishlist.length > 0) {
      console.log(`   Latest Wishlist: "${wishlist[0].title}" (${wishlist[0].id})`);
    }
    
    console.log("=" .repeat(60));
  }

  static async testWishlistSync(): Promise<void> {
    console.log("🧪 WISHLIST SYNC TEST: Starting...");
    
    const initialCount = HybridStorage.getWishlistItems().length;
    console.log(`📊 Initial count: ${initialCount}`);

    // Create test item
    const testItem = {
      id: `test-${Date.now()}`,
      title: "Sync Test Location",
      description: "Testing real-time sync functionality",
      priority: "medium" as const,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    console.log("➕ Creating test item...");
    await HybridStorage.saveWishlistItem(testItem);
    
    setTimeout(() => {
      const countAfterAdd = HybridStorage.getWishlistItems().length;
      console.log(`📊 Count after add: ${countAfterAdd} (expected: ${initialCount + 1})`);
      
      if (countAfterAdd === initialCount + 1) {
        console.log("✅ WISHLIST CREATE: Success");
        
        // Test deletion
        console.log("🗑️ Testing deletion...");
        HybridStorage.deleteWishlistItem(testItem.id);
        
        setTimeout(() => {
          const finalCount = HybridStorage.getWishlistItems().length;
          console.log(`📊 Final count: ${finalCount} (expected: ${initialCount})`);
          
          if (finalCount === initialCount) {
            console.log("✅ WISHLIST DELETION: Success");
            console.log("🎉 WISHLIST SYNC TEST: PASSED");
          } else {
            console.log("❌ WISHLIST DELETION: Failed");
          }
        }, 1000);
      } else {
        console.log("❌ WISHLIST CREATE: Failed");
      }
    }, 1000);
  }

  static async testMapPinSync(): Promise<void> {
    console.log("🧪 MAP PIN SYNC TEST: Starting...");
    
    const initialCount = HybridStorage.getMapPins().length;
    console.log(`📊 Initial count: ${initialCount}`);

    // Create test pin
    const testPin = {
      id: `test-pin-${Date.now()}`,
      title: "Sync Test Pin",
      description: "Testing map pin sync",
      lat: 56.4907, // Edinburgh coordinates
      lng: -3.2060,
      moodRating: 5 as const,
      visitDate: new Date().toISOString(),
      images: [],
    };

    console.log("📍 Creating test pin...");
    await HybridStorage.saveMapPin(testPin);
    
    setTimeout(() => {
      const countAfterAdd = HybridStorage.getMapPins().length;
      console.log(`📊 Count after add: ${countAfterAdd} (expected: ${initialCount + 1})`);
      
      if (countAfterAdd === initialCount + 1) {
        console.log("✅ MAP PIN CREATE: Success");
        
        // Test deletion
        console.log("🗑️ Testing pin deletion...");
        HybridStorage.deleteMapPin(testPin.id);
        
        setTimeout(() => {
          const finalCount = HybridStorage.getMapPins().length;
          console.log(`📊 Final count: ${finalCount} (expected: ${initialCount})`);
          
          if (finalCount === initialCount) {
            console.log("✅ MAP PIN DELETION: Success");
            console.log("🎉 MAP PIN SYNC TEST: PASSED");
          } else {
            console.log("❌ MAP PIN DELETION: Failed");
          }
        }, 1000);
      } else {
        console.log("❌ MAP PIN CREATE: Failed");
      }
    }, 1000);
  }

  static async testJournalSync(): Promise<void> {
    console.log("🧪 JOURNAL SYNC TEST: Starting...");
    
    const initialCount = HybridStorage.getJournalEntries().length;
    console.log(`📊 Initial count: ${initialCount}`);

    // Create test entry
    const testEntry = {
      id: `test-entry-${Date.now()}`,
      title: "Sync Test Entry",
      content: "Testing journal sync functionality",
      date: new Date().toISOString().split('T')[0],
      location: "Test Location",
      locationName: "Test Location",
      latitude: 56.4907,
      longitude: -3.2060,
      moodRating: 4,
      greatFor: ["testing"],
      isBusy: false,
      areaType: "test" as const,
      wouldReturnReason: "Great for testing",
      wouldReturn: true,
      hasFreeParkingAvailable: true,
      parkingCost: "",
      isPaidActivity: false,
      activityCost: "",
      author: "Test",
      likes: 0,
      comments: [],
      tags: ["test"],
      images: [],
      videos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("📖 Creating test entry...");
    await HybridStorage.saveJournalEntry(testEntry);
    
    setTimeout(() => {
      const countAfterAdd = HybridStorage.getJournalEntries().length;
      console.log(`📊 Count after add: ${countAfterAdd} (expected: ${initialCount + 1})`);
      
      if (countAfterAdd === initialCount + 1) {
        console.log("✅ JOURNAL CREATE: Success");
        
        // Test deletion
        console.log("🗑️ Testing entry deletion...");
        HybridStorage.deleteJournalEntry(testEntry.id);
        
        setTimeout(() => {
          const finalCount = HybridStorage.getJournalEntries().length;
          console.log(`📊 Final count: ${finalCount} (expected: ${initialCount})`);
          
          if (finalCount === initialCount) {
            console.log("✅ JOURNAL DELETION: Success");
            console.log("🎉 JOURNAL SYNC TEST: PASSED");
          } else {
            console.log("❌ JOURNAL DELETION: Failed");
          }
        }, 1000);
      } else {
        console.log("❌ JOURNAL CREATE: Failed");
      }
    }, 1000);
  }

  static async runFullSyncTest(): Promise<void> {
    console.log("🚀 FULL SYNC TEST: Starting comprehensive test...");
    console.log("This will test all sync functionality across the app");
    console.log("");

    this.checkAllStatus();
    
    console.log("⏳ Running tests in sequence...");
    
    // Run tests with delays to avoid conflicts
    setTimeout(() => this.testWishlistSync(), 1000);
    setTimeout(() => this.testMapPinSync(), 6000);
    setTimeout(() => this.testJournalSync(), 12000);
    
    setTimeout(() => {
      console.log("");
      console.log("🏁 FULL SYNC TEST: Completed!");
      console.log("Check the logs above for individual test results.");
      this.checkAllStatus();
    }, 18000);
  }

  static monitorRealTime(): void {
    console.log("👁️ REAL-TIME MONITOR: Starting...");
    console.log("This will log all real-time updates for 30 seconds");
    
    let updateCount = 0;
    const unsubscribe = HybridStorage.onUpdate(() => {
      updateCount++;
      console.log(`🔄 REAL-TIME UPDATE #${updateCount} detected at ${new Date().toLocaleTimeString()}`);
      this.checkAllStatus();
    });

    setTimeout(() => {
      unsubscribe();
      console.log(`👁️ REAL-TIME MONITOR: Stopped after detecting ${updateCount} updates`);
    }, 30000);
  }
}

// Make available globally for browser console testing
if (typeof window !== "undefined") {
  window.SyncTest = SyncTest;
  console.log("🧪 SyncTest available globally!");
  console.log("📋 Available commands:");
  console.log("   SyncTest.checkAllStatus() - Check current status");
  console.log("   SyncTest.testWishlistSync() - Test wishlist create/delete");  
  console.log("   SyncTest.testMapPinSync() - Test map pin create/delete");
  console.log("   SyncTest.testJournalSync() - Test journal create/delete");
  console.log("   SyncTest.runFullSyncTest() - Run all tests");
  console.log("   SyncTest.monitorRealTime() - Monitor real-time updates");
}
