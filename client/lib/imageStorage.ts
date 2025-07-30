// Firebase Storage service for large image uploads
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

export class ImageStorage {
  // Upload image to Firebase Storage and return download URL
  static async uploadImage(file: File, path: string): Promise<string> {
    try {
      console.log("🔄 Uploading image to Firebase Storage:", {
        fileName: file.name,
        size: file.size,
        type: file.type,
        path: path,
      });

      // Create storage reference
      const imageRef = ref(storage, path);

      // Upload file
      const snapshot = await uploadBytes(imageRef, file);
      console.log("✅ Upload completed:", snapshot.metadata.name);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("✅ Download URL created:", downloadURL);

      return downloadURL;
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      throw error;
    }
  }

  // Upload compressed image from canvas
  static async uploadCompressedImage(
    canvas: HTMLCanvasElement,
    path: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
            return;
          }

          try {
            console.log("🔄 Uploading compressed image to Firebase Storage:", {
              size: blob.size,
              type: blob.type,
              path: path,
            });

            // Create storage reference
            const imageRef = ref(storage, path);

            // Upload blob
            const snapshot = await uploadBytes(imageRef, blob);
            console.log("✅ Compressed upload completed");

            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log("✅ Download URL created:", downloadURL);

            resolve(downloadURL);
          } catch (error) {
            console.error("❌ Compressed image upload failed:", error);
            reject(error);
          }
        },
        "image/jpeg",
        0.8,
      );
    });
  }

  // Delete image from Firebase Storage
  static async deleteImage(downloadURL: string): Promise<void> {
    try {
      // Extract path from download URL
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.*)\?/);
      if (!pathMatch) {
        throw new Error("Invalid download URL");
      }

      const path = decodeURIComponent(pathMatch[1]);
      const imageRef = ref(storage, path);

      await deleteObject(imageRef);
      console.log("✅ Image deleted from storage:", path);
    } catch (error) {
      console.error("❌ Image deletion failed:", error);
      throw error;
    }
  }

  // Generate unique path for image
  static generateImagePath(prefix: string = "images"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${prefix}/${timestamp}_${random}.jpg`;
  }
}
