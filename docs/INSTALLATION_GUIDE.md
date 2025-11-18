# Installation Guide for Refactored Features

## Step 1: Install Dependencies

Run the following command to install new packages and security updates:

```bash
npm install
```

This will install:
- `@tanstack/react-virtual` - For virtual scrolling
- `swr` - For query caching and deduplication
- `vercel` (updated to v48.10.2) - Fixes 11 security vulnerabilities

**Security Note:** The Vercel CLI has been moved from dependencies to devDependencies and updated to the latest secure version, resolving all npm audit vulnerabilities.

## Step 2: Deploy Firestore Indexes

Deploy the new composite indexes to Firebase:

```bash
firebase deploy --only firestore:indexes
```

**Note:** Index creation can take 5-30 minutes depending on existing data volume.

## Step 3: Seed Content Collections

Populate Firestore with the static content currently stored in `src/lib/mockData.ts`.

1. Ensure the Firebase Admin environment variables in `.env.local` (or shell) are set:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
2. Run a dry-run to preview operations:

```bash
npm run seed:content
```

3. Apply the changes once the dry-run output looks correct:

```bash
npm run seed:content:commit
```

By default all collections (`tours`, `vehicles`, `blogPosts`, `landmarks`, `testimonials`) are processed. To target a subset, pass the `--collections` flag:

```bash
npm run seed:content:commit -- --collections=tours,blogPosts
```

The script is idempotent—it uses deterministic document IDs and `set(..., { merge: true })` so it can be re-run safely after editing source data.

After seeding, run the verification script to confirm counts and sample data:

```bash
npm run verify:content
```

To focus on specific collections:

```bash
npm run verify:content -- --collections=tours,blogPosts
```

## Step 4: Initialize Stats Cache

Create the initial dashboard stats cache document. Run this once in your Firebase Console or via a script:

### Option A: Firebase Console
1. Go to Firestore Database
2. Create a new collection called `stats`
3. Create a document with ID `dashboard`
4. Add these fields:
   - `pendingBookings`: 0
   - `totalUsers`: 0
   - `monthlyRevenue`: 0
   - `activeTours`: 0
   - `activeVehicles`: 0
   - `lastUpdated`: (current timestamp)

### Option B: Via Code
Add this temporary API endpoint and call it once:

```typescript
// src/pages/api/admin/initialize-stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { calculateAndCacheStats } from "@/services/admin/statsService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stats = await calculateAndCacheStats();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error initializing stats:", error);
    res.status(500).json({ error: "Failed to initialize stats" });
  }
}
```

Then call: `POST /api/admin/initialize-stats`

## Step 5: Update Firestore Rules

Add rules for the new `stats` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules ...
    
    // Stats collection
    match /stats/{document} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

## Step 6: Enable Virtual Scrolling (Optional)

After installing dependencies, enable virtual scrolling:

1. Open `src/components/Bookings/VirtualizedBookingsList.tsx`
2. Uncomment the `useVirtualizer` import and usage
3. Replace the simple map with virtualized rendering

## Step 7: Enable SWR Caching (Optional)

After installing dependencies, enable SWR caching:

1. Open `src/hooks/useBookingsWithCache.ts`
2. Uncomment the `useSWR` import
3. Uncomment the SWR implementation
4. Remove the placeholder fallback code

## Step 8: Test the Changes

### Test Dashboard:
1. Navigate to `/admin/dashboard`
2. Verify stats load quickly
3. Check browser console for any errors

### Test Bookings Pagination:
1. Navigate to `/admin/bookings`
2. Verify only 20 bookings load initially
3. Click "Load More" to load additional bookings
4. Test filtering by status and type

### Test Custom Itinerary:
1. Navigate to `/custom-itinerary`
2. Select tour duration and type
3. Add/remove landmarks
4. Verify smooth interactions without lag

## Step 9: Set Up Scheduled Stats Updates (Recommended)

Create a Cloud Function to update stats periodically:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const updateDashboardStats = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const db = admin.firestore();
    
    // Calculate stats
    const [bookingsSnap, usersSnap, toursSnap, vehiclesSnap] = await Promise.all([
      db.collection('bookings').where('status', '==', 'pending').get(),
      db.collection('users').get(),
      db.collection('tours').where('available', '==', true).get(),
      db.collection('vehicles').where('available', '==', true).get(),
    ]);

    // Calculate monthly revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const confirmedBookings = await db.collection('bookings')
      .where('status', '==', 'confirmed')
      .where('createdAt', '>=', firstDayOfMonth)
      .get();

    const monthlyRevenue = confirmedBookings.docs.reduce((sum, doc) => {
      return sum + (doc.data().totalPrice || 0);
    }, 0);

    // Update stats document
    await db.collection('stats').doc('dashboard').set({
      pendingBookings: bookingsSnap.size,
      totalUsers: usersSnap.size,
      monthlyRevenue,
      activeTours: toursSnap.size,
      activeVehicles: vehiclesSnap.size,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Dashboard stats updated successfully');
    return null;
  });
```

Deploy:
```bash
firebase deploy --only functions
```

## Troubleshooting

### Issue: Indexes not created
**Solution:** Wait 10-30 minutes, check Firebase Console > Firestore > Indexes

### Issue: Stats not loading
**Solution:** Ensure stats document exists in Firestore, run initialization script

### Issue: Pagination not working
**Solution:** Check Firestore rules allow read access to bookings collection

### Issue: Build warnings
**Solution:** Pre-existing warnings, not related to refactoring. Can be addressed separately.

## Performance Monitoring

To monitor the improvements:

1. Use Chrome DevTools Performance tab
2. Record a session while loading dashboard/bookings
3. Compare before/after metrics
4. Check Network tab for reduced Firestore calls

## Rollback Plan

If issues arise, revert these commits:
1. Dashboard stats service
2. Pagination implementation
3. State reducer refactoring

All changes are isolated and can be reverted independently.

## Support

For questions or issues:
1. Check console logs for detailed error messages
2. Verify Firestore rules are deployed
3. Ensure all indexes are created
4. Check that stats cache document exists

