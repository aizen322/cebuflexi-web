import { collection, doc, setDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  allTours, 
  vehicles, 
  cebuLandmarks, 
  mountainLandmarks,
  blogPosts 
} from "@/lib/mockData";
import { COLLECTIONS } from "@/lib/firestore-collections";

export async function seedTours() {
  const toursRef = collection(db, COLLECTIONS.TOURS);
  
  const promises = allTours.map(async (tour) => {
    const tourDoc = doc(toursRef, tour.id);
    await setDoc(tourDoc, {
      ...tour,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  await Promise.all(promises);
  return allTours.length;
}

export async function seedVehicles() {
  const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
  
  const promises = vehicles.map(async (vehicle) => {
    const vehicleDoc = doc(vehiclesRef, vehicle.id);
    await setDoc(vehicleDoc, {
      ...vehicle,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  await Promise.all(promises);
  return vehicles.length;
}

export async function seedLandmarks() {
  const landmarksRef = collection(db, COLLECTIONS.LANDMARKS);
  
  const allLandmarks = [...cebuLandmarks, ...mountainLandmarks];
  
  const promises = allLandmarks.map(async (landmark) => {
    const landmarkDoc = doc(landmarksRef, landmark.id);
    await setDoc(landmarkDoc, {
      ...landmark,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  await Promise.all(promises);
  return allLandmarks.length;
}

export async function seedBlogPosts() {
  const blogPostsRef = collection(db, COLLECTIONS.BLOG_POSTS);
  
  const promises = blogPosts.map(async (post) => {
    const postDoc = doc(blogPostsRef, post.id);
    await setDoc(postDoc, {
      ...post,
      publishedAt: Timestamp.fromDate(post.publishedAt),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  await Promise.all(promises);
  return blogPosts.length;
}

export async function seedSiteSettings() {
  const settingsDoc = doc(db, COLLECTIONS.SITE_SETTINGS, "default");
  
  await setDoc(settingsDoc, {
    siteName: "CebuFlexi Tours",
    contactEmail: "info@cebuflexitours.com",
    contactPhone: "+63 123 456 7890",
    customTourHourlyRate: 500,
    maintenanceMode: false,
    updatedAt: Timestamp.now(),
  });
  
  return 1;
}

export async function seedAllData() {
  try {
    const results = {
      tours: 0,
      vehicles: 0,
      landmarks: 0,
      blogPosts: 0,
      siteSettings: 0,
    };

    results.tours = await seedTours();
    results.vehicles = await seedVehicles();
    results.landmarks = await seedLandmarks();
    results.blogPosts = await seedBlogPosts();
    results.siteSettings = await seedSiteSettings();

    return {
      success: true,
      results,
      message: "All data seeded successfully",
    };
  } catch (error: any) {
    console.error("Seed error:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to seed data",
    };
  }
}

export async function checkDataExists() {
  try {
    const collections = [
      COLLECTIONS.TOURS,
      COLLECTIONS.VEHICLES,
      COLLECTIONS.LANDMARKS,
      COLLECTIONS.BLOG_POSTS,
    ];

    const results: Record<string, number> = {};

    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      results[collectionName] = snapshot.size;
    }

    return {
      success: true,
      results,
      hasData: Object.values(results).some(count => count > 0),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}


