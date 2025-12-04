import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TextInput,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTask } from '../contexts/TaskContext';
import { Task, EisenhowerQuadrant } from '../types';
import { EISENHOWER_QUADRANTS } from '../constants/api';
import {
  calculatePomodoroSchedule,
  formatTime,
  getSessionTypeName,
  getSessionTypeColor,
  getMotivationalMessage,
  PomodoroSchedule,
} from '../utils/pomodoroUtils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PomodoroScreen: React.FC = () => {
  const { tasks, fetchTasks } = useTask();
  const navigation = useNavigation();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [pomodoroSchedule, setPomodoroSchedule] = useState<PomodoroSchedule | null>(null);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hide tab bar when timer is running
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isRunning ? { display: 'none' } : undefined,
    });
  }, [isRunning, navigation]);

  // Handle Android back button when timer is running
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRunning) {
        handleStop();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    });

    return () => backHandler.remove();
  }, [isRunning]);

  // Refresh tasks when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  // Sort tasks by Eisenhower quadrant priority
  const sortedTasks = React.useMemo(() => {
    const quadrantOrder: EisenhowerQuadrant[] = [
      'URGENT_IMPORTANT',
      'NOT_URGENT_IMPORTANT',
      'URGENT_NOT_IMPORTANT',
      'NOT_URGENT_NOT_IMPORTANT',
    ];

    return [...tasks]
      .filter(task => task.status !== 'COMPLETED' && task.status !== 'CANCELLED')
      .sort((a, b) => {
        const aIndex = quadrantOrder.indexOf(a.eisenhowerQuadrant);
        const bIndex = quadrantOrder.indexOf(b.eisenhowerQuadrant);
        return aIndex - bIndex;
      });
  }, [tasks]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, remainingSeconds]);

  const handleSessionComplete = () => {
    if (!pomodoroSchedule) return;

    const currentSession = pomodoroSchedule.sessions[currentSessionIndex];
    
    // Show alert based on session type
    if (currentSession.type === 'work') {
      Alert.alert(
        '🎉 Focus Session Complete!',
        'Great work! Time for a break.',
        [
          {
            text: 'Start Break',
            onPress: () => moveToNextSession(),
          },
        ]
      );
    } else {
      Alert.alert(
        '⏰ Break Time Over!',
        'Ready to get back to work?',
        [
          {
            text: 'Start Working',
            onPress: () => moveToNextSession(),
          },
        ]
      );
    }
  };

  const moveToNextSession = () => {
    if (!pomodoroSchedule) return;

    const nextIndex = currentSessionIndex + 1;
    
    if (nextIndex >= pomodoroSchedule.sessions.length) {
      // All sessions complete
      Alert.alert(
        '🎊 Congratulations!',
        'You completed all Pomodoro sessions for this task!',
        [
          {
            text: 'Finish',
            onPress: () => resetPomodoro(),
          },
        ]
      );
      return;
    }

    setCurrentSessionIndex(nextIndex);
    setRemainingSeconds(pomodoroSchedule.sessions[nextIndex].duration * 60);
    setIsPaused(false);
  };

  const handleTaskSelect = (task: Task) => {
    if (isRunning) {
      Alert.alert(
        'Timer Running',
        'Please stop the current timer before selecting a new task.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedTask(task);
    setShowEstimateModal(true);
  };

  const handleStartPomodoro = () => {
    const minutes = parseInt(estimatedMinutes);
    
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of minutes.');
      return;
    }

    const schedule = calculatePomodoroSchedule(minutes);
    setPomodoroSchedule(schedule);
    setCurrentSessionIndex(0);
    setRemainingSeconds(schedule.sessions[0].duration * 60);
    setShowEstimateModal(false);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Timer',
      'Are you sure you want to stop the Pomodoro session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => resetPomodoro(),
        },
      ]
    );
  };

  const resetPomodoro = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSessionIndex(0);
    setRemainingSeconds(0);
    setPomodoroSchedule(null);
    setSelectedTask(null);
    setEstimatedMinutes('');
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const quadrant = EISENHOWER_QUADRANTS[item.eisenhowerQuadrant];
    
    return (
      <TouchableOpacity
        style={[styles.taskItem, { borderLeftColor: quadrant.color }]}
        onPress={() => handleTaskSelect(item)}
        disabled={isRunning}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={[styles.quadrantBadge, { backgroundColor: quadrant.color }]}>
            <Text style={styles.quadrantText}>{quadrant.title}</Text>
          </View>
        </View>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        {item.dueDate && (
          <Text style={styles.dueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const currentSession = pomodoroSchedule?.sessions[currentSessionIndex];
  const sessionType = currentSession?.type || 'work';

  return (
    <>
      {isRunning && selectedTask && currentSession ? (
        // Full-screen timer overlay
        <View style={[styles.fullScreenTimer, { backgroundColor: getSessionTypeColor(sessionType) }]}>
          <SafeAreaView style={styles.timerSafeArea} edges={['top']}>
            <Text style={styles.currentTaskTitle}>{selectedTask.title}</Text>
            <Text style={styles.sessionType}>{getSessionTypeName(sessionType)}</Text>
            <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
            <Text style={styles.motivationalText}>{getMotivationalMessage(sessionType)}</Text>

            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Session {currentSessionIndex + 1} of {pomodoroSchedule?.sessions.length}
              </Text>
            </View>

            <View style={styles.timerButtons}>
              <TouchableOpacity
                style={[styles.timerButton, styles.pauseButton]}
                onPress={handlePauseResume}
              >
                <Text style={styles.timerButtonText}>
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timerButton, styles.stopButton]}
                onPress={handleStop}
              >
                <Text style={styles.timerButtonText}>⏹️ Stop</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      ) : (
        // Task selection screen
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🍅 Pomodoro Timer</Text>
              <Text style={styles.headerSubtitle}>Select a task to start focusing</Text>
            </View>

            <FlatList
              data={sortedTasks}
              renderItem={renderTaskItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.taskList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tasks available</Text>
                  <Text style={styles.emptySubtext}>Create a task to start using Pomodoro</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      )}

      {/* Estimate Modal */}
      <Modal
        visible={showEstimateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEstimateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Estimate Time</Text>
            <Text style={styles.modalSubtitle}>
              How many minutes do you need to complete this task?
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter minutes (e.g., 60)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={estimatedMinutes}
              onChangeText={setEstimatedMinutes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEstimateModal(false);
                  setSelectedTask(null);
                  setEstimatedMinutes('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.startButton]}
                onPress={handleStartPomodoro}
              >
                <Text style={styles.startButtonText}>Start Pomodoro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskList: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  quadrantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  quadrantText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
  },
  // Full-screen timer styles
  fullScreenTimer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  timerSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  currentTaskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  sessionType: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 20,
  },
  motivationalText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressInfo: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  timerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PomodoroScreen;

