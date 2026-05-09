import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { LogOut, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Attendance<span>AI</span>
        </Link>
        
        <div className={styles.links}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.link}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              
              {userRole === 'admin' && (
                <Link to="/admin" className={styles.link}>
                  <Shield size={18} />
                  <span>Admin</span>
                </Link>
              )}
              
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>Login</Link>
              <Link to="/register" className={`${styles.link} ${styles.primary}`}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
