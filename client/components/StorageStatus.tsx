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
  }, []);

  // Don't show anything if storage is working fine
  if (!storageDisabled && storageUsage.totalSize < 20 * 1024 * 1024) {
    return null;
  }

  const sizeMB = (storageUsage.totalSize / 1024 / 1024).toFixed(1);

  if (storageDisabled) {
    return (
      <Alert className="mb-4 border-red-200 bg-red-50">
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
    );
  }

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
