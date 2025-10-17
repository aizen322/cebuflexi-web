import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long');

export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^\+\d{1,4}\d{7,15}$/, 'Please enter a valid international phone number (e.g., +639123456789)')
  .optional()
  .or(z.literal(''));

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/, 'Name can only contain letters and spaces');

export const messageSchema = z.string()
  .min(10, 'Message must be at least 10 characters')
  .max(2000, 'Message is too long')
  .refine(
    (val) => !/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(val),
    'Message contains potentially unsafe content'
  );

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject is too long')
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(val),
      'Subject contains potentially unsafe content'
    ),
  message: messageSchema,
});

// Tour booking validation
export const tourBookingSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  groupSize: z.number()
    .int('Group size must be a whole number')
    .min(1, 'Group size must be at least 1')
    .max(50, 'Group size cannot exceed 50'),
  specialRequests: z.string()
    .max(1000, 'Special requests are too long')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || !/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(val),
      'Special requests contain potentially unsafe content'
    ),
  bookingType: z.enum(['self', 'guest'], {
    required_error: 'Please select a booking type',
  }),
  guestName: z.string().optional(),
  guestEmail: z.string().optional(),
  guestPhone: z.string().optional(),
}).refine(
  (data) => {
    if (data.bookingType === 'guest') {
      return data.guestName && data.guestName.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Guest name is required when booking for someone else',
    path: ['guestName'],
  }
).refine(
  (data) => {
    if (data.bookingType === 'guest') {
      return data.guestEmail && data.guestEmail.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guestEmail);
    }
    return true;
  },
  {
    message: 'Please enter a valid guest email address',
    path: ['guestEmail'],
  }
).refine(
  (data) => {
    if (data.bookingType === 'guest') {
      return data.guestPhone && data.guestPhone.trim().length > 0 && /^\+\d{1,4}\d{7,15}$/.test(data.guestPhone);
    }
    return true;
  },
  {
    message: 'Please enter a valid guest phone number',
    path: ['guestPhone'],
  }
);

// Car rental booking validation
export const carRentalBookingSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  pickupLocation: z.string()
    .min(1, 'Pickup location is required')
    .max(200, 'Pickup location is too long'),
  dropoffLocation: z.string()
    .min(1, 'Drop-off location is required')
    .max(200, 'Drop-off location is too long'),
  rentalDays: z.number()
    .int('Rental days must be a whole number')
    .min(1, 'Minimum rental is 1 day')
    .max(30, 'Maximum rental is 30 days'),
  addOns: z.object({
    insurance: z.boolean().optional(),
    gps: z.boolean().optional(),
    childSeat: z.boolean().optional(),
  }).optional(),
  specialRequests: z.string()
    .max(1000, 'Special requests are too long')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || !/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(val),
      'Special requests contain potentially unsafe content'
    ),
});

// User profile validation
export const userProfileSchema = z.object({
  displayName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

// Admin user creation validation
export const adminUserSchema = z.object({
  email: emailSchema,
  role: z.enum(['user', 'admin', 'moderator'], {
    required_error: 'Please select a valid role',
  }),
  displayName: nameSchema,
});

// API request validation
export const apiBookingUpdateSchema = z.object({
  bookingId: z.string()
    .min(1, 'Booking ID is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid booking ID format'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
    required_error: 'Please select a valid status',
  }),
  notes: z.string()
    .max(500, 'Notes are too long')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || !/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(val),
      'Notes contain potentially unsafe content'
    ),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string()
      .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename format'),
    size: z.number()
      .max(5 * 1024 * 1024, 'File size must be less than 5MB'),
    type: z.string()
      .regex(/^image\/(jpeg|jpg|png|webp|gif)$/, 'Only image files are allowed'),
  }),
});

// Search and filter validation
export const searchSchema = z.object({
  query: z.string()
    .max(100, 'Search query is too long')
    .refine(
      (val) => !/<script|javascript:|data:|vbscript:|on\w+\s*=/i.test(val),
      'Search query contains potentially unsafe content'
    )
    .optional()
    .or(z.literal('')),
  category: z.string()
    .max(50, 'Category is too long')
    .optional(),
  minPrice: z.number()
    .min(0, 'Minimum price cannot be negative')
    .optional(),
  maxPrice: z.number()
    .min(0, 'Maximum price cannot be negative')
    .optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['minPrice'],
  }
);

// Type exports for TypeScript
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type TourBookingData = z.infer<typeof tourBookingSchema>;
export type CarRentalBookingData = z.infer<typeof carRentalBookingSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type AdminUserData = z.infer<typeof adminUserSchema>;
export type ApiBookingUpdateData = z.infer<typeof apiBookingUpdateSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type SearchData = z.infer<typeof searchSchema>;

// Validation helper functions
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}
