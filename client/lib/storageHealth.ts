// localStorage health monitoring and management
export class StorageHealth {
  private static readonly DISABLED_FLAG = "localStorage_disabled";

  // Check if localStorage was previously disabled
  static isDisabled(): boolean {
    try {
      return sessionStorage.getItem(this.DISABLED_FLAG) === "true";
    } catch {
      return true; // If sessionStorage fails, assume disabled
    }
  }

  // Mark localStorage as disabled
  static markDisabled(): void {
    try {
      sessionStorage.setItem(this.DISABLED_FLAG, "true");
      console.warn("📵 localStorage marked as disabled for this session");
    } catch {
      console.warn(
        "📵 Cannot mark localStorage disabled - sessionStorage also failing",
      );
    }
  }

  // Test localStorage functionality
  static testLocalStorage(): boolean {
    if (this.isDisabled()) {
      return false;
    }

    try {
      const testKey = "__storage_health_test__";
      const testValue = "test";
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        this.markDisabled();
        return false;
      }

      return true;
    } catch (error) {
      console.warn("⚠️ localStorage test failed:", error);
      this.markDisabled();
      return false;
    }
  }

  // Get storage usage percentage (rough estimate)
  static getUsageInfo(): { isHealthy: boolean; message: string } {
    if (!this.testLocalStorage()) {
      return {
        isHealthy: false,
        message: "localStorage is disabled due to quota exceeded",
      };
    }

    try {
      let totalSize = 0;
      for (const key in localStorage) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      const sizeMB = totalSize / (1024 * 1024);

      if (sizeMB > 8) {
        return {
          isHealthy: false,
          message: `localStorage usage high: ${sizeMB.toFixed(1)}MB - approaching limits`,
        };
      } else if (sizeMB > 5) {
        return {
          isHealthy: true,
          message: `localStorage usage: ${sizeMB.toFixed(1)}MB - consider cleanup soon`,
        };
      } else {
        return {
          isHealthy: true,
          message: `localStorage healthy: ${sizeMB.toFixed(1)}MB used`,
        };
      }
    } catch (error) {
      this.markDisabled();
      return {
        isHealthy: false,
        message: "localStorage health check failed",
      };
    }
  }

  // Force re-enable (for testing after cleanup)
  static forceReEnable(): boolean {
    try {
      sessionStorage.removeItem(this.DISABLED_FLAG);
      return this.testLocalStorage();
    } catch {
      return false;
    }
  }
}

// Auto-check on import
const healthCheck = StorageHealth.getUsageInfo();
if (!healthCheck.isHealthy) {
  console.warn("⚠️ Storage Health:", healthCheck.message);
}
