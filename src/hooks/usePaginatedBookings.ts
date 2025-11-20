import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryConstraint,
  DocumentSnapshot,
  onSnapshot,
  Query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { Booking } from "@/services/bookingService";
import { transformBookingDoc } from "@/lib/bookingTransformers";

export interface BookingFilters {
  status?: string;
  bookingType?: string;
  userId?: string;
  searchTerm?: string;
}

export interface PaginatedBookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  totalCount: number;
}

const PAGE_SIZE = 20;
const SEARCH_LIMIT = 1000; // Maximum bookings to fetch when searching

/**
 * Hook for paginated bookings with server-side filtering
 * Supports real-time updates for the first page only
 * When searchTerm is provided, fetches all matching bookings (up to SEARCH_LIMIT)
 */
export function usePaginatedBookings(
  filters: BookingFilters = {},
  enableRealtime = false
): PaginatedBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const buildQuery = useCallback(
    (lastDocument?: DocumentSnapshot | null, isSearchMode = false): Query => {
      const constraints: QueryConstraint[] = [];

      // Apply filters
      if (filters.userId) {
        constraints.push(where("userId", "==", filters.userId));
      }

      if (filters.status && filters.status !== "all") {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters.bookingType && filters.bookingType !== "all") {
        constraints.push(where("bookingType", "==", filters.bookingType));
      }

      // Always order by createdAt descending
      constraints.push(orderBy("createdAt", "desc"));

      // For search mode, fetch all bookings (up to limit), otherwise paginate
      if (isSearchMode) {
        constraints.push(limit(SEARCH_LIMIT));
      } else {
        // Pagination
        if (lastDocument) {
          constraints.push(startAfter(lastDocument));
        }
        constraints.push(limit(PAGE_SIZE));
      }

      return query(collection(db, COLLECTIONS.BOOKINGS), ...constraints);
    },
    [filters.userId, filters.status, filters.bookingType]
  );


  const fetchBookings = useCallback(
    async (isLoadMore = false) => {
      try {
        if (!isLoadMore) {
          setLoading(true);
          setError(null);
        }

        // Check if we're in search mode
        const isSearchMode = !!filters.searchTerm && filters.searchTerm.trim().length > 0;

        const q = buildQuery(isLoadMore ? lastDoc : null, isSearchMode && !isLoadMore);
        const snapshot = await getDocs(q);

        const newBookings = snapshot.docs.map(transformBookingDoc);

        // Client-side search filter (for search term)
        let filteredBookings = newBookings;
        if (isSearchMode) {
          const term = filters.searchTerm!.toLowerCase().trim();
          filteredBookings = newBookings.filter(
            (b) =>
              b.userName.toLowerCase().includes(term) ||
              b.userEmail.toLowerCase().includes(term) ||
              b.id.toLowerCase().includes(term)
          );
        }

        if (isLoadMore && !isSearchMode) {
          // Only allow load more in non-search mode
          setBookings((prev) => [...prev, ...filteredBookings]);
        } else {
          setBookings(filteredBookings);
          setTotalCount(filteredBookings.length);
        }

        // Update pagination state
        if (isSearchMode) {
          // In search mode, don't allow pagination (show all results)
          setLastDoc(null);
          setHasMore(false);
        } else {
          const lastVisible = snapshot.docs[snapshot.docs.length - 1];
          setLastDoc(lastVisible || null);
          setHasMore(snapshot.docs.length === PAGE_SIZE);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    },
    [buildQuery, lastDoc, filters.searchTerm]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchBookings(true);
  }, [hasMore, loading, fetchBookings]);

  const refresh = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await fetchBookings(false);
  }, [fetchBookings]);

  // Initial load and filter changes (excluding searchTerm to prevent auto-search)
  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchBookings(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.bookingType, filters.userId]);
  
  // Separate effect for searchTerm - triggers when search is performed or cleared
  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchBookings(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchTerm]);

  // Real-time updates for first page only (optional)
  // Disabled when in search mode to avoid conflicts
  useEffect(() => {
    if (!enableRealtime) return;
    if (filters.searchTerm && filters.searchTerm.trim().length > 0) return; // Skip real-time in search mode

    const q = buildQuery(null, false);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newBookings = snapshot.docs.map(transformBookingDoc);
        setBookings(newBookings);
        setTotalCount(newBookings.length);
        setError(null);
      },
      (err) => {
        console.error("Real-time listener error:", err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [enableRealtime, buildQuery, filters.searchTerm]);

  return {
    bookings,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount,
  };
}



