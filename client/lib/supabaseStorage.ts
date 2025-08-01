// Supabase Storage service for large images and videos
import { supabase } from "./supabase";
import { SupabaseSetup } from "./supabaseSetup";

export class SupabaseStorage {
  private static BUCKET_NAME = "journal-media";
  private static storageEnabled: boolean | null = null;

  // Check if Supabase Storage is available
  private static async checkStorageAvailability(): Promise<boolean> {
    if (this.storageEnabled !== null) {
      return this.storageEnabled;
    }

    try {
      const { data, error } = await supabase.storage.listBuckets();
      this.storageEnabled = !error;
      return this.storageEnabled;
    } catch (error) {
      console.warn("⚠️ Supabase Storage not available, using fallback");
      this.storageEnabled = false;
      return false;
    }
  }

  // Convert file to base64 as fallback
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Convert canvas to base64 as fallback
  private static canvasToBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  // Upload image/video file and return public URL
  static async uploadFile(file: File, entryId: string): Promise<string> {
    // Check if Supabase Storage is available
    const storageAvailable = await this.checkStorageAvailability();

    if (!storageAvailable) {
      console.log("⚠️ Supabase Storage unavailable, using base64 fallback");
      return await this.fileToBase64(file);
    }

    try {
      console.log("🔄 Uploading to Supabase Storage:", {
        fileName: file.name,
        size: file.size,
        type: file.type,
        entryId: entryId,
        bucketName: this.BUCKET_NAME,
        supabaseUrl: "https://vhdsguusgnhfpbicsewv.supabase.co",
      });

      // Create unique file path with generic extension to bypass MIME detection
      const fileName = `${entryId}/${Date.now()}_${Math.random().toString(36).substring(2)}.dat`;

      // Upload file to Supabase Storage without MIME type restrictions
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true, // Allow overwrite if file exists
          // No contentType specified to bypass bucket MIME restrictions
        });

