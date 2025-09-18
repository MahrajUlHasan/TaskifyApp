// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  eisenhowerQuadrant: EisenhowerQuadrant;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type EisenhowerQuadrant = 'URGENT_IMPORTANT' | 'NOT_URGENT_IMPORTANT' | 'URGENT_NOT_IMPORTANT' | 'NOT_URGENT_NOT_IMPORTANT';

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  eisenhowerQuadrant: EisenhowerQuadrant;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  eisenhowerQuadrant?: EisenhowerQuadrant;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AdminLogin: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Tasks: undefined;
  EisenhowerMatrix: undefined;
  Profile: undefined;
  Admin?: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  AddTask: undefined;
  EditTask: { taskId: string };
};

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: string, task: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
