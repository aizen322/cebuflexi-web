import { z } from "zod";

export const dayItinerarySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  activities: z.array(z.string()).min(1, "At least one activity is required"),
  meals: z.array(z.string()),
});

export const tourSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title is too long"),
  category: z.enum(["Beach", "Adventure", "Cultural", "Food"]),
  description: z.string().min(50, "Description must be at least 50 characters"),
  shortDescription: z.string().min(20, "Short description must be at least 20 characters").max(200, "Short description is too long"),
  price: z.number().positive("Price must be positive"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  location: z.string().min(3, "Location is required"),
  groupSize: z.object({
    min: z.number().int().positive("Minimum group size must be positive"),
    max: z.number().int().positive("Maximum group size must be positive"),
  }).refine(data => data.max >= data.min, {
    message: "Maximum must be greater than or equal to minimum",
  }),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
  itinerary: z.array(dayItinerarySchema).min(1, "At least one day itinerary is required"),
  inclusions: z.array(z.string()).min(1, "At least one inclusion is required"),
  available: z.boolean(),
  featured: z.boolean(),
});

export type TourFormData = z.infer<typeof tourSchema>;
export type DayItineraryFormData = z.infer<typeof dayItinerarySchema>;


