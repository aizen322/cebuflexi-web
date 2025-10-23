export interface Tour {
  id: string;
  title: string;
  category: "Beach" | "Adventure" | "Cultural" | "Food";
  description: string;
  shortDescription: string;
  price: number;
  duration: number;
  location: string;
  groupSize: {
    min: number;
    max: number;
  };
  images: string[];
  itinerary: DayItinerary[];
  inclusions: string[];
  available: boolean;
  featured: boolean;
}

export interface DayItinerary {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  type: "Sedan" | "SUV" | "Van";
  image: string;
  pricePerDay: number;
  capacity: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Gasoline" | "Diesel" | "Hybrid";
  withDriver: boolean;
  luggage: number;
  features: string[];
  available: boolean;
  stockCount: number;
}

export interface Booking {
  id: string;
  userId: string;
  type: "tour" | "rental";
  itemId: string;
  dates: {
    start: Date;
    end: Date;
  };
  groupSize?: number;
  addOns?: string[];
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  tourId?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  readTime: number;
  image: string;
  keywords: string[];
  category: string;
}

export interface SearchParams {
  tourType?: string;
  startDate?: Date;
  endDate?: Date;
  groupSize?: number;
}

export type TourType = "cebu-city" | "mountain";
export type TourDuration = "1-day" | "2-days";

export interface Landmark {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  estimatedDuration: number; // in minutes
  image: string;
  category: "Historical" | "Religious" | "Cultural" | "Nature";
  tourType: TourType;
}

export interface DayItineraryPlan {
  day: 1 | 2;
  tourType: TourType;
  landmarks: Array<{
    id: string;
    name: string;
    image: string;
    duration: number;
    order: number;
  }>;
  totalTime: number;
}

export interface MultiDayItineraryDetails {
  duration: TourDuration;
  days: DayItineraryPlan[];
  totalPrice: number;
  isFullPackage: boolean;
}

export interface CustomItinerary {
  selectedLandmarks: Landmark[];
  totalTime: number; // in minutes
  totalPrice: number;
  isFullPackage: boolean;
}

export interface ItineraryDetails {
  landmarks: Array<{
    id: string;
    name: string;
    image: string;
    duration: number;
    order: number;
  }>;
  totalTime: number;
  totalPrice: number;
  isFullPackage: boolean;
}