import { localStorageService } from './localStorageService';
import { authService } from './authService';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  PaginatedResponse,
  EisenhowerQuadrant
} from '../types';

class TaskService {
  private async getCurrentUserId(): Promise<string> {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('No user logged in');
    }
    return user.id;
  }

  // Get all tasks for current user
  async getTasks(page: number = 0, size: number = 20): Promise<PaginatedResponse<Task>> {
    try {
      const userId = await this.getCurrentUserId();
      const allTasks = await localStorageService.getUserTasks(userId);

      // Implement pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedTasks = allTasks.slice(startIndex, endIndex);

      return {
        content: paginatedTasks,
        totalElements: allTasks.length,
        totalPages: Math.ceil(allTasks.length / size),
        size,
        number: page,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tasks');
    }
  }

  // Get task by ID
  async getTaskById(id: string): Promise<Task> {
    try {
      const userId = await this.getCurrentUserId();
      const task = await localStorageService.getTaskById(id, userId);

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch task');
    }
  }

  // Get tasks by Eisenhower quadrant
  async getTasksByQuadrant(quadrant: EisenhowerQuadrant): Promise<Task[]> {
    try {
      const userId = await this.getCurrentUserId();
      return await localStorageService.getTasksByQuadrant(userId, quadrant);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tasks by quadrant');
    }
  }

  // Create new task
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    try {
      const userId = await this.getCurrentUserId();
      return await localStorageService.createTask(userId, taskData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create task');
    }
  }

  // Update task
  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<Task> {
    try {
      const userId = await this.getCurrentUserId();
      return await localStorageService.updateTask(id, userId, taskData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update task');
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      await localStorageService.deleteTask(id, userId);
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
      const userId = await this.getCurrentUserId();
      const allTasks = await localStorageService.searchTasks(userId, query);

      // Implement pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedTasks = allTasks.slice(startIndex, endIndex);

      return {
        content: paginatedTasks,
        totalElements: allTasks.length,
        totalPages: Math.ceil(allTasks.length / size),
        size,
        number: page,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search tasks');
    }
  }
}

export const taskService = new TaskService();
