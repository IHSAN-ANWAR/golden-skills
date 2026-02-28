# Golden Skills - Learning and Earning Platform

## 📋 Project Overview

Golden Skills is a comprehensive **Learning and Earning System** that enables users to learn new skills through structured courses and earn rewards by completing tasks. The platform combines educational content with practical task-based learning, allowing users to monetize their newly acquired skills.

### Key Features
- 📚 **Course Management** - Structured learning paths with quiz-based assessments
- 💼 **Task System** - Real-world tasks for practical skill application
- 💰 **Earning Mechanism** - Points-based reward system for completed tasks
- 📊 **Progress Tracking** - Monitor learning progress and task completion
- 🎓 **Course Plans** - Subscription-based learning plans
- 👥 **User Management** - Role-based access (Admin & Users)
- 🔐 **Authentication** - Secure login with password reset functionality

---

## 🏗️ Project Architecture

### Technology Stack

#### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **Security**: express-rate-limit, CORS
- **Environment**: dotenv for configuration

#### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Bootstrap 5.3.8 + Custom CSS
- **Icons**: React Icons

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  (React SPA - User Interface & Admin Dashboard)             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   API LAYER                                 │
│  (Express.js - Routes, Controllers, Middleware)             │
│  • Rate Limiting                                            │
│  • JWT Authentication                                       │
│  • Request Validation                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 BUSINESS LOGIC LAYER                        │
│  (Controllers - Business Rules & Data Processing)           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   DATA LAYER                                │
│  (MongoDB - Data Persistence & Models)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Project Modules

### 1. Authentication Module
**Purpose**: User registration, login, and password management

**Components**:
- User Registration with validation
- JWT-based authentication
- Password reset with token expiry
- Rate-limited auth endpoints (5 requests/15 min)

**Files**:
- `backend/controllers/authController.js`
- `backend/routes/auth.js`
- `backend/middleware/authMiddleware.js`
- `Golden skills/src/components/Admin Panel/Login/`
- `Golden skills/src/components/Admin Panel/ForgotPassword/`
- `Golden skills/src/components/Admin Panel/ResetPassword/`

---

### 2. Course Management Module
**Purpose**: Create, manage, and deliver educational courses

**Features**:
- Course CRUD operations
- Quiz-based assessments
- Course completion tracking
- Course-Plan linking system

**Components**:
- **Course Manager**: Admin interface for course creation
- **Course Plans**: Link courses to subscription plans
- **Course Verification**: Review and approve course completions
- **Course History**: Track all course activities

**Files**:
- `backend/controllers/courseController.js`
- `backend/models/Course.js`
- `backend/routes/courses.js`
- `Golden skills/src/components/Admin Panel/CourseManager/`
- `Golden skills/src/components/Admin Panel/Courses/`
- `Golden skills/src/components/Admin Panel/CoursePlans/`

---

### 3. Task Management Module
**Purpose**: Assign and manage practical tasks for skill application

**Features**:
- Task creation with deadlines
- Category-based organization
- Points/rewards system
- Task assignment (all users or specific users)
- Task status tracking (active, completed, expired)

**Components**:
- **Task Manager**: Create and edit tasks
- **Assign Task**: Assign tasks to users
- **Task History**: View all task activities
- **Submitted Tasks**: Review user submissions

**Files**:
- `backend/controllers/taskController.js`
- `backend/models/Task.js`
- `backend/routes/tasks.js`
- `Golden skills/src/components/Admin Panel/TasksManager/`
- `Golden skills/src/components/Admin Panel/AssignTask/`
- `Golden skills/src/components/Admin Panel/TaskHistory/`

---

### 4. Plan Management Module
**Purpose**: Subscription plans for accessing courses

**Features**:
- Create pricing plans
- Link courses to plans
- Track plan subscriptions
- User plan submissions

**Files**:
- `backend/controllers/planController.js`
- `backend/models/Plan.js`
- `backend/routes/plans.js`
- `backend/models/UserPlanSubmission.js`

---

### 5. User Progress Tracking Module
**Purpose**: Monitor user learning and earning progress

**Features**:
- Course completion tracking
- Task submission tracking
- Points accumulation
- Progress analytics

**Components**:
- **User Course Completion**: Track finished courses
- **User Task Tracking**: Monitor task progress
- **User Course Data**: Display user course history
- **User Task Data**: Display user task history

**Files**:
- `backend/models/UserCourseCompletion.js`
- `backend/models/UserTask.js`
- `backend/models/UserCoursePlanSubmission.js`
- `Golden skills/src/pages/UserCourseData.jsx`
- `Golden skills/src/pages/UserTaskData.jsx`

---

### 6. Admin Dashboard Module
**Purpose**: Centralized admin control panel

**Features**:
- Dashboard with analytics
- User management
- Course verification
- Task approval
- Submission reviews

**Files**:
- `Golden skills/src/components/Admin Panel/Dashboard/`
- `Golden skills/src/components/Admin Panel/Users/`
- `Golden skills/src/components/Admin Panel/AdminLayout.jsx`
- `Golden skills/src/components/Admin Panel/AdminSidebar.jsx`

