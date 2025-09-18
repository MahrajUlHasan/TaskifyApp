I'll analyze the codebase to identify all the API endpoints that the backend needs to implement. Let me examine the service files and contexts to gather this information.

Now let me get the type definitions to understand the expected request and response structures:

Now let me check if there are any additional endpoints in the user service:

Based on my analysis of the codebase, here's a comprehensive list of all the API endpoints your Spring Boot backend needs to implement:

# 📋 **Complete API Endpoints List for Spring Boot Backend**

## 🔐 **Authentication Endpoints**

### 1. **POST** `/api/auth/login`
**Purpose:** User login  
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Login successful"
}
```

### 2. **POST** `/api/auth/register`
**Purpose:** User registration  
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```
**Response:** Same as login response

### 3. **POST** `/api/auth/admin/login`
**Purpose:** Admin login (validates admin role)  
**Request Body:** Same as regular login  
**Response:** Same as login response (but user.role must be "ADMIN")

### 4. **POST** `/api/auth/refresh`
**Purpose:** Refresh JWT token  
**Request Body:**
```json
{
  "refreshToken": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_string"
  }
}
```

---

## 👤 **User Profile Endpoints**

### 5. **GET** `/api/users/profile`
**Purpose:** Get current user profile  
**Headers:** `Authorization: Bearer {token}`  
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "USER|ADMIN",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 6. **PUT** `/api/users/profile`
**Purpose:** Update user profile  
**Headers:** `Authorization: Bearer {token}`  
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string"
}
```
**Response:** Same as GET profile response

---

## 📋 **Task Management Endpoints**

### 7. **GET** `/api/tasks`
**Purpose:** Get user's tasks with pagination  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:** `?page=0&size=20`  
**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "priority": "LOW|MEDIUM|HIGH|URGENT",
        "status": "TODO|IN_PROGRESS|COMPLETED|CANCELLED",
        "dueDate": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "userId": "string",
        "eisenhowerQuadrant": "URGENT_IMPORTANT|NOT_URGENT_IMPORTANT|URGENT_NOT_IMPORTANT|NOT_URGENT_NOT_IMPORTANT"
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "size": 20,
    "number": 0
  }
}
```

### 8. **POST** `/api/tasks`
**Purpose:** Create new task  
**Headers:** `Authorization: Bearer {token}`  
**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "dueDate": "2024-01-01T00:00:00Z",
  "eisenhowerQuadrant": "URGENT_IMPORTANT|NOT_URGENT_IMPORTANT|URGENT_NOT_IMPORTANT|NOT_URGENT_NOT_IMPORTANT"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "priority": "LOW|MEDIUM|HIGH|URGENT",
    "status": "TODO",
    "dueDate": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "userId": "string",
    "eisenhowerQuadrant": "URGENT_IMPORTANT|NOT_URGENT_IMPORTANT|URGENT_NOT_IMPORTANT|NOT_URGENT_NOT_IMPORTANT"
  }
}
```

### 9. **GET** `/api/tasks/{id}`
**Purpose:** Get specific task by ID  
**Headers:** `Authorization: Bearer {token}`  
**Response:** Single task object (same structure as POST response)

### 10. **PUT** `/api/tasks/{id}`
**Purpose:** Update existing task  
**Headers:** `Authorization: Bearer {token}`  
**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "status": "TODO|IN_PROGRESS|COMPLETED|CANCELLED",
  "dueDate": "2024-01-01T00:00:00Z",
  "eisenhowerQuadrant": "URGENT_IMPORTANT|NOT_URGENT_IMPORTANT|URGENT_NOT_IMPORTANT|NOT_URGENT_NOT_IMPORTANT"
}
```
**Response:** Updated task object

### 11. **DELETE** `/api/tasks/{id}`
**Purpose:** Delete task  
**Headers:** `Authorization: Bearer {token}`  
**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### 12. **GET** `/api/tasks/quadrant/{quadrant}`
**Purpose:** Get tasks by Eisenhower quadrant  
**Headers:** `Authorization: Bearer {token}`  
**Path Parameters:** `quadrant` = `URGENT_IMPORTANT|NOT_URGENT_IMPORTANT|URGENT_NOT_IMPORTANT|NOT_URGENT_NOT_IMPORTANT`  
**Query Parameters:** `?page=0&size=20`  
**Response:** Same paginated structure as GET /api/tasks

### 13. **GET** `/api/tasks/search`
**Purpose:** Search tasks by query  
**Headers:** `Authorization: Bearer {token}`  
**Query Parameters:** `?q=search_term&page=0&size=20`  
**Response:** Same paginated structure as GET /api/tasks

---

## 👨‍💼 **Admin Endpoints**

### 14. **GET** `/api/admin/users`
**Purpose:** Get all users (admin only)  
**Headers:** `Authorization: Bearer {admin_token}`  
**Query Parameters:** `?page=0&size=20`  
**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "string",
        "username": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "USER|ADMIN",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "size": 20,
    "number": 0
  }
}
```

### 15. **GET** `/api/admin/stats`
**Purpose:** Get admin dashboard statistics  
**Headers:** `Authorization: Bearer {admin_token}`  
**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalTasks": 1250,
    "activeUsers": 75,
    "completedTasks": 800,
    "pendingTasks": 450
  }
}
```

### 16. **DELETE** `/api/admin/users/{id}`
**Purpose:** Delete user (admin only)  
**Headers:** `Authorization: Bearer {admin_token}`  
**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 17. **PATCH** `/api/admin/users/{id}/role`
**Purpose:** Update user role (admin only)  
**Headers:** `Authorization: Bearer {admin_token}`  
**Request Body:**
```json
{
  "role": "USER|ADMIN"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "USER|ADMIN",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 18. **GET** `/api/admin/users/search`
**Purpose:** Search users (admin only)  
**Headers:** `Authorization: Bearer {admin_token}`  
**Query Parameters:** `?q=search_term&page=0&size=20`  
**Response:** Same paginated structure as GET /api/admin/users

---

## 🔧 **Important Implementation Notes**

### **Authentication & Authorization:**
- All endpoints except auth endpoints require JWT token in Authorization header
- Admin endpoints require user role to be "ADMIN"
- Token refresh should be automatic when 401 is returned

### **Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### **HTTP Status Codes:**
- **200**: Success
- **201**: Created (for POST requests)
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

### **Database Considerations:**
- User passwords should be hashed (BCrypt recommended)
- Tasks should be linked to users via userId foreign key
- Implement proper indexing for search functionality
- Consider soft deletes for audit trails

This comprehensive API specification should cover all the functionality required by your React Native TaskifyApp frontend!
