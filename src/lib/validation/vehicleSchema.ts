import { z } from "zod";

export const vehicleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["Sedan", "SUV", "Van"]),
  image: z.string().url("Invalid image URL"),
  pricePerDay: z.number().positive("Price must be positive"),
  capacity: z.number().int().positive("Capacity must be positive"),
  transmission: z.enum(["Automatic", "Manual"]),
  fuelType: z.enum(["Gasoline", "Diesel", "Hybrid"]),
  withDriver: z.boolean(),
  luggage: z.number().int().nonnegative("Luggage capacity must be non-negative"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  available: z.boolean(),
  stockCount: z.number().int().nonnegative("Stock count must be non-negative"),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;


