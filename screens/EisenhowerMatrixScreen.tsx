import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTask } from '../contexts/TaskContext';
import { Task, EisenhowerQuadrant } from '../types';
import { EISENHOWER_QUADRANTS } from '../constants/api';
import { taskService } from '../services/taskService';
import { useRouter } from 'expo-router';

const EisenhowerMatrixScreen: React.FC = () => {
  const { tasks, isLoading, fetchTasks, updateTask } = useTask();
  const [matrixTasks, setMatrixTasks] = useState<Record<EisenhowerQuadrant, Task[]>>({
    URGENT_IMPORTANT: [],
    NOT_URGENT_IMPORTANT: [],
    URGENT_NOT_IMPORTANT: [],
    NOT_URGENT_NOT_IMPORTANT: [],
  });
  const router = useRouter();

  useEffect(() => {
    organizeTasksByQuadrant();
  }, [tasks]);

  const organizeTasksByQuadrant = () => {
    const organized: Record<EisenhowerQuadrant, Task[]> = {
      URGENT_IMPORTANT: [],
      NOT_URGENT_IMPORTANT: [],
      URGENT_NOT_IMPORTANT: [],
      NOT_URGENT_NOT_IMPORTANT: [],
    };

    tasks.forEach(task => {
      if (organized[task.eisenhowerQuadrant]) {
        organized[task.eisenhowerQuadrant].push(task);
      }
    });

    setMatrixTasks(organized);
  };

  const handleTaskPress = (task: Task) => {
    Alert.alert(
      task.title,
      task.description,
      [
        { text: 'View Details', onPress: () => router.push(`/task-detail?taskId=${task.id}`) },
        { text: 'Edit', onPress: () => router.push(`/edit-task?taskId=${task.id}`) },
        { text: 'Move to Different Quadrant', onPress: () => showMoveOptions(task) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showMoveOptions = (task: Task) => {
    const quadrantOptions = Object.entries(EISENHOWER_QUADRANTS)
      .filter(([key]) => key !== task.eisenhowerQuadrant)
      .map(([key, quadrant]) => ({
        text: quadrant.title,
        onPress: () => moveTaskToQuadrant(task, key as EisenhowerQuadrant),
      }));

    Alert.alert(
      'Move Task',
      `Move "${task.title}" to which quadrant?`,
      [
        ...quadrantOptions,
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const moveTaskToQuadrant = async (task: Task, newQuadrant: EisenhowerQuadrant) => {
    try {
      await updateTask(task.id, { eisenhowerQuadrant: newQuadrant });
      Alert.alert('Success', 'Task moved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to move task');
    }
  };

  const renderQuadrant = (quadrant: EisenhowerQuadrant) => {
    const quadrantInfo = EISENHOWER_QUADRANTS[quadrant];
    const quadrantTasks = matrixTasks[quadrant];

    return (
      <View key={quadrant} style={[styles.quadrant, { borderColor: quadrantInfo.color }]}>
        <View style={[styles.quadrantHeader, { backgroundColor: quadrantInfo.color }]}>
          <Text style={styles.quadrantTitle}>{quadrantInfo.title}</Text>
          <Text style={styles.quadrantSubtitle}>{quadrantInfo.subtitle}</Text>
          <Text style={styles.taskCount}>({quadrantTasks.length} tasks)</Text>
        </View>

        <ScrollView style={styles.quadrantContent} nestedScrollEnabled>
          {quadrantTasks.length === 0 ? (
            <View style={styles.emptyQuadrant}>
              <Text style={styles.emptyQuadrantText}>No tasks in this quadrant</Text>
            </View>
          ) : (
            quadrantTasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => handleTaskPress(task)}
              >
                <Text style={styles.taskCardTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.taskCardDescription} numberOfLines={2}>
                  {task.description}
                </Text>
                <View style={styles.taskCardMeta}>
                  <Text style={styles.taskCardStatus}>{task.status}</Text>
                  {task.dueDate && (
                    <Text style={styles.taskCardDueDate}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Eisenhower Matrix</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-task')}
          >
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchTasks} />
        }
      >
        <View style={styles.matrixContainer}>
          <View style={styles.matrixRow}>
            {renderQuadrant('URGENT_IMPORTANT')}
            {renderQuadrant('NOT_URGENT_IMPORTANT')}
          </View>
          <View style={styles.matrixRow}>
            {renderQuadrant('URGENT_NOT_IMPORTANT')}
            {renderQuadrant('NOT_URGENT_NOT_IMPORTANT')}
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Matrix Guide:</Text>
          <Text style={styles.legendItem}>🔴 Do First: Urgent & Important - Handle immediately</Text>
          <Text style={styles.legendItem}>🟢 Schedule: Important, Not Urgent - Plan and schedule</Text>
          <Text style={styles.legendItem}>🔵 Delegate: Urgent, Not Important - Delegate if possible</Text>
          <Text style={styles.legendItem}>🟡 Eliminate: Neither - Consider eliminating</Text>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  matrixContainer: {
    padding: 10,
  },
  matrixRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  quadrant: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    minHeight: 250,
    maxHeight: 300,
  },
  quadrantHeader: {
    padding: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  quadrantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  quadrantSubtitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },
  taskCount: {
    fontSize: 11,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  quadrantContent: {
    flex: 1,
    padding: 8,
  },
  emptyQuadrant: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyQuadrantText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  taskCardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },
  taskCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardStatus: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  taskCardDueDate: {
    fontSize: 10,
    color: '#999',
  },
  legend: {
    margin: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  legendItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default EisenhowerMatrixScreen;
