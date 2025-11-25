import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Vehicle } from "@/types";

export interface AvailabilityResult {
  vehicleId: string;
  totalStock: number;
  bookedCount: number;
  availableCount: number;
  isAvailable: boolean;
}

export const getAvailableVehicles = async (
  vehicles: Vehicle[],
  startDate: Date,
  endDate: Date
): Promise<AvailabilityResult[]> => {
  if (!db) {
    console.warn("Firestore is not initialized.");
    return vehicles.map((v) => ({
      vehicleId: v.id,
      totalStock: v.stockCount,
      bookedCount: 0,
      availableCount: v.stockCount,
      isAvailable: true,
    }));
  }

  try {
    const bookingsRef = collection(db, "bookings");

    // Create timestamps for the query
    // We want to find bookings that OVERLAP with the requested range.
    // A booking overlaps if:
    // booking.startDate < requestedEndDate AND booking.endDate > requestedStartDate
    // Note: In Firestore, we can't do multiple inequalities on different fields easily without composite indexes.
    // Strategy:
    // 1. Query for all "vehicle" type bookings that are "confirmed".
    // 2. Filter them in memory for the date overlap.
    // This is generally performant enough for a typical number of active bookings. 
    // If it scales to thousands, we'd need a better strategy (e.g. daily availability buckets).

    const q = query(
      bookingsRef,
      where("bookingType", "==", "vehicle"),
      where("status", "==", "confirmed")
    );

    const querySnapshot = await getDocs(q);

    // Map to count booked vehicles
    const bookedCounts: Record<string, number> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const bookingStart = data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate);
      const bookingEnd = data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate);

      // Check overlap
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      if (bookingStart < endDate && bookingEnd > startDate) {
        // Wait, the Booking type has itemId which is usually the ID. Let's check the type again.
        // In src/types/index.ts: itemId: string; type: "tour" | "rental";
        // Also in src/services/bookingService.ts: vehicleId?: string;
        // I should check both to be safe, but typically it's vehicleId or itemId.
        // Let's check the Booking interface I saw earlier.
        // src/services/bookingService.ts has vehicleId?: string;

        const targetId = data.vehicleId || data.itemId;

        if (targetId) {
          bookedCounts[targetId] = (bookedCounts[targetId] || 0) + 1;
        }
      }
    });

    // Build results
    return vehicles.map((vehicle) => {
      const booked = bookedCounts[vehicle.id] || 0;
      const available = Math.max(0, vehicle.stockCount - booked);

      return {
        vehicleId: vehicle.id,
        totalStock: vehicle.stockCount,
        bookedCount: booked,
        availableCount: available,
        isAvailable: available > 0,
      };
    });

  } catch (error) {
    // Handle permission errors gracefully for unauthenticated users
    // The bookings collection requires authentication to query
    // Return optimistic availability (all vehicles available) for browsing
    const firebaseError = error as { code?: string };
    if (firebaseError.code === "permission-denied") {
      // Unauthenticated user - show optimistic availability for browsing
      return vehicles.map((vehicle) => ({
        vehicleId: vehicle.id,
        totalStock: vehicle.stockCount,
        bookedCount: 0,
        availableCount: vehicle.stockCount,
        isAvailable: vehicle.available && vehicle.stockCount > 0,
      }));
    }
    
    // For other errors, also return optimistic availability to not break the UI
    return vehicles.map((vehicle) => ({
      vehicleId: vehicle.id,
      totalStock: vehicle.stockCount,
      bookedCount: 0,
      availableCount: vehicle.stockCount,
      isAvailable: vehicle.available && vehicle.stockCount > 0,
    }));
  }
};

export const checkVehicleAvailability = async (
  vehicleId: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  // This is for a single vehicle check (e.g. before creating booking)
  if (!db) throw new Error("Firestore not initialized");

  const bookingsRef = collection(db, "bookings");
  const q = query(
    bookingsRef,
    where("bookingType", "==", "vehicle"),
    where("status", "==", "confirmed"),
    where("vehicleId", "==", vehicleId) // Optimization: filter by vehicleId
  );

  const querySnapshot = await getDocs(q);
  let bookedCount = 0;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const bookingStart = data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate);
    const bookingEnd = data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate);

    if (bookingStart < endDate && bookingEnd > startDate) {
      bookedCount++;
    }
  });

  return bookedCount;
};
