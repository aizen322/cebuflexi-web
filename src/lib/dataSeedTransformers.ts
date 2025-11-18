import {
  BlogPost,
  Landmark,
  Testimonial,
  Tour,
  Vehicle,
} from "@/types";
import { sanitizeUserInput } from "@/lib/security";

type TimestampLike = Date | { toDate: () => Date };

export interface TimestampProvider {
  now(): TimestampLike;
  fromDate(date: Date): TimestampLike;
}

const defaultTimestampProvider: TimestampProvider = {
  now: () => new Date(),
  fromDate: (date: Date) => date,
};

export interface SeedTransformOptions {
  timestampProvider?: TimestampProvider;
}

function getTimestampProvider(
  options?: SeedTransformOptions
): TimestampProvider {
  return options?.timestampProvider ?? defaultTimestampProvider;
}

function ensureRange(
  value: number,
  field: string,
  min: number,
  max: number
): number {
  if (Number.isNaN(value)) {
    throw new Error(`${field} must be a number`);
  }
  if (value < min || value > max) {
    throw new Error(
      `${field} must be between ${min} and ${max}, received ${value}`
    );
  }
  return value;
}

function ensureHttpsUrl(url: string, field: string): string {
  const sanitized = sanitizeUserInput(url ?? "", "url");
  if (!sanitized || !sanitized.startsWith("http")) {
    throw new Error(`${field} must be a valid http(s) URL`);
  }
  return sanitized;
}

function sanitizeString(value: string, field: string, maxLength: number): string {
  const sanitized = sanitizeUserInput(value ?? "", "text");
  if (!sanitized) {
    throw new Error(`${field} is required`);
  }
  if (sanitized.length > maxLength) {
    throw new Error(`${field} exceeds ${maxLength} characters`);
  }
  return sanitized;
}

function sanitizeStringArray(
  values: string[],
  field: string,
  maxLength: number,
  { minItems = 0, maxItems = 50 }: { minItems?: number; maxItems?: number } = {}
): string[] {
  if (!Array.isArray(values)) {
    throw new Error(`${field} must be an array`);
  }
  if (values.length < minItems || values.length > maxItems) {
    throw new Error(
      `${field} must contain between ${minItems} and ${maxItems} items`
    );
  }
  return values.map((value, index) =>
    sanitizeString(value, `${field}[${index}]`, maxLength)
  );
}

export function transformTourForSeed(
  tour: Tour,
  options?: SeedTransformOptions
) {
  const ts = getTimestampProvider(options);
  return {
    id: sanitizeString(tour.id, "id", 200),
    title: sanitizeString(tour.title, "title", 200),
    category: sanitizeString(tour.category, "category", 50),
    description: sanitizeString(tour.description, "description", 2000),
    shortDescription: sanitizeString(
      tour.shortDescription,
      "shortDescription",
      300
    ),
    price: ensureRange(tour.price, "price", 0, 1_000_000),
    duration: ensureRange(tour.duration, "duration", 1, 30),
    location: sanitizeString(tour.location, "location", 100),
    groupSize: (() => {
      const min = ensureRange(tour.groupSize.min, "groupSize.min", 1, 100);
      const max = ensureRange(tour.groupSize.max, "groupSize.max", 1, 100);
      if (min > max) {
        throw new Error("groupSize.min cannot exceed groupSize.max");
      }
      return { min, max };
    })(),
    images: (() => {
      if (!Array.isArray(tour.images) || tour.images.length === 0) {
        throw new Error("images must contain at least one URL");
      }
      if (tour.images.length > 10) {
        throw new Error("images must not exceed 10 items");
      }
      return tour.images.map((url, index) =>
        ensureHttpsUrl(url, `images[${index}]`)
      );
    })(),
    itinerary: tour.itinerary.map((day, index) => ({
      day: ensureRange(day.day, `itinerary[${index}].day`, 1, 30),
      title: sanitizeString(day.title, `itinerary[${index}].title`, 150),
      activities: sanitizeStringArray(
        day.activities,
        `itinerary[${index}].activities`,
        150,
        { minItems: 1, maxItems: 20 }
      ),
      meals: sanitizeStringArray(
        day.meals ?? [],
        `itinerary[${index}].meals`,
        100,
        { minItems: 0, maxItems: 10 }
      ),
    })),
    inclusions: sanitizeStringArray(
      tour.inclusions,
      "inclusions",
      150,
      { minItems: 1, maxItems: 20 }
    ),
    available: Boolean(tour.available),
    featured: Boolean(tour.featured),
    createdAt: tour.createdAt ? ts.fromDate(new Date(tour.createdAt)) : ts.now(),
    updatedAt: ts.now(),
  };
}

