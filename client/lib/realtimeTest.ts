// Manual test for Supabase real-time functionality
import { SupabaseDatabase } from './supabaseDatabase'

export class RealtimeTest {
  static async createTestEntry(): Promise<void> {
    console.log("🧪 Creating test journal entry for real-time sync test...");
    
    const testEntry = {
      id: `test_${Date.now()}`,
      title: `Real-time Test ${new Date().toLocaleTimeString()}`,
      content: "This is a test entry to verify real-time sync is working between devices.",
      images: [],
      videos: [],
      locationName: "Test Location",
      latitude: null,
      longitude: null,
      createdAt: new Date().toISOString(),
      // Add required fields with defaults
      date: new Date().toISOString(),
      location: "Test Location",
      moodRating: 5,
      greatFor: ["Testing"],
      isBusy: false,
      areaType: "town" as const,
      wouldReturnReason: "Testing real-time sync",
      wouldReturn: true,
      hasFreeParkingAvailable: true,
      parkingCost: "",
      isPaidActivity: false,
      activityCost: "",
      author: "System Test",
      likes: 0,
      comments: [],
      tags: ["test", "realtime"],
      updatedAt: new Date().toISOString(),
    };

    try {
      await SupabaseDatabase.saveJournalEntry(testEntry);
      console.log("✅ Test entry created successfully!");
      console.log("📱 Check if this entry appears on other devices...");
    } catch (error) {
      console.error("❌ Failed to create test entry:", error);
    }
  }

  static async deleteTestEntries(): Promise<void> {
    console.log("🧹 Cleaning up test entries...");
    
    try {
      const entries = await SupabaseDatabase.getJournalEntries();
      const testEntries = entries.filter(entry => 
        entry.id.startsWith('test_') || 
        entry.title.includes('Real-time Test')
      );

      for (const entry of testEntries) {
        await SupabaseDatabase.deleteJournalEntry(entry.id);
        console.log(`🗑️ Deleted test entry: ${entry.title}`);
      }

      console.log(`✅ Cleaned up ${testEntries.length} test entries`);
    } catch (error) {
      console.error("❌ Failed to cleanup test entries:", error);
    }
  }
}

// Make it available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).RealtimeTest = RealtimeTest;
  console.log("🧪 RealtimeTest available globally. Use RealtimeTest.createTestEntry() to test.");
}
