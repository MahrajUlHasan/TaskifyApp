// ⚠️ GOOGLE CLIENT IDs - CONFIGURED ⚠️
// Get these from Google Cloud Console > APIs & Services > Credentials

// Web Client ID (OAuth 2.0 Client ID of type "Web application")
export const GOOGLE_WEB_CLIENT_ID = '46537333236-mtbqpibfvprbo8pvj8kc240ls3ai5ah6.apps.googleusercontent.com';

// Android Client ID (OAuth 2.0 Client ID of type "Android")
// Package name: com.taskifyapp.taskify
export const GOOGLE_ANDROID_CLIENT_ID = '46537333236-29l9i7npjia1ec2v2d4f35hbqj91t533.apps.googleusercontent.com';

// iOS Client ID (OAuth 2.0 Client ID of type "iOS")
// Bundle ID: com.taskifyapp.taskify
export const GOOGLE_IOS_CLIENT_ID = '46537333236-mtbqpibfvprbo8pvj8kc240ls3ai5ah6.apps.googleusercontent.com';

/**
 * Validates if Google configuration is set up
 */
export const isGoogleConfigured = (): boolean => {
  const hasWebClientId = GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID.length > 0;
  const hasAndroidClientId = GOOGLE_ANDROID_CLIENT_ID && GOOGLE_ANDROID_CLIENT_ID.length > 0;

  // We need both web and android client IDs
  return hasWebClientId && hasAndroidClientId;
};

export const getGoogleClientId = (): string => {
  return GOOGLE_WEB_CLIENT_ID;
};

