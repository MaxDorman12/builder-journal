import React, { useState, useEffect } from "react";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, TestTube } from "lucide-react";

interface SyncStatus {
  isConnected: boolean;
  listenerCount: number;
  lastUpdate: string;
  tables: { name: string; count: number }[];
}

export const SyncTest: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTest, setLastSyncTest] = useState<string>("");

  const checkSyncStatus = async () => {
    setIsLoading(true);
    try {
      const status = await SupabaseStorage.verifySyncStatus();
      setSyncStatus(status);
      setLastSyncTest(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("❌ Failed to check sync status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSyncByCreatingEntry = async () => {
    try {
      const testEntry = {
        id: `sync-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "🧪 Sync Test Entry",
        content: `This is a test entry created at ${new Date().toLocaleString()} to verify cross-device synchronization.`,
        date: new Date().toISOString().split("T")[0],
        location: "Scotland",
        images: [],
        likes: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("🧪 Creating sync test entry...");
      await SupabaseStorage.saveJournalEntry(testEntry);
      console.log("✅ Sync test entry created successfully");

      // Update sync status after test
      setTimeout(checkSyncStatus, 1000);
    } catch (error) {
      console.error("❌ Failed to create sync test entry:", error);
    }
  };

  useEffect(() => {
    checkSyncStatus();

    // Set up real-time listener to track updates
    const unsubscribe = SupabaseStorage.onUpdate(() => {
      console.log("🔄 [SYNC TEST] Real-time update detected!");
      setTimeout(checkSyncStatus, 500);
    });

    return unsubscribe;
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-600" />
          Real-Time Sync Status
          <Badge variant={syncStatus?.isConnected ? "default" : "destructive"}>
            {syncStatus?.isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {syncStatus.isConnected ? (
                  <Wifi className="h-6 w-6 text-green-600" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-600" />
                )}
              </div>
              <p className="text-sm font-medium">Connection</p>
              <p className="text-xs text-gray-500">
                {syncStatus.isConnected ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {syncStatus.listenerCount}
              </div>
              <p className="text-sm font-medium">Listeners</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {syncStatus.tables.reduce((sum, table) => sum + table.count, 0)}
              </div>
              <p className="text-sm font-medium">Total Items</p>
              <p className="text-xs text-gray-500">Synced</p>
            </div>

            <div className="text-center">
              <div className="text-xs font-mono text-gray-600">
                {lastSyncTest || "Never"}
              </div>
              <p className="text-sm font-medium">Last Check</p>
              <p className="text-xs text-gray-500">Time</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Table Counts:</h4>
          {syncStatus?.tables.map((table) => (
            <div
              key={table.name}
              className="flex justify-between items-center text-sm"
            >
              <span className="capitalize">{table.name.replace("_", " ")}</span>
              <Badge variant="outline">{table.count}</Badge>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={checkSyncStatus}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh Status
          </Button>

          <Button onClick={testSyncByCreatingEntry} size="sm" className="gap-2">
            <TestTube className="h-4 w-4" />
            Test Sync
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>How to test cross-device sync:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open this app on multiple devices/browsers</li>
            <li>Click "Test Sync" on one device</li>
            <li>Check if other devices update automatically</li>
            <li>Watch console logs for real-time notifications</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
