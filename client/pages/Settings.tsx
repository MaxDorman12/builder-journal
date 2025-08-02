import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorageStatus } from "@/components/StorageStatus";
import { SyncTest } from "@/components/SyncTest";
import { SupabaseTest } from "@/components/SupabaseTest";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { Download, Settings as SettingsIcon, Database } from "lucide-react";

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await SupabaseStorage.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `family-journal-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("✅ Data exported successfully");
    } catch (error) {
      console.error("❌ Failed to export data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="h-8 w-8 text-gray-600" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your family journal</p>
        </div>
      </div>

      {/* Real-time Sync Test */}
      <SyncTest />

      {/* Supabase Connection Test */}
      <SupabaseTest />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Storage Status */}
        <StorageStatus />

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Export Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download a backup of all your family journal data
              </p>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Storage Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Supabase Cloud Database</p>
                  <p className="text-gray-600">
                    All your data is stored securely in Supabase's cloud
                    database with automatic backups and real-time
                    synchronization across all devices.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Real-time Sync</p>
                  <p className="text-gray-600">
                    Changes are automatically synchronized across all family
                    members' devices in real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">No Local Storage</p>
                  <p className="text-gray-600">
                    This app no longer uses browser local storage or Firebase.
                    Everything is stored directly in Supabase for better
                    reliability and performance.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
