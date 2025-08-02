import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupabaseStorage } from '@/lib/supabaseOnly';
import { SupabaseDatabase } from '@/lib/supabaseDatabase';
import { PhotoStorage } from '@/lib/photoStorage';

export function DatabaseTest() {
  const [status, setStatus] = useState<string>('Testing...');
  const [details, setDetails] = useState<any[]>([]);

  const runTests = async () => {
    const testResults: any[] = [];
    
    try {
      // Test 1: Basic database connection
      testResults.push({ test: "Database Connection", status: "Testing...", details: "" });
      setDetails([...testResults]);
      
      const entries = await SupabaseStorage.getJournalEntries();
      testResults[0] = { 
        test: "Database Connection", 
        status: "✅ Success", 
        details: `Found ${entries.length} entries` 
      };
      
      // Test 2: Storage bucket status
      testResults.push({ test: "Photo Storage", status: "Testing...", details: "" });
      setDetails([...testResults]);
      
      const storageInfo = await PhotoStorage.getStorageInfo();
      testResults[1] = { 
        test: "Photo Storage", 
        status: storageInfo.isAvailable ? "✅ Available" : "❌ Unavailable", 
        details: `Bucket exists: ${storageInfo.bucketExists}` 
      };
      
      // Test 3: Create test entry
      testResults.push({ test: "Create Entry", status: "Testing...", details: "" });
      setDetails([...testResults]);
      
      const testEntry = {
        id: `test-${Date.now()}`,
        title: "Database Test Entry",
        content: "This is a test entry to verify the database is working.",
        date: new Date().toISOString().split('T')[0],
        location: "Test Location",
        images: [],
        videos: [],
        moodRating: 5 as const,
        greatFor: [],
        isBusy: false,
        areaType: "town" as const,
        wouldReturnReason: "",
        wouldReturn: true,
        hasFreeParkingAvailable: false,
        parkingCost: "",
        isPaidActivity: false,
        activityCost: "",
        author: "Test User",
        likes: 0,
        comments: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: true,
        isLiked: false
      };
      
      await SupabaseStorage.saveJournalEntry(testEntry);
      testResults[2] = { 
        test: "Create Entry", 
        status: "✅ Success", 
        details: `Test entry created with ID: ${testEntry.id}` 
      };
      
      // Test 4: Delete test entry
      testResults.push({ test: "Delete Entry", status: "Testing...", details: "" });
      setDetails([...testResults]);
      
      await SupabaseStorage.deleteJournalEntry(testEntry.id);
      testResults[3] = { 
        test: "Delete Entry", 
        status: "✅ Success", 
        details: "Test entry cleaned up" 
      };
      
      setStatus("✅ All tests passed!");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Database test failed:", error);
      
      if (testResults.length === 0) {
        testResults.push({ test: "Initial Setup", status: "❌ Failed", details: errorMessage });
      } else {
        testResults[testResults.length - 1].status = "❌ Failed";
        testResults[testResults.length - 1].details = errorMessage;
      }
      
      setStatus(`❌ Test failed: ${errorMessage}`);
    }
    
    setDetails([...testResults]);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Database Connection Test</CardTitle>
        <p className="text-sm text-gray-600">{status}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.map((result, index) => (
          <div key={index} className="flex justify-between items-start border-b pb-2">
            <div>
              <div className="font-medium">{result.test}</div>
              <div className="text-sm text-gray-600">{result.details}</div>
            </div>
            <div className="text-sm font-medium">{result.status}</div>
          </div>
        ))}
        
        <div className="pt-4">
          <Button onClick={runTests} variant="outline" className="w-full">
            Run Tests Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
