import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhoneInput } from "@/components/ui/phone-input";
import { Mail, User, ArrowLeft } from "lucide-react";
import { cebuLandmarks, mountainLandmarks } from "@/lib/mockData";
import { Landmark, TourType, TourDuration, MultiDayItineraryDetails } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking, Booking, checkUserPendingBookings } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";
import { BookingValidationDialog } from "@/components/Tours/BookingValidationDialog";
import { calculateTotalTime } from "@/lib/distanceCalculator";
import { calculatePrice, calculateMultiDayPrice } from "@/lib/pricingCalculator";
import { ItineraryDetails } from "@/types";
import { ItineraryMap } from "@/components/CustomItinerary/ItineraryMap";
import { LandmarkSelector } from "@/components/CustomItinerary/LandmarkSelector";
import { SelectedLandmarks } from "@/components/CustomItinerary/SelectedLandmarks";
import { ItinerarySummary } from "@/components/CustomItinerary/ItinerarySummary";
import { MultiDayItinerarySummary } from "@/components/CustomItinerary/MultiDayItinerarySummary";
import { TourSelectionStep } from "@/components/CustomItinerary/TourSelectionStep";
import { DayTabs } from "@/components/CustomItinerary/DayTabs";

export default function CustomItineraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Step-based flow state
  const [currentStep, setCurrentStep] = useState<"duration" | "tour-type" | "itinerary">("duration");
  const [tourDuration, setTourDuration] = useState<TourDuration | null>(null);
  const [day1TourType, setDay1TourType] = useState<TourType | null>(null);
  const [day2TourType, setDay2TourType] = useState<TourType | null>(null);
  const [currentDay, setCurrentDay] = useState<1 | 2>(1);

  // Per-day selections
  const [day1Landmarks, setDay1Landmarks] = useState<Landmark[]>([]);
  const [day2Landmarks, setDay2Landmarks] = useState<Landmark[]>([]);

  const [selectedLandmarks, setSelectedLandmarks] = useState<Landmark[]>([]);
  const [isFullPackage, setIsFullPackage] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "PH",
    groupSize: 1,
    specialRequests: "",
    bookingType: "self" as "self" | "guest",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestPhoneCountryCode: "PH"
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

  // Sync selectedLandmarks view with current day
  useEffect(() => {
    if (tourDuration === "2-days") {
      setSelectedLandmarks(currentDay === 1 ? day1Landmarks : day2Landmarks);
    }
  }, [currentDay]);

  const handleToggleLandmark = (landmark: Landmark) => {
    // Determine target day list
    if (tourDuration === "2-days") {
      if (currentDay === 1) {
        setDay1Landmarks(prev => {
          const exists = prev.some(l => l.id === landmark.id);
          const next = exists ? prev.filter(l => l.id !== landmark.id) : [...prev, landmark];
          setSelectedLandmarks(next);
          const available = day1TourType === "mountain" ? mountainLandmarks.length : cebuLandmarks.length;
          // Auto apply full package per-day when all are selected
          // Note: single-day is controlled by isFullPackage; per-day full-package only affects pricing via combined calc
          // We won't mutate global isFullPackage here; pricing uses combined function
          // But we may want to reflect UI toggle if all selected in single-day mode only
          return next;
        });
      } else {
        setDay2Landmarks(prev => {
          const exists = prev.some(l => l.id === landmark.id);
          const next = exists ? prev.filter(l => l.id !== landmark.id) : [...prev, landmark];
          setSelectedLandmarks(next);
          const available = day2TourType === "mountain" ? mountainLandmarks.length : cebuLandmarks.length;
          return next;
        });
      }
    } else {
      setSelectedLandmarks(prev => {
        const isSelected = prev.some(l => l.id === landmark.id);
        if (isSelected) {
          const filtered = prev.filter(l => l.id !== landmark.id);
          if (isFullPackage && filtered.length < cebuLandmarks.length) {
            setIsFullPackage(false);
          }
          return filtered;
        } else {
          const updated = [...prev, landmark];
          if (updated.length === cebuLandmarks.length) {
            setIsFullPackage(true);
          }
          return updated;
        }
      });
    }
  };

  const handleSelectAll = () => {
    if (tourDuration === "2-days") {
      const source = currentDay === 1 ? (day1TourType === "mountain" ? mountainLandmarks : cebuLandmarks) : (day2TourType === "mountain" ? mountainLandmarks : cebuLandmarks);
      const list = [...source];
      if (currentDay === 1) setDay1Landmarks(list);
      else setDay2Landmarks(list);
      setSelectedLandmarks(list);
      setIsFullPackage(false); // full package applies to single-day selection
      return;
    }
    if (isFullPackage) {
      setSelectedLandmarks([]);
      setIsFullPackage(false);
    } else {
      // For single-day, select all landmarks based on selected tour type
      const source = day1TourType === "mountain" ? mountainLandmarks : cebuLandmarks;
      setSelectedLandmarks([...source]);
      setIsFullPackage(true);
    }
  };

  const handleReorder = (reorderedLandmarks: Landmark[]) => {
    if (tourDuration === "2-days") {
      if (currentDay === 1) setDay1Landmarks(reorderedLandmarks);
      else setDay2Landmarks(reorderedLandmarks);
    }
    setSelectedLandmarks(reorderedLandmarks);
  };

  const handleRemoveLandmark = (landmark: Landmark) => {
    if (tourDuration === "2-days") {
      if (currentDay === 1) setDay1Landmarks(prev => prev.filter(l => l.id !== landmark.id));
      else setDay2Landmarks(prev => prev.filter(l => l.id !== landmark.id));
    }
    setSelectedLandmarks(prev => prev.filter(l => l.id !== landmark.id));
    if (isFullPackage) setIsFullPackage(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a custom itinerary.",
        variant: "destructive",
      });
      return;
    }

    if (selectedLandmarks.length === 0) {
      toast({
        title: "No Landmarks Selected",
        description: "Please select at least one landmark for your custom itinerary.",
        variant: "destructive",
      });
      return;
    }

    // 2-Day Tour Validation
    if (tourDuration === "2-days") {
      if (day1Landmarks.length === 0 || day2Landmarks.length === 0) {
        const missingDay = day1Landmarks.length === 0 ? "Day 1" : "Day 2";
        toast({
          title: "Incomplete Itinerary",
          description: `Please select at least one landmark for ${missingDay} before booking.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for your tour.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import validation and security utilities
      const { tourBookingSchema, validateForm } = await import('@/lib/validation');
      const { sanitizeUserInput } = await import('@/lib/security');

      // Prepare data for validation
      const formattedBookingData = {
        ...bookingData,
        groupSize: Number(bookingData.groupSize),
      };

      // Validate booking data
      const validation = validateForm(tourBookingSchema, formattedBookingData);

      if (!validation.success) {
        const errorMessages = Object.entries(validation.errors || {}).map(([field, message]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
          return `${fieldName}: ${message}`;
        });

        toast({
          title: "Validation Error",
          description: errorMessages.join(". "),
          variant: "destructive",
        });
        return;
      }

      // Sanitize validated data
      const sanitizedData = {
        ...validation.data,
        name: sanitizeUserInput(validation.data.name, 'text'),
        email: sanitizeUserInput(validation.data.email, 'email'),
        phone: sanitizeUserInput(validation.data.phone, 'phone'),
        specialRequests: validation.data.specialRequests ? sanitizeUserInput(validation.data.specialRequests, 'text') : '',
        guestName: validation.data.guestName ? sanitizeUserInput(validation.data.guestName, 'text') : '',
        guestEmail: validation.data.guestEmail ? sanitizeUserInput(validation.data.guestEmail, 'email') : '',
        guestPhone: validation.data.guestPhone ? sanitizeUserInput(validation.data.guestPhone, 'phone') : '',
      };

      setBookingData(prev => ({
        ...prev,
        ...sanitizedData,
        groupSize: Number(sanitizedData.groupSize),
      }));

      // Check for existing bookings
      const existingBookings = await checkUserPendingBookings(user.uid);
      if (existingBookings.hasPending || existingBookings.hasConfirmed) {
        setValidationData(existingBookings);
        setShowValidationDialog(true);
        return;
      }

      await proceedWithBooking();
    } catch (error) {
      console.error("Error validating booking:", error);
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const proceedWithBooking = async () => {
    if (!user || !selectedDate) return;

    setIsBooking(true);

    try {
      // Single-day vs Multi-day
      const isTwoDays = tourDuration === "2-days";
      const day1Minutes = calculateTotalTime(day1Landmarks);
      const day2Minutes = calculateTotalTime(day2Landmarks);
      const singleTotalTime = calculateTotalTime(selectedLandmarks);
      const singleTotalPrice = calculatePrice(singleTotalTime, isFullPackage);

      let itineraryDetailsPayload: any;
      if (isTwoDays && day1TourType && day2TourType) {
        const dayPlan = (day: 1 | 2, tourType: TourType, list: Landmark[], minutes: number) => ({
          day,
          tourType,
          landmarks: list.map((l, idx) => ({
            id: l.id,
            name: l.name,
            image: l.image,
            duration: l.estimatedDuration,
            order: idx + 1,
          })),
          totalTime: minutes,
        });

        const details: MultiDayItineraryDetails = {
          duration: "2-days",
          days: [
            dayPlan(1, day1TourType, day1Landmarks, day1Minutes),
            dayPlan(2, day2TourType, day2Landmarks, day2Minutes),
          ],
          totalPrice: calculateMultiDayPrice(day1Minutes, day2Minutes, false),
          isFullPackage: false,
        };
        itineraryDetailsPayload = details;
      } else {
        const itineraryDetails: ItineraryDetails = {
          landmarks: selectedLandmarks.map((landmark, index) => ({
            id: landmark.id,
            name: landmark.name,
            image: landmark.image,
            duration: landmark.estimatedDuration,
            order: index + 1
          })),
          totalTime: singleTotalTime,
          totalPrice: singleTotalPrice,
          isFullPackage
        };
        itineraryDetailsPayload = itineraryDetails;
      }

      // Create itinerary details for special requests (legacy format)
      const itineraryDetailsText = (() => {
        if (isTwoDays) {
          return `Custom DIY Tour - 2 days\n` +
            `Day 1: ${day1Landmarks.length} landmarks, ${Math.ceil(day1Minutes / 60)}h\n` +
            `Day 2: ${day2Landmarks.length} landmarks, ${Math.ceil(day2Minutes / 60)}h\n` +
            `Additional Notes: ${bookingData.specialRequests || 'None'}`;
        }
        return `Custom DIY Tour - ${selectedLandmarks.length} landmarks\n` +
          `Full Package: ${isFullPackage ? 'Yes' : 'No'}\n` +
          `Total Duration: ${Math.ceil(singleTotalTime / 60)} hours\n` +
          `Landmarks: ${selectedLandmarks.map((l, i) => `\n${i + 1}. ${l.name}`).join('')}\n\n` +
          `Additional Notes: ${bookingData.specialRequests || 'None'}`;
      })();

      const booking: Omit<Booking, "id" | "createdAt"> = {
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
        tourId: "custom-itinerary",
        bookingType: "custom-tour",
        startDate: selectedDate,
        endDate: selectedDate,
        groupSize: bookingData.groupSize,
        totalPrice: (isTwoDays
          ? calculateMultiDayPrice(day1Minutes, day2Minutes, false)
          : singleTotalPrice) * bookingData.groupSize,
        status: "pending",
        specialRequests: itineraryDetailsText,
        itineraryDetails: JSON.stringify(itineraryDetailsPayload),
        contactPhone: bookingData.phone,
        phoneCountryCode: bookingData.phoneCountryCode,
        customizations: JSON.stringify({
          landmarks: selectedLandmarks.map(l => l.id),
          isFullPackage,
          totalTime
        }),
        ...(bookingData.bookingType === "guest" && {
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          guestPhoneCountryCode: bookingData.guestPhoneCountryCode,
        }),
      };

      const bookingId = await createBooking(booking);

      // Redirect to confirmation page
      router.push(`/booking-confirmation/${bookingId}`);

      // Reset form
      setBookingData({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
        phoneCountryCode: "PH",
        groupSize: 1,
        specialRequests: "",
        bookingType: "self",
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        guestPhoneCountryCode: "PH"
      });
      setSelectedDate(undefined);
      setSelectedLandmarks([]);
      setIsFullPackage(false);

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

  // Totals
  const totalTime = calculateTotalTime(selectedLandmarks);
  const totalPrice = calculatePrice(totalTime, isFullPackage);
  const day1Time = calculateTotalTime(day1Landmarks);
  const day2Time = calculateTotalTime(day2Landmarks);

  return (
    <>
      <Head>
        <title>Create Custom Itinerary - DIY Tour | CebuFlexi Tours</title>
        <meta name="description" content="Build your perfect Cebu city tour. Choose from iconic landmarks and create a personalized itinerary with transparent pricing." />
        <meta name="keywords" content="custom Cebu tour, DIY Cebu itinerary, personalized tour Cebu, Cebu landmarks" />
        <link rel="canonical" href="https://cebuflexitours.com/custom-itinerary" />
      </Head>

      <Header />

      <main className="pt-20 min-h-screen bg-gray-50">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-3">Build Your Custom Tour</h1>
              <p className="text-lg text-gray-600">
                Choose your tour type and duration, customize each day, and book your perfect Cebu experience
              </p>
            </div>

            {currentStep !== "itinerary" && (
              <div className="bg-white rounded-lg p-6 mb-8">
                <TourSelectionStep
                  step={currentStep === "duration" ? "duration" : "tour-type"}
                  tourDuration={tourDuration}
                  day1TourType={day1TourType}
                  day2TourType={day2TourType}
                  onDurationSelect={(d) => {
                    setTourDuration(d);
                    setCurrentStep("tour-type");
                  }}
                  onDay1TourTypeSelect={(t) => setDay1TourType(t)}
                  onDay2TourTypeSelect={(t) => setDay2TourType(t)}
                  onContinue={() => setCurrentStep("itinerary")}
                  onBack={() => setCurrentStep("duration")}
                />
              </div>
            )}

            {/* Removed redundant change selection summary bar */}

            {/* Back to Tour Selection Button */}
            {currentStep === "itinerary" && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("duration");
                    // Reset selections
                    setTourDuration(null);
                    setDay1TourType(null);
                    setDay2TourType(null);
                    setDay1Landmarks([]);
                    setDay2Landmarks([]);
                    setSelectedLandmarks([]);
                    setIsFullPackage(false);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tour Selection
                </Button>
              </div>
            )}

            {/* Conditional Content - Only show when in itinerary step */}
            {currentStep === "itinerary" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Tour Builder */}
              <div className="lg:col-span-2 space-y-8">
                {currentStep === "itinerary" && tourDuration === "2-days" && day1TourType && day2TourType && (
                  <div className="bg-white rounded-lg p-4">
                    <DayTabs
                      currentDay={currentDay}
                      day1TourType={day1TourType}
                      day2TourType={day2TourType}
                      day1LandmarkCount={day1Landmarks.length}
                      day2LandmarkCount={day2Landmarks.length}
                      onDayChange={setCurrentDay}
                    />
                  </div>
                )}
                {/* Interactive Map */}
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Interactive Route Map</h2>
                  {tourDuration === "1-day" && day1TourType ? (
                    <ItineraryMap
                      landmarks={day1TourType === "mountain" ? mountainLandmarks : cebuLandmarks}
                      selectedLandmarks={selectedLandmarks}
                    />
                  ) : tourDuration === "2-days" ? (
                    <ItineraryMap
                      landmarks={
                        currentDay === 1 
                          ? (day1TourType === "mountain" ? mountainLandmarks : cebuLandmarks)
                          : (day2TourType === "mountain" ? mountainLandmarks : cebuLandmarks)
                      }
                      selectedLandmarks={selectedLandmarks}
                      markerColor={currentDay === 1 ? "blue" : "green"}
                    />
                  ) : null}
                </div>

                {/* Landmark Selector */}
                <div className="bg-white rounded-lg p-6">
                  {tourDuration === "1-day" && day1TourType ? (
                    <LandmarkSelector
                      landmarks={day1TourType === "mountain" ? mountainLandmarks : cebuLandmarks}
                      selectedLandmarks={selectedLandmarks}
                      onToggleLandmark={handleToggleLandmark}
                      onSelectAll={handleSelectAll}
                      isAllSelected={isFullPackage}
                      tourType={day1TourType}
                    />
                  ) : tourDuration === "2-days" ? (
                    <LandmarkSelector
                      landmarks={
                        currentDay === 1 
                          ? (day1TourType === "mountain" ? mountainLandmarks : cebuLandmarks)
                          : (day2TourType === "mountain" ? mountainLandmarks : cebuLandmarks)
                      }
                      selectedLandmarks={selectedLandmarks}
                      onToggleLandmark={handleToggleLandmark}
                      onSelectAll={handleSelectAll}
                      isAllSelected={false}
                      tourType={currentDay === 1 ? day1TourType! : day2TourType!}
                    />
                  ) : null}
                </div>

                {/* Selected Landmarks with Drag & Drop */}
                <div className="bg-white rounded-lg p-6">
                  <SelectedLandmarks
                    selectedLandmarks={selectedLandmarks}
                    onReorder={handleReorder}
                    onRemove={handleRemoveLandmark}
                  />
                </div>
              </div>

              {/* Right Column - Booking Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Summary */}
                  {tourDuration === "2-days" ? (
                    <MultiDayItinerarySummary
                      day1={{ landmarks: day1Landmarks, minutes: day1Time, isFullPackage: false }}
                      day2={{ landmarks: day2Landmarks, minutes: day2Time, isFullPackage: false }}
                      groupSize={bookingData.groupSize}
                    />
                  ) : (
                    <ItinerarySummary
                      selectedLandmarks={selectedLandmarks}
                      isFullPackage={isFullPackage}
                    />
                  )}

                  {/* Booking Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Book Your Custom Tour</CardTitle>
                      {((tourDuration === "2-days" && (day1Landmarks.length > 0 || day2Landmarks.length > 0)) || (tourDuration !== "2-days" && selectedLandmarks.length > 0)) && (
                        <div className="text-3xl font-bold text-blue-600">
                          ₱{((tourDuration === "2-days" 
                            ? calculateMultiDayPrice(day1Time, day2Time, isFullPackage)
                            : totalPrice) * bookingData.groupSize).toLocaleString()}
                          <span className="text-sm text-gray-500 font-normal ml-2">
                            total for {bookingData.groupSize} {bookingData.groupSize === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {!user && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Sign in required:</strong> Please sign in to book your custom tour.
                          </p>
                        </div>
                      )}

                      {(tourDuration !== "2-days" && selectedLandmarks.length === 0) && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Get started:</strong> Select landmarks above to begin building your itinerary.
                          </p>
                        </div>
                      )}

                      {/* 2-Day Validation Warning */}
                      {tourDuration === "2-days" && (day1Landmarks.length === 0 || day2Landmarks.length === 0) && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>⚠️ Action Required:</strong> Please select landmarks for both Day 1 and Day 2 to proceed with booking.
                          </p>
                        </div>
                      )}

                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div>
                          <Label className="text-base font-semibold mb-3 block">Booking Type</Label>
                          <RadioGroup
                            value={bookingData.bookingType}
                            onValueChange={(value: "self" | "guest") => setBookingData({ ...bookingData, bookingType: value })}
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
                              onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
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
                              onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
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
                                  onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
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
                                  onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                                  className="pl-10"
                                  placeholder="guest@example.com"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="guestPhone">Guest Phone *</Label>
                              <PhoneInput
                                id="guestPhone"
                                value={bookingData.guestPhone}
                                onChange={(phone, countryCode) => setBookingData({
                                  ...bookingData,
                                  guestPhone: phone,
                                  guestPhoneCountryCode: countryCode
                                })}
                                countryCode={bookingData.guestPhoneCountryCode}
                                required
                                placeholder="Enter guest phone number"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <Label htmlFor="phone">{bookingData.bookingType === "self" ? "Your Phone" : "Your Phone (Booker)"} *</Label>
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
                          <Label htmlFor="groupSize">Number of People *</Label>
                          <Input
                            id="groupSize"
                            type="number"
                            min={1}
                            max={20}
                            required
                            value={bookingData.groupSize}
                            onChange={(e) => setBookingData({ ...bookingData, groupSize: Number(e.target.value) })}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Max: 20 people
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
                            onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                            placeholder="Accessibility needs, dietary restrictions, specific timing requests, etc."
                            rows={3}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="lg"
                          disabled={isBooking || authLoading || (
                            tourDuration === "2-days" 
                              ? (day1Landmarks.length === 0 && day2Landmarks.length === 0)
                              : selectedLandmarks.length === 0
                          )}
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
            )}
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

