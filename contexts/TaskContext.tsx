import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { taskService } from '../services/taskService';
import { googleCalendarService } from '../services/googleCalendarService';
import { TaskContextType, Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { useAuth } from './AuthContext';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await taskService.getTasks();
      setTasks(response.content);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
      console.error('Fetch tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const newTask = await taskService.createTask(taskData);

      // Sync with Google Calendar
      const calendarEventId = await googleCalendarService.createCalendarEvent(newTask);
      if (calendarEventId) {
        // Update task with calendar event ID
        newTask.googleCalendarEventId = calendarEventId;
        await taskService.updateTask(newTask.id, { googleCalendarEventId: calendarEventId } as UpdateTaskRequest);
      }

      setTasks(prevTasks => [...prevTasks, newTask]);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      console.error('Create task error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, taskData: UpdateTaskRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedTask = await taskService.updateTask(id, taskData);

      // Sync with Google Calendar
      if (updatedTask.googleCalendarEventId) {
        await googleCalendarService.updateCalendarEvent(updatedTask, updatedTask.googleCalendarEventId);
      } else {
        // If no calendar event exists, try to find it or create one
        const existingEventId = await googleCalendarService.findEventByTaskId(updatedTask.id);
        if (existingEventId) {
          await googleCalendarService.updateCalendarEvent(updatedTask, existingEventId);
          updatedTask.googleCalendarEventId = existingEventId;
        } else {
          const newEventId = await googleCalendarService.createCalendarEvent(updatedTask);
          if (newEventId) {
            updatedTask.googleCalendarEventId = newEventId;
            await taskService.updateTask(updatedTask.id, { googleCalendarEventId: newEventId } as UpdateTaskRequest);
          }
        }
      }

      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === id ? updatedTask : task))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      console.error('Update task error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('TaskContext: Starting delete task with id:', id);

      // Find the task to get its calendar event ID
      const taskToDelete = tasks.find(task => task.id === id);

      // Delete from Google Calendar first
      if (taskToDelete?.googleCalendarEventId) {
        await googleCalendarService.deleteCalendarEvent(taskToDelete.googleCalendarEventId);
      } else if (taskToDelete) {
        // Try to find and delete the event by task ID
        const eventId = await googleCalendarService.findEventByTaskId(taskToDelete.id);
        if (eventId) {
          await googleCalendarService.deleteCalendarEvent(eventId);
        }
      }

      // Delete from local storage
      await taskService.deleteTask(id);
      setTasks(prevTasks => {
        const filteredTasks = prevTasks.filter(task => task.id !== id);
        console.log('TaskContext: Task deleted, remaining tasks:', filteredTasks.length);
        return filteredTasks;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      console.error('TaskContext: Delete task error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  const value: TaskContextType = {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
