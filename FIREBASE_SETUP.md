# 🔥 Firebase Setup Guide

## 🚀 Quick Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `assignment-maker` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Add Web App
1. In your Firebase project, click the web icon (</>) to add a web app
2. Register app with name: `Assignment Maker`
3. Check "Set up Firebase Hosting" (optional)
4. Click "Register app"

### 3. Get Configuration
1. Copy the Firebase config object that looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 4. Update Configuration
1. Open `app/firebase/config.ts`
2. Replace the placeholder config with your actual Firebase config
3. Save the file

### 5. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 6. Set Up Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 7. Set Up Security Rules
1. In Firestore Database, go to "Rules" tab
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own documents
    match /documents/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
3. Click "Publish"

## 🎯 Features Now Available

### ✅ Authentication
- User registration and login
- Email/password authentication
- Secure user sessions
- Automatic login persistence

### ✅ Document Management
- Create and save documents
- Real-time document sync
- Cross-device access
- Document deletion
- User-specific document storage

### ✅ Security
- Documents are private to each user
- Secure authentication
- Data validation
- Protected routes

## 🔧 Configuration Details

### Environment Variables (Optional)
For production, you can use environment variables:

1. Create `.env.local` file:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

2. Update `app/firebase/config.ts`:
```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## 🚀 Deployment

### Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build your app: `npm run build`
5. Deploy: `firebase deploy`

### Vercel/Netlify
1. Push your code to GitHub
2. Connect your repository to Vercel/Netlify
3. Add environment variables in the deployment platform
4. Deploy!

## 📊 Database Structure

### Collections

#### `documents`
```javascript
{
  id: "auto-generated",
  userId: "user-uid",
  title: "Document Title",
  content: "<p>Document content...</p>",
  type: "assignment" | "presentation",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## 🔒 Security Rules Explained

The security rules ensure:
- Only authenticated users can access documents
- Users can only access their own documents
- No unauthorized access to other users' data
- Secure document creation and updates

## 💰 Pricing

### Free Tier (Spark Plan)
- **Authentication:** 10,000 users/month
- **Firestore:** 1GB storage, 50,000 reads/day, 20,000 writes/day
- **Hosting:** 10GB storage, 360MB/day transfer

### Paid Plans
- **Blaze Plan:** Pay-as-you-go, scales automatically
- **Enterprise:** Custom pricing for large organizations

## 🛠️ Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're only initializing Firebase once
   - Check for duplicate imports

2. **"Permission denied"**
   - Check Firestore security rules
   - Ensure user is authenticated
   - Verify document ownership

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active
   - Check browser console for errors

### Debug Mode
Add this to see detailed Firebase logs:
```javascript
// In config.ts
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase config:', firebaseConfig);
}
```

## 🎉 Success!

Once you've completed the setup:
1. Your app will have real cloud storage
2. Users can register and login securely
3. Documents sync across all devices
4. Data is backed up in the cloud
5. You can scale to millions of users

## 📞 Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support) 