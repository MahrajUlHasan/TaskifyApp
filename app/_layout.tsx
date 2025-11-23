import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { TaskProvider } from '../contexts/TaskContext';
import ErrorBoundary from '../components/ErrorBoundary';
import DebugInfo from '../components/DebugInfo';

export const STATUS_BAR_COLOR = '#007AFF'; // iOS blue color - exported for use in screens

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={STATUS_BAR_COLOR}
          translucent={false}
        />

        <ErrorBoundary>
          <AuthProvider>
            <TaskProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="admin-login" />
                <Stack.Screen name="main" />
                <Stack.Screen name="(main)" />
                <Stack.Screen name="add-task" />
                <Stack.Screen name="edit-task" />
                <Stack.Screen name="task-detail" />
              </Stack>
            </TaskProvider>
          </AuthProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STATUS_BAR_COLOR,
  },
});
