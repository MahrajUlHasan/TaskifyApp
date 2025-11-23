import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Task, CreateTaskRequest, UpdateTaskRequest, RegisterRequest, LoginRequest } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'taskify_users',
  TASKS: 'taskify_tasks',
  CURRENT_USER: 'taskify_current_user',
  USER_COUNTER: 'taskify_user_counter',
  TASK_COUNTER: 'taskify_task_counter',
};

// Default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@taskify.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default admin password (in real app, this would be hashed)
const DEFAULT_ADMIN_PASSWORD = 'admin123';

class LocalStorageService {
  // Initialize storage with default data
  async initializeStorage(): Promise<void> {
    try {
      console.log('LocalStorageService: Initializing storage...');
      const users = await this.getUsers();
      console.log('LocalStorageService: Current users count:', users.length);
      if (users.length === 0) {
        // Create default admin user
        console.log('LocalStorageService: Creating default admin user');
        await this.storeUsers([DEFAULT_ADMIN]);
        await this.storeUserPassword(DEFAULT_ADMIN.id, DEFAULT_ADMIN_PASSWORD);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_COUNTER, '1');
        console.log('LocalStorageService: Default admin user created');
      }

      const tasks = await this.getTasks();
      if (tasks.length === 0) {
        await this.storeTasks([]);
        await AsyncStorage.setItem(STORAGE_KEYS.TASK_COUNTER, '0');
      }
      console.log('LocalStorageService: Storage initialization complete');
    } catch (error) {
      console.error('LocalStorageService: Storage initialization error:', error);
    }
  }

  // User management
  private async getUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  private async storeUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Store users error:', error);
      throw error;
    }
  }

  private async storeUserPassword(userId: string, password: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`password_${userId}`, password);
    } catch (error) {
      console.error('Store password error:', error);
      throw error;
    }
  }

  private async getUserPassword(userId: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`password_${userId}`);
    } catch (error) {
      console.error('Get password error:', error);
      return null;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      console.log('LocalStorageService: Starting login for username:', credentials.username);
      await this.initializeStorage(); // Ensure storage is initialized
      const users = await this.getUsers();
      console.log('LocalStorageService: Found users:', users.length);
      console.log('LocalStorageService: Available usernames:', users.map(u => u.username));
      const user = users.find(u => u.username === credentials.username);

      if (!user) {
        console.log('LocalStorageService: User not found');
        throw new Error('Invalid username or password');
      }

      const storedPassword = await this.getUserPassword(user.id);
      console.log('LocalStorageService: Checking password for user:', user.id);
      if (storedPassword !== credentials.password) {
        console.log('LocalStorageService: Password mismatch');
        throw new Error('Invalid username or password');
      }

      // Generate a simple token (in real app, use proper JWT)
      const token = `token_${user.id}_${Date.now()}`;

      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      console.log('LocalStorageService: Login successful for user:', user.username);

      return { user, token };
    } catch (error) {
      console.error('LocalStorageService: Login error:', error);
      throw error;
    }
  }

  async adminLogin(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      const result = await this.login(credentials);
      
      if (result.user.role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      return result;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    try {
      console.log('LocalStorageService: Starting registration for username:', userData.username);
      const users = await this.getUsers();

      // Check if username or email already exists
      const existingUser = users.find(u =>
        u.username === userData.username || u.email === userData.email
      );

      if (existingUser) {
        console.log('LocalStorageService: User already exists');
        throw new Error('Username or email already exists');
      }

      // Generate new user ID
      const counterStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_COUNTER) || '0';
      const counter = parseInt(counterStr) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_COUNTER, counter.toString());

      const newUser: User = {
        id: `user-${counter.toString().padStart(3, '0')}`,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      await this.storeUsers(users);
      await this.storeUserPassword(newUser.id, userData.password);

      // Generate token and set current user
      const token = `token_${newUser.id}_${Date.now()}`;
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
      console.log('LocalStorageService: Registration successful for user:', newUser.username);

      return { user: newUser, token };
    } catch (error) {
      console.error('LocalStorageService: Registration error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      users[userIndex] = updatedUser;
      await this.storeUsers(users);

      // Update current user if it's the same user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Task management
  private async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Get tasks error:', error);
      return [];
    }
  }

  private async storeTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Store tasks error:', error);
      throw error;
    }
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const allTasks = await this.getTasks();
      return allTasks.filter(task => task.userId === userId);
    } catch (error) {
      console.error('Get user tasks error:', error);
      return [];
    }
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      
      // Generate new task ID
      const counterStr = await AsyncStorage.getItem(STORAGE_KEYS.TASK_COUNTER) || '0';
      const counter = parseInt(counterStr) + 1;
      await AsyncStorage.setItem(STORAGE_KEYS.TASK_COUNTER, counter.toString());

      const newTask: Task = {
        id: `task-${counter.toString().padStart(3, '0')}`,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: 'TODO',
        dueDate: taskData.dueDate,
        eisenhowerQuadrant: taskData.eisenhowerQuadrant,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tasks.push(newTask);
      await this.storeTasks(tasks);

      return newTask;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, userId: string, updates: UpdateTaskRequest): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === userId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const updatedTask = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      tasks[taskIndex] = updatedTask;
      await this.storeTasks(tasks);

      return updatedTask;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      console.log('LocalStorageService: Deleting task:', taskId, 'for user:', userId);
      const tasks = await this.getTasks();
      console.log('LocalStorageService: Total tasks before delete:', tasks.length);
      console.log('LocalStorageService: Task IDs:', tasks.map(t => `${t.id} (user: ${t.userId})`));

      const taskToDelete = tasks.find(t => t.id === taskId && t.userId === userId);
      if (!taskToDelete) {
        console.log('LocalStorageService: Task not found for deletion');
        console.log('LocalStorageService: Looking for task ID:', taskId, 'user ID:', userId);
        throw new Error('Task not found');
      }

      const filteredTasks = tasks.filter(t => !(t.id === taskId && t.userId === userId));
      console.log('LocalStorageService: Total tasks after filter:', filteredTasks.length);

      await this.storeTasks(filteredTasks);
      console.log('LocalStorageService: Task deleted successfully');
    } catch (error) {
      console.error('LocalStorageService: Delete task error:', error);
      throw error;
    }
  }

  async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    try {
      const tasks = await this.getTasks();
      return tasks.find(t => t.id === taskId && t.userId === userId) || null;
    } catch (error) {
      console.error('Get task by ID error:', error);
      return null;
    }
  }

  async searchTasks(userId: string, query: string): Promise<Task[]> {
    try {
      const userTasks = await this.getUserTasks(userId);
      const lowercaseQuery = query.toLowerCase();
      
      return userTasks.filter(task =>
        task.title.toLowerCase().includes(lowercaseQuery) ||
        task.description.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Search tasks error:', error);
      return [];
    }
  }

  async getTasksByQuadrant(userId: string, quadrant: string): Promise<Task[]> {
    try {
      const userTasks = await this.getUserTasks(userId);
      return userTasks.filter(task => task.eisenhowerQuadrant === quadrant);
    } catch (error) {
      console.error('Get tasks by quadrant error:', error);
      return [];
    }
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return this.getUsers();
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      if (userId === DEFAULT_ADMIN.id) {
        throw new Error('Cannot delete default admin user');
      }

      const users = await this.getUsers();
      const filteredUsers = users.filter(u => u.id !== userId);
      
      if (filteredUsers.length === users.length) {
        throw new Error('User not found');
      }

      await this.storeUsers(filteredUsers);
      await AsyncStorage.removeItem(`password_${userId}`);

      // Delete user's tasks
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(t => t.userId !== userId);
      await this.storeTasks(filteredTasks);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
    try {
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      users[userIndex] = {
        ...users[userIndex],
        role,
        updatedAt: new Date().toISOString(),
      };

      await this.storeUsers(users);
      return users[userIndex];
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const users = await this.getUsers();
      const lowercaseQuery = query.toLowerCase();
      
      return users.filter(user =>
        user.username.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery) ||
        user.firstName.toLowerCase().includes(lowercaseQuery) ||
        user.lastName.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalTasks: number;
    activeUsers: number;
    completedTasks: number;
    pendingTasks: number;
  }> {
    try {
      const users = await this.getUsers();
      const tasks = await this.getTasks();
      
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
      const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
      
      // For simplicity, consider all users as active
      const activeUsers = users.length;

      return {
        totalUsers: users.length,
        totalTasks: tasks.length,
        activeUsers,
        completedTasks,
        pendingTasks,
      };
    } catch (error) {
      console.error('Get admin stats error:', error);
      return {
        totalUsers: 0,
        totalTasks: 0,
        activeUsers: 0,
        completedTasks: 0,
        pendingTasks: 0,
      };
    }
  }
}

export const localStorageService = new LocalStorageService();
