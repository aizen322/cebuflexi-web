import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken, isUserAdmin } from '@/lib/firebase-admin';

// Import server-side seed functions
import { adminDb } from '@/lib/firebase-admin';
import { 
  allTours, 
  vehicles, 
  cebuLandmarks, 
  mountainLandmarks,
  blogPosts 
} from '@/lib/mockData';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const verification = await verifyIdToken(token);

    if (!verification.success) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const isAdmin = await isUserAdmin(verification.user.uid);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Seed tours
    const toursPromises = allTours.map(async (tour) => {
      await adminDb.collection('tours').doc(tour.id).set({
        ...tour,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed vehicles
    const vehiclesPromises = vehicles.map(async (vehicle) => {
      await adminDb.collection('vehicles').doc(vehicle.id).set({
        ...vehicle,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed landmarks
    const allLandmarks = [...cebuLandmarks, ...mountainLandmarks];
    const landmarksPromises = allLandmarks.map(async (landmark) => {
      await adminDb.collection('landmarks').doc(landmark.id).set({
        ...landmark,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed blog posts
    const blogPostsPromises = blogPosts.map(async (post) => {
      await adminDb.collection('blogPosts').doc(post.id).set({
        ...post,
        publishedAt: post.publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed site settings
    await adminDb.collection('siteSettings').doc('default').set({
      siteName: "CebuFlexi Tours",
      contactEmail: "info@cebuflexitours.com",
      contactPhone: "+63 123 456 7890",
      customTourHourlyRate: 500,
      maintenanceMode: false,
      updatedAt: new Date(),
    });

    await Promise.all([
      ...toursPromises,
      ...vehiclesPromises,
      ...landmarksPromises,
      ...blogPostsPromises,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Data seeded successfully',
      results: {
        tours: allTours.length,
        vehicles: vehicles.length,
        landmarks: allLandmarks.length,
        blogPosts: blogPosts.length,
        siteSettings: 1,
      },
    });

  } catch (error: any) {
    console.error('Seed data error:', error);
    return res.status(500).json({
      error: 'Failed to seed data',
      details: error.message,
    });
  }
}


