import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { AdminProtectedRoute } from "@/components/Auth/AdminProtectedRoute";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Printer,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { COLLECTIONS } from "@/lib/firestore-collections";
import { useToursData, useVehiclesData } from "@/contexts/ContentDataContext";
import { Tour, Vehicle } from "@/types";

// Import new booking components
import {
  BookingStatusTimeline,
  BookingPriceBreakdown,
  TourBookingDetails,
  VehicleBookingDetails,
  CustomTourBookingDetails,
} from "@/components/Bookings";

import { checkVehicleAvailability } from "@/services/vehicleAvailabilityService";

interface BookingDetails {
  id: string;
  userName: string;
  userEmail: string;
  userId: string;
  bookingType: string;
  tourId?: string;
  vehicleId?: string;
  totalPrice: number;
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  guests?: number;
  groupSize?: number;
  contactPhone?: string;
  phoneCountryCode?: string;
  specialRequests?: string;
  customizations?: string;
  itineraryDetails?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const { data: tours } = useToursData();
  const { data: vehicles } = useVehiclesData();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Get tour or vehicle data based on booking type
  const tour: Tour | undefined = booking?.tourId
    ? tours.find((t) => t.id === booking.tourId)
    : undefined;
  const vehicle: Vehicle | undefined = booking?.vehicleId
    ? vehicles.find((v) => v.id === booking.vehicleId)
    : undefined;

