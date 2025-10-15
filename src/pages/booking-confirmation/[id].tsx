import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Car, 
  Clock,
  Mail,
  Phone,
  Home
} from "lucide-react";
import { allTours, vehicles } from "@/lib/mockData";
import { getBookingById, Booking } from "@/services/bookingService";
import { motion } from "framer-motion";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const booking = await getBookingById(id as string);
        
        if (!booking) {
          setError("Booking not found");
          return;
        }
        
        setBookingData(booking);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your booking confirmation...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Error</h1>
            <p className="text-lg text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const tour = bookingData.tourId ? allTours.find(t => t.id === bookingData.tourId) : null;
  const vehicle = bookingData.vehicleId ? vehicles.find(v => v.id === bookingData.vehicleId) : null;
  
  // Safely parse customizations JSON
  let customizations = null;
  if (bookingData.customizations) {
    try {
      customizations = JSON.parse(bookingData.customizations);
    } catch (error) {
      console.error("Error parsing customizations:", error);
      customizations = null;
    }
  }

  return (
    <>
      <Head>
        <title>Booking Confirmation | CebuFlexi Tours</title>
        <meta name="description" content="Your booking has been confirmed. Thank you for choosing CebuFlexi Tours!" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen bg-gray-50">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              {/* Success Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                >
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Booking Confirmed!
                </h1>
                <p className="text-xl text-gray-600">
                  Thank you for booking with CebuFlexi Tours
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Booking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-semibold">{bookingData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date:</span>
                      <span className="font-semibold">
                        {bookingData.createdAt.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Date:</span>
                      <span className="font-semibold">
                        {bookingData.startDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-lg text-blue-600">
                        ₱{bookingData.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-semibold">{bookingData.userName}</p>
                        <p className="text-sm text-gray-600">Primary Contact</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{bookingData.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{bookingData.contactPhone || 'Not provided'}</span>
                    </div>
                    
                    {bookingData.guestName && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-semibold">{bookingData.guestName}</p>
                            <p className="text-sm text-gray-600">Guest</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{bookingData.guestEmail}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{bookingData.guestPhone}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Service Details */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {bookingData.bookingType === "tour" ? (
                      <MapPin className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Car className="h-5 w-5 text-blue-600" />
                    )}
                    {bookingData.bookingType === "tour" ? "Tour Package" : "Vehicle Rental"} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingData.bookingType === "tour" && tour ? (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img
                          src={tour.images[0]}
                          alt={tour.title}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
                          <Badge className="mb-2">{tour.category}</Badge>
                          <p className="text-gray-600 mb-3">{tour.shortDescription}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{tour.duration} {tour.duration === 1 ? "Day" : "Days"}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{bookingData.groupSize} People</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{tour.location}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-blue-600">
                                ₱{tour.price.toLocaleString()}/person
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : bookingData.bookingType === "vehicle" && vehicle ? (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{vehicle.name}</h3>
                          <Badge className="mb-2">{vehicle.type}</Badge>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{vehicle.capacity} seats</span>
                            </div>
                            <div className="flex items-center">
                              <Car className="h-4 w-4 mr-2 text-blue-600" />
                              <span>{vehicle.transmission}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-blue-600">
                                ₱{vehicle.pricePerDay.toLocaleString()}/day
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span>
                                {Math.ceil((bookingData.endDate.getTime() - bookingData.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                              </span>
                            </div>
                          </div>
                          {customizations && (
                            <div className="text-sm">
                              <p><strong>Pickup:</strong> {customizations.pickupLocation}</p>
                              {customizations.dropoffLocation && (
                                <p><strong>Drop-off:</strong> {customizations.dropoffLocation}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Special Requests */}
              {bookingData.specialRequests && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{bookingData.specialRequests}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="text-center mt-8">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push("/")}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
