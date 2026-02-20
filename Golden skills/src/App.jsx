import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Public Pages
import Home from './pages/Home';
import About from './components/About';
import Courses from './components/Courses';
import PublicTasks from './components/Tasks';
import Contact from './components/Contact';
import UserTaskSubmission from './pages/UserTaskSubmission';
import UserTaskData from './pages/UserTaskData';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Admin Panel
import Login from './components/Admin Panel/Login/Login';
import ForgotPassword from './components/Admin Panel/ForgotPassword/ForgotPassword';
import ResetPassword from './components/Admin Panel/ResetPassword/ResetPassword';
import AdminLayout from './components/Admin Panel/AdminLayout';
import Dashboard from './components/Admin Panel/Dashboard/Dashboard';
import AdminCourses from './components/Admin Panel/Courses/Courses';
import TasksManager from './components/Admin Panel/TasksManager/TasksManager';
import Users from './components/Admin Panel/Users/Users';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/about" element={
          <>
            <Navbar />
            <About />
            <Footer />
          </>
        } />
        <Route path="/courses" element={
          <>
            <Navbar />
            <Courses />
            <Footer />
          </>
        } />
        <Route path="/tasks" element={
          <>
            <Navbar />
            <PublicTasks />
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <Contact />
            <Footer />
          </>
        } />
        <Route path="/submit-task" element={
          <>
            <Navbar />
            <UserTaskSubmission />
            <Footer />
          </>
        } />
        <Route path="/my-tasks" element={
          <>
            <Navbar />
            <UserTaskData />
            <Footer />
          </>
        } />

        {/* Admin Auth Routes (No Navbar/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Panel Routes (With Admin Layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="tasks" element={<TasksManager />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
