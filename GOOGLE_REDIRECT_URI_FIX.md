# 🔧 Fix: Google OAuth "Error 400: invalid_request" - Redirect URI Issue

## ❌ The Error You're Getting

```
Error 400: invalid_request
Request details: redirect_uri=exp://10.213.44.197:8081/--/auth
flowName=GeneralOAuthFlow
```

## 🔍 Why This Error Happens

Google is rejecting your redirect URI because:
1. ❌ **Uses `exp://` scheme** - Not HTTPS (violates Google's rules)
2. ❌ **Uses IP address** `10.213.44.197` - Google doesn't allow raw IP addresses
3. ❌ **Not registered** in Google Cloud Console

**Google's Rules:**
- ✅ Must use HTTPS (except localhost)
- ❌ Cannot use raw IP addresses (except localhost)
- ✅ Must be registered in Google Cloud Console

---

## ✅ The Solution

You need to add the **correct redirect URI** to your Google Cloud Console. When using Expo Go, the redirect URI should be:

```
https://auth.expo.io/@mahraj_ul_hasan/Taskify
```

**Why this works:**
- ✅ Uses HTTPS (complies with Google's rules)
- ✅ No IP address (uses Expo's auth proxy)
- ✅ Automatically handled by Expo

---

## 📝 Step-by-Step Fix

### **Step 1: Go to Google Cloud Console**

1. Open: https://console.cloud.google.com/apis/credentials
2. Select your project
3. Find your **Web OAuth Client** (the one with your Web Client ID)
4. Click on it to edit

---

### **Step 2: Add the Redirect URI**

1. Scroll down to **Authorized redirect URIs**
2. Click **+ ADD URI**
3. Add this **exact** URI:

```
https://auth.expo.io/@mahraj_ul_hasan/Taskify
```

**Important:**
- ✅ Must be **exactly** this format
- ✅ Case-sensitive!
- ✅ Your Expo username: `mahraj_ul_hasan`
- ✅ Your app slug: `Taskify` (from app.json)

4. Click **SAVE**

---

### **Step 3: Wait for Changes to Propagate**

⏱️ **Wait 5-10 minutes** for Google to update the configuration.

---

### **Step 4: Test Google Sign-In**

1. **Restart your dev server:**
   ```bash
   npm start -- --clear
   ```

2. **Open Expo Go** on your phone

3. **Scan the QR code**

4. **Try Google Sign-In:**
   - Tap "Continue with Google"
   - Browser opens
   - Sign in with Google
   - ✅ Should redirect back to app successfully!

---

## 🎯 Your Configuration Summary

### **Expo Account:**
```
Username: mahraj_ul_hasan
```

### **App Configuration (app.json):**
```json
{
  "expo": {
    "slug": "Taskify",
    "scheme": "com.taskifyapp.taskify"
  }
}
```

### **Redirect URIs to Add:**

#### **For Expo Go (Development):**
```
https://auth.expo.io/@mahraj_ul_hasan/Taskify
```

#### **For Standalone Builds (Production):**
```
com.taskifyapp.taskify://
```

#### **For Local Web Testing (Optional):**
```
http://localhost:8081
```

---

## 🔧 How It Works

### **Development (Expo Go):**
```
User taps "Sign in with Google"
    ↓
Opens browser with Google sign-in
    ↓
User signs in
    ↓
Google redirects to: https://auth.expo.io/@mahraj_ul_hasan/Taskify
    ↓
Expo's auth proxy forwards to your app via: exp://10.213.44.197:8081
    ↓
Your app receives the auth response
    ↓
✅ Success!
```

### **Production (Standalone App):**
```
User taps "Sign in with Google"
    ↓
Opens browser with Google sign-in
    ↓
User signs in
    ↓
Google redirects to: com.taskifyapp.taskify://
    ↓
Your app receives the auth response
    ↓
✅ Success!
```

---

## 📋 Complete Google Cloud Console Setup

### **1. Web OAuth Client**

**Client ID:** `46537333236-mtbqpibfvprbo8pvj8kc240ls3ai5ah6.apps.googleusercontent.com`

**Authorized redirect URIs:**
```
https://auth.expo.io/@mahraj_ul_hasan/Taskify
http://localhost:8081
```

---

### **2. Android OAuth Client**

**Client ID:** `46537333236-29l9i7npjia1ec2v2d4f35hbqj91t533.apps.googleusercontent.com`

**Package name:** `com.taskifyapp.taskify`

**SHA-1 certificate fingerprint:**
- Get from your debug keystore (see below)

**To get SHA-1:**
```bash
# Windows
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android

# Look for: SHA1: XX:XX:XX:...
```

---

### **3. iOS OAuth Client**

**Client ID:** `46537333236-mtbqpibfvprbo8pvj8kc240ls3ai5ah6.apps.googleusercontent.com`

**Bundle ID:** `com.taskifyapp.taskify`

---

## 🚨 Common Issues

### **Issue 1: Still getting "redirect_uri_mismatch"**

**Solution:**
1. Check console logs for the actual redirect URI being used
2. Make sure it **exactly** matches what you added to Google Cloud Console
3. Wait 5-10 minutes after adding the URI
4. Clear app cache: `npm start -- --clear`

---

### **Issue 2: "Error 400: invalid_request"**

**Solution:**
1. Make sure you added the URI to the **Web OAuth Client** (not Android or iOS)
2. Check for typos in the URI
3. Ensure it's HTTPS (not HTTP or exp://)

---

### **Issue 3: Works in Expo Go but not in standalone app**

**Solution:**
1. Add the standalone redirect URI: `com.taskifyapp.taskify://`
2. Make sure Android OAuth Client has correct package name and SHA-1
3. Make sure iOS OAuth Client has correct bundle ID

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Added `https://auth.expo.io/@mahraj_ul_hasan/Taskify` to Web OAuth Client
- [ ] Waited 5-10 minutes for changes to propagate
- [ ] Restarted dev server with `npm start -- --clear`
- [ ] Using Expo Go app (not standalone build)
- [ ] Expo username is correct: `mahraj_ul_hasan`
- [ ] App slug is correct: `Taskify`
- [ ] Web Client ID is configured in `config/googleConfig.ts`

---

## 🎓 Understanding Redirect URIs

### **What is a Redirect URI?**
The URL where Google sends the user after they sign in.

### **Why does Google validate it?**
Security! To prevent malicious apps from stealing your users' credentials.

### **Why use Expo's auth proxy?**
- ✅ Provides HTTPS (required by Google)
- ✅ No IP addresses (complies with Google's rules)
- ✅ Works seamlessly with Expo Go
- ✅ Automatically forwards to your local dev server

### **Format breakdown:**
```
https://auth.expo.io/@mahraj_ul_hasan/Taskify
│       │           │                 │
│       │           │                 └─ App slug (from app.json)
│       │           └─────────────────── Expo username
│       └─────────────────────────────── Expo's auth proxy domain
└─────────────────────────────────────── HTTPS (required by Google)
```

---

## 🚀 Next Steps

1. ✅ **Add redirect URI to Google Cloud Console** (see Step 2 above)
2. ⏱️ **Wait 5-10 minutes**
3. 🔄 **Restart dev server:** `npm start -- --clear`
4. 📱 **Test in Expo Go**
5. 🎉 **Enjoy working Google Sign-In!**

---

## 📞 Still Having Issues?

If you're still getting errors:

1. **Check console logs** for the actual redirect URI being used
2. **Share the error message** - the exact error helps diagnose the issue
3. **Verify Google Cloud Console** - make sure the URI is saved correctly
4. **Try incognito mode** - sometimes browser cache causes issues

---

**Last Updated:** Following Google's OAuth 2.0 redirect URI validation rules.

