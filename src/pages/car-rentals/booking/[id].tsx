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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Phone, 
  User,
  Clock,
  MapPin
} from "lucide-react";
import { vehicles } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking, Booking } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";

export default function CarRentalBookingPage() {
  const router = useRouter();
  const { id } = router.query;
  const vehicle = vehicles.find(v => v.id === id);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(undefined);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
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
        customizations: JSON.stringify({
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation,
          addOns: bookingData.addOns,
          rentalDays: rentalDays,
        }),
      };

      const bookingId = await createBooking(booking);
      
      toast({
        title: "Booking Confirmed!",
        description: `Your vehicle rental has been submitted. Booking ID: ${bookingId}`,
      });

      // Reset form
      setSelectedDates(undefined);
      setBookingData({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
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
                              <Check className="h-4 w-4 mr-2 text-green-600" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        {vehicle.withDriver && (
                          <Badge className="mt-4 bg-green-600">Driver Available</Badge>
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
                    <div className="text-3xl font-bold text-green-600">
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
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={bookingData.phone}
                            onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                            className="pl-10"
                            placeholder="+63 912 345 6789"
                          />
                        </div>
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
                        <Label>Rental Period *</Label>
                        <Calendar
                          mode="range"
                          selected={selectedDates}
                          onSelect={setSelectedDates}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
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
                          <span className="text-green-600">₱{calculateTotalPrice().toLocaleString()}</span>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700" 
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