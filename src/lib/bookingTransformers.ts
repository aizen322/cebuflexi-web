import { QueryDocumentSnapshot, DocumentSnapshot } from "firebase/firestore";
import { Booking } from "@/services/bookingService";

/**
 * Transform a Firestore document into a Booking object
 * Handles both QueryDocumentSnapshot and DocumentSnapshot
 */
export function transformBookingDoc(
  doc: QueryDocumentSnapshot | DocumentSnapshot
): Booking {
  const data = doc.data();
  
  if (!data) {
    throw new Error("Document data is undefined");
  }

  return {
    id: doc.id,
    userName: data.userName || data.guestName || "Unknown",
    userEmail: data.userEmail || data.guestEmail || "",
    userId: data.userId || "",
    bookingType: data.bookingType || "tour",
    tourId: data.tourId,
    vehicleId: data.vehicleId,
    totalPrice: data.totalPrice || 0,
    status: data.status || "pending",
    startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(),
    endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    guests: data.guests || data.groupSize,
    groupSize: data.groupSize,
    contactPhone: data.contactPhone,
    phoneCountryCode: data.phoneCountryCode,
    specialRequests: data.specialRequests,
    customizations: data.customizations,
    itineraryDetails: data.itineraryDetails,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    guestPhoneCountryCode: data.guestPhoneCountryCode,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
  } as Booking;
}

/**
 * Transform multiple booking documents
 */
export function transformBookingDocs(
  docs: QueryDocumentSnapshot[] | DocumentSnapshot[]
): Booking[] {
  return docs.map(transformBookingDoc);
}

/**
 * Parse JSON string safely
 */
export function parseBookingJSON<T = unknown>(jsonString: string | undefined): T | null {
  if (!jsonString) return null;

  try {
    return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
  } catch {
    return null;
  }
}

