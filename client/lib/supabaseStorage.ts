// Supabase Storage service for large images and videos
import { supabase } from './supabase'
import { SupabaseSetup } from './supabaseSetup'

export class SupabaseStorage {
  private static BUCKET_NAME = 'journal-media'
  private static storageEnabled: boolean | null = null

  // Check if Supabase Storage is available
  private static async checkStorageAvailability(): Promise<boolean> {
    if (this.storageEnabled !== null) {
      return this.storageEnabled
    }

    try {
      const { data, error } = await supabase.storage.listBuckets()
      this.storageEnabled = !error
      return this.storageEnabled
    } catch (error) {
      console.warn('⚠️ Supabase Storage not available, using fallback')
      this.storageEnabled = false
      return false
    }
  }

  // Convert file to base64 as fallback
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Convert canvas to base64 as fallback
  private static canvasToBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  // Upload image/video file and return public URL
  static async uploadFile(file: File, entryId: string): Promise<string> {
    // Check if Supabase Storage is available
    const storageAvailable = await this.checkStorageAvailability()

    if (!storageAvailable) {
      console.log('⚠️ Supabase Storage unavailable, using base64 fallback')
      return await this.fileToBase64(file)
    }

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
          upsert: true // Allow overwrite if file exists
        })

      if (error) {
        console.error('❌ Supabase upload error:', error)
        if (error.message?.includes('Failed to fetch')) {
          console.error('💡 Falling back to base64 storage')
          SupabaseSetup.displaySetupInstructions()
          return await this.fileToBase64(file)
        }
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
      console.error('❌ Supabase Storage upload failed, using base64 fallback:', error)
      return await this.fileToBase64(file)
    }
  }

  // Upload compressed image from canvas
  static async uploadCompressedImage(canvas: HTMLCanvasElement, entryId: string): Promise<string> {
    // Check if Supabase Storage is available
    const storageAvailable = await this.checkStorageAvailability()

    if (!storageAvailable) {
      console.log('⚠️ Supabase Storage unavailable, using base64 fallback')
      return this.canvasToBase64(canvas)
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          // Fallback to base64 if blob creation fails
          resolve(this.canvasToBase64(canvas))
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
              upsert: true // Allow overwrite if file exists
            })

          if (error) {
            console.error('❌ Supabase compressed upload error:', error)
            if (error.message?.includes('Failed to fetch')) {
              console.error('💡 Falling back to base64 storage')
              SupabaseSetup.displaySetupInstructions()
              resolve(this.canvasToBase64(canvas))
              return
            }
            throw error
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(fileName)

          console.log('✅ Compressed image uploaded to Supabase:', urlData.publicUrl)
          resolve(urlData.publicUrl)
        } catch (error) {
          console.error('❌ Supabase compressed upload failed, using base64 fallback:', error)
          resolve(this.canvasToBase64(canvas))
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

      // Check if storage is enabled first
      const storageEnabled = await SupabaseSetup.isStorageEnabled()
      if (!storageEnabled) {
        console.warn('⚠️ Supabase Storage service is not enabled or accessible')
        SupabaseSetup.displaySetupInstructions()
        return
      }

      // First test connection
      const testResult = await SupabaseSetup.testConnection()
      if (testResult.success) {
        console.log('✅', testResult.message)
        return
      }

      console.warn('⚠️', testResult.message)

      // Try to create bucket with minimal configuration
      const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: true
      })

      if (createError) {
        if (createError.message?.includes('already exists')) {
          console.log('✅ Supabase storage bucket already exists:', this.BUCKET_NAME)
        } else {
          console.error('❌ Bucket creation failed:', createError.message)
          SupabaseSetup.displaySetupInstructions()
        }
      } else {
        console.log('✅ Supabase storage bucket created successfully:', this.BUCKET_NAME)
      }
    } catch (error) {
      console.error('❌ Bucket initialization failed:', error)
      SupabaseSetup.displaySetupInstructions()
    }
  }
}
