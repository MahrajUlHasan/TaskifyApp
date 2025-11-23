import { localStorageService } from './localStorageService';
import { User, PaginatedResponse } from '../types';

interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  activeUsers: number;
  completedTasks: number;
  pendingTasks: number;
}

class AdminService {
  // Get all users (admin only)
  async getAllUsers(page: number = 0, size: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const allUsers = await localStorageService.getAllUsers();

      // Implement pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      return {
        content: paginatedUsers,
        totalElements: allUsers.length,
        totalPages: Math.ceil(allUsers.length / size),
        size,
        number: page,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }

  // Get admin statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      return await localStorageService.getAdminStats();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch admin statistics');
    }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    try {
      await localStorageService.deleteUser(userId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
    try {
      return await localStorageService.updateUserRole(userId, role);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user role');
    }
  }

  // Search users (admin only)
  async searchUsers(query: string, page: number = 0, size: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const allUsers = await localStorageService.searchUsers(query);

      // Implement pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      return {
        content: paginatedUsers,
        totalElements: allUsers.length,
        totalPages: Math.ceil(allUsers.length / size),
        size,
        number: page,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search users');
    }
  }
}

export const adminService = new AdminService();
