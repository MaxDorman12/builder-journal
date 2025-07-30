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
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
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
          
          // Upload blob to Supabase Storage
          const { data, error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: false
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
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('❌ Failed to list buckets:', listError)
        return
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME)
      
      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/*', 'video/*'],
          fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
        })

        if (createError) {
          console.error('❌ Failed to create bucket:', createError)
        } else {
          console.log('✅ Supabase storage bucket created:', this.BUCKET_NAME)
        }
      } else {
        console.log('✅ Supabase storage bucket ready:', this.BUCKET_NAME)
      }
    } catch (error) {
      console.error('❌ Bucket initialization failed:', error)
    }
  }
}
