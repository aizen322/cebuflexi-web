# Firebase Storage Rules Setup Guide

## The Problem
You're getting CORS errors because Firebase Storage Security Rules are blocking the upload. The preflight request is being rejected.

## Solution: Update Firebase Storage Rules

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your project: **cebuflexitours**

### Step 2: Navigate to Storage Rules
1. Click on **Storage** in the left sidebar
2. Click on the **Rules** tab (at the top)

### Step 3: Replace the Rules
Copy and paste this EXACT code into the rules editor:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload tour images
    match /tours/{tourId}/images/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to upload vehicle images
    match /vehicles/{vehicleId}/image/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to upload landmark images
    match /landmarks/{landmarkId}/image/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish
1. Click **Publish** button
2. Wait for confirmation that rules are published

### Step 5: Test
Try creating a tour again. The upload should work now.

## Alternative: If You Want Admin-Only Uploads

If you use custom claims for admin roles, use this instead:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tours/{tourId}/images/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'moderator');
    }
    
    match /vehicles/{vehicleId}/image/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'moderator');
    }
    
    match /landmarks/{landmarkId}/image/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'moderator');
    }
    
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Troubleshooting

### If rules don't work:
1. Make sure you're logged in as an admin user
2. Check that Storage is enabled in your Firebase project
3. Verify the bucket name matches: `cebuflexitours.firebasestorage.app`
4. Try clearing browser cache and refreshing

### Current Rules Check
Your current rules might be something like:
```javascript
allow read, write: if false;
```
This blocks everything! You need to allow authenticated writes for the specific paths.

