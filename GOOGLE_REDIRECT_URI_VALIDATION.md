# Google OAuth 2.0 Redirect URI Validation Rules

## 📚 Official Documentation

**Source:** https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation

This document explains Google's strict validation rules for OAuth 2.0 redirect URIs and how TaskifyApp complies with them.

---

## ✅ Google's Validation Rules

### **1. Scheme**
- ✅ **MUST** use HTTPS (not HTTP)
- ✅ **Exception:** Localhost URIs can use HTTP
- ✅ **Native apps:** Can use custom schemes (e.g., `com.taskifyapp.taskify://`)

**TaskifyApp Implementation:**
```
com.taskifyapp.taskify://
```

---

### **2. Host**
- ❌ **CANNOT** be raw IP addresses
- ✅ **Exception:** Localhost IP addresses (127.0.0.1) are allowed
- ✅ **MUST** be a valid domain name

**TaskifyApp Implementation:**
- Native app scheme (no host component)
- For web: Would use valid domain like `taskifyapp.com`

---

### **3. Domain**
- ✅ **MUST** have TLD from public suffix list
- ❌ **CANNOT** be `googleusercontent.com`
- ❌ **CANNOT** use URL shorteners (goo.gl, bit.ly, etc.)
- ✅ **Exception:** If you own the shortener domain AND include `/google-callback/` in path

**TaskifyApp Implementation:**
- Uses reverse domain notation: `com.taskifyapp.taskify`
- No URL shorteners

---

### **4. Userinfo**
- ❌ **CANNOT** contain userinfo subcomponent
- ❌ **Invalid:** `https://user:password@example.com/callback`
- ✅ **Valid:** `https://example.com/callback`

**TaskifyApp Implementation:**
- No userinfo component

---

### **5. Path**
- ❌ **CANNOT** contain path traversal (`/../` or `\..`)
- ❌ **Invalid:** `https://example.com/../callback`
- ❌ **Invalid:** `https://example.com/path\..\callback`
- ✅ **Valid:** `https://example.com/oauth2callback`

**TaskifyApp Implementation:**
- No path component for native apps
- Clean path for web (if implemented)

---

### **6. Query**
- ❌ **CANNOT** contain open redirects
- ❌ **Invalid:** `https://example.com/callback?redirect=https://evil.com`
- ✅ **Valid:** `https://example.com/callback`

**TaskifyApp Implementation:**
- No query parameters in redirect URI

---

### **7. Fragment**
- ❌ **CANNOT** contain fragment component
- ❌ **Invalid:** `https://example.com/callback#section`
- ✅ **Valid:** `https://example.com/callback`

**TaskifyApp Implementation:**
- No fragment component

---

### **8. Characters**
- ❌ **CANNOT** contain:
  - Wildcard characters (`*`)
  - Non-printable ASCII characters
  - Invalid percent encodings
  - Null characters (`%00`, `%C0%80`)

**TaskifyApp Implementation:**
- Only valid characters in scheme

---

## 🎯 TaskifyApp's Compliant Redirect URIs

### **For Native Apps (Android/iOS):**
```
com.taskifyapp.taskify://
```

**Validation:**
- ✅ Custom scheme (allowed for native apps)
- ✅ No forbidden characters
- ✅ No path traversal
- ✅ No fragments
- ✅ No query parameters
- ✅ No userinfo
- ✅ Follows reverse domain notation

---

### **For Expo Go Development:**
```
https://auth.expo.io/@your-username/Taskify
```

**Validation:**
- ✅ Uses HTTPS
- ✅ Valid domain (expo.io)
- ✅ No forbidden characters
- ✅ Clean path structure
- ✅ No fragments or query params

---

### **For Web (if implemented):**
```
https://taskifyapp.com/oauth2callback
```

**Validation:**
- ✅ Uses HTTPS
- ✅ Valid domain
- ✅ Clean path
- ✅ No forbidden components

---

## 🔧 Implementation in Code

### **AuthContext.tsx**

