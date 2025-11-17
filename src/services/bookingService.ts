
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { transformBookingDoc, transformBookingDocs } from "@/lib/bookingTransformers";

export interface Booking {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  tourId?: string;
  vehicleId?: string;
  bookingType: "tour" | "vehicle" | "custom-tour";
  startDate: Date;
  endDate: Date;
  guests?: number;
  groupSize?: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customizations?: string;
  specialRequests?: string;
  contactPhone?: string;
  phoneCountryCode?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestPhoneCountryCode?: string;
  itineraryDetails?: string; // JSON string for custom tours
  createdAt: Date;
  updatedAt?: Date;
}

export const createBooking = async (bookingData: Omit<Booking, "id" | "createdAt">) => {
  if (!db) {
    throw new Error("Firestore database not initialized");
  }
  
  try {
    const bookingsCollection = collection(db, "bookings");
    const docRef = await addDoc(bookingsCollection, {
      ...bookingData,
      status: bookingData.status || "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      startDate: Timestamp.fromDate(bookingData.startDate),
      endDate: Timestamp.fromDate(bookingData.endDate),
    });
    return docRef.id;
  } catch (error: any) {
    console.error("Booking creation error:", error);
    console.error("Booking data:", {
      userId: bookingData.userId,
      userEmail: bookingData.userEmail,
      userName: bookingData.userName,
      bookingType: bookingData.bookingType,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      totalPrice: bookingData.totalPrice,
      status: bookingData.status || "pending",
    });
    
    if (error.code === "permission-denied") {
      throw new Error(
        "Permission denied. Please ensure:\n" +
        "1. You are logged in\n" +
        "2. Firestore rules are deployed\n" +
        "3. Your account has proper permissions"
      );
    }
    throw error;
  }
};

export const getBookingById = async (bookingId: string) => {
  if (!db) {
    throw new Error("Firestore database not initialized");
  }
  const bookingRef = doc(db, "bookings", bookingId);
  const bookingDoc = await getDoc(bookingRef);
  
  if (!bookingDoc.exists()) {
    return null;
  }
  
  return transformBookingDoc(bookingDoc);
};

export const getUserBookings = async (userId: string) => {
  if (!db) {
    throw new Error("Firestore database not initialized");
  }
  const bookingsCollection = collection(db, "bookings");
  const q = query(
    bookingsCollection,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return transformBookingDocs(querySnapshot.docs);
};

export const updateBookingStatus = async (
  bookingId: string,
  status: Booking["status"]
) => {
  const bookingRef = doc(db, "bookings", bookingId);
  await updateDoc(bookingRef, { 
    status,
    updatedAt: Timestamp.now()
  });
};

export const cancelBooking = async (bookingId: string) => {
  await updateBookingStatus(bookingId, "cancelled");
};

export const deleteBooking = async (bookingId: string) => {
  const bookingRef = doc(db, "bookings", bookingId);
  await deleteDoc(bookingRef);
};

export const checkUserPendingBookings = async (userId: string) => {
  if (!db) {
    throw new Error("Firestore database not initialized");
  }
  
  const bookingsCollection = collection(db, "bookings");
  const q = query(
    bookingsCollection,
    where("userId", "==", userId),
    where("bookingType", "==", "tour"),
    where("status", "in", ["pending", "confirmed"])
  );
  
  const querySnapshot = await getDocs(q);
  const bookings = transformBookingDocs(querySnapshot.docs);
  
  return {
    hasPending: bookings.some(b => b.status === "pending"),
    hasConfirmed: bookings.some(b => b.status === "confirmed"),
    pendingCount: bookings.filter(b => b.status === "pending").length,
    confirmedCount: bookings.filter(b => b.status === "confirmed").length,
    bookings: bookings
  };
};

export const getAllBookings = async () => {
  const bookingsCollection = collection(db, "bookings");
  const q = query(bookingsCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return transformBookingDocs(querySnapshot.docs);
};
