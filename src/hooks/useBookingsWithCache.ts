/**
 * SWR-based caching hooks for bookings and stats
 * 
 * NOTE: Requires SWR package
 * Install with: npm install swr
 * 
 * These hooks provide automatic request deduplication, caching,
 * and revalidation for improved performance.
 */

// import useSWR from "swr";
import { Booking } from "@/services/bookingService";
import { BookingFilters } from "./usePaginatedBookings";

interface UseBookingsOptions {
  filters?: BookingFilters;
  enableRealtime?: boolean;
  revalidateOnFocus?: boolean;
}

/**
 * Hook for fetching bookings with SWR caching
 * Provides automatic deduplication and revalidation
 * 
 * TODO: Uncomment when SWR is installed
 */
export function useBookingsWithCache(
  _fetcher: (filters?: BookingFilters) => Promise<Booking[]>,
  _options: UseBookingsOptions = {}
) {
  // Placeholder implementation - replace with SWR when installed
  // const {
  //   filters = {},
  //   enableRealtime = false,
  //   revalidateOnFocus = false,
  // } = options;

  // // Create cache key from filters
  // const cacheKey = ["bookings", filters];

  // const { data, error, mutate, isLoading } = useSWR(
  //   cacheKey,
  //   () => fetcher(filters),
  //   {
  //     revalidateOnFocus,
  //     revalidateOnReconnect: true,
  //     dedupingInterval: 5000, // Dedupe requests within 5 seconds
  //     refreshInterval: enableRealtime ? 10000 : 0, // Poll every 10s if realtime enabled
  //     onError: (err) => {
  //       console.error("Error fetching bookings:", err);
  //     },
  //   }
  // );

  // return {
  //   bookings: data || [],
  //   loading: isLoading,
  //   error: error?.message || null,
  //   refetch: mutate,
  // };

  // Temporary fallback
  return {
    bookings: [],
    loading: false,
    error: null,
    refetch: async () => {},
  };
}

/**
 * Hook for fetching dashboard stats with caching
 * 
 * TODO: Uncomment when SWR is installed
 */
export function useDashboardStatsWithCache(
  _fetcher: () => Promise<unknown>
) {
  // const { data, error, mutate, isLoading } = useSWR(
  //   "dashboard-stats",
  //   fetcher,
  //   {
  //     revalidateOnFocus: false,
  //     dedupingInterval: 60000, // Cache for 1 minute
  //     refreshInterval: 300000, // Refresh every 5 minutes
  //   }
  // );

  // return {
  //   stats: data,
  //   loading: isLoading,
  //   error: error?.message || null,
  //   refetch: mutate,
  // };

  // Temporary fallback
  return {
    stats: null,
    loading: false,
    error: null,
    refetch: async () => {},
  };
}

