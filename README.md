# Task Management Application

A modern full-stack task management application built with Next.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Role-based access control (Admin and User roles)
- Task management (create, read, update, delete)
- Task filtering by status, search, etc.
- Reminder system for upcoming tasks
- Modern responsive UI with Mantine

## Tech Stack

### Frontend
- **Framework**: React with Next.js
- **UI Library**: Mantine
- **State Management**: Jotai
- **Styling**: CSS Modules and Mantine components

### Backend
- **Environment**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

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
└── server/                  # Backend Express application
    ├── src/
    │   ├── config/          # Configuration files
    │   ├── controllers/     # Route controllers
    │   ├── middleware/      # Express middleware
    │   ├── models/          # MongoDB models
    │   ├── routes/          # Express routes
    │   ├── types/           # TypeScript types
    │   └── index.ts         # Server entry point
    ├── .env                 # Environment variables
    └── tsconfig.json        # TypeScript configuration
```

## Installation and Setup

### Prerequisites
- Node.js (>= 16.x)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/task-management-app.git
cd task-management-app
```

2. **Install dependencies**

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
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

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

5. **Access the application**

Open your browser and navigate to `http://localhost:3000`

## Testing the Application

### Initial Setup
- Register an admin user
- Register a regular user
- Create sample tasks for both users

### Testing User Roles
1. **Admin Features**:
   - View all tasks from all users
   - Edit and delete any task
   - Filter tasks by user

2. **Regular User Features**:
   - View only their own tasks
   - Create, edit, and delete only their tasks
   - Filter tasks by status

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by role)
- `POST /api/tasks` - Create a task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## License

This project is licensed under the MIT License. 