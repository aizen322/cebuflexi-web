import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestore-collections";

export interface DashboardStats {
  pendingBookings: number;
  totalUsers: number;
  monthlyRevenue: number;
  activeTours: number;
  activeVehicles: number;
  lastUpdated: Date;
}

/**
 * Fetch dashboard stats from cached summary document
 * Falls back to real-time calculation if cache doesn't exist
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Try to get cached stats first
    const statsRef = doc(db, COLLECTIONS.STATS, "dashboard");
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      const data = statsSnap.data();
      const lastUpdated = data.lastUpdated?.toDate() || new Date(0);
      const now = new Date();
      const cacheAge = now.getTime() - lastUpdated.getTime();
      
      // Use cache if less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return {
          pendingBookings: data.pendingBookings || 0,
          totalUsers: data.totalUsers || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          activeTours: data.activeTours || 0,
          activeVehicles: data.activeVehicles || 0,
          lastUpdated,
        };
      }
    }

    // Cache miss or stale - calculate fresh stats
    return await calculateAndCacheStats();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

/**
 * Calculate stats from Firestore and update cache
 * Should be called periodically via Cloud Function or on-demand
 */
export async function calculateAndCacheStats(): Promise<DashboardStats> {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for better performance
    const [
      pendingBookingsSnap,
      confirmedBookingsSnap,
      usersSnap,
      activeToursSnap,
      activeVehiclesSnap,
    ] = await Promise.all([
      // Pending bookings count
      getDocs(
        query(
          collection(db, COLLECTIONS.BOOKINGS),
          where("status", "==", "pending")
        )
      ),
      // Confirmed bookings this month for revenue
      getDocs(
        query(
          collection(db, COLLECTIONS.BOOKINGS),
          where("status", "==", "confirmed"),
          where("createdAt", ">=", Timestamp.fromDate(firstDayOfMonth))
        )
      ),
      // Total users
      getDocs(collection(db, COLLECTIONS.USERS)),
      // Active tours
      getDocs(
        query(
          collection(db, COLLECTIONS.TOURS),
          where("available", "==", true)
        )
      ),
      // Active vehicles
      getDocs(
        query(
          collection(db, COLLECTIONS.VEHICLES),
          where("available", "==", true)
        )
      ),
    ]);

    // Calculate monthly revenue from confirmed bookings
    const monthlyRevenue = confirmedBookingsSnap.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (typeof data.totalPrice === "number" ? data.totalPrice : 0);
    }, 0);

    const stats: DashboardStats = {
      pendingBookings: pendingBookingsSnap.size,
      totalUsers: usersSnap.size,
      monthlyRevenue,
      activeTours: activeToursSnap.size,
      activeVehicles: activeVehiclesSnap.size,
      lastUpdated: now,
    };

    // Cache the stats
    const statsRef = doc(db, COLLECTIONS.STATS, "dashboard");
    await setDoc(statsRef, {
      ...stats,
      lastUpdated: Timestamp.now(),
    });

    return stats;
  } catch (error) {
    console.error("Error calculating dashboard stats:", error);
    throw error;
  }
}

/**
 * Invalidate stats cache to force recalculation on next fetch
 */
export async function invalidateStatsCache(): Promise<void> {
  try {
    const statsRef = doc(db, COLLECTIONS.STATS, "dashboard");
    await setDoc(
      statsRef,
      {
        lastUpdated: Timestamp.fromDate(new Date(0)),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error invalidating stats cache:", error);
  }
}

