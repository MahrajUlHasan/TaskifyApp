import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

const DebugInfo: React.FC = () => {
  const [storageData, setStorageData] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);
  const { user, token } = useAuth();
  const { tasks } = useTask();

  const loadStorageData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data: any = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        try {
          data[key] = JSON.parse(value || '');
        } catch {
          data[key] = value;
        }
      }
      
      setStorageData(data);
    } catch (error) {
      console.error('Debug: Error loading storage data:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Debug: Storage cleared');
      await loadStorageData();
    } catch (error) {
      console.error('Debug: Error clearing storage:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadStorageData();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.toggleButtonText}>🐛</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Info</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth Context</Text>
          <Text style={styles.text}>User: {user ? user.username : 'null'}</Text>
          <Text style={styles.text}>Token: {token ? 'exists' : 'null'}</Text>
          <Text style={styles.text}>User Role: {user?.role || 'null'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks Context</Text>
          <Text style={styles.text}>Tasks Count: {tasks.length}</Text>
          {tasks.slice(0, 3).map((task, index) => (
            <Text key={index} style={styles.text}>
              Task {index + 1}: {task.title} (ID: {task.id})
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AsyncStorage</Text>
          {Object.entries(storageData).map(([key, value]) => (
            <View key={key} style={styles.storageItem}>
              <Text style={styles.storageKey}>{key}:</Text>
              <Text style={styles.storageValue}>
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={loadStorageData}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearStorage}>
            <Text style={styles.buttonText}>Clear Storage</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  toggleButtonText: {
    fontSize: 20,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#333',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  storageItem: {
    marginBottom: 10,
  },
  storageKey: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storageValue: {
    color: 'white',
    fontSize: 10,
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default DebugInfo;
