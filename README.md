# Task Management Application

A modern full-stack task management application built with Next.js, Express, and MongoDB. This application allows users to manage tasks with features like reminders, filtering, and role-based access control.

## Features

- **User Authentication**: Secure login and registration with JWT
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Task Management**: Create, read, update, and delete tasks
- **Task Filtering**: Filter tasks by status, priority, due date, and search terms
- **Reminder System**: Get notified about upcoming tasks
- **Responsive UI**: Modern and mobile-friendly interface built with Mantine
- **Real-time Updates**: Task changes reflect immediately in the UI

## Tech Stack

### Frontend
- **Framework**: React with Next.js 14 (App Router)
- **UI Library**: Mantine v7
- **State Management**: Jotai
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

### Initial Setup
- Register an admin user
- Register a regular user
- Create sample tasks for both users

### Testing User Roles
1. **Admin Features**:
   - View all tasks from all users
   - Edit and delete any task
   - Filter tasks by user
   - Access to the admin dashboard

2. **Regular User Features**:
   - View only their own tasks
   - Create, edit, and delete only their tasks
   - Filter tasks by status, priority, and due date

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/profile` - Get user profile
- `GET /api/users` - Get all users (admin only)

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by role)
- `POST /api/tasks` - Create a task
- `GET /api/tasks/:id` - Get a specific task
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