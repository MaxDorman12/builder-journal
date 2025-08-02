import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupabaseStorage } from "@/lib/supabaseOnly";
import { CheckCircle, XCircle, AlertCircle, Database } from "lucide-react";

export function StorageStatus() {
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    error?: string;
  }>({ connected: false });

  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        // Try to fetch some data to test connection
        await SupabaseStorage.getJournalEntries();
        setSupabaseStatus({ connected: true });
      } catch (error) {
        setSupabaseStatus({ 
          connected: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    };

    checkSupabaseStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Storage Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supabase Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Supabase Database</span>
          {supabaseStatus.connected ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>

        {supabaseStatus.error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Error: {supabaseStatus.error}
          </div>
        )}

        {/* Storage Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>✅ All data stored in Supabase cloud database</p>
          <p>🔄 Real-time sync across all devices</p>
          <p>🔒 Secure and backed up automatically</p>
        </div>
      </CardContent>
    </Card>
  );
}
