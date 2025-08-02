import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { SupabaseDatabase } from '@/lib/supabaseDatabase';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkSupabaseConnection();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsSupabaseConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection check
    checkSupabaseConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      const result = await SupabaseDatabase.testConnection();
      setIsSupabaseConnected(result.success);
      if (!result.success) {
        setLastError(result.message);
      } else {
        setLastError(null);
      }
    } catch (error) {
      setIsSupabaseConnected(false);
      setLastError(error instanceof Error ? error.message : 'Connection test failed');
    }
  };

  const retryConnection = async () => {
    setIsRetrying(true);
    await checkSupabaseConnection();
    setIsRetrying(false);
  };

  // Don't show anything if everything is working
  if (isOnline && isSupabaseConnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50">
        <div className="flex items-start gap-2">
          {!isOnline ? (
            <WiFiOff className="h-5 w-5 text-orange-600 mt-0.5" />
          ) : (
            <WiFiOff className="h-5 w-5 text-orange-600 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertDescription className="text-orange-800">
              {!isOnline ? (
                <div>
                  <strong>No Internet Connection</strong>
                  <p className="text-sm mt-1">You're currently offline. Some features may not work.</p>
                </div>
              ) : (
                <div>
                  <strong>Database Connection Issue</strong>
                  <p className="text-sm mt-1">
                    {lastError || "Unable to connect to the database. The app will work with cached data."}
                  </p>
                </div>
              )}
            </AlertDescription>
            
            {isOnline && (
              <Button
                onClick={retryConnection}
                disabled={isRetrying}
                variant="outline"
                size="sm"
                className="mt-2 h-8"
              >
                {isRetrying ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Wifi className="h-3 w-3 mr-1" />
                )}
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}
