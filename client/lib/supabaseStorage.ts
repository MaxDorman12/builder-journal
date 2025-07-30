// Supabase Storage service for large images and videos
import { supabase } from './supabase'

export class SupabaseStorage {
  private static BUCKET_NAME = 'journal-media'

  // Upload image/video file and return public URL
  static async uploadFile(file: File, entryId: string): Promise<string> {
    try {
      console.log('🔄 Uploading to Supabase Storage:', {
        fileName: file.name,
        size: file.size,
        type: file.type,
        entryId: entryId
      })

      // Create unique file path
      const fileExtension = file.name.split('.').pop() || 'bin'
      const fileName = `${entryId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`
      
      // Ensure bucket exists before upload
      await this.initializeBucket()

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwrite if file exists
        })

      if (error) {
        console.error('❌ Supabase upload error:', error)
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName)

      console.log('✅ File uploaded to Supabase:', {
        path: data.path,
        publicUrl: urlData.publicUrl
      })

      return urlData.publicUrl
    } catch (error) {
      console.error('❌ Supabase Storage upload failed:', error)
      throw error
    }
  }

  // Upload compressed image from canvas
  static async uploadCompressedImage(canvas: HTMLCanvasElement, entryId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'))
          return
        }

        try {
          console.log('🔄 Uploading compressed image to Supabase:', {
            size: blob.size,
            type: blob.type,
            entryId: entryId
          })

          // Create unique file path
          const fileName = `${entryId}/${Date.now()}_compressed.jpg`
          
          // Ensure bucket exists before upload
          await this.initializeBucket()

          // Upload blob to Supabase Storage
          const { data, error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: true // Allow overwrite if file exists
            })

          if (error) {
            console.error('❌ Supabase compressed upload error:', error)
            throw error
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(fileName)

          console.log('✅ Compressed image uploaded to Supabase:', urlData.publicUrl)
          resolve(urlData.publicUrl)
        } catch (error) {
          console.error('❌ Supabase compressed upload failed:', error)
          reject(error)
        }
      }, 'image/jpeg', 0.8)
    })
  }

  // Delete file from Supabase Storage
  static async deleteFile(url: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = url.split(`/${this.BUCKET_NAME}/`)
      if (urlParts.length < 2) {
        throw new Error('Invalid Supabase URL')
      }
      
      const filePath = urlParts[1].split('?')[0] // Remove query parameters
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('❌ Supabase delete error:', error)
        throw error
      }

      console.log('✅ File deleted from Supabase:', filePath)
    } catch (error) {
      console.error('❌ Supabase deletion failed:', error)
      throw error
    }
  }

  // Initialize storage bucket (create if doesn't exist)
  static async initializeBucket(): Promise<void> {
    try {
      console.log('🔄 Initializing Supabase Storage bucket...')

      // Try to create bucket first (it will fail gracefully if it already exists)
      const { data: createData, error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*'],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
      })

      if (createError) {
        if (createError.message?.includes('already exists')) {
          console.log('✅ Supabase storage bucket already exists:', this.BUCKET_NAME)
        } else {
          console.warn('⚠️ Bucket creation warning:', createError.message)
          // Check if bucket exists by trying to list it
          const { data: buckets, error: listError } = await supabase.storage.listBuckets()
          if (!listError && buckets?.some(bucket => bucket.name === this.BUCKET_NAME)) {
            console.log('✅ Bucket exists and accessible:', this.BUCKET_NAME)
          } else {
            console.error('❌ Cannot access or create bucket. Please check Supabase dashboard.')
            console.error('Setup instructions:')
            console.error('1. Go to your Supabase project dashboard')
            console.error('2. Navigate to Storage section')
            console.error('3. Create a public bucket named "journal-media"')
            console.error('4. Set RLS policies to allow public access')
          }
        }
      } else {
        console.log('✅ Supabase storage bucket created successfully:', this.BUCKET_NAME)
      }
    } catch (error) {
      console.error('❌ Bucket initialization failed:', error)
      console.error('Please manually create the bucket in Supabase dashboard:')
      console.error('1. Go to Storage > Create new bucket')
      console.error('2. Name: "journal-media"')
      console.error('3. Make it public')
      console.error('4. Allow image/* and video/* file types')
    }
  }
}
