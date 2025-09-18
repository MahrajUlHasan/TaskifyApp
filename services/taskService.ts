import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  ApiResponse, 
  PaginatedResponse,
  EisenhowerQuadrant 
} from '../types';

class TaskService {
  // Get all tasks for current user
  async getTasks(page: number = 0, size: number = 20): Promise<PaginatedResponse<Task>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Task>>>(
        `${API_ENDPOINTS.TASKS}?page=${page}&size=${size}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tasks');
    }
  }

  // Get task by ID
  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await apiClient.get<ApiResponse<Task>>(
        API_ENDPOINTS.TASK_BY_ID(id)
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch task');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch task');
    }
  }

  // Get tasks by Eisenhower quadrant
  async getTasksByQuadrant(quadrant: EisenhowerQuadrant): Promise<Task[]> {
    try {
      const response = await apiClient.get<ApiResponse<Task[]>>(
        API_ENDPOINTS.TASKS_BY_QUADRANT(quadrant)
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch tasks by quadrant');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tasks by quadrant');
    }
  }

  // Create new task
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.post<ApiResponse<Task>>(
        API_ENDPOINTS.TASKS,
        taskData
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create task');
    }
  }

  // Update task
  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.put<ApiResponse<Task>>(
        API_ENDPOINTS.TASK_BY_ID(id),
        taskData
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update task');
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.TASK_BY_ID(id)
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete task');
    }
  }

  // Mark task as completed
  async markTaskCompleted(id: string): Promise<Task> {
    return this.updateTask(id, { status: 'COMPLETED' });
  }

  // Mark task as in progress
  async markTaskInProgress(id: string): Promise<Task> {
    return this.updateTask(id, { status: 'IN_PROGRESS' });
  }

  // Mark task as todo
  async markTaskTodo(id: string): Promise<Task> {
    return this.updateTask(id, { status: 'TODO' });
  }

  // Cancel task
  async cancelTask(id: string): Promise<Task> {
    return this.updateTask(id, { status: 'CANCELLED' });
  }

  // Move task to different Eisenhower quadrant
  async moveTaskToQuadrant(id: string, quadrant: EisenhowerQuadrant): Promise<Task> {
    return this.updateTask(id, { eisenhowerQuadrant: quadrant });
  }

  // Get tasks grouped by Eisenhower matrix
  async getEisenhowerMatrix(): Promise<Record<EisenhowerQuadrant, Task[]>> {
    try {
      const [
        urgentImportant,
        notUrgentImportant,
        urgentNotImportant,
        notUrgentNotImportant
      ] = await Promise.all([
        this.getTasksByQuadrant('URGENT_IMPORTANT'),
        this.getTasksByQuadrant('NOT_URGENT_IMPORTANT'),
        this.getTasksByQuadrant('URGENT_NOT_IMPORTANT'),
        this.getTasksByQuadrant('NOT_URGENT_NOT_IMPORTANT')
      ]);

      return {
        URGENT_IMPORTANT: urgentImportant,
        NOT_URGENT_IMPORTANT: notUrgentImportant,
        URGENT_NOT_IMPORTANT: urgentNotImportant,
        NOT_URGENT_NOT_IMPORTANT: notUrgentNotImportant
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch Eisenhower matrix');
    }
  }

  // Search tasks
  async searchTasks(query: string, page: number = 0, size: number = 20): Promise<PaginatedResponse<Task>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Task>>>(
        `${API_ENDPOINTS.TASKS}/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to search tasks');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search tasks');
    }
  }
}

export const taskService = new TaskService();