```typescript
import { makeRedirectUri } from 'expo-auth-session';

// Configure redirect URI following Google's validation rules
const redirectUri = makeRedirectUri({
  scheme: 'com.taskifyapp.taskify',
  // No path - follows Google's validation rules for native apps
});

const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  webClientId: GOOGLE_WEB_CLIENT_ID,
  redirectUri: redirectUri,
  scopes: ['profile', 'email'],
  usePKCE: true, // Required for native apps
  responseType: 'code', // Authorization code flow
});
```

---

## 📝 Google Cloud Console Configuration

### **Step 1: Web OAuth Client**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your Web OAuth Client
3. Under **Authorized redirect URIs**, add:

```
https://auth.expo.io/@your-expo-username/Taskify
http://localhost:8081
```

**Why these URIs?**
- First URI: For Expo Go testing (HTTPS required)
- Second URI: For local development (localhost exception)

---

### **Step 2: Android OAuth Client**

1. Create Android OAuth Client
2. **Package name:** `com.taskifyapp.taskify`
3. **SHA-1 fingerprint:** Your debug/release keystore SHA-1

**Note:** Android OAuth clients don't have redirect URI configuration - they use the package name and SHA-1 for validation.

---

### **Step 3: iOS OAuth Client**

1. Create iOS OAuth Client
2. **Bundle ID:** `com.taskifyapp.taskify`

**Note:** iOS OAuth clients use the bundle ID for validation.

---

## 🚨 Common Validation Errors

### **Error: "redirect_uri_mismatch"**

**Cause:** Redirect URI doesn't match any authorized URIs in Google Cloud Console.

**Fix:**
1. Check console logs for actual redirect URI being used
2. Add that **exact** URI to Google Cloud Console
3. URIs are case-sensitive!
4. Wait 5-10 minutes for changes to propagate

---

### **Error: "invalid_request"**

**Cause:** Redirect URI violates Google's validation rules.

**Common violations:**
- Using HTTP instead of HTTPS (except localhost)
- Including fragments (#)
- Including open redirects in query params
- Using forbidden characters

**Fix:**
- Review Google's validation rules above
- Ensure redirect URI is clean and simple
- Remove any query parameters or fragments

---

### **Error: "Error 400: redirect_uri_mismatch"**

**Cause:** The redirect URI format is invalid or not properly registered.

**Fix:**
1. For native apps, use: `com.taskifyapp.taskify://`
2. For Expo Go, use: `https://auth.expo.io/@username/Taskify`
3. Ensure no typos in the URI
4. Check that scheme matches app.json configuration

---

## 🔐 Security Best Practices

### **1. Use PKCE (Proof Key for Code Exchange)**
```typescript
usePKCE: true
```
- Required for native apps
- Prevents authorization code interception attacks

---

### **2. Use Authorization Code Flow**
```typescript
responseType: 'code'
```
- More secure than implicit flow
- Recommended by Google for all app types

---

### **3. Request Minimal Scopes**
```typescript
scopes: ['profile', 'email']
```
- Only request what you need
- Reduces security risk
- Better user experience

---

### **4. Validate State Parameter**
- Prevents CSRF attacks
- Automatically handled by expo-auth-session

---

### **5. Use HTTPS Everywhere**
- Except for localhost development
- Protects tokens in transit

---

## 📊 Redirect URI Checklist

Before deploying, verify your redirect URIs:

- [ ] Uses HTTPS (or valid custom scheme for native)
- [ ] No raw IP addresses (except localhost)
- [ ] Valid TLD from public suffix list
- [ ] Not using googleusercontent.com
- [ ] No URL shorteners
- [ ] No userinfo component
- [ ] No path traversal (/../)
- [ ] No open redirects in query
- [ ] No fragment component (#)
- [ ] No wildcard characters (*)
- [ ] No non-printable characters
- [ ] Properly registered in Google Cloud Console
- [ ] Matches app.json scheme configuration
- [ ] Tested with actual OAuth flow

---

## 🎓 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Redirect URI Validation Rules](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)
- [Expo Auth Session Docs](https://docs.expo.dev/guides/authentication/)
- [RFC 3986 - URI Specification](https://www.rfc-editor.org/rfc/rfc3986)

---

**Last Updated:** Following Google's OAuth 2.0 Web Server validation rules as of 2024.