  // Calculate rental days for vehicles
  const rentalDays = booking
    ? Math.max(
        1,
        Math.ceil(
          (booking.endDate.getTime() - booking.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 1;

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchBookingDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchBookingDetails(bookingId: string) {
    try {
      setLoading(true);
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      const bookingSnap = await getDoc(bookingRef);

      if (!bookingSnap.exists()) {
        toast({
          title: "Error",
          description: "Booking not found",
          variant: "destructive",
        });
        router.push("/admin/bookings");
        return;
      }

      const data = bookingSnap.data();
      setBooking({
        id: bookingSnap.id,
        userName: data.userName || data.guestName || "Unknown",
        userEmail: data.userEmail || data.guestEmail || "",
        userId: data.userId || "",
        bookingType: data.bookingType || "tour",
        tourId: data.tourId,
        vehicleId: data.vehicleId,
        totalPrice: data.totalPrice || 0,
        status: data.status || "pending",
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        guests: data.guests || data.groupSize,
        groupSize: data.groupSize,
        contactPhone: data.contactPhone || data.guestPhone,
        phoneCountryCode: data.phoneCountryCode || data.guestPhoneCountryCode,
        specialRequests: data.specialRequests,
        customizations: data.customizations,
        itineraryDetails: data.itineraryDetails,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!booking) return;

    setActionLoading(true);
    try {
      // Check availability before confirming if it's a vehicle booking
      if (booking.bookingType === "vehicle" && booking.vehicleId) {
        const vehicleData = vehicles.find((v) => v.id === booking.vehicleId);
        if (vehicleData) {
          const bookedCount = await checkVehicleAvailability(
            booking.vehicleId,
            booking.startDate,
            booking.endDate
          );

          if (vehicleData.stockCount - bookedCount <= 0) {
            const confirmOverride = window.confirm(
              `Warning: This vehicle appears to be fully booked for these dates (${bookedCount}/${vehicleData.stockCount} booked). Confirm anyway?`
            );
            if (!confirmOverride) {
              setActionLoading(false);
              return;
            }
          }
        }
      }

      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

      const response = await fetch("/api/admin/bookings/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          status: "confirmed",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm booking");
      }

      toast({
        title: "Success",
        description: "Booking confirmed successfully",
      });

      await fetchBookingDetails(booking.id);
      setShowConfirmDialog(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to confirm booking",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;

    setActionLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

      const response = await fetch("/api/admin/bookings/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          status: "cancelled",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });

      await fetchBookingDetails(booking.id);
      setShowCancelDialog(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    if (!booking) return;

    setActionLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

      const response = await fetch("/api/admin/bookings/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          status: "completed",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark booking as complete");
      }

      toast({
        title: "Success",
        description: "Booking marked as complete",
      });

      await fetchBookingDetails(booking.id);
      setShowCompleteDialog(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark booking as complete",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  // Quick action handlers
  const handleEmailCustomer = () => {
    if (!booking) return;
    const subject = encodeURIComponent(
      `Regarding your ${booking.bookingType} booking #${booking.id.slice(0, 8)}`
    );
    window.location.href = `mailto:${booking.userEmail}?subject=${subject}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AdminProtectedRoute>
      <Head>
        <title>Booking Details - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6 print:space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/bookings")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Booking Details
                </h1>
                {booking && (
                  <p className="text-sm text-muted-foreground">
                    #{booking.id.slice(0, 8)} • Created{" "}
                    {format(booking.createdAt, "MMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {booking && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailCustomer}
                  className="gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                {booking.bookingType === "tour" && tour && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/tours/${tour.id}`)}
                    className="gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Tour
                  </Button>
                )}
                {booking.bookingType === "vehicle" && vehicle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/car-rentals`)}
                    className="gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Rentals
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Status Action Buttons */}
          {booking && (
            <div className="flex gap-2 print:hidden">
              {booking.status === "pending" && (
                <>
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={actionLoading}
                    className="gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Booking
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={actionLoading}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Booking
                  </Button>
                </>
              )}
              {booking.status === "confirmed" && (
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Complete
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !booking ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Booking not found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Status Timeline */}
              <BookingStatusTimeline
                status={booking.status}
                createdAt={booking.createdAt}
              />

              {/* Main Content Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Customer & Booking Info */}
                <div className="space-y-6 lg:col-span-1">
                  {/* Customer Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Customer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(booking.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{booking.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.guests || booking.groupSize || 1}{" "}
                            {(booking.guests || booking.groupSize || 1) === 1
                              ? "guest"
                              : "guests"}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.userEmail}</span>
                        </div>
                        {booking.contactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.phoneCountryCode} {booking.contactPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Guest Booking Info */}
                      {booking.guestName && booking.guestName !== booking.userName && (
                        <>
                          <Separator />
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Booked for Guest
                            </p>
                            <p className="font-medium text-sm">{booking.guestName}</p>
                            {booking.guestEmail && (
                              <p className="text-sm text-muted-foreground">
                                {booking.guestEmail}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Price Breakdown */}
                  <BookingPriceBreakdown
                    bookingType={booking.bookingType}
                    totalPrice={booking.totalPrice}
                    guests={booking.guests}
                    groupSize={booking.groupSize}
                    startDate={booking.startDate}
                    endDate={booking.endDate}
                    basePrice={
                      tour?.price ||
                      vehicle?.pricePerDay ||
                      undefined
                    }
                  />

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MessageSquare className="h-5 w-5" />
                          Special Requests
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {booking.specialRequests}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Tour/Vehicle Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Tour Booking Details */}
                  {booking.bookingType === "tour" && tour && (
                    <TourBookingDetails tour={tour} />
                  )}

                  {/* Vehicle Booking Details */}
                  {booking.bookingType === "vehicle" && vehicle && (
                    <VehicleBookingDetails
                      vehicle={vehicle}
                      rentalDays={rentalDays}
                    />
                  )}

                  {/* Custom Tour Details */}
                  {booking.bookingType === "custom-tour" && (
                    <CustomTourBookingDetails
                      customizations={booking.customizations}
                      itineraryDetails={booking.itineraryDetails}
                    />
                  )}

                  {/* Fallback for tour/vehicle not found */}
                  {booking.bookingType === "tour" && !tour && booking.tourId && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                          Tour details not found (ID: {booking.tourId})
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {booking.bookingType === "vehicle" && !vehicle && booking.vehicleId && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                          Vehicle details not found (ID: {booking.vehicleId})
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to confirm this booking? The customer will
                be notified via email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} disabled={actionLoading}>
                {actionLoading ? "Confirming..." : "Confirm Booking"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Go Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                disabled={actionLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {actionLoading ? "Cancelling..." : "Cancel Booking"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Complete Dialog */}
        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Booking as Complete</AlertDialogTitle>
              <AlertDialogDescription>
                Mark this booking as completed? This indicates the tour/service
                has been successfully delivered.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleComplete}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading ? "Completing..." : "Mark as Complete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
