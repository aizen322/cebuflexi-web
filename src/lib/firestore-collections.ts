import { collection, CollectionReference, DocumentData } from "firebase/firestore";
import { db } from "./firebase";
import { Tour, Vehicle, Landmark, BlogPost, SiteSettings, UserProfile } from "@/types";

// Type-safe collection references
export const toursCollection = () => 
  collection(db, "tours") as CollectionReference<Tour, DocumentData>;

export const vehiclesCollection = () => 
  collection(db, "vehicles") as CollectionReference<Vehicle, DocumentData>;

export const bookingsCollection = () => 
  collection(db, "bookings") as CollectionReference<DocumentData>;

export const usersCollection = () => 
  collection(db, "users") as CollectionReference<UserProfile, DocumentData>;

export const landmarksCollection = () => 
  collection(db, "landmarks") as CollectionReference<Landmark, DocumentData>;

export const blogPostsCollection = () => 
  collection(db, "blogPosts") as CollectionReference<BlogPost, DocumentData>;

export const siteSettingsCollection = () => 
  collection(db, "siteSettings") as CollectionReference<SiteSettings, DocumentData>;

// Collection names as constants
export const COLLECTIONS = {
  TOURS: "tours",
  VEHICLES: "vehicles",
  BOOKINGS: "bookings",
  USERS: "users",
  LANDMARKS: "landmarks",
  BLOG_POSTS: "blogPosts",
  SITE_SETTINGS: "siteSettings",
  STATS: "stats",
} as const;


