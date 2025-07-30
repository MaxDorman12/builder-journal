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
    
    const imagesCleared = this.clearLargeImages();
    const videosCleared = this.clearLargeVideos();
    
    const afterUsage = this.getStorageUsage();
    console.log(`📊 After cleanup: ${(afterUsage.totalSize / 1024 / 1024).toFixed(2)}MB in ${afterUsage.itemCount} items`);
    
    const savedMB = (beforeUsage.totalSize - afterUsage.totalSize) / 1024 / 1024;
    
    alert(`🧹 Storage Cleanup Complete!\n\nRemoved:\n• ${imagesCleared} large images\n• ${videosCleared} large videos\n• Freed ${savedMB.toFixed(2)}MB space\n\nTry saving again!`);
  }
}

// Auto-run cleanup if localStorage is getting too large
const usage = StorageCleanup.getStorageUsage();
if (usage.totalSize > 50 * 1024 * 1024) { // 50MB threshold
  console.warn('⚠️ localStorage approaching size limits, consider cleanup');
}
