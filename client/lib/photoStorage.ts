// Photo Storage Service using Supabase Storage
import { supabase } from "./supabase";

export class PhotoStorage {
  private static readonly BUCKET_NAME = "journal-photos";

  // Initialize storage bucket (run once)
  static async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        console.warn("⚠️ Could not list buckets:", listError.message);
        return;
      }

      const bucketExists = buckets?.some(
        (bucket) => bucket.name === this.BUCKET_NAME,
      );

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(
          this.BUCKET_NAME,
          {
            public: true, // Make photos publicly accessible
            fileSizeLimit: 50 * 1024 * 1024, // 50MB limit per file
            allowedMimeTypes: [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
              "image/heic",
              "image/heif",
            ],
          },
        );

        if (createError) {
          console.warn("⚠️ Could not create bucket:", createError.message);
        } else {
          console.log("✅ Photo storage bucket created successfully");
        }
      } else {
        console.log("✅ Photo storage bucket already exists");
      }
    } catch (error) {
      console.warn("⚠️ Bucket initialization failed:", error);
    }
  }

  // Upload a single photo to cloud storage
  static async uploadPhoto(file: File, entryId: string): Promise<string> {
    try {
      // Check if bucket exists first, try to create if it doesn't
      await this.ensureBucketExists();

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${entryId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      console.log(
        `📤 Uploading photo to cloud storage: ${fileName} (${Math.round(file.size / 1024)}KB)`,
      );

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: "3600", // 1 hour cache
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log(`✅ Photo uploaded successfully: ${urlData.publicUrl}`);
      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Photo upload failed:", error);
      throw error;
    }
  }

  // Ensure bucket exists, create if needed
  private static async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        throw new Error(`Cannot access storage: ${listError.message}`);
      }

      const bucketExists = buckets?.some(
        (bucket) => bucket.name === this.BUCKET_NAME,
      );

      if (!bucketExists) {
        console.log("📁 Creating storage bucket...");
        const { error: createError } = await supabase.storage.createBucket(
          this.BUCKET_NAME,
          {
            public: true,
            fileSizeLimit: 50 * 1024 * 1024, // 50MB
            allowedMimeTypes: [
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
              "image/heic",
            ],
          },
        );

        if (createError) {
          throw new Error(
            `Cannot create storage bucket: ${createError.message}`,
          );
        }

        console.log("✅ Storage bucket created successfully");
      }
    } catch (error) {
      console.error("❌ Storage bucket check failed:", error);
      throw new Error(
        "Cloud storage is not available. This may be due to permissions or configuration issues.",
      );
    }
  }

  // Upload multiple photos with progress tracking
  static async uploadPhotos(
    files: File[],
    entryId: string,
    onProgress?: (current: number, total: number, fileName: string) => void,
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (onProgress) {
        onProgress(i + 1, files.length, file.name);
      }

      try {
        const url = await this.uploadPhoto(file, entryId);
        uploadedUrls.push(url);
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        // Continue with other files, don't fail entire upload
      }
    }

    return uploadedUrls;
  }

  // Delete photos from cloud storage
  static async deletePhotos(photoUrls: string[]): Promise<void> {
    try {
      const filePaths = photoUrls
        .filter((url) => url.includes(this.BUCKET_NAME))
        .map((url) => {
          // Extract file path from URL
          const parts = url.split(`/${this.BUCKET_NAME}/`);
          return parts[1];
        })
        .filter(Boolean);

      if (filePaths.length === 0) {
        return;
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);

      if (error) {
        console.warn("⚠️ Some photos could not be deleted:", error.message);
      } else {
        console.log(`✅ Deleted ${filePaths.length} photos from cloud storage`);
      }
    } catch (error) {
      console.warn("⚠️ Photo deletion failed:", error);
    }
  }

  // Compress image if needed (fallback for very large files)
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8,
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Check if cloud storage is available
  static async isAvailable(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      return !error && Array.isArray(data);
    } catch {
      return false;
    }
  }

  // Get storage usage statistics
  static async getStorageInfo(): Promise<{
    isAvailable: boolean;
    bucketExists: boolean;
    photoCount?: number;
  }> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return { isAvailable: false, bucketExists: false };
      }

      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists =
        buckets?.some((bucket) => bucket.name === this.BUCKET_NAME) || false;

      if (!bucketExists) {
        return { isAvailable: true, bucketExists: false };
      }

      // Try to count photos (optional, might fail with permissions)
      try {
        const { data: files } = await supabase.storage
          .from(this.BUCKET_NAME)
          .list();
        const photoCount = files?.length || 0;
        return { isAvailable: true, bucketExists: true, photoCount };
      } catch {
        return { isAvailable: true, bucketExists: true };
      }
    } catch {
      return { isAvailable: false, bucketExists: false };
    }
  }
}
