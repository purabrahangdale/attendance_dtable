import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import AIChat from '../components/AIChat/AIChat';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
      <AIChat />
    </div>
  );
};

export default DashboardLayout;
