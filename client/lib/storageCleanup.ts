// Storage cleanup utility for quota issues
export class StorageCleanup {
  // Clear large base64 images from localStorage
  static clearLargeImages(): number {
    let clearedCount = 0;
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.startsWith('data:image/') && value.length > 100000) {
          console.log(`🗑️ Removing large image from localStorage: ${key}`);
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        console.warn('Error checking localStorage item:', key);
      }
    }
    
    return clearedCount;
  }

  // Clear large base64 videos from localStorage  
  static clearLargeVideos(): number {
    let clearedCount = 0;
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.startsWith('data:video/') && value.length > 500000) {
          console.log(`🗑️ Removing large video from localStorage: ${key}`);
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        console.warn('Error checking localStorage item:', key);
      }
    }
    
    return clearedCount;
  }

  // Get total localStorage usage
  static getStorageUsage(): { totalSize: number; itemCount: number } {
    let totalSize = 0;
    let itemCount = 0;
    
    for (const key in localStorage) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          itemCount++;
        }
      } catch (error) {
        // Skip problematic items
      }
    }
    
    return { totalSize, itemCount };
  }

  // Emergency cleanup for quota issues
  static emergencyCleanup(): void {
    console.log('🚨 Emergency storage cleanup started...');

    const beforeUsage = this.getStorageUsage();
    console.log(`📊 Before cleanup: ${(beforeUsage.totalSize / 1024 / 1024).toFixed(2)}MB in ${beforeUsage.itemCount} items`);

    // Phase 1: Clear all media files
    const imagesCleared = this.clearAllImages();
    const videosCleared = this.clearAllVideos();

    // Phase 2: If still over 80% full, clear old data
    const midUsage = this.getStorageUsage();
    let entriesCleared = 0;
    if (midUsage.totalSize > 4 * 1024 * 1024) { // Still over 4MB
      entriesCleared = this.clearOldEntries();
    }

    const afterUsage = this.getStorageUsage();
    console.log(`📊 After cleanup: ${(afterUsage.totalSize / 1024 / 1024).toFixed(2)}MB in ${afterUsage.itemCount} items`);

    const savedMB = (beforeUsage.totalSize - afterUsage.totalSize) / 1024 / 1024;

    alert(`🧹 AGGRESSIVE Storage Cleanup Complete!\n\nRemoved:\n• ${imagesCleared} images\n• ${videosCleared} videos\n• ${entriesCleared} old entries\n• Freed ${savedMB.toFixed(2)}MB space\n\nYour app should work normally now!`);
  }

  // Clear ALL images (not just large ones)
  static clearAllImages(): number {
    let clearedCount = 0;
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.startsWith('data:image/')) {
          console.log(`🗑️ Removing image: ${key}`);
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        console.warn('Error clearing image:', key);
      }
    }

    return clearedCount;
  }

  // Clear ALL videos (not just large ones)
  static clearAllVideos(): number {
    let clearedCount = 0;
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value && value.startsWith('data:video/')) {
          console.log(`🗑️ Removing video: ${key}`);
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        console.warn('Error clearing video:', key);
      }
    }

    return clearedCount;
  }

  // Clear old journal entries (keep only recent 3)
  static clearOldEntries(): number {
    try {
      const entriesKey = 'familyjournal_entries';
      const entriesData = localStorage.getItem(entriesKey);
      if (entriesData) {
        const entries = JSON.parse(entriesData);
        if (entries.length > 3) {
          const recentEntries = entries.slice(-3); // Keep last 3
          localStorage.setItem(entriesKey, JSON.stringify(recentEntries));
          console.log(`🗑️ Reduced entries from ${entries.length} to 3`);
          return entries.length - 3;
        }
      }
    } catch (error) {
      console.warn('Error clearing old entries:', error);
    }
    return 0;
  }
}

// Auto-run cleanup if localStorage is getting too large
const usage = StorageCleanup.getStorageUsage();
if (usage.totalSize > 50 * 1024 * 1024) { // 50MB threshold
  console.warn('⚠️ localStorage approaching size limits, consider cleanup');
}
