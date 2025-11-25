# Firebase Monitoring Setup Guide

This guide explains how to set up monitoring and alerts for your Firebase project to ensure optimal performance and stay within budget.

## Table of Contents

1. [Budget Alerts](#budget-alerts)
2. [Firestore Usage Monitoring](#firestore-usage-monitoring)
3. [Authentication Monitoring](#authentication-monitoring)
4. [Storage Monitoring](#storage-monitoring)
5. [Performance Monitoring](#performance-monitoring)

---

## Budget Alerts

### Setting Up Budget Alerts in Firebase Console

1. **Navigate to Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `cebuflexitours`

2. **Access Billing Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Usage and billing"
   - Click "Details & settings"

3. **Create Budget Alert**
   - Go to the "Budgets & alerts" tab
   - Click "Create budget"
   - Set your monthly budget amount (recommended: $25-50 for 100 users)
   - Set alert thresholds:
     - 50% - Early warning
     - 80% - Action required
     - 100% - Budget exceeded

4. **Configure Notifications**
   - Add email addresses for alerts
   - Enable Pub/Sub for programmatic alerts (optional)

### Recommended Budget Settings for 100 Users

| Service | Estimated Monthly Cost | Alert Threshold |
|---------|----------------------|-----------------|
| Firestore | $0-5 | $5 |
| Authentication | $0 (free tier) | N/A |
| Storage | $0-5 | $5 |
| Hosting | $0 (Vercel) | N/A |
| **Total** | **$0-10** | **$15** |

---

## Firestore Usage Monitoring

### Key Metrics to Monitor

1. **Document Reads**
   - Free tier: 50,000/day
   - Monitor in: Firebase Console → Firestore → Usage tab

2. **Document Writes**
   - Free tier: 20,000/day
   - Critical for booking operations

3. **Document Deletes**
   - Free tier: 20,000/day

### Setting Up Firestore Alerts

1. Go to Firebase Console → Firestore Database → Usage
2. Enable "Usage alerts" for:
   - Daily read quota (alert at 40,000 reads)
   - Daily write quota (alert at 15,000 writes)

### Optimization Tips

- Use composite indexes (already configured in `firestore.indexes.json`)
- Implement pagination for large collections
- Cache frequently accessed data client-side
- Use `onSnapshot` listeners sparingly

---

## Authentication Monitoring

### Key Metrics

| Metric | Free Tier Limit | Alert Threshold |
|--------|-----------------|-----------------|
| Monthly Active Users | 50,000 | 40,000 |
| Phone Auth | 10/IP/hour | N/A |
| Email/Password | Unlimited | N/A |

### Monitoring Setup

1. Go to Firebase Console → Authentication → Usage
2. Review weekly active users
3. Monitor failed sign-in attempts (security)

### Security Alerts

Enable email notifications for:
- Suspicious sign-in activity
- Multiple failed attempts from same IP
- New admin user creation

---

## Storage Monitoring

### Key Metrics

| Metric | Free Tier | Recommended Limit |
|--------|-----------|-------------------|
| Storage | 5 GB | 4 GB |
| Downloads | 1 GB/day | 800 MB/day |
| Uploads | 1 GB/day | 800 MB/day |

### Monitoring Setup

1. Go to Firebase Console → Storage → Usage
2. Monitor storage growth weekly
3. Set up alerts for:
   - Storage approaching 4 GB
   - Unusual upload/download patterns

### Image Optimization

- Compress images before upload
- Use WebP format when possible
- Implement lazy loading
- Maximum image size: 5 MB

---

## Performance Monitoring

### Enabling Firebase Performance Monitoring

Add to your `_app.tsx` (optional):

```typescript
import { getPerformance } from 'firebase/performance';

// Initialize in useEffect
useEffect(() => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const { getPerformance } = await import('firebase/performance');
    getPerformance();
  }
}, []);
```

### Key Performance Metrics

- **App Start Time**: Target < 3 seconds
- **Screen Rendering**: Target < 1 second
- **Network Request Duration**: Target < 2 seconds

---

## Alert Response Procedures

### When Budget Alert Triggers

1. **50% Alert**: Review current usage patterns
2. **80% Alert**: 
   - Implement rate limiting if not active
   - Review for unusual activity
   - Consider usage optimization
3. **100% Alert**:
   - Enable stricter rate limiting
   - Investigate potential abuse
   - Contact Firebase support if needed

### When Quota Alert Triggers

1. Check for runaway queries or loops
2. Review recent code deployments
3. Check for potential DDoS/abuse
4. Implement emergency rate limiting

---

## Monitoring Dashboard Checklist

Weekly review checklist:

- [ ] Firestore read/write counts within normal range
- [ ] Authentication metrics stable
- [ ] Storage growth as expected
- [ ] No budget alerts triggered
- [ ] No security anomalies detected

---

## Contact & Escalation

For Firebase-related issues:
- Firebase Support: [firebase.google.com/support](https://firebase.google.com/support)
- Community: [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)

For billing emergencies:
- Disable Firebase services temporarily via Console
- Contact Google Cloud billing support

---

## Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Status](https://status.firebase.google.com/)
- [Firestore Quotas](https://firebase.google.com/docs/firestore/quotas)

