# Admin Permissions Fix

## Problem
Admin users were getting "Missing or insufficient permissions" errors when accessing admin pages, even after being granted admin role.

## Root Causes

### 1. Missing Firestore Rules for `stats` Collection
The dashboard was trying to read/write to a `stats` collection that had no security rules defined, causing all access to be denied.

### 2. Custom Claims Not Refreshed
Firestore security rules check `request.auth.token.role` (custom claim), but after setting admin role, users need to sign out and back in to get a fresh token with the updated custom claim.

## Solutions Implemented

### 1. Added `stats` Collection Rules
```javascript
// Stats collection (admin only - for cached dashboard statistics)
match /stats/{statId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
}
```

### 2. Added Fallback Role Check
Added a fallback function that checks the user document in Firestore if the custom claim isn't set:
```javascript
function hasAdminInFirestore() {
  return isAuthenticated() && 
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

function isAdmin() {
  return hasRole('admin') || hasAdminInFirestore();
}
```

This allows admin access even if the custom claim hasn't been refreshed yet.

### 3. Auto-Revoke Tokens on Admin Setup
Updated the admin setup API to automatically revoke all refresh tokens when granting admin role, forcing users to sign in again and get a fresh token with the custom claim.

## How to Fix Your Admin Access

### Option 1: Deploy Updated Rules (Recommended)
1. Deploy the updated Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Sign out and sign back in to your account

3. The fallback check should now allow you access even without the custom claim

### Option 2: Re-run Admin Setup
1. Visit `/admin/setup`
2. Enter your email and admin setup secret
3. The system will automatically revoke your tokens
4. Sign out and sign back in
5. You should now have admin access

### Option 3: Manual Token Refresh
1. Sign out of your account
2. Sign back in
3. This will refresh your token with the custom claim

## Verification

After fixing, you should be able to:
- ✅ Access `/admin/dashboard` without permission errors
- ✅ View bookings, users, tours, and vehicles
- ✅ See dashboard statistics
- ✅ Perform admin actions

## Additional Fix: Offline Sign-In Error

### Problem
Users were getting "Failed to get document because the client is offline" error when signing in, preventing login.

### Solution
Updated `AuthContext` to handle Firestore connection errors gracefully:
- Catches offline/connection errors during sign-in
- Uses Firebase Auth data as fallback if Firestore read fails
- Allows users to sign in even when Firestore is temporarily unavailable
- Syncs user profile to Firestore in background when connection is restored

### What Changed
1. **Error Handling in AuthContext**: Wrapped Firestore reads in try-catch blocks
2. **Graceful Degradation**: Users can sign in with auth data even if Firestore fails
3. **Background Sync**: Firestore profile sync happens asynchronously, non-blocking

## Troubleshooting

### Still Getting Permission Errors?

1. **Check Firestore Rules Deployment**
   ```bash
   firebase deploy --only firestore:rules
   ```
   Wait 1-2 minutes for rules to propagate.

2. **Verify User Document**
   - Go to Firebase Console → Firestore
   - Check `users/{your-uid}` document
   - Ensure `role` field is set to `"admin"`

3. **Verify Custom Claims**
   - Go to Firebase Console → Authentication → Users
   - Find your user
   - Check "Custom claims" section
   - Should show `{"role": "admin"}`

4. **Clear Browser Cache**
   - Clear cookies and localStorage
   - Sign out and sign back in

5. **Check Browser Console**
   - Open DevTools → Console
   - Look for specific permission error messages
   - Check which collection/operation is failing

### Still Getting "Client is Offline" Error?

1. **Check Internet Connection**
   - Ensure you have a stable internet connection
   - Try refreshing the page

2. **Check Firebase Status**
   - Visit https://status.firebase.google.com/
   - Verify Firebase services are operational

3. **Clear Browser Data**
   - Clear cookies, localStorage, and IndexedDB
   - This clears any cached offline state

4. **Check Firestore Rules**
   - Ensure rules are deployed correctly
   - Verify rules allow authenticated users to read their own document

5. **Try Incognito/Private Mode**
   - This eliminates browser extension or cache issues

## Technical Details

### Custom Claims vs Firestore Role
- **Custom Claims**: Set in Firebase Auth token, checked via `request.auth.token.role`
- **Firestore Role**: Stored in user document, checked via `get()` function
- **Best Practice**: Use custom claims for security rules (faster, no extra reads)
- **Fallback**: Check Firestore document if custom claim not available

### Performance Note
The `hasAdminInFirestore()` fallback does an extra Firestore read on every rule check. This is acceptable for admin operations but should be temporary. Once custom claims are properly set, the primary `hasRole('admin')` check will be used.

## Firestore Index Error Fix

### Problem
Admin pages were showing "The query requires an index" errors when filtering bookings by status and ordering by createdAt.

### Solution
Added comprehensive composite indexes to `firestore.indexes.json` to support all booking query combinations:
- `status` + `createdAt` (for status filtering)
- `bookingType` + `createdAt` (for type filtering)
- `userId` + `status` + `createdAt` (for user-specific filtered queries)
- And other combinations for pagination

### Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

**Note:** Index creation can take 5-30 minutes. The admin page will work once indexes are built.

## Files Modified

1. `firestore.rules` - Added stats collection rules and fallback admin check
2. `src/pages/api/admin/setup-first-admin.ts` - Added token revocation
3. `firestore.indexes.json` - Added comprehensive booking indexes
4. `docs/ADMIN_PERMISSIONS_FIX.md` - This documentation

## Next Steps

1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Test admin access
3. If issues persist, check Firebase Console for specific error details

