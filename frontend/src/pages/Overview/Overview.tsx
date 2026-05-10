import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Overview.module.css';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const Overview = () => {
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });
  const email = localStorage.getItem('email');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`https://attendancedtable-production.up.railway.app/attendance/history?user_id=${email}`);
        const history = res.data;
        const present = history.filter((h: any) => h.status === 'present').length;
        const incomplete = history.filter((h: any) => h.status === 'incomplete').length;
        setStats({ present, late: incomplete, absent: 0 });
      } catch (err) {
        console.error("Failed to fetch stats");
      }
    };
    fetchStats();
  }, [email]);

  return (
    <div className={styles.overview}>
      <h1>Dashboard Overview</h1>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.icon} ${styles.green}`}><CheckCircle /></div>
          <div className={styles.info}>
            <p>Present Days</p>
            <h3>{stats.present}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.icon} ${styles.yellow}`}><Clock /></div>
          <div className={styles.info}>
            <p>Incomplete Shift</p>
            <h3>{stats.late}</h3>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.icon} ${styles.red}`}><AlertTriangle /></div>
          <div className={styles.info}>
            <p>Invalid Records</p>
            <h3>0</h3>
          </div>
        </div>
      </div>
      
      <div className={styles.welcomeCard}>
        <h2>Welcome to AI Attendance System</h2>
        <p>Use the sidebar to punch in/out, view your reports, or request overtime.</p>
      </div>
    </div>
  );
};

export default Overview;
