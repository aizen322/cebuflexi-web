
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export const checkTourAvailability = async (
  tourId: string,
  date: Date
): Promise<boolean> => {
  const bookingsRef = collection(db, "bookings");
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    bookingsRef,
    where("tourId", "==", tourId),
    where("startDate", ">=", Timestamp.fromDate(startOfDay)),
    where("startDate", "<=", Timestamp.fromDate(endOfDay)),
    where("status", "in", ["pending", "confirmed"])
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

export const checkVehicleAvailability = async (
  vehicleId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  const bookingsRef = collection(db, "bookings");

  const q = query(
    bookingsRef,
    where("vehicleId", "==", vehicleId),
    where("status", "in", ["pending", "confirmed"])
  );

  const querySnapshot = await getDocs(q);

  const overlappingBookings = querySnapshot.docs.filter((doc) => {
    const booking = doc.data();
    const bookingStart = booking.startDate.toDate();
    const bookingEnd = booking.endDate.toDate();

    return (
      (startDate >= bookingStart && startDate <= bookingEnd) ||
      (endDate >= bookingStart && endDate <= bookingEnd) ||
      (startDate <= bookingStart && endDate >= bookingEnd)
    );
  });

  return overlappingBookings.length === 0;
};

export const getAvailableDatesForTour = async (
  tourId: string,
  month: number,
  year: number
): Promise<Date[]> => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDates: Date[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date >= new Date()) {
      const isAvailable = await checkTourAvailability(tourId, date);
      if (isAvailable) {
        availableDates.push(date);
      }
    }
  }

  return availableDates;
};
