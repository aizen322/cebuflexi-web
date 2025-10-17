import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Car, 
  Users, 
  Fuel, 
  Settings, 
  Check, 
  Calendar as CalendarIcon, 
  Mail, 
  User,
  Clock,
  MapPin,
  ArrowLeft
} from "lucide-react";
import { vehicles } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking, Booking } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";

export default function CarRentalBookingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(undefined);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "PH",
    pickupLocation: "",
    dropoffLocation: "",
    specialRequests: "",
    addOns: {
      insurance: false,
      gps: false,
      childSeat: false,
    }
  });
  const [isBooking, setIsBooking] = useState(false);

  // Find vehicle only after router query is loaded
  const vehicle = router.isReady && id ? vehicles.find(v => v.id === id) : null;

  // Update form data when user is authenticated
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Show loading state while router is loading
  if (!router.isReady) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading vehicle details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Vehicle Not Found</h1>
            <Button onClick={() => router.push("/car-rentals")}>Browse Vehicles</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const calculateTotalPrice = () => {
    if (!selectedDates?.from || !selectedDates?.to) return 0;
    
    const days = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    let total = vehicle.pricePerDay * days;
    
    if (bookingData.addOns.insurance) total += 500 * days;
    if (bookingData.addOns.gps) total += 200 * days;
    if (bookingData.addOns.childSeat) total += 150 * days;
    
    return total;
  };

  const getRentalDays = () => {
    if (!selectedDates?.from || !selectedDates?.to) return 0;
    return Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a vehicle.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDates?.from || !selectedDates?.to) {
      toast({
        title: "Dates Required",
        description: "Please select pickup and dropoff dates.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.phone || !bookingData.pickupLocation) {
      toast({
        title: "Information Required",
        description: "Please provide phone number and pickup location.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const totalPrice = calculateTotalPrice();
      const rentalDays = getRentalDays();
      
      const booking: Omit<Booking, "id" | "createdAt"> = {
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
        vehicleId: vehicle.id,
        bookingType: "vehicle",
        startDate: selectedDates!.from!,
        endDate: selectedDates!.to!,
        groupSize: 1, // Vehicle booking is typically for 1 group
        totalPrice: totalPrice,
        status: "pending",
        specialRequests: bookingData.specialRequests,
        contactPhone: bookingData.phone,
        phoneCountryCode: bookingData.phoneCountryCode,
        customizations: JSON.stringify({
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation,
          addOns: bookingData.addOns,
          rentalDays: rentalDays,
        }),
      };

      const bookingId = await createBooking(booking);
      
      // Redirect to confirmation page instead of showing toast
      router.push(`/booking-confirmation/${bookingId}`);

      // Reset form
      setSelectedDates(undefined);
      setBookingData({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
        phoneCountryCode: "PH",
        pickupLocation: "",
        dropoffLocation: "",
        specialRequests: "",
        addOns: {
          insurance: false,
          gps: false,
          childSeat: false,
        }
      });

    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <Head>
        <title>Book {vehicle.name} | Car Rental - CebuFlexi Tours</title>
        <meta name="description" content={`Book ${vehicle.name} for your Cebu adventure. ${vehicle.type} rental with ${vehicle.capacity} seats.`} />
        <link rel="canonical" href={`https://cebuflexitours.com/car-rentals/booking/${vehicle.id}`} />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen bg-gray-50">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/car-rentals")}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Vehicles
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Vehicle Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <h1 className="text-3xl font-bold mb-2">{vehicle.name}</h1>
                        <Badge className="mb-4">{vehicle.type}</Badge>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">{vehicle.capacity} seats</span>
                          </div>
                          <div className="flex items-center">
                            <Settings className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">{vehicle.transmission}</span>
                          </div>
                          <div className="flex items-center">
                            <Fuel className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">{vehicle.fuelType}</span>
                          </div>
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">{vehicle.luggage} bags</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-semibold mb-2">Features:</h4>
                          {vehicle.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <Check className="h-4 w-4 mr-2 text-blue-600" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        {vehicle.withDriver && (
                          <Badge className="mt-4 bg-blue-600">Driver Available</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Book This Vehicle</CardTitle>
                    <div className="text-3xl font-bold text-blue-600">
                      ₱{vehicle.pricePerDay.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal ml-2">per day</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!user && (
                      <Alert className="mb-4">
                        <AlertDescription>
                          <strong>Sign in required:</strong> Please sign in to book this vehicle.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            required
                            value={bookingData.name}
                            onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                            className="pl-10"
                            placeholder="John Doe"
                            disabled={!!user}
                          />
                        </div>
                        {user && (
                          <p className="text-xs text-gray-500 mt-1">Pre-filled from your account</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            required
                            value={bookingData.email}
                            onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                            className="pl-10"
                            placeholder="john@example.com"
                            disabled={!!user}
                          />
                        </div>
                        {user && (
                          <p className="text-xs text-gray-500 mt-1">Pre-filled from your account</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <PhoneInput
                          id="phone"
                          value={bookingData.phone}
                          onChange={(phone, countryCode) => setBookingData({
                            ...bookingData, 
                            phone: phone,
                            phoneCountryCode: countryCode
                          })}
                          countryCode={bookingData.phoneCountryCode}
                          required
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pickup">Pickup Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="pickup"
                            required
                            value={bookingData.pickupLocation}
                            onChange={(e) => setBookingData({...bookingData, pickupLocation: e.target.value})}
                            className="pl-10"
                            placeholder="Cebu City or Airport"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="dropoff">Drop-off Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="dropoff"
                            value={bookingData.dropoffLocation}
                            onChange={(e) => setBookingData({...bookingData, dropoffLocation: e.target.value})}
                            className="pl-10"
                            placeholder="Same as pickup (if different)"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-2 block">Rental Period *</Label>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-start space-x-2">
                            <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">Select your rental dates</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Choose a <strong>start date</strong> and <strong>end date</strong> for your rental period
                              </p>
                            </div>
                          </div>
                          {selectedDates?.from && selectedDates?.to && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              {selectedDates.from.getTime() === selectedDates.to.getTime() ? (
                                // Same day rental - split color indicator
                                <div className="text-center">
                                  <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-100 to-orange-100 border-2 border-green-500 border-r-orange-500">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-sm font-medium text-gray-900">Same Day Rental</p>
                                      <p className="text-xs text-gray-600">{selectedDates.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                  </div>
                                  <p className="text-center text-xs text-blue-600 font-semibold mt-2">
                                    1 day rental
                                  </p>
                                </div>
                              ) : (
                                // Different dates - separate color indicators
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div>
                                      <p className="text-green-600 font-medium">Pickup</p>
                                      <p className="text-gray-900">{selectedDates.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                  </div>
                                  <Clock className="h-4 w-4 text-blue-400" />
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <div className="text-right">
                                      <p className="text-orange-600 font-medium">Return</p>
                                      <p className="text-gray-900">{selectedDates.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {selectedDates.from.getTime() !== selectedDates.to.getTime() && (
                                <p className="text-center text-xs text-blue-600 font-semibold mt-2">
                                  {getRentalDays()} {getRentalDays() === 1 ? 'day' : 'days'} rental
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <Calendar
                          mode="range"
                          selected={selectedDates}
                          onSelect={setSelectedDates}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                          classNames={{
                            day_range_start: "bg-green-500 text-white hover:bg-green-600 focus:bg-green-600",
                            day_range_end: "bg-orange-500 text-white hover:bg-orange-600 focus:bg-orange-600",
                            day_range_middle: "bg-blue-200 text-gray-700 hover:bg-gray-100",
                            day_selected: "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }}
                        />
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-3 block">Add-ons</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="insurance"
                                checked={bookingData.addOns.insurance}
                                onChange={(e) => setBookingData({
                                  ...bookingData, 
                                  addOns: {...bookingData.addOns, insurance: e.target.checked}
                                })}
                                className="rounded"
                              />
                              <Label htmlFor="insurance" className="cursor-pointer">
                                Full Insurance Coverage
                              </Label>
                            </div>
                            <span className="text-sm text-gray-600">+₱500/day</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="gps"
                                checked={bookingData.addOns.gps}
                                onChange={(e) => setBookingData({
                                  ...bookingData, 
                                  addOns: {...bookingData.addOns, gps: e.target.checked}
                                })}
                                className="rounded"
                              />
                              <Label htmlFor="gps" className="cursor-pointer">
                                GPS Navigation
                              </Label>
                            </div>
                            <span className="text-sm text-gray-600">+₱200/day</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="childSeat"
                                checked={bookingData.addOns.childSeat}
                                onChange={(e) => setBookingData({
                                  ...bookingData, 
                                  addOns: {...bookingData.addOns, childSeat: e.target.checked}
                                })}
                                className="rounded"
                              />
                              <Label htmlFor="childSeat" className="cursor-pointer">
                                Child Safety Seat
                              </Label>
                            </div>
                            <span className="text-sm text-gray-600">+₱150/day</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="requests">Special Requests</Label>
                        <Textarea
                          id="requests"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                          placeholder="Additional driver, specific pickup time, etc."
                          rows={3}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Base price:</span>
                            <span>₱{vehicle.pricePerDay.toLocaleString()}/day</span>
                          </div>
                          {selectedDates?.from && selectedDates?.to && (
                            <div className="flex justify-between">
                              <span>Days:</span>
                              <span>{getRentalDays()} days</span>
                            </div>
                          )}
                          {bookingData.addOns.insurance && selectedDates?.from && selectedDates?.to && (
                            <div className="flex justify-between">
                              <span>Insurance:</span>
                              <span>₱{(500 * getRentalDays()).toLocaleString()}</span>
                            </div>
                          )}
                          {bookingData.addOns.gps && selectedDates?.from && selectedDates?.to && (
                            <div className="flex justify-between">
                              <span>GPS:</span>
                              <span>₱{(200 * getRentalDays()).toLocaleString()}</span>
                            </div>
                          )}
                          {bookingData.addOns.childSeat && selectedDates?.from && selectedDates?.to && (
                            <div className="flex justify-between">
                              <span>Child Seat:</span>
                              <span>₱{(150 * getRentalDays()).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                          <span>Total:</span>
                          <span className="text-blue-600">₱{calculateTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        size="lg"
                        disabled={isBooking || authLoading}
                      >
                        {isBooking ? "Processing..." : "Book Vehicle"}
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        By booking, you agree to our terms and conditions
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}