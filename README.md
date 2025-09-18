# TaskifyApp - React Native Task Management App

A comprehensive task management application built with React Native and Expo, featuring Eisenhower Matrix categorization, user authentication, and admin dashboard. The app communicates with a Spring Boot backend for data persistence and user management.

## Features

### 🔐 Authentication
- User registration and login
- Admin login with special privileges
- JWT token-based authentication
- Secure token storage and refresh

### 📋 Task Management
- Create, read, update, and delete tasks
- Task prioritization (Low, Medium, High, Urgent)
- Task status tracking (Todo, In Progress, Completed, Cancelled)
- Due date management
- Search and filter tasks

### 📊 Eisenhower Matrix
- Categorize tasks into four quadrants:
  - **Do First**: Urgent & Important
  - **Schedule**: Important, Not Urgent
  - **Delegate**: Urgent, Not Important
  - **Eliminate**: Neither Urgent nor Important
- Visual matrix representation
- Drag-and-drop task organization
- Quick task movement between quadrants

### 👨‍💼 Admin Dashboard
- View all registered users
- User role management (User/Admin)
- System statistics
- User account management
- Delete user accounts

### 📱 Mobile-First Design
- Responsive design for all screen sizes
- Intuitive navigation with bottom tabs
- Loading states and error handling
- Offline-ready architecture

## Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **React Context** for state management
- **Axios** for API communication
- **AsyncStorage** for local data persistence

### Backend Requirements
- **Spring Boot** REST API
- **JWT** authentication
- **PostgreSQL** database
- **Spring Security** for authentication

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TaskifyApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update the `API_CONFIG.BASE_URL` in `constants/api.ts`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://your-backend-url:8080/api', // Update this
     TIMEOUT: 10000,
   };
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For web: `npm run web`

## API Endpoints

The app expects the following REST API endpoints from your Spring Boot backend:

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/admin/login
POST /api/auth/refresh
```

### User Endpoints
```
GET /api/users/profile
PUT /api/users/profile
```

### Task Endpoints
```
GET /api/tasks
POST /api/tasks
GET /api/tasks/{id}
PUT /api/tasks/{id}
DELETE /api/tasks/{id}
GET /api/tasks/quadrant/{quadrant}
GET /api/tasks/search?q={query}
```

### Admin Endpoints
```
GET /api/admin/users
GET /api/admin/stats
DELETE /api/admin/users/{id}
PATCH /api/admin/users/{id}/role
GET /api/admin/users/search?q={query}
```

## Project Structure

```
TaskifyApp/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # App entry point
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   ├── admin-login.tsx    # Admin login screen
│   ├── main.tsx           # Main tab navigation
│   ├── add-task.tsx       # Add task screen
│   └── task-detail.tsx    # Task detail screen
├── screens/               # Screen components
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── AdminLoginScreen.tsx
│   ├── TaskListScreen.tsx
│   ├── EisenhowerMatrixScreen.tsx
│   ├── AdminDashboardScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── AddTaskScreen.tsx
│   └── TaskDetailScreen.tsx
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── TaskContext.tsx    # Task management state
├── services/              # API service layers
│   ├── apiClient.ts       # HTTP client configuration
│   ├── authService.ts     # Authentication services
│   ├── taskService.ts     # Task management services
│   └── adminService.ts    # Admin services
├── types/                 # TypeScript type definitions
│   └── index.ts
├── constants/             # App constants and configuration
│   ├── api.ts            # API endpoints and config
│   └── theme.ts          # Theme and styling constants
└── assets/               # Static assets
```

## Key Features Implementation

### Authentication Flow
1. User opens app → Check stored token
2. If valid token exists → Navigate to main app
3. If no token → Navigate to login screen
4. After successful login → Store token and user data
5. API requests automatically include auth headers

### Task Management
- Tasks are categorized using the Eisenhower Matrix
- Real-time updates across all screens
- Optimistic UI updates for better UX
- Error handling with user-friendly messages

### Admin Features
- Role-based access control
- Admin-only screens and features
- User management capabilities
- System statistics dashboard

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=http://localhost:8080/api
API_TIMEOUT=10000
```

### Customization
- Update colors in `constants/theme.ts`
- Modify API endpoints in `constants/api.ts`
- Adjust navigation structure in `app/_layout.tsx`

## Development

### Building for Production
```bash
# For Android
npm run build:android

# For iOS
npm run build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section
