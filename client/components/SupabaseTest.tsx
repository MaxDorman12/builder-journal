import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SupabaseDatabase } from '@/lib/supabaseDatabase';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle, RefreshCw, Database } from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  message: string;
  details?: any;
}

export function SupabaseTest() {
  const [status, setStatus] = useState<ConnectionStatus>({ isConnected: false, message: 'Not tested' });
  const [isTesting, setIsTesting] = useState(false);
  const [rawError, setRawError] = useState<any>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setRawError(null);
    
    try {
      console.log('🧪 Testing Supabase connection...');
      
      // Test 1: Basic supabase client
      console.log('📦 Supabase URL:', supabase.supabaseUrl);
      console.log('🔑 Supabase Key (first 20 chars):', supabase.supabaseKey.substring(0, 20) + '...');
      
      // Test 2: Simple query to a basic table
      console.log('🔍 Testing basic query...');
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Basic query failed:', error);
        setRawError(error);
        
        if (error.message?.includes('relation "journal_entries" does not exist')) {
          setStatus({
            isConnected: false,
            message: 'Database tables not created. Please run the SQL migration.',
            details: 'Tables missing'
          });
        } else if (error.message?.includes('Failed to fetch')) {
          setStatus({
            isConnected: false,
            message: 'Network connection failed. Check internet connection.',
            details: 'Network error'
          });
        } else {
          setStatus({
            isConnected: false,
            message: `Database error: ${error.message}`,
            details: error
          });
        }
        return;
      }
      
      // Test 3: Use the database class test method
      console.log('🔧 Testing database class...');
      const dbTest = await SupabaseDatabase.testConnection();
      
      if (dbTest.success) {
        setStatus({
          isConnected: true,
          message: 'Connection successful! Database is working.',
          details: `Found ${data?.length || 0} entries`
        });
      } else {
        setStatus({
          isConnected: false,
          message: dbTest.message,
          details: 'Database class test failed'
        });
      }
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setRawError(error);
      
      let message = 'Unknown connection error';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          message = 'Network error: Unable to reach Supabase. Check internet connection.';
        } else if (error.message.includes('CORS')) {
          message = 'CORS error: Browser blocking request. Check Supabase CORS settings.';
        } else {
          message = error.message;
        }
      }
      
      setStatus({
        isConnected: false,
        message,
        details: error
      });
    } finally {
      setIsTesting(false);
    }
  };

  const checkHealth = async () => {
    try {
      const health = await SupabaseDatabase.checkConnectionHealth();
      console.log('🏥 Health check result:', health);
      alert(`Health Check: ${health.healthy ? 'Healthy' : 'Unhealthy'}\n${health.message}`);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      alert('Health check failed: ' + error);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {status.isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
          <Badge className={status.isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
            {status.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Message */}
        <div className="p-4 rounded-lg bg-gray-50">
          <p className="font-medium">{status.message}</p>
          {status.details && (
            <p className="text-sm text-gray-600 mt-1">Details: {JSON.stringify(status.details, null, 2)}</p>
          )}
        </div>

        {/* Raw error display */}
        {rawError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Raw Error:</h4>
            <pre className="text-xs text-red-700 overflow-auto">
              {JSON.stringify(rawError, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={isesting} className="flex-1">
            {isesting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {isesting ? 'Testing...' : 'Test Again'}
          </Button>
          <Button onClick={checkHealth} variant="outline">
            Health Check
          </Button>
        </div>

        {/* Connection info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>URL:</strong> {supabase.supabaseUrl}</p>
          <p><strong>Key:</strong> {supabase.supabaseKey.substring(0, 20)}...</p>
        </div>
      </CardContent>
    </Card>
  );
}
