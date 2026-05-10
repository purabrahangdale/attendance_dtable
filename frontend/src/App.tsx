import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Overview from './pages/Overview/Overview';
import Punch from './pages/Punch/Punch';
import Reports from './pages/Reports/Reports';
import AdminPanel from './pages/Admin/AdminPanel';
import Profile from './pages/Profile/Profile';
import DashboardLayout from './layouts/DashboardLayout';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  return (
    <Router basename="/attendance_dtable/">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/punch" element={<Punch />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/overtime" element={<Overview />} /> {/* Placeholder for OT */}
          <Route path="/profile" element={<Profile />} />
          
          <Route 
            path="/admin" 
            element={userRole === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
          />
        </Route>
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
