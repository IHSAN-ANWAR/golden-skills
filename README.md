# Golden Skills - Admin Panel & Backend

A comprehensive admin panel and backend system for managing users, tasks, courses, and plans.

## Project Structure

```
.
├── backend/                    # Node.js Backend
│   ├── controllers/           # API Controllers
│   ├── middleware/            # Authentication & Middleware
│   ├── models/                # MongoDB Models
│   ├── routes/                # API Routes
│   ├── scripts/               # Database Seed Scripts
│   ├── .env                   # Environment Variables
│   ├── package.json           # Backend Dependencies
│   └── server.js              # Express Server Entry Point
│
└── Golden skills/             # React Frontend
    ├── public/                # Static Assets
    ├── src/                   # React Source Code
    │   ├── components/        # React Components
    │   │   └── Admin Panel/   # Admin Panel Components
    │   ├── pages/             # Page Components
    │   ├── config/            # Configuration Files
    │   ├── App.jsx            # Main App Component
    │   └── main.jsx           # React Entry Point
    ├── index.html             # HTML Template
    ├── package.json           # Frontend Dependencies
    └── vite.config.js         # Vite Configuration

## Features

### Admin Panel
- **User Management**: View and manage registered users
- **Task Verifications**: Approve/reject user plan submissions
- **Send Tasks**: Assign custom tasks to approved users
- **Submitted Tasks**: Review and approve task submissions
- **Task History**: View all task assignments and completions
- **Course Management**: Manage courses and course plans
- **Course Verifications**: Approve/reject course plan applications
- **Send Course Links**: Assign courses to approved users
- **Course History**: Track course assignments and completions

### Backend API
- User authentication and authorization
- Task management (CRUD operations)
- Course management (CRUD operations)
- Plan management
- Submission tracking and status updates
- File upload handling

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with required environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Seed initial data (optional):
   ```bash
   node scripts/seedCoursePlans.js
   node scripts/seedCourseCompletions.js
   node scripts/seedUserTasks.js
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd "Golden skills"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Available Scripts

### Backend Scripts
- `seedCoursePlans.js` - Seed course plans into database
- `seedCourseCompletions.js` - Seed course completion data
- `seedUserTasks.js` - Seed user task data
- `rebuildIndexes.js` - Rebuild database indexes

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (File uploads)

### Frontend
- React 18
- Vite
- React Router
- React Icons
- CSS3

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - User registration

### Tasks
- `GET /api/user-tasks` - Get all tasks
- `POST /api/user-tasks/assign` - Assign task to user
- `PUT /api/user-tasks/:id/status` - Update task status

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create new plan
- `PUT /api/plans/:id` - Update plan

### Submissions
- `GET /api/submissions` - Get all submissions
- `PUT /api/submissions/:id/status` - Update submission status
- `DELETE /api/submissions/:id` - Delete submission

## License

Private - All rights reserved
