import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExportUtils } from '@/lib/exportUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Shield, 
  Settings as SettingsIcon,
  Calendar,
  Users,
  MapPin,
  BookOpen,
  Camera,
  Heart,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function Settings() {
  const { isFamilyMember, currentUser, logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isFamilyMember) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">⚙️ Settings</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your family journal settings and data
          </p>
        </div>
        
        <Card className="family-card">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Family Members Only</h3>
            <p className="text-muted-foreground">
              Only family members can access settings and backup features
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = ExportUtils.getExportStats();

  const handleFullBackup = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      
      ExportUtils.exportFullBackup();
      
      setMessage({
        type: 'success',
        text: 'Backup exported successfully! Your family memories are safe.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to export backup. Please try again.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleJournalExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      
      ExportUtils.exportJournalAsHTML();
      
      setMessage({
        type: 'success',
        text: 'Journal exported as beautiful HTML document!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to export journal. Please try again.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setMessage(null);
      
      await ExportUtils.importBackup(file);
      
      setMessage({
        type: 'success',
        text: 'Backup imported successfully! Page will reload to show your data.'
      });
      
      // Reload page after 2 seconds to show imported data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to import backup. Please check the file format.'
      });
    } finally {
      setIsImporting(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearMessage = () => setMessage(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">⚙️ Settings & Backup</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage your family journal and protect your precious memories
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={`${
          message.type === 'success' ? 'border-green-200 bg-green-50' :
          message.type === 'error' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {message.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
              <AlertDescription className={`${
                message.type === 'success' ? 'text-green-700' :
                message.type === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {message.text}
              </AlertDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={clearMessage}>×</Button>
          </div>
        </Alert>
      )}

      {/* Account Info */}
      <Card className="family-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-semibold">{currentUser || 'Dorman Family'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Journal Owner</p>
              <p className="font-semibold">Dorman Family</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={logout}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Overview */}
      <Card className="family-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Your Family Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xl font-bold">{stats.totalEntries}</p>
              <p className="text-sm text-muted-foreground">Journal Entries</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-xl font-bold">{stats.totalPins}</p>
              <p className="text-sm text-muted-foreground">Places Visited</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-xl font-bold">{stats.totalPhotos}</p>
              <p className="text-sm text-muted-foreground">Photos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-red-100 rounded-full">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-xl font-bold">{stats.totalLikes}</p>
              <p className="text-sm text-muted-foreground">Total Likes</p>
            </div>
          </div>
          
          {stats.dateRange && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Adventure Timeline</span>
              </div>
              <p className="text-sm text-muted-foreground">
                From {stats.dateRange.earliest.toLocaleDateString()} to {stats.dateRange.latest.toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export & Backup */}
      <Card className="family-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export & Backup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Backup */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Complete Backup</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Download all your data (entries, photos, wishlist) as a JSON file. This is your safety net!
              </p>
              <Button 
                onClick={handleFullBackup}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Download Full Backup
                  </>
                )}
              </Button>
            </div>

            {/* Journal Export */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Beautiful Journal</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Export your journal as a beautiful HTML document - perfect for printing or sharing!
              </p>
              <Button 
                onClick={handleJournalExport}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Document
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Important Notice */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              <strong>Keep your memories safe!</strong> Regular backups ensure you never lose your precious family adventures. 
              We recommend backing up monthly or after adding many new entries.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Import Backup */}
      <Card className="family-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Restore from Backup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Restore your family journal from a previously exported backup file. This will add the backed-up data to your current journal.
          </p>
          
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Backup File
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              Only .json backup files are supported
            </span>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Note:</strong> Importing a backup will add the data to your current journal. 
              If you want to completely replace your data, clear your browser storage first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="family-card">
        <CardHeader>
          <CardTitle>💡 Backup Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>Monthly backups:</strong> Set a monthly reminder to backup your journal</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>Multiple copies:</strong> Save backups in different locations (computer, cloud, USB)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>After big trips:</strong> Backup immediately after adding lots of new adventures</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">•</span>
              <span><strong>Share with family:</strong> Send copies to other family members for extra safety</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
