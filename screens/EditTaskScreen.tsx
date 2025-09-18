import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTask } from '../contexts/TaskContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TaskPriority, EisenhowerQuadrant, TaskStatus } from '../types';
import { TASK_PRIORITIES, EISENHOWER_QUADRANTS, TASK_STATUSES } from '../constants/api';

const EditTaskScreen: React.FC = () => {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { getTaskById, updateTask } = useTask();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    status: 'TODO' as TaskStatus,
    eisenhowerQuadrant: 'NOT_URGENT_IMPORTANT' as EisenhowerQuadrant,
    dueDate: null as Date | null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (taskId) {
      const task = getTaskById(taskId);
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          eisenhowerQuadrant: task.eisenhowerQuadrant,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        });
      } else {
        Alert.alert('Error', 'Task not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    }
  }, [taskId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dueDate: selectedDate }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !taskId) return;

    try {
      setIsLoading(true);
      await updateTask(taskId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        eisenhowerQuadrant: formData.eisenhowerQuadrant,
        dueDate: formData.dueDate?.toISOString(),
      });
      Alert.alert('Success', 'Task updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
          <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter task description"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.priority}
              onValueChange={(value) => handleInputChange('priority', value)}
              style={styles.picker}
            >
              {Object.entries(TASK_PRIORITIES).map(([key, priority]) => (
                <Picker.Item
                  key={key}
                  label={priority.label}
                  value={priority.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
              style={styles.picker}
            >
              {Object.entries(TASK_STATUSES).map(([key, status]) => (
                <Picker.Item
                  key={key}
                  label={status.label}
                  value={key}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Eisenhower Quadrant</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.eisenhowerQuadrant}
              onValueChange={(value) => handleInputChange('eisenhowerQuadrant', value)}
              style={styles.picker}
            >
              {Object.entries(EISENHOWER_QUADRANTS).map(([key, quadrant]) => (
                <Picker.Item
                  key={key}
                  label={`${quadrant.title} - ${quadrant.subtitle}`}
                  value={quadrant.key}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.dueDate
                ? formData.dueDate.toLocaleDateString()
                : 'Select due date'
              }
            </Text>
          </TouchableOpacity>
          {formData.dueDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => handleInputChange('dueDate', null)}
            >
              <Text style={styles.clearDateText}>Clear Date</Text>
            </TouchableOpacity>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  cancelButton: {
    fontSize: 16,
    color: '#FF3B30',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    color: '#ccc',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    fontSize: 14,
    color: '#FF3B30',
  },
});

export default EditTaskScreen;
