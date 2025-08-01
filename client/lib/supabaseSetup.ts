// Supabase Storage setup and diagnostic utilities
import { supabase } from './supabase'

export class SupabaseSetup {
  private static BUCKET_NAME = 'journal-media'

  // Test Supabase connection and storage access
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Testing Supabase connection...')
      
      // Test basic connection
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) {
        return {
          success: false,
          message: `Connection failed: ${error.message}. Please check your Supabase credentials.`
        }
      }

      // Check if storage bucket exists
      const bucketExists = data?.some(bucket => bucket.name === this.BUCKET_NAME)
      
      if (!bucketExists) {
        return {
          success: false,
          message: `Storage bucket "${this.BUCKET_NAME}" not found. Please create it manually in Supabase dashboard.`
        }
      }

      return {
        success: true,
        message: `✅ Supabase Storage is properly configured with bucket "${this.BUCKET_NAME}"`
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error}`
      }
    }
  }

  // Create bucket manually (requires service role key)
  static async createBucketManually(): Promise<void> {
    try {
      const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: true
        // Remove file size and MIME type limits to avoid creation errors
      })

      if (error) {
        if (error.message.includes('already exists')) {
          console.log('✅ Bucket already exists')
        } else {
          throw error
        }
      } else {
        console.log('✅ Bucket created successfully')
      }
    } catch (error) {
      console.error('❌ Manual bucket creation failed:', error)
      throw error
    }
  }

  // Check if Storage service is enabled
  static async isStorageEnabled(): Promise<boolean> {
    try {
      // Try a simple storage operation
      const { data, error } = await supabase.storage.listBuckets()
      if (error && error.message?.includes('Failed to fetch')) {
        return false
      }
      return true
    } catch (error) {
      return false
    }
  }

  // Display setup instructions
  static displaySetupInstructions(): void {
    console.log('\n📋 SUPABASE STORAGE SETUP INSTRUCTIONS:')
    console.log('==========================================')
    console.log('🚨 CRITICAL: RLS Policy Error AGAIN!')
    console.log('Row Level Security is blocking uploads')
    console.log('')
    console.log('IMMEDIATE SOLUTION: Fix RLS Policy')
    console.log('==========================================')
    console.log('Your RLS policy is not working! Try these fixes:')
    console.log('')
    console.log('METHOD 1 - Check Policy Status:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select project: vhdscuusgnhfpbicsewv')
    console.log('3. Storage > Policies')
    console.log('4. Find "Allow public storage uploads" policy')
    console.log('5. Make sure it shows ENABLED (not just created)')
    console.log('')
    console.log('METHOD 2 - Recreate Policy with Correct Settings:')
    console.log('1. Delete existing policy if it exists')
    console.log('2. Create new policy with:')
    console.log('   - Table: storage.objects')
    console.log('   - Operation: INSERT')
    console.log('   - Target roles: public')
    console.log('   - WITH CHECK: bucket_id = \\\'journal-media\\\'')
    console.log('')
    console.log('METHOD 3 - Disable RLS (EASIEST):')
    console.log('1. Go to Storage > Policies')
    console.log('2. Find storage.objects table')
    console.log('3. Disable RLS entirely for storage.objects')
    console.log('')
    console.log('If bucket doesn\\\'t exist, create new one:')
    console.log('1. Storage > Create new bucket')
    console.log('2. Name: "journal-media"')
    console.log('3. Public: ON')
    console.log('4. MIME types: LEAVE EMPTY (don\\\'t add anything)')
    console.log('5. File size: 50MB or unlimited')
    console.log('==========================================')
    console.log('Empty MIME field = allows ALL file types')
    console.log('')
    console.log('METHOD 2 - Create SPECIFIC Storage Policies:')
    console.log('The policy you created might not be covering everything.')
    console.log('')
    console.log('1. Go to Storage > Policies (NOT bucket settings)')
    console.log('2. Look for table: storage.objects')
    console.log('3. Create THESE EXACT policies:')
    console.log('')
    console.log('POLICY A - Storage Insert:')
    console.log('   • Table: storage.objects')
    console.log('   • Policy name: "Allow public storage uploads"')
    console.log('   • Allowed operation: INSERT')
    console.log('   • Target roles: public')
    console.log('   • USING expression: true')
    console.log('   • WITH CHECK expression: (bucket_id = \\\'journal-media\\\')')
    console.log('')
    console.log('POLICY B - Storage Select:')
    console.log('   • Table: storage.objects')
    console.log('   • Policy name: "Allow public storage downloads"')
    console.log('   • Allowed operation: SELECT')
    console.log('   • Target roles: public')
    console.log('   • USING expression: (bucket_id = \\\'journal-media\\\')')
    console.log('   • WITH CHECK expression: true')
    console.log('')
    console.log('OR EASIER: Just disable RLS completely!')
    console.log('Go to Storage > Policies > Disable RLS for storage.objects')
    console.log('==========================================\n')
  }
}
