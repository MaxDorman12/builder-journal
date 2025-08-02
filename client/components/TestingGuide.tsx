import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';

interface TestStep {
  id: string;
  title: string;
  description: string;
  category: 'functionality' | 'sync' | 'ui';
  completed: boolean;
}

export function TestingGuide() {
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: 'journal-create',
      title: 'Create Journal Entry',
      description: 'Fill out all fields including title, content, location, area type (try "other"), mood, weather, parking info, activity info, and photos. Click Create Entry.',
      category: 'functionality',
      completed: false
    },
    {
      id: 'map-pin-dialog',
      title: 'Map Pin Dialog',
      description: 'After creating entry, verify "Add Map Pin?" dialog appears. Test both "Skip" and "Add Pin" options.',
      category: 'functionality',
      completed: false
    },
    {
      id: 'map-navigation',
      title: 'Map Navigation & Pin Creation',
      description: 'When clicking "Add Pin", verify navigation to map page with pre-filled form. Click on map to set coordinates and create pin.',
      category: 'functionality',
      completed: false
    },
    {
      id: 'entry-display',
      title: 'Journal Entry Display',
      description: 'Verify all information displays correctly: title, date, location, area type, mood, weather, content, photos, parking info, activity info.',
      category: 'ui',
      completed: false
    },
    {
      id: 'real-time-sync',
      title: 'Real-time Sync Test',
      description: 'Open app in another tab/device. Create/edit/delete entries in one tab and verify changes appear instantly in the other.',
      category: 'sync',
      completed: false
    },
    {
      id: 'map-functionality',
      title: 'Map Page Features',
      description: 'Test map pin creation, viewing, and deletion. Verify pins show correctly on Scotland map.',
      category: 'functionality',
      completed: false
    },
    {
      id: 'gallery-sync',
      title: 'Gallery Sync',
      description: 'Verify photos from journal entries appear in gallery page automatically.',
      category: 'sync',
      completed: false
    },
    {
      id: 'wishlist-crud',
      title: 'Wishlist CRUD',
      description: 'Test creating, completing, and deleting wishlist items. Verify all operations sync across devices.',
      category: 'functionality',
      completed: false
    },
    {
      id: 'calendar-view',
      title: 'Calendar View',
      description: 'Check calendar page shows entries by date. Test date selection and entry viewing.',
      category: 'functionality',
      completed: false
    },
    {
      id: 'connection-test',
      title: 'Connection Diagnostics',
      description: 'Run connection test in Settings page. Verify "Connection successful" status.',
      category: 'functionality',
      completed: false
    }
  ]);

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };

  const resetAll = () => {
    setSteps(prev => prev.map(step => ({ ...step, completed: false })));
  };

  const functionalitySteps = steps.filter(s => s.category === 'functionality');
  const syncSteps = steps.filter(s => s.category === 'sync');
  const uiSteps = steps.filter(s => s.category === 'ui');

  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const getCategoryBadge = (category: string) => {
    const className = category === 'functionality' ? 'bg-blue-100 text-blue-700' :
                    category === 'sync' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700';
    
    return <Badge className={className}>{category}</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🧪 Manual Testing Checklist
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-700">
              {completedCount}/{totalCount} Complete
            </Badge>
            <Badge className={completionRate === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
              {completionRate}%
            </Badge>
          </div>
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={resetAll} variant="outline" size="sm">
            Reset All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Functionality Tests */}
        <div>
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            🔧 Core Functionality Tests
            <Badge className="bg-blue-100 text-blue-700">
              {functionalitySteps.filter(s => s.completed).length}/{functionalitySteps.length}
            </Badge>
          </h3>
          <div className="space-y-2">
            {functionalitySteps.map(step => (
              <div 
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleStep(step.id)}
              >
                {step.completed ? 
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
                  <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${step.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                      {step.title}
                    </span>
                    {getCategoryBadge(step.category)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Tests */}
        <div>
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            🔄 Cross-Device Sync Tests
            <Badge className="bg-green-100 text-green-700">
              {syncSteps.filter(s => s.completed).length}/{syncSteps.length}
            </Badge>
          </h3>
          <div className="space-y-2">
            {syncSteps.map(step => (
              <div 
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleStep(step.id)}
              >
                {step.completed ? 
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
                  <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${step.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                      {step.title}
                    </span>
                    {getCategoryBadge(step.category)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UI Tests */}
        <div>
          <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            🎨 User Interface Tests
            <Badge className="bg-purple-100 text-purple-700">
              {uiSteps.filter(s => s.completed).length}/{uiSteps.length}
            </Badge>
          </h3>
          <div className="space-y-2">
            {uiSteps.map(step => (
              <div 
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleStep(step.id)}
              >
                {step.completed ? 
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> : 
                  <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
                }
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${step.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                      {step.title}
                    </span>
                    {getCategoryBadge(step.category)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testing Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Testing Tips:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>For sync tests:</strong> Open the app in multiple browser tabs or devices</li>
            <li>• <strong>Check browser console:</strong> Look for any errors (F12 → Console)</li>
            <li>• <strong>Test all field types:</strong> Try different area types, parking options, activity costs</li>
            <li>• <strong>Verify real-time updates:</strong> Changes should appear instantly without refreshing</li>
            <li>• <strong>Test offline behavior:</strong> Disconnect internet briefly to see error handling</li>
            <li>• <strong>Mobile responsiveness:</strong> Test on different screen sizes</li>
          </ul>
        </div>

        {completionRate === 100 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">🎉 All Tests Complete!</h4>
            <p className="text-green-700">
              Excellent! You've tested all core functionality. The app is ready for production use with 
              full cross-device synchronization, comprehensive journal features, and robust error handling.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
