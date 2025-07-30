// Media storage service for large images and videos
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export class MediaStorage {
  // Upload image/video file and return download URL
  static async uploadFile(file: File, entryId: string): Promise<string> {
    try {
      console.log("🔄 Uploading to Firebase Storage:", {
        fileName: file.name,
        size: file.size,
        type: file.type,
        entryId: entryId
      });

      // Create unique path for this file
      const fileExtension = file.name.split('.').pop() || 'bin';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `journal-media/${entryId}/${fileName}`;
      
      // Create storage reference
      const fileRef = ref(storage, filePath);
      
      // Upload file
      const snapshot = await uploadBytes(fileRef, file);
      console.log("✅ Upload completed:", snapshot.metadata.name);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("✅ Download URL created:", downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error("❌ Media upload failed:", error);
      throw error;
    }
  }

  // Upload compressed image from canvas
  static async uploadCompressedImage(canvas: HTMLCanvasElement, entryId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }

        try {
          console.log("🔄 Uploading compressed image:", {
            size: blob.size,
            type: blob.type,
            entryId: entryId
          });

          // Create unique path
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
          const filePath = `journal-media/${entryId}/${fileName}`;
          
          // Create storage reference
          const imageRef = ref(storage, filePath);
          
          // Upload blob
          const snapshot = await uploadBytes(imageRef, blob);
          console.log("✅ Compressed image uploaded");
          
          // Get download URL
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log("✅ Download URL created:", downloadURL);
          
          resolve(downloadURL);
        } catch (error) {
          console.error("❌ Compressed image upload failed:", error);
          reject(error);
        }
      }, "image/jpeg", 0.8);
    });
  }

  // Delete media file from Firebase Storage
  static async deleteFile(downloadURL: string): Promise<void> {
    try {
      // Extract path from download URL
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.*)\?/);
      if (!pathMatch) {
        throw new Error("Invalid download URL");
      }
      
      const path = decodeURIComponent(pathMatch[1]);
      const fileRef = ref(storage, path);
      
      await deleteObject(fileRef);
      console.log("✅ Media file deleted:", path);
    } catch (error) {
      console.error("❌ Media deletion failed:", error);
      throw error;
    }
  }
}
