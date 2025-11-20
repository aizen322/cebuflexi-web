import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { Landmark } from "@/types";

export async function createLandmark(landmarkData: Omit<Landmark, "id">): Promise<string> {
  const landmarksRef = collection(db, COLLECTIONS.LANDMARKS);
  const newLandmarkRef = doc(landmarksRef);
  
  await setDoc(newLandmarkRef, {
    ...landmarkData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return newLandmarkRef.id;
}

export async function updateLandmark(landmarkId: string, landmarkData: Partial<Landmark>): Promise<void> {
  const landmarkRef = doc(db, COLLECTIONS.LANDMARKS, landmarkId);
  
  await updateDoc(landmarkRef, {
    ...landmarkData,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteLandmark(landmarkId: string): Promise<void> {
  const landmarkRef = doc(db, COLLECTIONS.LANDMARKS, landmarkId);
  await deleteDoc(landmarkRef);
}

export async function getLandmarkById(landmarkId: string): Promise<Landmark | null> {
  const landmarkRef = doc(db, COLLECTIONS.LANDMARKS, landmarkId);
  const landmarkSnap = await getDoc(landmarkRef);

  if (!landmarkSnap.exists()) {
    return null;
  }

  const data = landmarkSnap.data();
  return {
    id: landmarkSnap.id,
    ...data,
    location: data.location || { lat: 0, lng: 0 },
  } as Landmark;
}

export async function getAllLandmarks(): Promise<Landmark[]> {
  const landmarksRef = collection(db, COLLECTIONS.LANDMARKS);
  const snapshot = await getDocs(landmarksRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    location: doc.data().location || { lat: 0, lng: 0 },
  })) as Landmark[];
}

