/**
 * SWR-based caching hooks for bookings and stats
 * 
 * These hooks provide automatic request deduplication, caching,
 * and revalidation for improved performance.
 */

import useSWR from "swr";
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
 */
export function useBookingsWithCache(
  fetcher: (filters?: BookingFilters) => Promise<Booking[]>,
  options: UseBookingsOptions = {}
) {
  const {
    filters = {},
    enableRealtime = false,
    revalidateOnFocus = false,
  } = options;

  // Create cache key from filters
  const cacheKey = filters ? ["bookings", JSON.stringify(filters)] : ["bookings"];

  const { data, error, mutate, isLoading } = useSWR(
    cacheKey,
    () => fetcher(filters),
    {
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      refreshInterval: enableRealtime ? 10000 : 0, // Poll every 10s if realtime enabled
      onError: (err) => {
        // Silent error - errors are handled via the error return value
        if (process.env.NODE_ENV === 'development') {
          console.error("SWR Error fetching bookings:", err);
        }
      },
    }
  );

  return {
    bookings: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  monthlyRevenue: number;
  activeTours: number;
  activeVehicles: number;
}

/**
 * Hook for fetching dashboard stats with caching
 */
export function useDashboardStatsWithCache(
  fetcher: () => Promise<DashboardStats>
) {
  const { data, error, mutate, isLoading } = useSWR(
    "dashboard-stats",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
      refreshInterval: 300000, // Refresh every 5 minutes
      onError: (err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error("SWR Error fetching dashboard stats:", err);
        }
      },
    }
  );

  return {
    stats: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

/**
 * Hook for fetching a single booking by ID with caching
 */
export function useBookingWithCache(
  bookingId: string | null,
  fetcher: (id: string) => Promise<Booking | null>
) {
  const { data, error, mutate, isLoading } = useSWR(
    bookingId ? ["booking", bookingId] : null,
    () => (bookingId ? fetcher(bookingId) : null),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Cache for 10 seconds
    }
  );

  return {
    booking: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

/**
 * Hook for fetching content data with long-term caching
 */
export function useContentWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  fallbackData?: T
) {
  const { data, error, mutate, isLoading } = useSWR(
    ["content", key],
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
      refreshInterval: 600000, // Refresh every 10 minutes
      fallbackData,
    }
  );

  return {
    data: data || fallbackData || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}
