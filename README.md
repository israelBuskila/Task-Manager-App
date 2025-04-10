# Task Management Application

A full-stack task management application built as part of a technical interview assignment. The application demonstrates modern web development practices using Next.js, Express, and MongoDB.

## Live Application
The application is currently deployed and accessible at:
- Frontend: [https://task-manager-app-hazel-nine.vercel.app](https://task-manager-app-hazel-nine.vercel.app)
- Backend: Hosted on Render
- Database: MongoDB Atlas

> **Note**: The backend server may experience a cold start delay of up to 50 seconds after periods of inactivity. This is normal behavior for the free tier of Render. Please be patient when making the first request after a period of inactivity.

### Test Account
For testing purposes, you can use the following admin account:
- Email: admin1@gmail.com
- Password: admin1

## Screenshots
Here are some screenshots showcasing the application's interface and features:

### Login Page
The clean and modern login interface with email and password fields, featuring a "Create account" option for new users.
![Login Page](client/screenshots/loginPage.png)

### Admin Dashboard
The main admin dashboard showing task management interface with task list, filters, and task creation options.
![Admin Dashboard](client/screenshots/dasboardAdminPanel.png)

### Admin Menu
The admin navigation menu with options for my Dasboard and admin Dashboard.
![Admin Menu](client/screenshots/dasboardAdminMenu.png)

### Task Card in Admin Dashboard
Detailed view of a task card showing task information, status, priority, and management options.
![Task Card](client/screenshots/taskCardAdminDasboard.png)

### Admin Statistics Panel
s](client/screenshots/dashboardadminStatistics.png)

### Theme Toggle
The application's dark/light theme toggle feature for personalized user experience.
![Theme Toggle](client/screenshots/toggleCloorTheme.png)

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
- Deployed on Vercel

### Backend
- Express with TypeScript
- MongoDB Atlas for data persistence
- JWT Authentication
- RESTful API architecture
- Error handling and validation
- Deployed on Render

## Getting Started

### Prerequisites
- Node.js (>= 16.x)
- MongoDB Atlas account
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
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

Client (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api  # For local development
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
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database service
- [Mantine](https://mantine.dev/) - React components library
- [Jotai](https://jotai.org/) - Primitive and flexible state management for React
- [Vercel](https://vercel.com/) - Frontend deployment platform
- [Render](https://render.com/) - Backend deployment platform 