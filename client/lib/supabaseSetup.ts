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
    console.log('⚠️  IMPORTANT: If you see "Failed to fetch" errors:')
    console.log('1. First, enable Storage service in your Supabase project:')
    console.log('   - Go to https://supabase.com/dashboard')
    console.log('   - Select your project')
    console.log('   - Go to Settings > API')
    console.log('   - Ensure Storage API is enabled')
    console.log('')
    console.log('2. Then create the storage bucket:')
    console.log('   - Navigate to Storage section on the left sidebar')
    console.log('   - Click "Create a new bucket"')
    console.log('   - Set bucket name: "journal-media"')
    console.log('   - Make it public (toggle "Public bucket" to ON)')
    console.log('   - IMPORTANT: Leave MIME type restrictions EMPTY or set to:')
    console.log('     • image/*')
    console.log('     • video/*')
    console.log('     • application/*')
    console.log('   - Set file size limit to 100MB (or leave unlimited)')
    console.log('')
    console.log('3. Set up RLS policies:')
    console.log('   - Go to Storage > Policies')
    console.log('   - Create a new policy:')
    console.log('     • Name: "Public Access"')
    console.log('     • Allowed operation: SELECT, INSERT')
    console.log('     • Target roles: public')
    console.log('     • Policy definition: true')
    console.log('')
    console.log('4. Alternative: Disable RLS for the bucket entirely')
    console.log('   - In Storage > journal-media > Settings')
    console.log('   - Toggle "Row Level Security" OFF')
    console.log('==========================================\n')
  }
}
