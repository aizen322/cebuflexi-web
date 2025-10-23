import { Landmark } from "@/types";

// Pricing constants
const BASE_RATE = 2000; // ₱2000 for first 3 hours
const BASE_HOURS = 3;
const HOURLY_RATE = 500; // ₱500 per additional hour
const FULL_PACKAGE_RATE = 4000; // ₱4000 for all landmarks (discounted)

/**
 * Calculate the price for a custom itinerary
 * @param totalMinutes Total duration in minutes
 * @param isFullPackage Whether the full package is selected
 * @returns Price in PHP
 */
export function calculatePrice(
  totalMinutes: number,
  isFullPackage: boolean
): number {
  // If full package, return flat rate
  if (isFullPackage) {
    return FULL_PACKAGE_RATE;
  }
  
  const totalHours = Math.ceil(totalMinutes / 60);
  
  // If within base hours, return base rate
  if (totalHours <= BASE_HOURS) {
    return BASE_RATE;
  }
  
  // Calculate additional hours beyond base
  const additionalHours = totalHours - BASE_HOURS;
  const additionalCost = additionalHours * HOURLY_RATE;
  
  return BASE_RATE + additionalCost;
}

/**
 * Get pricing breakdown for display
 * @param totalMinutes Total duration in minutes
 * @param isFullPackage Whether full package is selected
 * @param landmarkCount Number of selected landmarks
 * @returns Pricing breakdown object
 */
export function getPricingBreakdown(
  totalMinutes: number,
  isFullPackage: boolean,
  landmarkCount: number
) {
  const totalHours = Math.ceil(totalMinutes / 60);
  
  if (isFullPackage) {
    return {
      type: "full-package",
      baseRate: 0,
      additionalHours: 0,
      additionalCost: 0,
      totalPrice: FULL_PACKAGE_RATE,
      savings: calculatePrice(totalMinutes, false) - FULL_PACKAGE_RATE,
      description: `Full package (${landmarkCount} landmarks, ${totalHours}h)`
    };
  }
  
  const additionalHours = Math.max(0, totalHours - BASE_HOURS);
  const additionalCost = additionalHours * HOURLY_RATE;
  
  return {
    type: "hourly",
    baseRate: BASE_RATE,
    baseHours: BASE_HOURS,
    additionalHours,
    additionalCost,
    totalPrice: BASE_RATE + additionalCost,
    savings: 0,
    description: totalHours <= BASE_HOURS 
      ? `Base rate (up to ${BASE_HOURS}h)` 
      : `Base ${BASE_HOURS}h + ${additionalHours}h additional`
  };
}

/**
 * Check if full package would be cheaper
 * @param totalMinutes Total duration in minutes
 * @returns True if full package offers savings
 */
export function isFullPackageBetter(totalMinutes: number): boolean {
  const hourlyPrice = calculatePrice(totalMinutes, false);
  return FULL_PACKAGE_RATE < hourlyPrice;
}

/**
 * Get pricing constants for display
 */
export function getPricingConstants() {
  return {
    BASE_RATE,
    BASE_HOURS,
    HOURLY_RATE,
    FULL_PACKAGE_RATE
  };
}

/**
 * Calculate price for multi-day tours
 * @param day1Minutes Total minutes for day 1
 * @param day2Minutes Total minutes for day 2 (0 for 1-day tour)
 * @param isFullPackage Whether full package discount applies
 * @returns Total price for the tour
 */
export function calculateMultiDayPrice(
  day1Minutes: number,
  day2Minutes: number = 0,
  isFullPackage: boolean
): number {
  const is2Day = day2Minutes > 0;
  
  // Full package pricing for 2-day tours
  if (is2Day && isFullPackage) {
    return 7000; // ₱7,000 for 2-day full package (discounted)
  }
  
  // Calculate each day separately
  const day1Price = calculatePrice(day1Minutes, isFullPackage);
  const day2Price = day2Minutes > 0 ? calculatePrice(day2Minutes, false) : 0;
  
  return day1Price + day2Price;
}

/**
 * Get pricing breakdown for multi-day tours
 * @param day1Minutes Total minutes for day 1
 * @param day2Minutes Total minutes for day 2 (0 for 1-day tour)
 * @param isFullPackage Whether full package is selected
 * @param day1LandmarkCount Number of landmarks on day 1
 * @param day2LandmarkCount Number of landmarks on day 2
 */
export function getMultiDayPricingBreakdown(
  day1Minutes: number,
  day2Minutes: number = 0,
  isFullPackage: boolean,
  day1LandmarkCount: number,
  day2LandmarkCount: number = 0
) {
  const is2Day = day2Minutes > 0;
  const day1Hours = Math.ceil(day1Minutes / 60);
  const day2Hours = day2Minutes > 0 ? Math.ceil(day2Minutes / 60) : 0;
  const totalHours = day1Hours + day2Hours;
  
  if (is2Day && isFullPackage) {
    const regularPrice = calculateMultiDayPrice(day1Minutes, day2Minutes, false);
    return {
      type: "full-package-2day",
      day1Hours,
      day2Hours,
      totalHours,
      totalPrice: 7000,
      savings: regularPrice - 7000,
      description: `2-Day Full Package (${day1LandmarkCount + day2LandmarkCount} landmarks, ${totalHours}h total)`
    };
  }
  
  if (is2Day) {
    const day1Breakdown = getPricingBreakdown(day1Minutes, false, day1LandmarkCount);
    const day2Breakdown = getPricingBreakdown(day2Minutes, false, day2LandmarkCount);
    
    return {
      type: "2day-hourly",
      day1: day1Breakdown,
      day2: day2Breakdown,
      day1Hours,
      day2Hours,
      totalHours,
      totalPrice: day1Breakdown.totalPrice + day2Breakdown.totalPrice,
      savings: 0,
      description: `Day 1: ${day1Hours}h + Day 2: ${day2Hours}h`
    };
  }
  
  // Single day pricing
  return getPricingBreakdown(day1Minutes, isFullPackage, day1LandmarkCount);
}

