import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Car,
  Map,
  X,
  Filter,
  Loader2,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBookings, cancelBooking, Booking } from "@/services/bookingService";
import { allTours } from "@/lib/mockData";
import { vehicles } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";

export default function UserBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userBookings = await getUserBookings(user.uid);
      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBookingItem = (booking: Booking) => {
    if (booking.bookingType === "tour" && booking.tourId) {
      return allTours.find(tour => tour.id === booking.tourId);
    } else if (booking.bookingType === "vehicle" && booking.vehicleId) {
      return vehicles.find(vehicle => vehicle.id === booking.vehicleId);
    }
    return null;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-600";
      case "pending": return "bg-yellow-600";
      case "cancelled": return "bg-red-600";
      case "completed": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your bookings...</span>
          </div>
        </div>
        <Footer />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>My Bookings | CebuFlexi Tours</title>
        <meta name="description" content="View and manage your tour and car rental bookings with CebuFlexi Tours." />
        <link rel="canonical" href="https://cebuflexitours.com/account/bookings" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen bg-gray-50">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-gray-600">Manage your tour and car rental bookings</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">Filter by status:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter === "all" 
                      ? "You haven't made any bookings yet. Start exploring our tours and car rentals!"
                      : `No ${statusFilter} bookings found.`
                    }
                  </p>
                  <Button onClick={() => router.push("/tours")}>
                    Browse Tours
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => {
                  const item = getBookingItem(booking);
                  if (!item) return null;

                  return (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="lg:w-1/4">
                            <div className="relative h-48 lg:h-32 rounded-lg overflow-hidden">
                              <img
                                src={booking.bookingType === "tour" ? (item as any).images?.[0] : (item as any).image}
                                alt={booking.bookingType === "tour" ? (item as any).title : (item as any).name}
                                className="w-full h-full object-cover"
                              />
                              <Badge className={`absolute top-2 left-2 ${getStatusBadgeColor(booking.status)}`}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="lg:w-3/4 flex flex-col justify-between">
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <h3 className="text-xl font-bold">
                                  {booking.bookingType === "tour" ? (item as any).title : (item as any).name}
                                </h3>
                                <div className="text-2xl font-bold text-blue-600">
                                  ₱{booking.totalPrice.toLocaleString()}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>
                                    {formatDate(booking.startDate)}
                                    {booking.endDate && booking.endDate.getTime() !== booking.startDate.getTime() && 
                                      ` - ${formatDate(booking.endDate)}`
                                    }
                                  </span>
                                </div>

                                {booking.groupSize && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>{booking.groupSize} {booking.groupSize === 1 ? 'person' : 'people'}</span>
                                  </div>
                                )}

                                <div className="flex items-center text-sm text-gray-600">
                                  {booking.bookingType === "tour" ? <Map className="h-4 w-4 mr-2" /> : <Car className="h-4 w-4 mr-2" />}
                                  <span>{booking.bookingType === "tour" ? "Tour" : "Vehicle Rental"}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>Booked on {formatDate(booking.createdAt)}</span>
                                </div>
                              </div>

                              {booking.specialRequests && (
                                <div className="mb-4">
                                  <h4 className="font-semibold text-sm mb-1">Special Requests:</h4>
                                  <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                                </div>
                              )}

                              {(booking.guestName || booking.guestEmail || booking.guestPhone) && (
                                <div className="mb-4">
                                  <h4 className="font-semibold text-sm mb-1">Guest Information:</h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    {booking.guestName && (
                                      <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-blue-600" />
                                        <span>Name: {booking.guestName}</span>
                                      </div>
                                    )}
                                    {booking.guestEmail && (
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                                        <span>Email: {booking.guestEmail}</span>
                                      </div>
                                    )}
                                    {booking.guestPhone && (
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                                        <span>Phone: {booking.guestPhone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {booking.customizations && booking.bookingType === "vehicle" && (
                                <div className="mb-4">
                                  <h4 className="font-semibold text-sm mb-1">Rental Details:</h4>
                                  <div className="text-sm text-gray-600">
                                    {(() => {
                                      try {
                                        const customizations = JSON.parse(booking.customizations);
                                        const rentalDays = customizations.rentalDays || 1;
                                        const addOns = customizations.addOns || {};
                                        
                                        return (
                                          <div className="space-y-2">
                                            {customizations.pickupLocation && (
                                              <div>Pickup: {customizations.pickupLocation}</div>
                                            )}
                                            {customizations.dropoffLocation && (
                                              <div>Drop-off: {customizations.dropoffLocation}</div>
                                            )}
                                            {customizations.rentalDays && (
                                              <div>Duration: {customizations.rentalDays} days</div>
                                            )}
                                            
                                            {(addOns.insurance || addOns.gps || addOns.childSeat) && (
                                              <div className="mt-3 pt-2 border-t border-gray-200">
                                                <h5 className="font-medium text-sm mb-1">Add-ons:</h5>
                                                <div className="space-y-1">
                                                  {addOns.insurance && (
                                                    <div className="flex justify-between">
                                                      <span>Insurance:</span>
                                                      <span>₱{(500 * rentalDays).toLocaleString()}</span>
                                                    </div>
                                                  )}
                                                  {addOns.gps && (
                                                    <div className="flex justify-between">
                                                      <span>GPS Navigation:</span>
                                                      <span>₱{(200 * rentalDays).toLocaleString()}</span>
                                                    </div>
                                                  )}
                                                  {addOns.childSeat && (
                                                    <div className="flex justify-between">
                                                      <span>Child Safety Seat:</span>
                                                      <span>₱{(150 * rentalDays).toLocaleString()}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } catch {
                                        return <div>{booking.customizations}</div>;
                                      }
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {booking.userEmail}
                                </div>
                                {booking.contactPhone && (
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    {booking.contactPhone}
                                  </div>
                                )}
                              </div>

                              {booking.status === "pending" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking.id!)}
                                  className="ml-auto"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </ProtectedRoute>
  );
}
