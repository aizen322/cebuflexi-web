import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PhoneInput } from "@/components/ui/phone-input";
import { Mail, User } from "lucide-react";
import { Landmark } from "@/types";
import { ItineraryState } from "@/hooks/useItineraryState";
import { calculateMultiDayPrice } from "@/lib/pricingCalculator";
import { ItinerarySummary } from "./ItinerarySummary";
import { MultiDayItinerarySummary } from "./MultiDayItinerarySummary";

interface UserProfile {
  displayName?: string | null;
  email?: string | null;
}

interface BookingFormProps {
  state: ItineraryState;
  selectedLandmarks: Landmark[];
  day1Time: number;
  day2Time: number;
  totalPrice: number;
  user: UserProfile | null;
  authLoading: boolean;
  canBook: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isBooking: boolean;
}

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

export function BookingForm({
  state,
  selectedLandmarks,
  day1Time,
  day2Time,
  totalPrice,
  user,
  authLoading,
  canBook,
  onSubmit,
  isBooking,
}: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    phoneCountryCode: "PH",
    groupSize: 1,
    specialRequests: "",
    bookingType: "self",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestPhoneCountryCode: "PH",
  });

  return (
    <div className="sticky top-24 space-y-6">
      {/* Summary */}
      {state.tourDuration === "2-days" ? (
        <MultiDayItinerarySummary
          day1={{
            landmarks: state.day1Landmarks,
            minutes: day1Time,
            isFullPackage: false,
          }}
          day2={{
            landmarks: state.day2Landmarks,
            minutes: day2Time,
            isFullPackage: false,
          }}
          groupSize={bookingData.groupSize}
        />
      ) : (
        <ItinerarySummary
          selectedLandmarks={selectedLandmarks}
          isFullPackage={state.isFullPackage}
        />
      )}

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Book Your Custom Tour</CardTitle>
          {((state.tourDuration === "2-days" &&
            (state.day1Landmarks.length > 0 || state.day2Landmarks.length > 0)) ||
            (state.tourDuration !== "2-days" && selectedLandmarks.length > 0)) && (
            <div className="text-3xl font-bold text-blue-600">
              ₱
              {(
                (state.tourDuration === "2-days"
                  ? calculateMultiDayPrice(day1Time, day2Time, state.isFullPackage)
                  : totalPrice) * bookingData.groupSize
              ).toLocaleString()}
              <span className="text-sm text-gray-500 font-normal ml-2">
                total for {bookingData.groupSize}{" "}
                {bookingData.groupSize === 1 ? "person" : "people"}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!user && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Sign in required:</strong> Please sign in to book your
                custom tour.
              </p>
            </div>
          )}

          {state.tourDuration !== "2-days" && selectedLandmarks.length === 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Get started:</strong> Select landmarks above to begin
                building your itinerary.
              </p>
            </div>
          )}

          {/* 2-Day Validation Warning */}
          {state.tourDuration === "2-days" &&
            (state.day1Landmarks.length === 0 ||
              state.day2Landmarks.length === 0) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Action Required:</strong> Please select landmarks
                  for both Day 1 and Day 2 to proceed with booking.
                </p>
              </div>
            )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Booking Type
              </Label>
              <RadioGroup
                value={bookingData.bookingType}
                onValueChange={(value: "self" | "guest") =>
                  setBookingData({ ...bookingData, bookingType: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self" className="cursor-pointer">
                    Book for yourself
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guest" id="guest" />
                  <Label htmlFor="guest" className="cursor-pointer">
                    Book for someone else
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="name">
                {bookingData.bookingType === "self"
                  ? "Your Full Name"
                  : "Your Name (Booker)"}{" "}
                *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  required
                  value={bookingData.name}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, name: e.target.value })
                  }
                  className="pl-10"
                  placeholder="John Doe"
                  disabled={!!user}
                />
              </div>
              {user && (
                <p className="text-xs text-gray-500 mt-1">
                  Pre-filled from your account
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                {bookingData.bookingType === "self"
                  ? "Your Email"
                  : "Your Email (Booker)"}{" "}
                *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={bookingData.email}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, email: e.target.value })
                  }
                  className="pl-10"
                  placeholder="john@example.com"
                  disabled={!!user}
                />
              </div>
              {user && (
                <p className="text-xs text-gray-500 mt-1">
                  Pre-filled from your account
                </p>
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
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          guestName: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          guestEmail: e.target.value,
                        })
                      }
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
                    onChange={(phone, countryCode) =>
                      setBookingData({
                        ...bookingData,
                        guestPhone: phone,
                        guestPhoneCountryCode: countryCode,
                      })
                    }
                    countryCode={bookingData.guestPhoneCountryCode}
                    required
                    placeholder="Enter guest phone number"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="phone">
                {bookingData.bookingType === "self"
                  ? "Your Phone"
                  : "Your Phone (Booker)"}{" "}
                *
              </Label>
              <PhoneInput
                id="phone"
                value={bookingData.phone}
                onChange={(phone, countryCode) =>
                  setBookingData({
                    ...bookingData,
                    phone: phone,
                    phoneCountryCode: countryCode,
                  })
                }
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
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    groupSize: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">Max: 20 people</p>
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
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    specialRequests: e.target.value,
                  })
                }
                placeholder="Accessibility needs, dietary restrictions, specific timing requests, etc."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={isBooking || authLoading || !canBook}
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
  );
}

