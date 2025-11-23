import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { localStorageService } from '../services/localStorageService';

const DebugScreen: React.FC = () => {
  const { user, login, register, logout } = useAuth();
  const { tasks, createTask, deleteTask } = useTask();
  const [debugInfo, setDebugInfo] = useState<string>('');

  const testLogin = async () => {
    try {
      console.log('Debug: Testing login with admin credentials');
      await login('admin', 'admin123');
      setDebugInfo('Login successful!');
    } catch (error: any) {
      console.error('Debug: Login failed:', error);
      setDebugInfo(`Login failed: ${error.message}`);
    }
  };

  const testRegister = async () => {
    try {
      console.log('Debug: Testing registration');
      const testUser = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      await register(testUser);
      setDebugInfo('Registration successful!');
    } catch (error: any) {
      console.error('Debug: Registration failed:', error);
      setDebugInfo(`Registration failed: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      console.log('Debug: Testing logout');
      await logout();
      setDebugInfo('Logout successful!');
    } catch (error: any) {
      console.error('Debug: Logout failed:', error);
      setDebugInfo(`Logout failed: ${error.message}`);
    }
  };

  const testCreateTask = async () => {
    try {
      console.log('Debug: Testing task creation');
      const testTask = {
        title: `Test Task ${Date.now()}`,
        description: 'This is a test task',
        priority: 'MEDIUM' as const,
        eisenhowerQuadrant: 'URGENT_IMPORTANT' as const,
        dueDate: new Date().toISOString(),
      };
      await createTask(testTask);
      setDebugInfo('Task creation successful!');
    } catch (error: any) {
      console.error('Debug: Task creation failed:', error);
      setDebugInfo(`Task creation failed: ${error.message}`);
    }
  };

  const testDeleteTask = async () => {
    try {
      if (tasks.length === 0) {
        setDebugInfo('No tasks to delete');
        return;
      }
      console.log('Debug: Testing task deletion');
      const taskToDelete = tasks[0];
      await deleteTask(taskToDelete.id);
      setDebugInfo('Task deletion successful!');
    } catch (error: any) {
      console.error('Debug: Task deletion failed:', error);
      setDebugInfo(`Task deletion failed: ${error.message}`);
    }
  };

  const checkStorage = async () => {
    try {
      console.log('Debug: Checking storage');
      await localStorageService.initializeStorage();
      const users = await (localStorageService as any).getUsers();
      const allTasks = await (localStorageService as any).getTasks();
      setDebugInfo(`Storage check: ${users.length} users, ${allTasks.length} tasks`);
    } catch (error: any) {
      console.error('Debug: Storage check failed:', error);
      setDebugInfo(`Storage check failed: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        <Text style={styles.info}>
          {user ? `${user.firstName} ${user.lastName} (${user.username})` : 'Not logged in'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <Text style={styles.info}>Total tasks: {tasks.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Functions</Text>
        
        <TouchableOpacity style={styles.button} onPress={testLogin}>
          <Text style={styles.buttonText}>Test Login (admin/admin123)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testRegister}>
          <Text style={styles.buttonText}>Test Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testLogout}>
          <Text style={styles.buttonText}>Test Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testCreateTask}>
          <Text style={styles.buttonText}>Test Create Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testDeleteTask}>
          <Text style={styles.buttonText}>Test Delete Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={checkStorage}>
          <Text style={styles.buttonText}>Check Storage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Info</Text>
        <Text style={styles.debugInfo}>{debugInfo}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  debugInfo: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
});

export default DebugScreen;
