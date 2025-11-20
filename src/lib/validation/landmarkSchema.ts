import { z } from "zod";

export const landmarkSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.object({
    lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    lng: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  }),
  estimatedDuration: z.number().int().positive("Estimated duration must be positive (in minutes)"),
  image: z.string().url("Invalid image URL").optional(), // Validated manually during upload
  category: z.enum(["Historical", "Religious", "Cultural", "Nature"]),
  tourType: z.enum(["cebu-city", "mountain"]),
});

export type LandmarkFormData = z.infer<typeof landmarkSchema>;

