# Task Management Application

A modern full-stack task management application built with Next.js, Express, and MongoDB. This application allows admins to assign and manage tasks, while users can manage their assigned tasks and receive timely reminders.

## Features

- **User Authentication**: Secure login and registration with JWT and localStorage persistence
- **Role-Based Access Control**: 
  - **Admin**: 
    - View all tasks in the system
    - Create and assign tasks to users
    - Manage task assignments
  - **Users**: 
    - View and manage tasks assigned to them
- **Task Management**:
  - Admins:
    - Create tasks
    - Assign tasks to users
    - View and manage all tasks
  - Users:
    - View their assigned tasks
    - Update task status and details
    - Delete their assigned tasks
- **Smart Reminder System**:
  - Three-tier reminder notifications:
    - Urgent (1 hour before deadline)
    - Soon (24 hours before)
    - Upcoming (72 hours before)
  - Priority-based color coding
  - Automatic reminder checks on:
    - Login
    - Page refresh
    - Every minute while active
  - Duplicate prevention system
- **Task Filtering**: 
  - Filter by status
  - Filter by priority
  - Search functionality
  - User filtering (admin only)
- **Responsive UI**: Modern and mobile-friendly interface built with Mantine
- **Real-time Updates**: Task changes reflect immediately in the UI

## Tech Stack

### Frontend
- **Framework**: React with Next.js 14 (App Router)
- **UI Library**: Mantine v7
- **State Management**: Jotai
- **Notifications**: Mantine Notifications
- **Styling**: CSS Modules and Mantine components
- **Typescript**: For type safety

### Backend
- **Environment**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Typescript**: For type safety and better developer experience

## Project Structure

```
/
├── client/                  # Frontend Next.js application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   ├── config/          # Configuration files
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Client-side utilities
│   │   ├── store/           # Jotai atoms and state
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── .env.local           # Environment variables
│
├── server/                  # Backend Express application
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # Express routes
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Server entry point
│   ├── .env                 # Environment variables
│   └── tsconfig.json        # TypeScript configuration
│
├── .gitignore               # Git ignore file
└── package.json             # Root package.json for scripts
```

## Installation and Setup

### Prerequisites
- Node.js (>= 16.x)
- MongoDB (local or Atlas)
- npm or yarn
- Git

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/task-management-app.git
cd task-management-app
```

2. **Install dependencies**

You can install all dependencies (root, client, and server) with a single command:

```bash
npm run install-all
```

Or install them separately:

```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

3. **Set up environment variables**

For the server (.env file in server directory):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

For the client (.env.local file in client directory):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Start the development servers**

You can start both the client and server from the root directory:

```bash
# Start both client and server concurrently
npm run dev

# Or start them individually
npm run client  # Starts just the client
npm run server  # Starts just the server
```

Or start them separately in different terminals:

```bash
# Terminal 1 (Server)
cd server
npm run dev

# Terminal 2 (Client)
cd client
npm run dev
```

5. **Access the application**

Open your browser and navigate to `http://localhost:3000`

## Testing the Application

### Admin Workflow
1. Log in as admin
2. Create new tasks with reminder dates
3. Assign tasks to specific users
4. View all tasks in the system
5. Filter tasks by user
6. Manage task assignments

### User Workflow
1. Log in as regular user
2. Receive reminder notifications for approaching tasks
3. View tasks assigned by admin
4. Update task status/priority
5. Delete completed tasks
6. Filter assigned tasks by status/priority

### Testing Reminders
1. Create a task with a reminder date:
   - Set within 1 hour for urgent notification
   - Set within 24 hours for soon notification
   - Set within 72 hours for upcoming notification
2. Log out and log back in to see reminders
3. Refresh the page to verify reminder persistence
4. Complete a task to verify reminder stops
5. Create multiple tasks to test notification grouping

## User Roles and Permissions

### Admin
- Create new tasks
- Assign tasks to any user
- View all tasks in the system
- Update any task's details
- Delete any task
- Filter tasks by user
- Access admin dashboard

### Regular User
- View tasks assigned to them by admin
- Update their assigned tasks (status, priority, details)
- Delete their assigned tasks
- Filter their tasks by status and priority
- Search within their assigned tasks

## Task Reminder System

### Reminder Stages
1. **Urgent Reminders** (1 hour before)
   - 🚨 Urgent indicator in title
   - Red notification for high priority tasks
   - Immediate attention required

2. **Soon Reminders** (24 hours before)
   - Shows hours remaining
   - Color-coded by task priority
   - Preparation time notification

3. **Upcoming Reminders** (72 hours before)
   - Shows days remaining
   - Color-coded by task priority
   - Early planning notification

### Priority Colors
- High Priority: Red notifications
- Medium Priority: Yellow notifications
- Low Priority: Blue notifications

### Reminder Triggers
- On user login
- On page refresh (if logged in)
- Every minute while using the application
- When tasks are updated

### Duplicate Prevention
- Each reminder stage tracked separately
- Once-per-day notification limit
- Midnight reset for new day
- Completed tasks excluded

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile

### Tasks
- `GET /api/tasks` - Get tasks (all for admin, assigned only for users)
- `POST /api/tasks` - Create and assign a task (admin only)
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Deployment

### Client
The Next.js client can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

```bash
cd client
npm run build
# Follow platform-specific deployment instructions
```

### Server
The Express server can be deployed to Heroku, Railway, or any other platform that supports Node.js applications.

```bash
cd server
npm run build
# Follow platform-specific deployment instructions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - General purpose, document-based, distributed database
- [Mantine](https://mantine.dev/) - React components library
- [Jotai](https://jotai.org/) - Primitive and flexible state management for React 

## Task Assignment Flow

1. **Admin Creates Task**:
   - Admin creates a new task
   - Specifies task details (title, description, etc.)
   - Assigns the task to a specific user

2. **User Manages Assigned Tasks**:
   - User sees tasks assigned to them
   - Can update task status/priority
   - Can delete tasks when completed 