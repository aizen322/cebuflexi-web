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
import { BookingStatusBadge } from "@/components/Bookings/BookingStatusBadge";
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
  Calendar, 
  DollarSign,
  MapPin,
  Car,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { COLLECTIONS } from "@/lib/firestore-collections";

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
}

import { checkVehicleAvailability } from "@/services/vehicleAvailabilityService";
import { useVehiclesData } from "@/contexts/ContentDataContext";

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const { data: vehicles } = useVehiclesData(); // Fetch vehicles for stock count check
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

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
      });
    } catch (error) {
      console.error("Error fetching booking:", error);
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
      // Optional: Check availability before confirming if it's a vehicle booking
      if (booking.bookingType === "vehicle" && booking.vehicleId) {
        const vehicle = vehicles.find(v => v.id === booking.vehicleId);
        if (vehicle) {
          const bookedCount = await checkVehicleAvailability(
            booking.vehicleId, 
            booking.startDate, 
            booking.endDate
          );
          
          if (vehicle.stockCount - bookedCount <= 0) {
            const confirmOverride = window.confirm(
              `Warning: This vehicle appears to be fully booked for these dates (${bookedCount}/${vehicle.stockCount} booked). Confirm anyway?`
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

      // Refresh booking data
      await fetchBookingDetails(booking.id);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error confirming booking:", error);
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

      // Refresh booking data
      await fetchBookingDetails(booking.id);
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error cancelling booking:", error);
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

      // Refresh booking data
      await fetchBookingDetails(booking.id);
      setShowCompleteDialog(false);
    } catch (error) {
      console.error("Error completing booking:", error);
      toast({
        title: "Error",
        description: "Failed to mark booking as complete",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }


  // Parse JSON strings for custom tour display
  const parseCustomTourData = (data: string | undefined) => {
    if (!data) return null;
    
    try {
      // Try parsing as JSON
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed;
    } catch {
      // If not JSON, return as string
      return data;
    }
  };

  const renderCustomTourInfo = () => {
    if (booking?.bookingType !== "custom-tour") return null;

    const customizations = parseCustomTourData(booking.customizations);
    const itineraryDetails = parseCustomTourData(booking.itineraryDetails);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Tour Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customizations && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Customizations</p>
              {typeof customizations === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(customizations).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="font-medium capitalize min-w-[120px]">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-muted-foreground">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm">{String(customizations)}</p>
              )}
            </div>
          )}

          {itineraryDetails && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Itinerary Details</p>
              {typeof itineraryDetails === 'object' ? (
                <div className="space-y-3">
                  {itineraryDetails.landmarks && Array.isArray(itineraryDetails.landmarks) && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Landmarks:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {itineraryDetails.landmarks.map((landmark: any, idx: number) => (
                          <li key={idx}>
                            {landmark.name || landmark}
                            {landmark.duration && ` (${landmark.duration} min)`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {itineraryDetails.totalTime && (
                    <div className="text-sm">
                      <span className="font-medium">Total Time: </span>
                      <span>{itineraryDetails.totalTime} minutes</span>
                    </div>
                  )}
                  {itineraryDetails.totalPrice && (
                    <div className="text-sm">
                      <span className="font-medium">Total Price: </span>
                      <span>₱{itineraryDetails.totalPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {typeof itineraryDetails === 'object' && !itineraryDetails.landmarks && (
                    <div className="text-sm space-y-1">
                      {Object.entries(itineraryDetails).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm">{String(itineraryDetails)}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminProtectedRoute>
      <Head>
        <title>Booking Details - CebuFlexi Admin</title>
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/bookings")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
              {booking && (
                <p className="text-muted-foreground mt-1">
                  ID: {booking.id}
                </p>
              )}
            </div>
            {booking && (
              <div className="flex gap-2">
                {booking.status === "pending" && (
                  <>
                    <Button
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <Button
                    onClick={() => setShowCompleteDialog(true)}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : !booking ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Booking not found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{booking.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {booking.userEmail}
                    </p>
                  </div>
                  {booking.contactPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {booking.phoneCountryCode} {booking.contactPhone}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1"><BookingStatusBadge status={booking.status} /></div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize flex items-center gap-2">
                      {booking.bookingType === "vehicle" ? (
                        <Car className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      {booking.bookingType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dates</p>
                    <p className="font-medium">
                      {format(booking.startDate, "MMM d, yyyy")} - {format(booking.endDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  {booking.guests && (
                    <div>
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="font-medium">{booking.guests} guests</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{format(booking.createdAt, "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-2xl font-bold">₱{booking.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Tour Information */}
              {renderCustomTourInfo()}

              {/* Additional Information */}
              {booking.specialRequests && booking.bookingType !== "custom-tour" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="text-sm text-muted-foreground">Special Requests</p>
                      <p className="mt-1">{booking.specialRequests}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {booking.specialRequests && booking.bookingType === "custom-tour" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{booking.specialRequests}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to confirm this booking? The customer will be notified via email.
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
                Are you sure you want to cancel this booking? This action cannot be undone.
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
                Mark this booking as completed? This indicates the tour/service has been successfully delivered.
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


