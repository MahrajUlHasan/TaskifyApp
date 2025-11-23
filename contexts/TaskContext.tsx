import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { taskService } from '../services/taskService';
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
