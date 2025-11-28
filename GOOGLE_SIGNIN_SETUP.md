# Google Sign-In Setup Guide for TaskifyApp (Expo)

This guide will help you set up Google Sign-In for your TaskifyApp using Expo.

## 📋 Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Expo development environment
- Your app's package name (from `app.json`)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: **"TaskifyApp"** (or your preferred name)
5. Click **"Create"**

### Step 2: Enable Required APIs

1. In your project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** and enable it
3. Search for **"Google People API"** and enable it (for user info)

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: TaskifyApp
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. Skip the "Scopes" section (click **"Save and Continue"**)
7. Add test users if needed (your email)
8. Click **"Save and Continue"**

### Step 4: Create OAuth 2.0 Credentials

#### 4.1 Create Web Client ID (REQUIRED)

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"**
4. Name: **"TaskifyApp Web Client"**
5. Click **"Create"**
6. **IMPORTANT**: Copy the **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
7. Click **"OK"**

#### 4.2 Create Android Client ID (Optional - for Android builds)

1. Click **"Create Credentials"** > **"OAuth client ID"**
2. Select **"Android"**
3. Name: **"TaskifyApp Android"**
4. Package name: `com.taskifyapp.taskify` (from your `app.json`)
5. Get SHA-1 certificate fingerprint:
   
   **For Development:**
   ```bash
   # Windows
   cd android
   gradlew signingReport
   
   # Mac/Linux
   cd android
   ./gradlew signingReport
   ```
   
   Look for the SHA-1 under "Variant: debug" and copy it.
   
6. Paste the SHA-1 fingerprint
7. Click **"Create"**

#### 4.3 Create iOS Client ID (Optional - for iOS builds)

1. Click **"Create Credentials"** > **"OAuth client ID"**
2. Select **"iOS"**
3. Name: **"TaskifyApp iOS"**
4. Bundle ID: `com.taskifyapp.taskify` (from your `app.json`)
5. Click **"Create"**

---

## 🔑 Step 5: Add Your Web Client ID to the App

1. Open the file: **`config/googleConfig.ts`**
2. Find this line:
   ```typescript
   export const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID_HERE';
   ```
3. Replace `'YOUR_GOOGLE_WEB_CLIENT_ID_HERE'` with your actual Web Client ID:
   ```typescript
   export const GOOGLE_WEB_CLIENT_ID = '123456789-abcdefg.apps.googleusercontent.com';
   ```
4. Save the file

---

## 📱 Step 6: Platform-Specific Configuration

### For Android

If you created an Android OAuth client:

1. Download the `google-services.json` file:
   - Go to **"APIs & Services"** > **"Credentials"**
   - Find your Android client
   - Download the configuration file
2. Place it in the root of your project: `./google-services.json`

### For iOS

If you created an iOS OAuth client:

1. Download the `GoogleService-Info.plist` file:
   - Go to **"APIs & Services"** > **"Credentials"**
   - Find your iOS client
   - Download the configuration file
2. Place it in the root of your project: `./GoogleService-Info.plist`

---

## ✅ Step 7: Test Google Sign-In

1. Start your development server:
   ```bash
   npm start
   ```

2. Run the app on your device/emulator:
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

3. On the login screen, tap the **"Continue with Google"** button
4. Select your Google account
5. Grant permissions
6. You should be logged in!

---

## 🔧 Troubleshooting

### Error: "Google Sign-In is not configured"

- Make sure you've added your Web Client ID in `config/googleConfig.ts`
- The Client ID should NOT be `'YOUR_GOOGLE_WEB_CLIENT_ID_HERE'`

### Error: "DEVELOPER_ERROR" or "API not enabled"

- Make sure you've enabled the Google Sign-In API in Google Cloud Console
- Wait a few minutes for the API to be fully enabled

### Error: "Sign in failed" on Android

- Make sure your SHA-1 certificate fingerprint is correct
- For development, use the debug keystore SHA-1
- For production, use the release keystore SHA-1

### Error: "Google Play Services not available"

- This only affects Android
- Make sure Google Play Services is installed on your device/emulator
- Update Google Play Services to the latest version

### Button doesn't work

- Check the console logs for error messages
- Make sure you've installed the package: `npm install @react-native-google-signin/google-signin`

---

## 🎯 What Happens When You Sign In?

Currently, the app creates a local user account based on your Google profile:

- **ID**: Your Google user ID
- **Username**: Your Google email
- **Email**: Your Google email
- **Name**: Parsed from your Google display name
- **Role**: USER

### ⚠️ Production Note

In a production app, you should:

1. Send the Google ID token to your backend server
2. Verify the token on the server
3. Create or retrieve the user from your database
4. Return a session token to the app

The current implementation is for **development/testing only**.

---

## 📚 Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/web/sign-in)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the console logs in your terminal
2. Check the error messages in the app
3. Verify all credentials are correct
4. Make sure all APIs are enabled in Google Cloud Console
5. Wait a few minutes after making changes (propagation time)

---

## ✨ Features Implemented

- ✅ Google Sign-In button on login screen
- ✅ Automatic user creation from Google profile
- ✅ Proper error handling
- ✅ Loading states
- ✅ Sign out from Google on logout
- ✅ Beautiful UI with Google branding

Enjoy using Google Sign-In in your TaskifyApp! 🎉

