/**
 * VirtualizedBookingsList - Optimized list rendering for large datasets
 * 
 * NOTE: Requires @tanstack/react-virtual package
 * Install with: npm install @tanstack/react-virtual
 * 
 * This component uses virtual scrolling to efficiently render large lists
 * by only rendering visible items, improving performance for 1000+ bookings.
 */

import { useRef } from "react";
import { useRouter } from "next/router";
// import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { Booking } from "@/services/bookingService";
import { BookingStatusBadge } from "./BookingStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VirtualizedBookingsListProps {
  bookings: Booking[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function VirtualizedBookingsList({
  bookings,
  onLoadMore,
  hasMore,
}: VirtualizedBookingsListProps) {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);

  // TODO: Uncomment when @tanstack/react-virtual is installed
  // const virtualizer = useVirtualizer({
  //   count: bookings.length,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 80,
  //   overscan: 5,
  // });

  // // Trigger load more when near bottom
  // const items = virtualizer.getVirtualItems();
  // const lastItem = items[items.length - 1];
  
  // if (lastItem && lastItem.index >= bookings.length - 5 && hasMore && onLoadMore) {
  //   onLoadMore();
  // }

  // Fallback to regular rendering until virtual scrolling is enabled
  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ maxHeight: "600px" }}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            return (
              <TableRow
                key={booking.id}
                className="hover:bg-accent/50"
              >
                <TableCell className="font-mono text-xs">
                  {booking.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.userEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{booking.bookingType}</TableCell>
                <TableCell className="text-sm">
                  <div>
                    <p>{format(booking.startDate, "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">
                      to {format(booking.endDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  ₱{booking.totalPrice.toLocaleString()}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Load more trigger */}
      {hasMore && onLoadMore && (
        <div className="text-center py-4">
          <Button onClick={onLoadMore} variant="outline" size="sm">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// TODO: Enable virtual scrolling by:
// 1. Run: npm install @tanstack/react-virtual
// 2. Uncomment the useVirtualizer code above
// 3. Replace the TableBody map with virtualizer.getVirtualItems().map()

