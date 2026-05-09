import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  FileBarChart, 
  Calendar, 
  LogOut, 
  ShieldCheck,
  User
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const userEmail = localStorage.getItem('email');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        Attendance<span>AI</span>
      </div>
      
      <div className={styles.userProfile}>
        <div className={styles.avatar}><User size={20} /></div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{userEmail?.split('@')[0]}</p>
          <p className={styles.userRole}>{userRole}</p>
        </div>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>
        
        <NavLink to="/punch" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
          <Clock size={20} />
          <span>Punch In/Out</span>
        </NavLink>
        
        <NavLink to="/reports" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
          <FileBarChart size={20} />
          <span>Reports</span>
        </NavLink>
        
        <NavLink to="/overtime" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
          <Calendar size={20} />
          <span>Overtime</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
          <User size={20} />
          <span>Face Registration</span>
        </NavLink>

        {userRole === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            <ShieldCheck size={20} />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
