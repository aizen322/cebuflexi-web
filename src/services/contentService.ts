import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import {
  BlogPost,
  Landmark,
  Testimonial,
  Tour,
  Vehicle,
} from "@/types";

const toDate = (value: any) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") {
    return value.toDate();
  }
  return undefined;
};

export async function fetchTours(): Promise<Tour[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "tours"), orderBy("title"))
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Tour;
    return {
      ...data,
      id: doc.id,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "vehicles"), orderBy("name"))
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Vehicle;
    return {
      ...data,
      id: doc.id,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "blogPosts"), orderBy("publishedAt", "desc"))
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data() as BlogPost;
    return {
      ...data,
      id: doc.id,
      publishedAt: toDate(data.publishedAt) ?? new Date(),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function fetchLandmarks(): Promise<Landmark[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "landmarks"), orderBy("name"))
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Landmark;
    return {
      ...data,
      id: doc.id,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "testimonials"), orderBy("name"))
  );
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Testimonial;
    return {
      ...data,
      id: doc.id,
    };
  });
}

