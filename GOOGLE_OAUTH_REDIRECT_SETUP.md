# Google OAuth Redirect URI Setup Guide

## 📋 Overview

This guide explains how to properly configure Google OAuth redirect URIs for your TaskifyApp following **Google's OAuth 2.0 Redirect URI Validation Rules**.

**Reference:** https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation

---

## 🔑 Your App Configuration

**App Scheme:** `com.taskifyapp.taskify`
**Package Name (Android):** `com.taskifyapp.taskify`
**Bundle ID (iOS):** `com.taskifyapp.taskify`

---

## ⚠️ Google's Redirect URI Validation Rules

Google enforces strict validation rules for redirect URIs:

### **✅ Required:**
- **HTTPS scheme** (except for localhost)
- **No raw IP addresses** (except localhost)
- **Valid TLD** from public suffix list
- **No URL shorteners** (e.g., goo.gl)
- **No path traversal** (/../ or \..)
- **No fragments** (#)
- **No wildcards** (*)
- **No open redirects**

### **❌ Forbidden:**
- `googleusercontent.com` domains
- Userinfo subcomponents
- Non-printable ASCII characters
- Invalid percent encodings

---

## 🌐 Redirect URIs to Add in Google Cloud Console

### **1. For Development (Expo Go)**

```
https://auth.expo.io/@your-expo-username/Taskify
```

Replace `your-expo-username` with your actual Expo username.

**Note:** This uses HTTPS and is a valid Expo domain.

### **2. For Standalone/Production Builds (Native Apps)**

**Android & iOS:**
```
com.taskifyapp.taskify://
```

**Important:**
- Uses reverse domain notation (recommended by Google for native apps)
- No path component (cleaner and follows Google's guidelines)
- Ends with `://` (scheme with authority)

### **3. For Web (if applicable):**
```
https://yourdomain.com/oauth2callback
```

**Must use HTTPS** (not HTTP) unless it's localhost.

---

## 📝 Step-by-Step Setup in Google Cloud Console

### **Step 1: Go to Google Cloud Console**

1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Navigate to: **APIs & Services** → **Credentials**

---

### **Step 2: Configure OAuth Consent Screen**

1. Click **OAuth consent screen** in the left sidebar
2. Select **External** (unless you have a Google Workspace)
3. Fill in required fields:
   - **App name:** TaskifyApp
   - **User support email:** Your email
   - **Developer contact email:** Your email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Click **Save and Continue**

---

### **Step 3: Create/Update Web OAuth Client**

1. Go to **Credentials** tab
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. **Name:** TaskifyApp Web Client
5. **Authorized JavaScript origins:**
   ```
   http://localhost:8081
   https://localhost:8081
   ```
6. **Authorized redirect URIs:**
   ```
   https://auth.expo.io/@your-expo-username/Taskify
   http://localhost:8081
   ```
7. Click **Create**
8. **Copy the Client ID** - This is your `GOOGLE_WEB_CLIENT_ID`

---

### **Step 4: Create Android OAuth Client**

1. Click **Create Credentials** → **OAuth client ID**
2. Select **Android**
3. **Name:** TaskifyApp Android
4. **Package name:** `com.taskifyapp.taskify`
5. **SHA-1 certificate fingerprint:**
   
   **For Debug (Development):**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   
   **For Release (Production):**
   - Use your release keystore SHA-1
   - Get it from your signing keystore

6. Click **Create**
7. **Copy the Client ID** - This is your `GOOGLE_ANDROID_CLIENT_ID`

---

### **Step 5: Create iOS OAuth Client**

1. Click **Create Credentials** → **OAuth client ID**
2. Select **iOS**
3. **Name:** TaskifyApp iOS
4. **Bundle ID:** `com.taskifyapp.taskify`
5. Click **Create**
6. **Copy the Client ID** - This is your `GOOGLE_IOS_CLIENT_ID`

---

## ✅ Update Your Config File

Update `config/googleConfig.ts` with your Client IDs:

```typescript
// Web Client ID (OAuth 2.0 Client ID of type "Web application")
export const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID_HERE';

// Android Client ID (OAuth 2.0 Client ID of type "Android")
export const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID_HERE';

// iOS Client ID (OAuth 2.0 Client ID of type "iOS")
export const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID_HERE';
```

---

## 🔄 Redirect URI Format (Following Google's Rules)

The app uses this redirect URI format for native apps:

```
com.taskifyapp.taskify://
```

This is automatically generated using:
```typescript
makeRedirectUri({
  scheme: 'com.taskifyapp.taskify',
  // No path - follows Google's validation rules for native apps
})
```

**Why this format?**
- ✅ Uses reverse domain notation (matches package name)
- ✅ No forbidden characters or components
- ✅ No path traversal or fragments
- ✅ Complies with Google's OAuth 2.0 validation rules
- ✅ Works with PKCE (Proof Key for Code Exchange)

---

## 🚨 Common Issues & Solutions

### **Issue 1: "redirect_uri_mismatch" Error**

**Cause:** The redirect URI in your request doesn't match any authorized redirect URIs in Google Cloud Console.

**Solution:**
1. Check the exact redirect URI being used (check console logs for: `AuthContext: Redirect URI: ...`)
2. Add that **exact** URI to Google Cloud Console (case-sensitive!)
3. Common redirect URIs to add:
   - For Expo Go: `https://auth.expo.io/@your-username/Taskify`
   - For native builds: `com.taskifyapp.taskify://`
   - For localhost testing: `http://localhost:8081`
4. Wait 5-10 minutes for changes to propagate
5. Clear app cache and restart

---

### **Issue 2: "Error 400: invalid_request"**

**Cause:** Missing or incorrect OAuth client configuration.

**Solution:**
1. Verify all three Client IDs are correctly configured
2. Ensure OAuth consent screen is properly set up
3. Check that scopes (`profile`, `email`) are added

---

### **Issue 3: "This app isn't verified"**

**Cause:** Your app is in testing mode and the user isn't added as a test user.

**Solution:**
1. Go to **OAuth consent screen**
2. Under **Test users**, click **Add Users**
3. Add the Google accounts you want to test with
4. Or publish your app (requires verification for production)

---

### **Issue 4: "Access blocked: Authorization Error"**

**Cause:** App is trying to access scopes that aren't configured.

**Solution:**
1. Go to **OAuth consent screen**
2. Click **Edit App**
3. In **Scopes**, add:
   - `userinfo.email`
   - `userinfo.profile`
4. Save changes

---

## 🔐 Security Best Practices

1. **Never commit Client IDs to public repositories**
   - Use environment variables for production
   - Keep `googleConfig.ts` in `.gitignore` if needed

2. **Use PKCE (Proof Key for Code Exchange)**
   - Already enabled in the app with `usePKCE: true`
   - Provides additional security for mobile apps

3. **Validate redirect URIs**
   - Only add redirect URIs you actually use
   - Remove unused redirect URIs

4. **Rotate credentials if compromised**
   - Delete and recreate OAuth clients if exposed
   - Update app configuration immediately

---

## 📱 Testing Your Setup

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Run on device/emulator:**
   ```bash
   npm run android
   # or
   npm run ios
   ```

3. **Test Google Sign-In:**
   - Tap "Continue with Google"
   - Browser/WebView opens
   - Sign in with your Google account
   - Should redirect back to app
   - ✅ You're logged in!

4. **Check console logs:**
   - Look for "AuthContext: Redirect URI: ..."
   - Verify it matches what's in Google Cloud Console

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Auth Session Documentation](https://docs.expo.dev/guides/authentication/)
- [Google OAuth Redirect URI Guidelines](https://developers.google.com/identity/protocols/oauth2/native-app)

---

## 🎯 Quick Checklist

- [ ] OAuth consent screen configured
- [ ] Web OAuth Client created
- [ ] Android OAuth Client created with SHA-1
- [ ] iOS OAuth Client created
- [ ] All Client IDs added to `config/googleConfig.ts`
- [ ] Redirect URIs added to Google Cloud Console
- [ ] Test users added (if app is in testing mode)
- [ ] Scopes (`profile`, `email`) configured
- [ ] App tested on device/emulator

---

**Need Help?** Check the console logs for detailed error messages and redirect URI information.

