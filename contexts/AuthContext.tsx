import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { authService } from '../services/authService';
import { AuthContextType, User, RegisterRequest } from '../types';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  isGoogleConfigured
} from '../config/googleConfig';

import { GoogleSignin , isSuccessResponse ,isErrorWithCode , statusCodes}  from "@react-native-google-signin/google-signin";




// Complete auth session on web - required for proper redirect handling
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure redirect URI following Google's OAuth 2.0 validation rules
  // https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation
  // For Expo Go: Automatically uses https://auth.expo.io (HTTPS - complies with Google's rules)
  // For standalone builds: Uses custom scheme
  const redirectUri = makeRedirectUri({
    scheme: 'com.taskifyapp.taskify',
  });

  // Log the redirect URI for debugging
  console.log('AuthContext: Redirect URI:', redirectUri);
  console.log('AuthContext: Make sure this URI is added to Google Cloud Console');

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      redirectUri: redirectUri,
      // Request only necessary scopes
      scopes: ['profile', 'email'],
      // Use PKCE for better security (required for native apps)
      usePKCE: true,
      // Response type for authorization code flow
      responseType: 'code',
    }
  );

  useEffect(() => {
    checkAuthState();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleAuthSuccess(authentication.accessToken);
      } else {
        console.error('AuthContext: No access token in response');
      }
    } else if (response?.type === 'error') {
      console.error('AuthContext: Google auth error:', response.error);
    }
  }, [response]);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const [currentUser, authToken] = await Promise.all([
        authService.getCurrentUser(),
        authService.getAuthToken(),
      ]);

      if (currentUser && authToken) {
        setUser(currentUser);
        setToken(authToken);
      }
    } catch (error) {
      console.error('Auth state check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting login for username:', username);
      const authResponse = await authService.login({ username, password });
      console.log('AuthContext: Login successful, user:', authResponse.user);
      setUser(authResponse.user);
      setToken(authResponse.token);
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const authResponse = await authService.adminLogin({ username, password });
      
      if (authResponse.user.role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      setUser(authResponse.user);
      setToken(authResponse.token);
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting registration for username:', data.username);
      const authResponse = await authService.register(data);
      console.log('AuthContext: Registration successful, user:', authResponse.user);
      setUser(authResponse.user);
      setToken(authResponse.token);
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuthSuccess = async (accessToken: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Processing Google authentication');

      // Fetch user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
      }

      const userInfo = await userInfoResponse.json();
      console.log('AuthContext: Got Google user info', userInfo);

      // Validate required fields
      if (!userInfo.email) {
        throw new Error('Email not provided by Google. Please ensure email permission is granted.');
      }

      // Parse name
      const fullName = userInfo.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const googleUser: User = {
        id: userInfo.id || '',
        username: userInfo.email || userInfo.name || 'google_user',
        email: userInfo.email || '',
        firstName: firstName,
        lastName: lastName,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store the user and token
      await authService.saveAuthData(googleUser, accessToken);

      setUser(googleUser);
      setToken(accessToken);

      console.log('AuthContext: Google login complete');
    } catch (error: any) {
      console.error('AuthContext: Google authentication error:', error);
      // Clear any partial state
      setUser(null);
      setToken(null);
      throw new Error(error.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };


    const loginWithGoogle = async (): Promise<void> => {

        try{
            setIsLoading(true);
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if(isSuccessResponse(response))
            {

                const {idToken,user} = response.data;
                const {name , email , photo } = user;

                // Parse name into first and last name
                const nameParts = name?.split(' ') || [];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // Create user object
                const googleUser: User = {
                  id: user.id || '',
                  username: email || name || 'google_user',
                  email: email || '',
                  firstName: firstName,
                  lastName: lastName,
                  role: 'USER',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };

                // Save user data and idToken
                await authService.saveAuthData(googleUser, idToken || '');

                // Update state
                setUser(googleUser);
                setToken(idToken || '');

                console.log('AuthContext: Google login complete (native)');

            }
            else{
                // Sign-in was cancelled by user
                throw new Error('CANCELLED');
            }
            setIsLoading(false);

        }
        catch(error)
        {
            if(isErrorWithCode(error))
            {
                switch(error.code){
                    case statusCodes.SIGN_IN_CANCELLED:
                        throw new Error('CANCELLED');
                    case statusCodes.IN_PROGRESS:
                        throw new Error('IN_PROGRESS');
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        throw new Error('PLAY_SERVICES_NOT_AVAILABLE');
                    default:
                        throw new Error(error.code);
                }

            }
            else
            {
                throw new Error('Google Sign-In failed');
            }
        }

    }

  // const loginWithGoogle = async (): Promise<void> => {
  //   try {
  //     if (!isGoogleConfigured()) {
  //       throw new Error('Google Sign-In is not configured. Please add your Client IDs in config/googleConfig.ts');
  //     }
  //
  //     if (!request) {
  //       throw new Error('Google Sign-In is not ready. Please try again.');
  //     }
  //
  //     console.log('AuthContext: Starting Google Sign-In');
  //     console.log('AuthContext: Redirect URI:', redirectUri);
  //
  //     // Trigger the Google Sign-In flow
  //     const result = await promptAsync();
  //
  //     console.log('AuthContext: Google Sign-In result:', result.type);
  //
  //     if (result.type === 'cancel') {
  //       console.log('AuthContext: User cancelled Google Sign-In');
  //       throw new Error('CANCELLED');
  //     }
  //
  //     if (result.type === 'error') {
  //       console.error('AuthContext: Google Sign-In error:', result.error);
  //       throw new Error(result.error?.message || 'Authentication failed');
  //     }
  //
  //     if (result.type === 'dismiss') {
  //       console.log('AuthContext: Google Sign-In dismissed');
  //       throw new Error('CANCELLED');
  //     }
  //
  //     // Success case is handled by the useEffect hook
  //   } catch (error: any) {
  //     console.error('AuthContext: Google Sign-In error:', error);
  //
  //     if (error.message === 'CANCELLED') {
  //       throw error;
  //     }
  //
  //     throw new Error(error.message || 'Google Sign-In failed');
  //   }
  // };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await GoogleSignin.signOut();
      console.log('AuthContext: Starting logout');

      await authService.logout();
      setUser(null);
      setToken(null);
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    loginWithGoogle,
    adminLogin,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
