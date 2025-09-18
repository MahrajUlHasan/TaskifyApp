import React from 'react';
import { Stack } from "expo-router";
import { AuthProvider } from '../contexts/AuthContext';
import { TaskProvider } from '../contexts/TaskContext';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
  return (
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
  );
}
