import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken, isUserAdmin, adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const updateStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

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

    // Validate request body
    const validation = updateStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: validation.error.errors 
      });
    }

    const { bookingId, status } = validation.data;

    // Update booking status
    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await bookingRef.update({
      status,
      updatedAt: new Date(),
    });

    // TODO: Send email notification to customer
    // This would integrate with SendGrid, Resend, or similar service
    console.log(`Booking ${bookingId} status updated to ${status}`);
    console.log(`Email notification would be sent to: ${bookingSnap.data()?.userEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      bookingId,
      status,
    });

  } catch (error: any) {
    console.error('Update booking status error:', error);
    return res.status(500).json({
      error: 'Failed to update booking status',
      details: error.message,
    });
  }
}


