import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

// Public Pages
import Home from './pages/Home';
import About from './components/About';
import CoursesSection from './components/CoursesSection';
import PublicTasks from './components/Tasks';
import Contact from './components/Contact';
import UserTaskSubmission from './pages/UserTaskSubmission';
import UserTaskData from './pages/UserTaskData';
import UserCourseData from './pages/UserCourseData';
import TeamVerification from './pages/TeamVerification';
import ReportFraud from './pages/ReportFraud';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AlertBanner from './components/AlertBanner';

// Admin Panel
import Login from './components/Admin Panel/Login/Login';
import AdminLayout from './components/Admin Panel/AdminLayout';
import Dashboard from './components/Admin Panel/Dashboard/Dashboard';
import AdminCourses from './components/Admin Panel/Courses/Courses';
import TasksManager from './components/Admin Panel/TasksManager/TasksManager';
import Users from './components/Admin Panel/Users/Users';
import PromotionsManager from './components/Admin Panel/PromotionsManager/PromotionsManager';
import AccountDetails from './components/Admin Panel/AccountDetails/AccountDetails';
import ReferralSystem from './components/Admin Panel/ReferralSystem/ReferralSystem';
import TeamManagement from './components/Admin Panel/TeamManagement/TeamManagement';
import FraudReports from './components/Admin Panel/FraudReports/FraudReports';
import SiteSettings from './components/Admin Panel/SiteSettings/SiteSettings';
import WhatsAppWidget from './components/WhatsAppWidget/WhatsAppWidget';
import SearchTracking from './components/Admin Panel/SearchTracking/SearchTracking';

// Only show AlertBanner on public pages (not admin/login)
const PublicAlertBanner = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/login';
  if (isAdminPage) return null;
  return <AlertBanner />;
};

function App() {
  return (
    <Router>
      <PublicAlertBanner />
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
            <CoursesSection />
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
        <Route path="/my-courses" element={
          <>
            <Navbar />
            <UserCourseData />
            <Footer />
          </>
        } />
        <Route path="/verify-team" element={<TeamVerification />} />
        <Route path="/report-fraud" element={<ReportFraud />} />

        {/* Admin Auth Routes (No Navbar/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Panel Routes (With Admin Layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="tasks" element={<TasksManager />} />
          <Route path="users" element={<Users />} />
          <Route path="promotions" element={<PromotionsManager />} />
          <Route path="account-details" element={<AccountDetails />} />
          <Route path="referrals" element={<ReferralSystem />} />
          <Route path="team-management" element={<TeamManagement />} />
          <Route path="fraud-reports" element={<FraudReports />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="search-tracking" element={<SearchTracking />} />
        </Route>  
      </Routes>
      <WhatsAppWidget />
    </Router>
  );
}

export default App;
