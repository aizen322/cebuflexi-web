import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Date;
}

export const createContactSubmission = async (submissionData: Omit<ContactSubmission, "id" | "createdAt">) => {
  if (!db) {
    throw new Error("Firestore database not initialized");
  }
  
  const submissionsCollection = collection(db, "contact_submissions");
  const docRef = await addDoc(submissionsCollection, {
    ...submissionData,
    createdAt: Timestamp.now(),
  });
  
  return docRef.id;
};
