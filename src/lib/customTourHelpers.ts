import { ItineraryDetails, MultiDayItineraryDetails } from "@/types";
import type { Booking } from "@/services/bookingService";

/**
 * Type guard to check if a booking is a custom tour
 */
export function isCustomTour(booking: Booking): boolean {
  return booking.bookingType === "custom-tour";
}

/**
 * Parse itinerary details from booking data
 */
export function parseItineraryDetails(
  booking: Booking
): ItineraryDetails | MultiDayItineraryDetails | null {
  if (!isCustomTour(booking) || !booking.itineraryDetails) {
    return null;
  }

  try {
    return JSON.parse(booking.itineraryDetails) as
      | ItineraryDetails
      | MultiDayItineraryDetails;
  } catch (error) {
    console.error("Error parsing itinerary details:", error);
    return null;
  }
}

/**
 * Get the first landmark image for display purposes
 */
export function getFirstLandmarkImage(booking: Booking): string | null {
  const itineraryDetails = parseItineraryDetails(booking);
  if (!itineraryDetails) {
    return null;
  }
  // Multi-day
  if ((itineraryDetails as MultiDayItineraryDetails).days) {
    const md = itineraryDetails as MultiDayItineraryDetails;
    if (!md.days.length) return null;
    const day1 = md.days.find((d) => d.day === 1) || md.days[0];
    if (!day1.landmarks.length) return null;
    const sorted = [...day1.landmarks].sort((a, b) => a.order - b.order);
    return sorted[0].image;
  }
  // Single-day
  const sd = itineraryDetails as ItineraryDetails;
  if (!sd.landmarks.length) return null;
  const sortedLandmarks = [...sd.landmarks].sort((a, b) => a.order - b.order);
  return sortedLandmarks[0].image;
}

/**
 * Generate itinerary summary text for display
 */
export function getItinerarySummary(booking: Booking): string {
  const itineraryDetails = parseItineraryDetails(booking);
  if (!itineraryDetails) {
    return "Custom DIY Tour";
  }
  // Multi-day
  if ((itineraryDetails as MultiDayItineraryDetails).days) {
    const md = itineraryDetails as MultiDayItineraryDetails;
    const landmarkCount = md.days.reduce((sum, d) => sum + d.landmarks.length, 0);
    const hours = Math.ceil(md.days.reduce((sum, d) => sum + d.totalTime, 0) / 60);
    const dayLabel = md.duration === "2-days" ? "2-Day" : "1-Day";
    return `${dayLabel} • ${landmarkCount} landmark${landmarkCount !== 1 ? 's' : ''} • ${hours}h total`;
  }
  // Single-day
  const sd = itineraryDetails as ItineraryDetails;
  const landmarkCount = sd.landmarks.length;
  const hours = Math.ceil(sd.totalTime / 60);
  return `${landmarkCount} landmark${landmarkCount > 1 ? 's' : ''} • ${hours}h tour`;
}

/**
 * Get landmark names for display (first 3 + "and X more...")
 */
export function getLandmarkNames(booking: Booking, maxDisplay: number = 3): string {
  const itineraryDetails = parseItineraryDetails(booking);
  if (!itineraryDetails) {
    return "Custom DIY Tour";
  }
  let names: string[] = [];
  if ((itineraryDetails as MultiDayItineraryDetails).days) {
    const md = itineraryDetails as MultiDayItineraryDetails;
    names = md.days
      .flatMap((d) => d.landmarks)
      .sort((a, b) => a.order - b.order)
      .map((l) => l.name);
  } else {
    const sd = itineraryDetails as ItineraryDetails;
    names = [...sd.landmarks]
      .sort((a, b) => a.order - b.order)
      .map((l) => l.name);
  }
  
  if (names.length <= maxDisplay) {
    return names.join(", ");
  }
  
  const displayedNames = names.slice(0, maxDisplay);
  const remainingCount = names.length - maxDisplay;
  
  return `${displayedNames.join(", ")} and ${remainingCount} more`;
}

/**
 * Format tour duration for display
 */
export function formatTourDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Get pricing breakdown text for custom tours
 */
export function getPricingBreakdownText(booking: Booking): string {
  const itineraryDetails = parseItineraryDetails(booking);
  if (!itineraryDetails) {
    return "";
  }
  // Multi-day
  if ((itineraryDetails as MultiDayItineraryDetails).days) {
    const md = itineraryDetails as MultiDayItineraryDetails;
    if (md.duration === "2-days" && md.isFullPackage) return "2-Day Full Package";
    // Build per-day breakdown
    const hoursDay1 = Math.ceil((md.days[0]?.totalTime || 0) / 60);
    const hoursDay2 = Math.ceil((md.days[1]?.totalTime || 0) / 60);
    if (md.duration === "2-days" && md.days.length === 2) {
      return `Day 1: ${hoursDay1}h • Day 2: ${hoursDay2}h`;
    }
    return `Day 1: ${hoursDay1}h`;
  }
  // Single-day
  const sd = itineraryDetails as ItineraryDetails;
  if (sd.isFullPackage) {
    return "Full Package Deal";
  }
  const hours = Math.ceil(sd.totalTime / 60);
  if (hours <= 3) {
    return "Base Rate (3h)";
  }
  const additionalHours = hours - 3;
  return `Base 3h + ${additionalHours}h additional`;
}

/**
 * Check if booking has valid itinerary details
 */
export function hasValidItinerary(booking: Booking): boolean {
  const itineraryDetails = parseItineraryDetails(booking);
  if (!itineraryDetails) return false;
  if ((itineraryDetails as MultiDayItineraryDetails).days) {
    const md = itineraryDetails as MultiDayItineraryDetails;
    return Array.isArray(md.days) && md.days.some((d) => Array.isArray(d.landmarks) && d.landmarks.length > 0);
  }
  const sd = itineraryDetails as ItineraryDetails;
  return Array.isArray(sd.landmarks) && sd.landmarks.length > 0;
}