      if (error) {
        console.error("❌ Supabase upload error:", error);
        console.error("🔍 Detailed error info:", {
          message: error.message,
          name: error.name,
          bucketName: this.BUCKET_NAME,
          fileName: fileName,
          projectUrl: "https://vhdsguusgnhfpbicsewv.supabase.co",
        });

        if (
          error.message?.includes("Failed to fetch") ||
          error.message?.includes("mime type") ||
          error.message?.includes("row-level security policy")
        ) {
          console.error(
            "💡 Supabase Storage issue detected, falling back to base64 storage",
          );

          if (error.message?.includes("mime type")) {
            console.error("🚨 MIME type restriction:", file.type);
          } else if (error.message?.includes("row-level security policy")) {
            console.error("🚨 RLS POLICY STILL BLOCKING UPLOAD!");
            console.error(
              "❗ The policy you created might not be working correctly",
            );
            console.error(
              '❗ Check: Storage > Policies > "Allow public storage uploads" is ENABLED',
            );
          }

          SupabaseSetup.displaySetupInstructions();
          return await this.fileToBase64(file);
        }
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log("✅ File uploaded to Supabase:", {
        path: data.path,
        publicUrl: urlData.publicUrl,
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error(
        "❌ Supabase Storage upload failed, using base64 fallback:",
        error,
      );
      return await this.fileToBase64(file);
    }
  }

  // Upload compressed image from canvas
  static async uploadCompressedImage(
    canvas: HTMLCanvasElement,
    entryId: string,
  ): Promise<string> {
    // Check if Supabase Storage is available
    const storageAvailable = await this.checkStorageAvailability();

    if (!storageAvailable) {
      console.log("⚠️ Supabase Storage unavailable, using base64 fallback");
      return this.canvasToBase64(canvas);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            // Fallback to base64 if blob creation fails
            resolve(this.canvasToBase64(canvas));
            return;
          }

          try {
            console.log("🔄 Uploading compressed image to Supabase:", {
              size: blob.size,
              type: blob.type,
              entryId: entryId,
            });

            // Create unique file path with generic extension to bypass MIME detection
            const fileName = `${entryId}/${Date.now()}_compressed.dat`;

            // Upload blob to Supabase Storage without MIME type specification
            const { data, error } = await supabase.storage
              .from(this.BUCKET_NAME)
              .upload(fileName, blob, {
                cacheControl: "3600",
                upsert: true, // Allow overwrite if file exists
                // No contentType to bypass MIME restrictions
              });

            if (error) {
              console.error("❌ Supabase compressed upload error:", error);
              if (
                error.message?.includes("Failed to fetch") ||
                error.message?.includes("mime type") ||
                error.message?.includes("row-level security policy")
              ) {
                console.error(
                  "💡 Supabase Storage issue detected, falling back to base64 storage",
                );

                if (error.message?.includes("mime type")) {
                  console.error("🚨 MIME type restriction detected");
                } else if (
                  error.message?.includes("row-level security policy")
                ) {
                  console.error("🚨 RLS POLICY BLOCKING IMAGE UPLOAD!");
                  console.error("IMMEDIATE FIX NEEDED:");
                  console.error("1. Go to https://supabase.com/dashboard");
                  console.error("2. Storage > journal-media > Settings");
                  console.error('3. Turn OFF "Row Level Security"');
                  console.error("4. Save changes");
                }

                SupabaseSetup.displaySetupInstructions();
                resolve(this.canvasToBase64(canvas));
                return;
              }
              throw error;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from(this.BUCKET_NAME)
              .getPublicUrl(fileName);

            console.log(
              "✅ Compressed image uploaded to Supabase:",
              urlData.publicUrl,
            );
            resolve(urlData.publicUrl);
          } catch (error) {
            console.error(
              "❌ Supabase compressed upload failed, using base64 fallback:",
              error,
            );
            resolve(this.canvasToBase64(canvas));
          }
        },
        "image/png",
        0.8,
      ); // Use PNG format to avoid MIME restrictions
    });
  }

  // Delete file from Supabase Storage
  static async deleteFile(url: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = url.split(`/${this.BUCKET_NAME}/`);
      if (urlParts.length < 2) {
        throw new Error("Invalid Supabase URL");
      }

      const filePath = urlParts[1].split("?")[0]; // Remove query parameters

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error("❌ Supabase delete error:", error);
        throw error;
      }

      console.log("✅ File deleted from Supabase:", filePath);
    } catch (error) {
      console.error("❌ Supabase deletion failed:", error);
      throw error;
    }
  }

  // Initialize storage bucket (create if doesn't exist)
  static async initializeBucket(): Promise<void> {
    try {
      console.log("🔄 Initializing Supabase Storage bucket...");

      // Check if storage is enabled first
      const storageEnabled = await SupabaseSetup.isStorageEnabled();
      if (!storageEnabled) {
        console.warn(
          "⚠️ Supabase Storage service is not enabled or accessible",
        );
        SupabaseSetup.displaySetupInstructions();
        return;
      }

      // First test connection
      const testResult = await SupabaseSetup.testConnection();
      if (testResult.success) {
        console.log("✅", testResult.message);
        return;
      }

      console.warn("⚠️", testResult.message);

      // Skip bucket creation due to RLS policy restrictions
      // Bucket must be created manually in Supabase dashboard
      console.log("⚠️ Skipping automatic bucket creation due to RLS policies");
      console.log("📋 Please create bucket manually in Supabase dashboard:");
      console.log("1. Go to Storage section");
      console.log('2. Create bucket named "journal-media"');
      console.log("3. Make it public");
      console.log("4. Disable RLS or set public policies");

      const createError = new Error(
        "Bucket must be created manually in dashboard",
      );

      if (createError) {
        if (createError.message?.includes("already exists")) {
          console.log(
            "✅ Supabase storage bucket already exists:",
            this.BUCKET_NAME,
          );
        } else {
          console.error("❌ Bucket creation failed:", createError.message);
          SupabaseSetup.displaySetupInstructions();
        }
      } else {
        console.log(
          "✅ Supabase storage bucket created successfully:",
          this.BUCKET_NAME,
        );
      }
    } catch (error) {
      console.error("❌ Bucket initialization failed:", error);
      SupabaseSetup.displaySetupInstructions();
    }
  }
}
