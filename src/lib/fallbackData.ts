import { Tour, Vehicle, Testimonial, BlogPost, Landmark } from "@/types";

/**
 * Minimal fallback data for ContentDataContext.
 * Used only when Firestore data is unavailable.
 * These are empty arrays to prevent stale data from being displayed.
 */
export const fallbackTours: Tour[] = [];
export const fallbackVehicles: Vehicle[] = [];
export const fallbackBlogPosts: BlogPost[] = [];
export const fallbackLandmarks: Landmark[] = [];
export const fallbackTestimonials: Testimonial[] = [];

