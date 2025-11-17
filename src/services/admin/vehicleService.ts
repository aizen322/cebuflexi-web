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
import { Vehicle } from "@/types";

export async function createVehicle(vehicleData: Omit<Vehicle, "id">): Promise<string> {
  const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
  const newVehicleRef = doc(vehiclesRef);
  
  await setDoc(newVehicleRef, {
    ...vehicleData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return newVehicleRef.id;
}

export async function updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>): Promise<void> {
  const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
  
  await updateDoc(vehicleRef, {
    ...vehicleData,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
  await deleteDoc(vehicleRef);
}

export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
  const vehicleSnap = await getDoc(vehicleRef);

  if (!vehicleSnap.exists()) {
    return null;
  }

  return {
    id: vehicleSnap.id,
    ...vehicleSnap.data(),
  } as Vehicle;
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
  const snapshot = await getDocs(vehiclesRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Vehicle[];
}

export async function toggleVehicleAvailability(vehicleId: string): Promise<void> {
  const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
  const vehicleSnap = await getDoc(vehicleRef);

  if (!vehicleSnap.exists()) {
    throw new Error("Vehicle not found");
  }

  const currentAvailable = vehicleSnap.data().available || false;
  
  await updateDoc(vehicleRef, {
    available: !currentAvailable,
    updatedAt: Timestamp.now(),
  });
}


