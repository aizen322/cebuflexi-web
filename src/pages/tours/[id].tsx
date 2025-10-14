
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Users, MapPin, Check, Calendar as CalendarIcon, Mail, Phone, User } from "lucide-react";
import { allTours } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking, Booking, checkUserPendingBookings } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";
import { BookingValidationDialog } from "@/components/Tours/BookingValidationDialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function TourDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const tour = allTours.find(t => t.id === id);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    groupSize: 2,
    specialRequests: "",
    addOns: [] as string[],
    bookingType: "self" as "self" | "guest",
    guestName: "",
    guestEmail: "",
    guestPhone: ""
  });
  const [isBooking, setIsBooking] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);

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

  if (!tour) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Tour Not Found</h1>
            <Button onClick={() => router.push("/tours")}>Browse Tours</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a tour.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for your tour.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.phone) {
      toast({
        title: "Phone Required",
        description: "Please provide a contact phone number.",
        variant: "destructive",
      });
      return;
    }

    if (bookingData.bookingType === "guest") {
      if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
        toast({
          title: "Guest Information Required",
          description: "Please provide all guest details when booking for someone else.",
          variant: "destructive",
        });
        return;
      }
    }

    // Check for existing bookings first
    try {
      const existingBookings = await checkUserPendingBookings(user.uid);
      if (existingBookings.hasPending || existingBookings.hasConfirmed) {
        setValidationData(existingBookings);
        setShowValidationDialog(true);
        return;
      }
    } catch (error) {
      console.error("Error checking existing bookings:", error);
      // Continue with booking if check fails
    }

    await proceedWithBooking();
  };

  const proceedWithBooking = async () => {
    if (!user || !selectedDate) return;

    setIsBooking(true);

    try {
      const booking: Omit<Booking, "id" | "createdAt"> = {
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
        tourId: tour.id,
        bookingType: "tour",
        startDate: selectedDate,
        endDate: selectedDate, // For tours, start and end are the same day
        groupSize: bookingData.groupSize,
        totalPrice: tour.price * bookingData.groupSize,
        status: "pending",
        specialRequests: bookingData.specialRequests,
        contactPhone: bookingData.phone,
        ...(bookingData.bookingType === "guest" && {
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
        }),
      };

      const bookingId = await createBooking(booking);
      
      toast({
        title: "Booking Confirmed!",
        description: `Your tour booking has been submitted. Booking ID: ${bookingId}`,
      });

      // Reset form
      setBookingData({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
        groupSize: 2,
        specialRequests: "",
        addOns: [],
        bookingType: "self",
        guestName: "",
        guestEmail: "",
        guestPhone: ""
      });
      setSelectedDate(undefined);

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
        <title>{tour.title} | Cebu Tours - CebuFlexi Tours</title>
        <meta name="description" content={tour.description} />
        <meta name="keywords" content={`${tour.title}, ${tour.category} tour Cebu, Cebu adventure, Philippines tours`} />
        <link rel="canonical" href={`https://cebuflexitours.com/tours/${tour.id}`} />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen">
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                    <img
                      src={tour.images[selectedImage]}
                      alt={`${tour.title} - Image ${selectedImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {tour.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative h-24 rounded-lg overflow-hidden ${selectedImage === idx ? "ring-2 ring-blue-600" : ""}`}
                      >
                        <img src={img} alt={`${tour.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-blue-600">{tour.category}</Badge>
                    {tour.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                  </div>

                  <h1 className="text-4xl font-bold mb-4">{tour.title}</h1>
                  <p className="text-lg text-gray-700 mb-6">{tour.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-semibold">{tour.duration} {tour.duration === 1 ? "Day" : "Days"}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Group Size</p>
                        <p className="font-semibold">{tour.groupSize.min}-{tour.groupSize.max}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold">{tour.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="itinerary" className="bg-white rounded-lg p-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                    <TabsTrigger value="inclusions">What's Included</TabsTrigger>
                  </TabsList>
                  <TabsContent value="itinerary" className="mt-6">
                    <div className="space-y-6">
                      {tour.itinerary.map((day) => (
                        <div key={day.day} className="border-l-4 border-blue-600 pl-4">
                          <h3 className="text-xl font-bold mb-2">Day {day.day}: {day.title}</h3>
                          <ul className="space-y-2">
                            {day.activities.map((activity, idx) => (
                              <li key={idx} className="flex items-start">
                                <Check className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                          {day.meals.length > 0 && (
                            <p className="mt-3 text-sm text-gray-600">
                              <strong>Meals:</strong> {day.meals.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="inclusions" className="mt-6">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tour.inclusions.map((inclusion, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-24" id="book">
                  <CardHeader>
                    <CardTitle>Book This Tour</CardTitle>
                    <div className="text-3xl font-bold text-blue-600">
                      ₱{tour.price.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal ml-2">per person</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!user && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Sign in required:</strong> Please sign in to book this tour.
                        </p>
                      </div>
                    )}
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Booking Type</Label>
                        <RadioGroup 
                          value={bookingData.bookingType} 
                          onValueChange={(value: "self" | "guest") => setBookingData({...bookingData, bookingType: value})}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self" id="self" />
                            <Label htmlFor="self" className="cursor-pointer">Book for yourself</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="guest" id="guest" />
                            <Label htmlFor="guest" className="cursor-pointer">Book for someone else</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="name">{bookingData.bookingType === "self" ? "Your Full Name" : "Your Name (Booker)"} *</Label>
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
                        <Label htmlFor="email">{bookingData.bookingType === "self" ? "Your Email" : "Your Email (Booker)"} *</Label>
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

                      {bookingData.bookingType === "guest" && (
                        <>
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Guest Information</h4>
                          </div>
                          
                          <div>
                            <Label htmlFor="guestName">Guest Full Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="guestName"
                                required
                                value={bookingData.guestName}
                                onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                                className="pl-10"
                                placeholder="Guest Name"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="guestEmail">Guest Email *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="guestEmail"
                                type="email"
                                required
                                value={bookingData.guestEmail}
                                onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                                className="pl-10"
                                placeholder="guest@example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="guestPhone">Guest Phone *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="guestPhone"
                                type="tel"
                                required
                                value={bookingData.guestPhone}
                                onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                                className="pl-10"
                                placeholder="+63 912 345 6789"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <Label htmlFor="phone">{bookingData.bookingType === "self" ? "Your Phone" : "Your Phone (Booker)"} *</Label>
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
                        <Label htmlFor="groupSize">Number of People *</Label>
                        <Input
                          id="groupSize"
                          type="number"
                          min={tour.groupSize.min}
                          max={tour.groupSize.max}
                          required
                          value={bookingData.groupSize}
                          onChange={(e) => setBookingData({...bookingData, groupSize: Number(e.target.value)})}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Min: {tour.groupSize.min}, Max: {tour.groupSize.max}
                        </p>
                      </div>

                      <div>
                        <Label>Select Date *</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="requests">Special Requests</Label>
                        <Textarea
                          id="requests"
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                          placeholder="Dietary restrictions, accessibility needs, etc."
                          rows={3}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between mb-2">
                          <span>Price per person:</span>
                          <span>₱{tour.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Number of people:</span>
                          <span>× {bookingData.groupSize}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span className="text-blue-600">₱{(tour.price * bookingData.groupSize).toLocaleString()}</span>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        size="lg"
                        disabled={isBooking || authLoading}
                      >
                        {isBooking ? "Processing..." : "Book Now"}
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

      <BookingValidationDialog
        isOpen={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        onProceed={() => {
          setShowValidationDialog(false);
          proceedWithBooking();
        }}
        hasPending={validationData?.hasPending || false}
        hasConfirmed={validationData?.hasConfirmed || false}
        pendingCount={validationData?.pendingCount || 0}
        confirmedCount={validationData?.confirmedCount || 0}
        bookings={validationData?.bookings || []}
      />
    </>
  );
}
