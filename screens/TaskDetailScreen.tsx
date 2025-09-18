import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTask } from '../contexts/TaskContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Task } from '../types';
import { TASK_PRIORITIES, TASK_STATUSES, EISENHOWER_QUADRANTS } from '../constants/api';

const TaskDetailScreen: React.FC = () => {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { getTaskById, updateTask, deleteTask } = useTask();
  const [task, setTask] = useState<Task | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (taskId) {
      const foundTask = getTaskById(taskId);
      setTask(foundTask || null);
    }
  }, [taskId]);

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task) return;

    try {
      await updateTask(task.id, { status: newStatus });
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Success', 'Task status updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task status');
    }
  };

  const handleDelete = () => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              Alert.alert('Success', 'Task deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (task) {
      router.push(`/edit-task?taskId=${task.id}`);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
        </View>
      </View>
    );
  }

  const quadrantInfo = EISENHOWER_QUADRANTS[task.eisenhowerQuadrant];
  const priorityInfo = TASK_PRIORITIES[task.priority];
  const statusInfo = TASK_STATUSES[task.status];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusTag, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Priority:</Text>
            <View style={[styles.metaTag, { backgroundColor: priorityInfo.color }]}>
              <Text style={styles.metaTagText}>{priorityInfo.label}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Quadrant:</Text>
            <View style={[styles.metaTag, { backgroundColor: quadrantInfo.color }]}>
              <Text style={styles.metaTagText}>{quadrantInfo.title}</Text>
            </View>
          </View>

          {task.dueDate && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date:</Text>
              <Text style={styles.metaValue}>
                {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValue}>
              {new Date(task.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Updated:</Text>
            <Text style={styles.metaValue}>
              {new Date(task.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.statusActions}>
            {Object.entries(TASK_STATUSES).map(([key, status]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.statusButton,
                  { backgroundColor: status.color },
                  task.status === key && styles.activeStatusButton
                ]}
                onPress={() => handleStatusChange(key as Task['status'])}
                disabled={task.status === key}
              >
                <Text style={styles.statusButtonText}>{status.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  metaSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metaLabel: {
    fontSize: 16,
    color: '#666',
  },
  metaTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  activeStatusButton: {
    opacity: 0.5,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
});

export default TaskDetailScreen;
