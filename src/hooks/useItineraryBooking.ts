import { useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "./use-toast";
import { createBooking, Booking, checkUserPendingBookings } from "@/services/bookingService";
import { Landmark, MultiDayItineraryDetails, ItineraryDetails, TourType } from "@/types";
import { calculateTotalTime } from "@/lib/distanceCalculator";
import { calculatePrice, calculateMultiDayPrice } from "@/lib/pricingCalculator";
import { ItineraryState } from "./useItineraryState";

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  groupSize: number;
  specialRequests: string;
  bookingType: "self" | "guest";
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestPhoneCountryCode: string;
}

interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

interface UseItineraryBookingProps {
  state: ItineraryState;
  selectedLandmarks: Landmark[];
  user: UserProfile | null;
}

export function useItineraryBooking({
  state,
  selectedLandmarks,
  user,
}: UseItineraryBookingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isBooking, setIsBooking] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState<unknown>(null);

  const validateAndSubmit = async (
    bookingData: BookingFormData,
    selectedDate: Date | undefined
  ) => {
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
    if (state.tourDuration === "2-days") {
      if (state.day1Landmarks.length === 0 || state.day2Landmarks.length === 0) {
        const missingDay = state.day1Landmarks.length === 0 ? "Day 1" : "Day 2";
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
      const { tourBookingSchema, validateForm } = await import("@/lib/validation");
      const { sanitizeUserInput } = await import("@/lib/security");

      // Prepare data for validation
      const formattedBookingData = {
        ...bookingData,
        groupSize: Number(bookingData.groupSize),
      };

      // Validate booking data
      const validation = validateForm(tourBookingSchema, formattedBookingData);

      if (!validation.success) {
        const errorMessages = Object.entries(validation.errors || {}).map(
          ([field, message]) => {
            const fieldName =
              field.charAt(0).toUpperCase() +
              field.slice(1).replace(/([A-Z])/g, " $1");
            return `${fieldName}: ${message}`;
          }
        );

        toast({
          title: "Validation Error",
          description: errorMessages.join(". "),
          variant: "destructive",
        });
        return;
      }

      // Sanitize validated data
      const sanitizedData: BookingFormData = {
        name: sanitizeUserInput(validation.data.name, "text"),
        email: sanitizeUserInput(validation.data.email, "email"),
        phone: sanitizeUserInput(validation.data.phone, "phone"),
        phoneCountryCode: bookingData.phoneCountryCode || "PH",
        groupSize: Number(validation.data.groupSize),
        specialRequests: validation.data.specialRequests
          ? sanitizeUserInput(validation.data.specialRequests, "text")
          : "",
        bookingType: validation.data.bookingType || "self",
        guestName: validation.data.guestName
          ? sanitizeUserInput(validation.data.guestName, "text")
          : "",
        guestEmail: validation.data.guestEmail
          ? sanitizeUserInput(validation.data.guestEmail, "email")
          : "",
        guestPhone: validation.data.guestPhone
          ? sanitizeUserInput(validation.data.guestPhone, "phone")
          : "",
        guestPhoneCountryCode: bookingData.guestPhoneCountryCode || "PH",
      };

      // Check for existing bookings
      const existingBookings = await checkUserPendingBookings(user.uid);
      if (existingBookings.hasPending || existingBookings.hasConfirmed) {
        setValidationData(existingBookings);
        setShowValidationDialog(true);
        return;
      }

      await proceedWithBooking(sanitizedData, selectedDate);
    } catch (error) {
      console.error("Error validating booking:", error);
      toast({
        title: "Validation Error",
        description:
          error instanceof Error ? error.message : "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const proceedWithBooking = async (
    bookingData: BookingFormData,
    selectedDate: Date
  ) => {
    if (!user || !selectedDate) return;

    setIsBooking(true);

    try {
      // Single-day vs Multi-day
      const isTwoDays = state.tourDuration === "2-days";
      const day1Minutes = calculateTotalTime(state.day1Landmarks);
      const day2Minutes = calculateTotalTime(state.day2Landmarks);
      const singleTotalTime = calculateTotalTime(selectedLandmarks);
      const singleTotalPrice = calculatePrice(singleTotalTime, state.isFullPackage);

      let itineraryDetailsPayload: MultiDayItineraryDetails | ItineraryDetails;
      if (isTwoDays && state.day1TourType && state.day2TourType) {
        const dayPlan = (
          day: 1 | 2,
          tourType: TourType,
          list: Landmark[],
          minutes: number
        ) => ({
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
            dayPlan(1, state.day1TourType, state.day1Landmarks, day1Minutes),
            dayPlan(2, state.day2TourType, state.day2Landmarks, day2Minutes),
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
            order: index + 1,
          })),
          totalTime: singleTotalTime,
          totalPrice: singleTotalPrice,
          isFullPackage: state.isFullPackage,
        };
        itineraryDetailsPayload = itineraryDetails;
      }

      const booking: Omit<Booking, "id" | "createdAt"> = {
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
        tourId: "custom-itinerary",
        bookingType: "custom-tour",
        startDate: selectedDate,
        endDate: selectedDate,
        groupSize: bookingData.groupSize,
        totalPrice:
          (isTwoDays
            ? calculateMultiDayPrice(day1Minutes, day2Minutes, false)
            : singleTotalPrice) * bookingData.groupSize,
        status: "pending",
        specialRequests: bookingData.specialRequests || "",
        itineraryDetails: JSON.stringify(itineraryDetailsPayload),
        contactPhone: bookingData.phone,
        phoneCountryCode: bookingData.phoneCountryCode,
        customizations: JSON.stringify({
          landmarks: selectedLandmarks.map((l) => l.id),
          isFullPackage: state.isFullPackage,
          totalTime: singleTotalTime,
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

  return {
    isBooking,
    showValidationDialog,
    validationData,
    setShowValidationDialog,
    validateAndSubmit,
    proceedWithBooking,
  };
}

