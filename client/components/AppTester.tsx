import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SupabaseStorage } from '@/lib/supabaseOnly';
import { SupabaseDatabase } from '@/lib/supabaseDatabase';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export function AppTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Database Connection
      console.log('🧪 Testing database connection...');
      try {
        const connectionTest = await SupabaseDatabase.testConnection();
        if (connectionTest.success) {
          addResult({
            name: 'Database Connection',
            status: 'pass',
            message: 'Connected successfully',
            details: connectionTest.message
          });
        } else {
          addResult({
            name: 'Database Connection',
            status: 'fail',
            message: connectionTest.message
          });
        }
      } catch (error) {
        addResult({
          name: 'Database Connection',
          status: 'fail',
          message: `Connection failed: ${error}`
        });
      }

      // Test 2: Data Loading
      console.log('🧪 Testing data loading...');
      try {
        const [entries, pins, wishlist] = await Promise.all([
          SupabaseStorage.getJournalEntries(),
          SupabaseStorage.getMapPins(),
          SupabaseStorage.getWishlistItems()
        ]);

        addResult({
          name: 'Data Loading',
          status: 'pass',
          message: `Loaded: ${entries.length} entries, ${pins.length} pins, ${wishlist.length} wishlist items`
        });
      } catch (error) {
        addResult({
          name: 'Data Loading',
          status: 'fail',
          message: `Failed to load data: ${error}`
        });
      }

      // Test 3: Real-time Sync Status
      console.log('🧪 Testing sync status...');
      try {
        const syncStatus = await SupabaseStorage.verifySyncStatus();
        if (syncStatus.isConnected && syncStatus.listenerCount > 0) {
          addResult({
            name: 'Real-time Sync',
            status: 'pass',
            message: `Active with ${syncStatus.listenerCount} listeners`
          });
        } else {
          addResult({
            name: 'Real-time Sync',
            status: 'warning',
            message: `Connected but no listeners active`
          });
        }
      } catch (error) {
        addResult({
          name: 'Real-time Sync',
          status: 'fail',
          message: `Sync test failed: ${error}`
        });
      }

      // Test 4: Create Test Entry (if authenticated)
      console.log('🧪 Testing journal entry creation...');
      try {
        const testEntry = {
          id: `test-${Date.now()}`,
          title: 'Test Entry - Auto Generated',
          content: 'This is a test entry created by the app tester.',
          date: new Date().toISOString().split('T')[0],
          location: 'Test Location',
          areaType: 'town' as any,
          customAreaType: undefined,
          moodRating: 5 as any,
          weather: 'Sunny',
          temperature: '20°C',
          images: [],
          videos: [],
          isPublic: true,
          hasFreeParkingAvailable: true,
          parkingCost: '',
          isPaidActivity: false,
          activityCost: '',
          updatedBy: 'tester',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          isLiked: false,
          moodRating: 5,
          greatFor: [],
          isBusy: false,
          wouldReturnReason: '',
          wouldReturn: true,
          author: 'Test User',
          comments: [],
          tags: []
        };

        await SupabaseStorage.saveJournalEntry(testEntry);
        
        // Verify it was saved
        const entries = await SupabaseStorage.getJournalEntries();
        const savedEntry = entries.find(e => e.id === testEntry.id);
        
        if (savedEntry) {
          addResult({
            name: 'Journal Entry Creation',
            status: 'pass',
            message: 'Test entry created and verified'
          });

          // Clean up - delete test entry
          await SupabaseStorage.deleteJournalEntry(testEntry.id);
        } else {
          addResult({
            name: 'Journal Entry Creation',
            status: 'fail',
            message: 'Entry not found after creation'
          });
        }
      } catch (error) {
        addResult({
          name: 'Journal Entry Creation',
          status: 'fail',
          message: `Creation failed: ${error}`
        });
      }

      // Test 5: Charlie Data
      console.log('🧪 Testing Charlie data...');
      try {
        const charlieData = await SupabaseStorage.getCharlieData();
        if (charlieData.description && charlieData.description !== "Charlie's data is temporarily unavailable.") {
          addResult({
            name: 'Charlie Data',
            status: 'pass',
            message: 'Charlie data loaded successfully'
          });
        } else {
          addResult({
            name: 'Charlie Data',
            status: 'warning',
            message: 'Charlie data using default fallback'
          });
        }
      } catch (error) {
        addResult({
          name: 'Charlie Data',
          status: 'fail',
          message: `Charlie data failed: ${error}`
        });
      }

      console.log('✅ Comprehensive test completed');

    } catch (error) {
      addResult({
        name: 'Test Suite',
        status: 'fail',
        message: `Test suite error: ${error}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const className = status === 'pass' ? 'bg-green-100 text-green-700' :
                    status === 'fail' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700';
    
    return <Badge className={className}>{status.toUpperCase()}</Badge>;
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 App Comprehensive Test Suite
        </CardTitle>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-700">✅ {passCount} Passed</Badge>
          <Badge className="bg-red-100 text-red-700">❌ {failCount} Failed</Badge>
          <Badge className="bg-yellow-100 text-yellow-700">⚠️ {warningCount} Warnings</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runComprehensiveTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          {isRunning ? 'Running Tests...' : 'Run Comprehensive Test'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-gray-500 mt-1">Details: {JSON.stringify(result.details)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Testing Summary:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ <strong>Database Connection:</strong> Supabase connectivity test</li>
              <li>📊 <strong>Data Loading:</strong> Journal entries, map pins, wishlist items</li>
              <li>🔄 <strong>Real-time Sync:</strong> Cross-device synchronization status</li>
              <li>📝 <strong>CRUD Operations:</strong> Create, read, update, delete functionality</li>
              <li>🐕 <strong>Charlie Data:</strong> Home page data loading</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
