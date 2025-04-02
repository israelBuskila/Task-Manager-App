# Task Management Application

A full-stack task management application built as part of a technical interview assignment. The application demonstrates modern web development practices using Next.js, Express, and MongoDB.

## Live Application
The application is currently deployed and accessible at:
- Frontend: [https://task-manager-app-hazel-nine.vercel.app](https://task-manager-app-hazel-nine.vercel.app)
- Database: MongoDB Atlas

## Features

### Authentication & Authorization
- Secure login and registration with JWT
- Role-based access (Admin and User roles)
- Persistent authentication with secure token management

### Task Management
- **Admin Features**:
  - Create and assign tasks to users
  - View and manage all tasks in system
  - Filter tasks by user, status, and priority
  - Monitor task assignments and progress
  
- **User Features**:
  - Create personal tasks (auto-assigned)
  - View assigned tasks (both self-created and admin-assigned)
  - Update task status, priority, and details
  - Delete tasks
  - Filter tasks by status and priority
  - Receive notifications for assigned tasks

### Smart Reminder System
- Three-tier notifications:
  - Urgent (1 hour before)
  - Soon (24 hours before)
  - Upcoming (72 hours before)
- Priority-based color coding:
  - High: Red
  - Medium: Yellow
  - Low: Blue
- Automatic checks on login, refresh, and periodic intervals

## Technical Implementation

### Frontend
- Next.js 14 (App Router)
- Mantine v7 for UI components
- Jotai for state management
- TypeScript for type safety
- Responsive design with modern UI/UX

### Backend
- Express with TypeScript
- MongoDB for data persistence
- JWT Authentication
- RESTful API architecture
- Error handling and validation

## Getting Started

### Prerequisites
- Node.js (>= 16.x)
- MongoDB
- npm or yarn

### Installation

1. **Clone and Install**
```bash
git clone https://github.com/yourusername/task-management-app.git
cd task-management-app
npm run install-all
```

2. **Environment Setup**

Server (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

Client (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Start Development**
```bash
npm run dev  # Starts both client and server
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get profile

### Tasks
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Key Features Implemented

### Task Assignment System
- Admin can assign tasks to specific users
- Users can create their own tasks (auto-assigned)
- Task ownership and permissions management
- Real-time task status updates

### User Experience
- Intuitive task creation and management
- Clear task assignment visualization
- Responsive design for all devices
- Smooth animations and transitions

### Security
- JWT-based authentication
- Role-based access control
- Secure token management
- Input validation and sanitization

## Task Assignment Flow

### Admin Task Management
1. **Task Creation**:
   - Admin creates a new task
   - Specifies task details (title, description, priority)
   - Sets due date and reminder date
   - Assigns task to specific user(s)

2. **Task Monitoring**:
   - View all tasks in the system
   - Track task progress and status
   - Filter tasks by user, status, or priority
   - Monitor task completion rates

### User Task Management
1. **Task Creation**:
   - User creates a personal task
   - Task is automatically assigned to the creator
   - Sets task details, priority, and deadlines
   - Receives notifications for task deadlines

2. **Task Management**:
   - View all assigned tasks (both self-created and admin-assigned)
   - Update task status and progress
   - Modify task details and priority
   - Delete completed tasks
   - Filter tasks by status or priority

### Task Notifications
1. **Reminder System**:
   - Urgent notifications (1 hour before deadline)
   - Soon notifications (24 hours before)
   - Upcoming notifications (72 hours before)
   - Priority-based notification colors

2. **Status Updates**:
   - Task completion notifications
   - Assignment notifications
   - Deadline reminders

## License

MIT License

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - General purpose, document-based, distributed database
- [Mantine](https://mantine.dev/) - React components library
- [Jotai](https://jotai.org/) - Primitive and flexible state management for React 