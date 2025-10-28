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
  Home,
  Check,
  Map
} from "lucide-react";
import { allTours, vehicles, cebuLandmarks, mountainLandmarks } from "@/lib/mockData";
import { getBookingById, Booking } from "@/services/bookingService";
import { motion } from "framer-motion";
import { parseItineraryDetails, isCustomTour } from "@/lib/customTourHelpers";
import { ItineraryMap } from "@/components/CustomItinerary/ItineraryMap";
import { Landmark, MultiDayItineraryDetails } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentConfirmationDay, setCurrentConfirmationDay] = useState<1 | 2>(1);

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

  // Parse custom tour itinerary details
  const itineraryDetails = isCustomTour(bookingData) ? parseItineraryDetails(bookingData) : null;
  
  // Detect multi-day vs single-day tours
  const isMultiDay = itineraryDetails && (itineraryDetails as MultiDayItineraryDetails).days !== undefined;
  const multiDayDetails = isMultiDay ? (itineraryDetails as MultiDayItineraryDetails) : null;
  const singleDayDetails = !isMultiDay ? (itineraryDetails as any) : null;

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
                        {isCustomTour(bookingData) && itineraryDetails && (
                          <>
                            {' • '}
                            <strong>Day(s):</strong> {
                              (itineraryDetails as MultiDayItineraryDetails).days 
                                ? (itineraryDetails as MultiDayItineraryDetails).duration === "2-days" ? "2" : "1"
                                : "1"
                            }
                          </>
                        )}
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
                    {isCustomTour(bookingData) ? (
                      <Map className="h-5 w-5 text-blue-600" />
                    ) : bookingData.bookingType === "tour" ? (
                      <MapPin className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Car className="h-5 w-5 text-blue-600" />
                    )}
                    {isCustomTour(bookingData) ? "Custom DIY Tour" : 
                     bookingData.bookingType === "tour" ? "Tour Package" : "Vehicle Rental"} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCustomTour(bookingData) && itineraryDetails ? (
                    <>
                      {isMultiDay && multiDayDetails ? (
                        <>
                          {/* Header showing total summary */}
                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">2-Day Custom DIY Tour</h3>
                            <p className="text-gray-600">
                              {multiDayDetails.days.reduce((sum, d) => sum + d.landmarks.length, 0)} total landmarks •{' '}
                              {Math.ceil(multiDayDetails.days.reduce((sum, d) => sum + d.totalTime, 0) / 60)} hours total
                            </p>
                          </div>

                          {/* Day Tabs */}
                          <div className="mb-6">
                            <Tabs value={`day${currentConfirmationDay}`} onValueChange={(v) => setCurrentConfirmationDay(v === "day1" ? 1 : 2)}>
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="day1">
                                  Day 1 - {multiDayDetails.days[0].tourType === "mountain" ? "Mountain" : "Cebu City"}
                                </TabsTrigger>
                                <TabsTrigger value="day2">
                                  Day 2 - {multiDayDetails.days[1].tourType === "mountain" ? "Mountain" : "Cebu City"}
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </div>

                          {/* Current Day Details */}
                          {(() => {
                            const currentDay = multiDayDetails.days.find(d => d.day === currentConfirmationDay);
                            if (!currentDay) return null;

                            return (
                              <>
                                {/* Map for current day */}
                                <div className="mb-6">
                                  <h4 className="font-semibold mb-3">Day {currentDay.day} Route</h4>
                                  <div className="h-64 rounded-lg overflow-hidden">
                                    <ItineraryMap
                                      landmarks={currentDay.tourType === "mountain" ? mountainLandmarks : cebuLandmarks}
                                      selectedLandmarks={currentDay.landmarks
                                        .map(l => [...cebuLandmarks, ...mountainLandmarks].find(cl => cl.id === l.id))
                                        .filter(Boolean) as Landmark[]}
                                      markerColor={currentDay.day === 1 ? "blue" : "green"}
                                    />
                                  </div>
                                </div>

                                {/* Landmarks for current day */}
                                <div className="mb-6">
                                  <h4 className="font-semibold mb-3">Day {currentDay.day} Itinerary</h4>
                                  <div className="space-y-3">
                                    {currentDay.landmarks
                                      .sort((a, b) => a.order - b.order)
                                      .map((landmark) => (
                                        <div key={landmark.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <div className="flex-shrink-0">
                                            <Badge className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
                                              {landmark.order}
                                            </Badge>
                                          </div>
                                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                                            <img
                                              src={landmark.image}
                                              alt={landmark.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          <div className="flex-grow">
                                            <h5 className="font-semibold">{landmark.name}</h5>
                                            <p className="text-sm text-gray-600">
                                              ~{landmark.duration} minutes visit
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </>
                            );
                          })()}

                          {/* Pricing Summary for Multi-Day */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Pricing Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Tour Duration:</span>
                                <span className="font-semibold">2 Days</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Day 1:</span>
                                <span>{Math.ceil(multiDayDetails.days[0].totalTime / 60)}h • {multiDayDetails.days[0].landmarks.length} landmarks</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Day 2:</span>
                                <span>{Math.ceil(multiDayDetails.days[1].totalTime / 60)}h • {multiDayDetails.days[1].landmarks.length} landmarks</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Package Type:</span>
                                <span className="font-semibold">
                                  {multiDayDetails.isFullPackage ? "2-Day Full Package" : "Hourly Rate"}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total ({bookingData.groupSize} people):</span>
                                <span className="text-blue-600">₱{bookingData.totalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : singleDayDetails ? (
                        <>
                          {/* Single Day Display */}
                          <div className="space-y-6">
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold mb-2">Custom DIY Tour</h3>
                              <p className="text-gray-600">
                                {singleDayDetails.landmarks.length} landmarks • {Math.ceil(singleDayDetails.totalTime / 60)} hours
                              </p>
                            </div>

                            {/* Interactive Map */}
                            <div className="mb-6">
                              <h4 className="font-semibold mb-3">Your Route</h4>
                              <div className="h-64 rounded-lg overflow-hidden">
                                <ItineraryMap
                                  landmarks={[...cebuLandmarks, ...mountainLandmarks]}
                                  selectedLandmarks={singleDayDetails.landmarks
                                    .map(l => {
                                      const found = [...cebuLandmarks, ...mountainLandmarks].find(cl => cl.id === l.id);
                                      return found;
                                    })
                                    .filter(Boolean) as Landmark[]}
                                />
                              </div>
                            </div>

                            {/* Landmarks List */}
                            <div>
                              <h4 className="font-semibold mb-3">Itinerary Details</h4>
                              <div className="space-y-3">
                                {singleDayDetails.landmarks
                                  .sort((a, b) => a.order - b.order)
                                  .map((landmark, index) => (
                                    <div key={landmark.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                      <div className="flex-shrink-0">
                                        <Badge className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
                                          {landmark.order}
                                        </Badge>
                                      </div>
                                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                                        <img
                                          src={landmark.image}
                                          alt={landmark.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-grow">
                                        <h5 className="font-semibold">{landmark.name}</h5>
                                        <p className="text-sm text-gray-600">
                                          ~{landmark.duration} minutes visit
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Pricing Summary */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Pricing Summary</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Package Type:</span>
                                  <span className="font-semibold">
                                    {singleDayDetails.isFullPackage ? "Full Package Deal" : "Hourly Rate"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total Duration:</span>
                                  <span>{Math.ceil(singleDayDetails.totalTime / 60)} hours</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Price per person:</span>
                                  <span className="text-blue-600">₱{singleDayDetails.totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                  <span>Total ({bookingData.groupSize} people):</span>
                                  <span className="text-blue-600">₱{bookingData.totalPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : bookingData.bookingType === "tour" && tour ? (
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
                          alt={`${vehicle.type} rental`}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{vehicle.type}</h3>
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
                              {customizations.addOns && (
                                <div className="mt-3">
                                  <p className="font-semibold mb-2">Selected Add-ons:</p>
                                  <div className="space-y-1">
                                    {customizations.addOns.insurance && (
                                      <div className="flex items-center text-sm">
                                        <Check className="h-4 w-4 mr-2 text-blue-600" />
                                        Full Insurance Coverage (+₱500/day)
                                      </div>
                                    )}
                                    {customizations.addOns.gps && (
                                      <div className="flex items-center text-sm">
                                        <Check className="h-4 w-4 mr-2 text-blue-600" />
                                        GPS Navigation (+₱200/day)
                                      </div>
                                    )}
                                    {customizations.addOns.childSeat && (
                                      <div className="flex items-center text-sm">
                                        <Check className="h-4 w-4 mr-2 text-blue-600" />
                                        Child Safety Seat (+₱150/day)
                                      </div>
                                    )}
                                    {!customizations.addOns.insurance && !customizations.addOns.gps && !customizations.addOns.childSeat && (
                                      <p className="text-gray-500 text-sm">No add-ons selected</p>
                                    )}
                                  </div>
                                </div>
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
              {bookingData.specialRequests && !isCustomTour(bookingData) && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{bookingData.specialRequests}</p>
                  </CardContent>
                </Card>
              )}

              {/* For custom tours, extract and show only user-entered special requests */}
              {isCustomTour(bookingData) && bookingData.specialRequests && (
                (() => {
                  const match = bookingData.specialRequests.match(/Additional Notes: (.+)/);
                  const notes = match ? match[1].trim() : '';
                  if (notes && notes !== 'None') {
                    return (
                      <Card className="mt-8">
                        <CardHeader>
                          <CardTitle>Special Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{notes}</p>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                })()
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
