import { useState, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingStatusBadge } from "@/components/Bookings/BookingStatusBadge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Download, Filter, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { usePaginatedBookings } from "@/hooks/usePaginatedBookings";

export default function AdminBookingsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filters = useMemo(
    () => ({
      status: statusFilter,
      bookingType: typeFilter,
      searchTerm: activeSearchTerm || undefined,
    }),
    [statusFilter, typeFilter, activeSearchTerm]
  );

  const { bookings, loading, hasMore, loadMore } =
    usePaginatedBookings(filters, true);

  const handleSearch = () => {
    setActiveSearchTerm(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearchTerm("");
  };

  const exportToCSV = () => {
    const csvData = bookings.map((b) => ({
      ID: b.id,
      "Customer Name": b.userName,
      "Customer Email": b.userEmail,
      Type: b.bookingType,
      Status: b.status,
      "Total Price": b.totalPrice,
      "Start Date": format(b.startDate, "yyyy-MM-dd"),
      "End Date": format(b.endDate, "yyyy-MM-dd"),
      "Created At": format(b.createdAt, "yyyy-MM-dd HH:mm"),
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminProtectedRoute>
      <Head>
        <title>Bookings - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor all customer bookings
              </p>
            </div>
            <Button onClick={exportToCSV} variant="outline" disabled={bookings.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or ID..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  {activeSearchTerm && (
                    <Button
                      onClick={handleClearSearch}
                      variant="outline"
                      disabled={loading}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tour">Tours</SelectItem>
                    <SelectItem value="vehicle">Vehicles</SelectItem>
                    <SelectItem value="custom-tour">Custom Tours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No bookings found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
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
                        {bookings.map((booking) => (
                          <TableRow key={booking.id} className="hover:bg-accent/50">
                            <TableCell className="font-mono text-xs">
                              {booking.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{booking.userName}</p>
                                <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
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
                          <TableCell><BookingStatusBadge status={booking.status} /></TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button
                        onClick={loadMore}
                        variant="outline"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Results count */}
              {!loading && bookings.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  {activeSearchTerm ? (
                    <>Showing {bookings.length} search result{bookings.length !== 1 ? "s" : ""} for "{activeSearchTerm}"</>
                  ) : (
                    <>Showing {bookings.length} bookings{hasMore ? " (more available)" : ""}</>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}


