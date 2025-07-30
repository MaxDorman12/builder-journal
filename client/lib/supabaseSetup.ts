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
        public: true,
        allowedMimeTypes: ['image/*', 'video/*'],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB
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

  // Display setup instructions
  static displaySetupInstructions(): void {
    console.log('\n📋 SUPABASE STORAGE SETUP INSTRUCTIONS:')
    console.log('==========================================')
    console.log('1. Go to your Supabase project dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to Storage section on the left sidebar')
    console.log('3. Click "Create a new bucket"')
    console.log('4. Set bucket name: "journal-media"')
    console.log('5. Make it public (toggle "Public bucket" to ON)')
    console.log('6. In the bucket settings, add these MIME types:')
    console.log('   - image/*')
    console.log('   - video/*')
    console.log('7. Set file size limit to 100MB')
    console.log('8. Go to Storage > Policies')
    console.log('9. Create a new policy for the bucket with these settings:')
    console.log('   - Name: "Public Access"')
    console.log('   - Allowed operation: SELECT, INSERT')
    console.log('   - Target roles: public')
    console.log('   - Policy definition: (no restrictions)')
    console.log('10. Save and try uploading again')
    console.log('==========================================\n')
  }
}
