
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export interface Booking {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  tourId?: string;
  vehicleId?: string;
  bookingType: "tour" | "vehicle";
  startDate: Date;
  endDate: Date;
  guests?: number;
  groupSize?: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customizations?: string;
  specialRequests?: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const createBooking = async (bookingData: Omit<Booking, "id" | "createdAt">) => {
  if (!db) {
    throw new Error("Firestore database not initialized");
  }
  const bookingsCollection = collection(db, "bookings");
  const docRef = await addDoc(bookingsCollection, {
    ...bookingData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    startDate: Timestamp.fromDate(bookingData.startDate),
    endDate: Timestamp.fromDate(bookingData.endDate),
  });
  return docRef.id;
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
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate.toDate(),
    endDate: doc.data().endDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Booking[];
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

export const getAllBookings = async () => {
  const bookingsCollection = collection(db, "bookings");
  const q = query(bookingsCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate.toDate(),
    endDate: doc.data().endDate.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Booking[];
};
