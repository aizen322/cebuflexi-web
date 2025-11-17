import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { Tour } from "@/types";

export async function createTour(tourData: Omit<Tour, "id">): Promise<string> {
  const toursRef = collection(db, COLLECTIONS.TOURS);
  const newTourRef = doc(toursRef);
  
  await setDoc(newTourRef, {
    ...tourData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return newTourRef.id;
}

export async function updateTour(tourId: string, tourData: Partial<Tour>): Promise<void> {
  const tourRef = doc(db, COLLECTIONS.TOURS, tourId);
  
  await updateDoc(tourRef, {
    ...tourData,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTour(tourId: string): Promise<void> {
  const tourRef = doc(db, COLLECTIONS.TOURS, tourId);
  await deleteDoc(tourRef);
}

export async function getTourById(tourId: string): Promise<Tour | null> {
  const tourRef = doc(db, COLLECTIONS.TOURS, tourId);
  const tourSnap = await getDoc(tourRef);

  if (!tourSnap.exists()) {
    return null;
  }

  return {
    id: tourSnap.id,
    ...tourSnap.data(),
  } as Tour;
}

export async function getAllTours(): Promise<Tour[]> {
  const toursRef = collection(db, COLLECTIONS.TOURS);
  const snapshot = await getDocs(toursRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Tour[];
}

export async function toggleTourFeatured(tourId: string): Promise<void> {
  const tourRef = doc(db, COLLECTIONS.TOURS, tourId);
  const tourSnap = await getDoc(tourRef);

  if (!tourSnap.exists()) {
    throw new Error("Tour not found");
  }

  const currentFeatured = tourSnap.data().featured || false;
  
  await updateDoc(tourRef, {
    featured: !currentFeatured,
    updatedAt: Timestamp.now(),
  });
}

export async function toggleTourAvailability(tourId: string): Promise<void> {
  const tourRef = doc(db, COLLECTIONS.TOURS, tourId);
  const tourSnap = await getDoc(tourRef);

  if (!tourSnap.exists()) {
    throw new Error("Tour not found");
  }

  const currentAvailable = tourSnap.data().available || false;
  
  await updateDoc(tourRef, {
    available: !currentAvailable,
    updatedAt: Timestamp.now(),
  });
}


