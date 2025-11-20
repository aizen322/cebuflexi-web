import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadProgress {
  progress: number;
  url?: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!storage) {
      reject(new Error("Firebase storage not initialized"));
      return;
    }

    // Create a reference
    const storageRef = ref(storage, path);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress callback
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        // Error callback
        console.error("Upload error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // Check for CORS/network errors
        if (error.message && (
          error.message.includes("CORS") || 
          error.message.includes("blocked") ||
          error.message.includes("preflight") ||
          error.message.includes("ERR_FAILED")
        )) {
          reject(new Error(
            "CORS Error: Firebase Storage Security Rules are blocking the upload. " +
            "Please update your Storage rules in Firebase Console to allow authenticated uploads."
          ));
          return;
        }
        
        // Provide more helpful error messages
        if (error.code === 'storage/unauthorized') {
          reject(new Error("You don't have permission to upload files. Please check Firebase Storage rules."));
        } else if (error.code === 'storage/canceled') {
          reject(new Error("Upload was canceled."));
        } else if (error.code === 'storage/unknown') {
          reject(new Error("An unknown error occurred. Please check your internet connection and Firebase Storage configuration."));
        } else {
          reject(error);
        }
      },
      async () => {
        // Complete callback
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

export async function uploadTourImages(
  files: File[],
  tourId: string,
  onProgress?: (index: number, progress: number) => void
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    // Use new path format: tours/{tourId}/images/{filename}
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `tours/${tourId}/images/${Date.now()}-${sanitizedFilename}`;
    return uploadImage(file, path, (progress) => {
      onProgress?.(index, progress);
    });
  });

  return Promise.all(uploadPromises);
}

export async function uploadVehicleImage(
  file: File,
  vehicleId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Use path format: vehicles/{vehicleId}/image/{filename}
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `vehicles/${vehicleId}/image/${Date.now()}-${sanitizedFilename}`;
  return uploadImage(file, path, onProgress);
}

export async function uploadLandmarkImage(
  file: File,
  landmarkId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Use path format: landmarks/{landmarkId}/image/{filename}
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `landmarks/${landmarkId}/image/${Date.now()}-${sanitizedFilename}`;
  return uploadImage(file, path, onProgress);
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!storage) {
    throw new Error("Firebase storage not initialized");
  }

  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathStart = url.pathname.indexOf('/o/') + 3;
    const pathEnd = url.pathname.indexOf('?');
    const path = decodeURIComponent(url.pathname.substring(pathStart, pathEnd));

    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "File size too large. Maximum size is 5MB.",
    };
  }

  return { valid: true };
}