export function transformVehicleForSeed(
  vehicle: Vehicle,
  options?: SeedTransformOptions
) {
  const ts = getTimestampProvider(options);
  return {
    id: sanitizeString(vehicle.id, "id", 200),
    name: sanitizeString(vehicle.name, "name", 150),
    type: sanitizeString(vehicle.type, "type", 50),
    image: ensureHttpsUrl(vehicle.image, "image"),
    pricePerDay: ensureRange(vehicle.pricePerDay, "pricePerDay", 0, 100_000),
    capacity: ensureRange(vehicle.capacity, "capacity", 1, 20),
    transmission: sanitizeString(vehicle.transmission, "transmission", 20),
    fuelType: sanitizeString(vehicle.fuelType, "fuelType", 20),
    withDriver: Boolean(vehicle.withDriver),
    luggage: ensureRange(vehicle.luggage ?? 0, "luggage", 0, 20),
    features: sanitizeStringArray(vehicle.features ?? [], "features", 150, {
      minItems: 0,
      maxItems: 15,
    }),
    available: Boolean(vehicle.available),
    stockCount: ensureRange(vehicle.stockCount ?? 0, "stockCount", 0, 100),
    createdAt: vehicle.createdAt
      ? ts.fromDate(new Date(vehicle.createdAt))
      : ts.now(),
    updatedAt: ts.now(),
  };
}

export function transformBlogPostForSeed(
  post: BlogPost,
  options?: SeedTransformOptions
) {
  const ts = getTimestampProvider(options);
  return {
    id: sanitizeString(post.id, "id", 200),
    title: sanitizeString(post.title, "title", 200),
    slug: sanitizeString(post.slug, "slug", 200),
    excerpt: sanitizeString(post.excerpt, "excerpt", 500),
    content: sanitizeUserInput(post.content ?? "", "html"),
    author: sanitizeString(post.author, "author", 100),
    publishedAt: ts.fromDate(new Date(post.publishedAt)),
    readTime: ensureRange(post.readTime, "readTime", 1, 60),
    image: ensureHttpsUrl(post.image, "image"),
    keywords: sanitizeStringArray(post.keywords ?? [], "keywords", 100, {
      minItems: 1,
      maxItems: 25,
    }),
    category: sanitizeString(post.category, "category", 50),
    createdAt: post.createdAt
      ? ts.fromDate(new Date(post.createdAt))
      : ts.now(),
    updatedAt: ts.now(),
  };
}

export function transformLandmarkForSeed(
  landmark: Landmark,
  options?: SeedTransformOptions
) {
  const ts = getTimestampProvider(options);
  return {
    id: sanitizeString(landmark.id, "id", 200),
    name: sanitizeString(landmark.name, "name", 150),
    description: sanitizeString(landmark.description, "description", 1000),
    location: {
      lat: ensureRange(landmark.location.lat, "location.lat", -90, 90),
      lng: ensureRange(landmark.location.lng, "location.lng", -180, 180),
    },
    estimatedDuration: ensureRange(
      landmark.estimatedDuration,
      "estimatedDuration",
      15,
      600
    ),
    image: ensureHttpsUrl(landmark.image, "image"),
    category: sanitizeString(landmark.category, "category", 50),
    tourType: sanitizeString(landmark.tourType, "tourType", 50),
    createdAt: landmark.createdAt
      ? ts.fromDate(new Date(landmark.createdAt))
      : ts.now(),
    updatedAt: ts.now(),
  };
}

export function transformTestimonialForSeed(
  testimonial: Testimonial,
  options?: SeedTransformOptions
) {
  const ts = getTimestampProvider(options);
  return {
    id: sanitizeString(testimonial.id, "id", 200),
    name: sanitizeString(testimonial.name, "name", 100),
    location: sanitizeString(testimonial.location, "location", 100),
    rating: ensureRange(testimonial.rating, "rating", 1, 5),
    text: sanitizeString(testimonial.text, "text", 1000),
    avatar: ensureHttpsUrl(testimonial.avatar, "avatar"),
    tourId: testimonial.tourId
      ? sanitizeString(testimonial.tourId, "tourId", 200)
      : null,
    createdAt: ts.now(),
    updatedAt: ts.now(),
  };
}

