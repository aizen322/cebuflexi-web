import { Landmark } from "@/types";

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate travel time between two landmarks
 * Assumes average 20 minutes travel time between locations
 * @param distance Distance in kilometers
 * @returns Travel time in minutes
 */
export function estimateTravelTime(distance: number): number {
  // Fixed average travel time of 20 minutes between landmarks
  // This accounts for city traffic and short distances
  return 20;
}

/**
 * Calculate total itinerary time including visits and travel
 * @param landmarks Array of selected landmarks in order
 * @returns Total time in minutes
 */
export function calculateTotalTime(landmarks: Landmark[]): number {
  if (landmarks.length === 0) return 0;
  
  // Sum up all visit durations
  const visitTime = landmarks.reduce((total, landmark) => {
    return total + landmark.estimatedDuration;
  }, 0);
  
  // Add travel time between landmarks (20 min between each)
  const travelTime = landmarks.length > 1 ? (landmarks.length - 1) * 20 : 0;
  
  return visitTime + travelTime;
}

/**
 * Format time in minutes to hours and minutes display
 * @param minutes Total minutes
 * @returns Formatted string like "3h 30m"
 */
export function formatTime(minutes: number): string {
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