---

## 👥 User Roles & Permissions

### 1. Admin Users
**Capabilities**:
- ✅ Create and manage courses
- ✅ Create and assign tasks
- ✅ Create subscription plans
- ✅ Link courses to plans
- ✅ Review and verify course completions
- ✅ Review and approve task submissions
- ✅ Manage all users
- ✅ View analytics and reports
- ✅ Access admin dashboard

**Access**: Full system access through admin panel

---

### 2. Regular Users
**Capabilities**:
- ✅ Register and create account
- ✅ Browse available courses
- ✅ Subscribe to plans
- ✅ Complete courses and quizzes
- ✅ View assigned tasks
- ✅ Submit task completions
- ✅ Track learning progress
- ✅ View earned points/rewards
- ✅ Update profile information

**Access**: User-facing interface with limited permissions

---

## 🗄️ Database Schema

The project uses **MongoDB** with **10 collections (tables)**:

### 1. **users**
Stores user account information
```javascript
{
  fullName: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  age: Number,
  city: String,
  referralCode: String,
  resetToken: String,
  resetTokenExpiry: Number,
  createdAt: Date
}
```

### 2. **courses**
Stores course content and structure
```javascript
{
  title: String,
  icon: String,
  description: String,
  quizQuestions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],
  createdAt: Date
}
```

### 3. **tasks**
Stores task assignments
```javascript
{
  title: String,
  description: String,
  category: String,
  points: Number,
  deadline: Date,
  status: String (active/completed/expired),
  assignedTo: String (all/specific),
  specificUsers: [ObjectId],
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **plans**
Stores subscription plans
```javascript
{
  title: String,
  price: String,
  description: String,
  isActive: Boolean,
  createdBy: String,
  timestamps: true
}
```

### 5. **courseplans**
Links courses to subscription plans
```javascript
{
  planId: ObjectId (ref: Plan),
  courseId: ObjectId (ref: Course),
  order: Number,
  isActive: Boolean,
  createdAt: Date
}
```

### 6. **courselinkassignments**
Manages course-plan relationships
```javascript
{
  courseId: ObjectId (ref: Course),
  planId: ObjectId (ref: Plan),
  assignedAt: Date,
  isActive: Boolean
}
```

### 7. **usercoursecompletions**
Tracks user course completions
```javascript
{
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  planId: ObjectId (ref: Plan),
  quizScore: Number,
  completedAt: Date,
  status: String (pending/verified/rejected)
}
```

### 8. **userplansubmissions**
Tracks user plan subscriptions
```javascript
{
  userId: ObjectId (ref: User),
  planId: ObjectId (ref: Plan),
  submittedAt: Date,
  status: String,
  paymentDetails: Object
}
```

### 9. **usercourseplansubmissions**
Tracks course-plan specific submissions
```javascript
{
  userId: ObjectId (ref: User),
  coursePlanId: ObjectId (ref: CoursePlan),
  submittedAt: Date,
  status: String,
  completionData: Object
}
```

### 10. **usertasks**
Tracks user task submissions
```javascript
{
  userId: ObjectId (ref: User),
  taskId: ObjectId (ref: Task),
  submissionUrl: String,
  submissionText: String,
  status: String (pending/approved/rejected),
  pointsEarned: Number,
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: String
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd golden-skills
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Create .env file in backend folder**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. **Frontend Setup**
```bash
cd "Golden skills"
npm install
```

5. **Start the application**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd "Golden skills"
npm run dev
```

### Seeding Data
```bash
cd backend
npm run seed:user-tasks
npm run seed:course-plans
```

---

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (Admin)
- `PUT /api/tasks/:id` - Update task (Admin)
- `DELETE /api/tasks/:id` - Delete task (Admin)

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create plan (Admin)
- `PUT /api/plans/:id` - Update plan (Admin)

### User Progress
- `GET /api/user-course-completions` - Get user course progress
- `POST /api/user-course-completions` - Submit course completion
- `GET /api/user-tasks` - Get user task submissions
- `POST /api/user-tasks` - Submit task completion

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password encryption
- **Rate Limiting**: 
  - General API: 100 requests/15 min
  - Auth endpoints: 5 requests/15 min
  - Submissions: 30 requests/15 min
- **CORS**: Cross-origin resource sharing enabled
- **Input Validation**: Mongoose schema validation
- **Token Expiry**: Reset tokens expire after set duration

---

## 📈 Future Enhancements

- Payment gateway integration
- Real-time notifications
- Advanced analytics dashboard
- Mobile application
- Certificate generation
- Social features (forums, chat)
- Gamification elements

---

## 👨‍💻 Development Team

This project is built as a learning and earning platform to help users acquire new skills and monetize their knowledge.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For support and queries, please contact the development team.

---

**Total Database Collections: 10**

The system efficiently manages user learning journeys, task assignments, and reward distribution through a well-structured database schema with proper relationships and indexing.
