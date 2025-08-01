import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StorageCleanup } from "@/lib/storageCleanup";
import { HybridStorage } from "@/lib/hybridStorage";
import { SupabaseDatabase } from "@/lib/supabaseDatabase";
import { AlertTriangle, CloudOff, HardDrive, Wifi, WifiOff } from "lucide-react";

export function StorageStatus() {
  const [storageDisabled, setStorageDisabled] = useState(false);
  const [storageUsage, setStorageUsage] = useState({
    totalSize: 0,
    itemCount: 0,
  });
  const [networkStatus, setNetworkStatus] = useState<{
    healthy: boolean;
    message: string;
    supabaseEnabled: boolean;
  }>({ healthy: true, message: "", supabaseEnabled: false });

  useEffect(() => {
    // Check if localStorage is working
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      setStorageDisabled(false);
    } catch (error) {
      setStorageDisabled(true);
    }

    // Get storage usage
    const usage = StorageCleanup.getStorageUsage();
    setStorageUsage(usage);

    // Check network/Supabase status
    const checkNetworkStatus = async () => {
      const supabaseStatus = HybridStorage.getSupabaseStatus();

      if (supabaseStatus.enabled) {
        try {
          const healthCheck = await SupabaseDatabase.checkConnectionHealth();
          setNetworkStatus({
            healthy: healthCheck.healthy,
            message: healthCheck.message,
            supabaseEnabled: true
          });
        } catch (error) {
          setNetworkStatus({
            healthy: false,
            message: "Connection check failed",
            supabaseEnabled: true
          });
        }
      } else {
        setNetworkStatus({
          healthy: false,
          message: "Supabase not connected",
          supabaseEnabled: false
        });
      }
    };

    checkNetworkStatus();

    // Check network status every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show component if storage issues or network issues
  const hasStorageIssues = storageDisabled || storageUsage.totalSize >= 20 * 1024 * 1024;
  const hasNetworkIssues = networkStatus.supabaseEnabled && !networkStatus.healthy;

  if (!hasStorageIssues && !hasNetworkIssues) {
    return null;
  }

  const sizeMB = (storageUsage.totalSize / 1024 / 1024).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Network Status Alert */}
      {hasNetworkIssues && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Network Issue:</strong> {networkStatus.message}
                <br />
                <span className="text-sm">
                  📱 Changes save locally and will sync when connection is restored
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="h-7 text-xs"
              >
                🔄 Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Issues Alert */}
      {storageDisabled && (
        <Alert className="border-red-200 bg-red-50">
          <CloudOff className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Device Storage Full!</strong> Changes won't save locally
                but will sync to cloud.
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => StorageCleanup.emergencyCleanup()}
                  className="h-7 text-xs"
                >
                  🧹 Clean
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => StorageCleanup.nuclearReset()}
                  className="h-7 text-xs bg-red-100"
                >
                  💥 Reset
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Storage Warning:</strong> Using {sizeMB}MB of local storage.
            Consider cleaning up.
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              StorageCleanup.emergencyCleanup();
              // Refresh the component
              window.location.reload();
            }}
            className="h-7 text-xs ml-4"
          >
            🧹 Clean Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
