import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Reports.module.css';
import { Download } from 'lucide-react';

const Reports = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const email = localStorage.getItem('email');

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`https://attendance-dtable.vercel.app//attendance/history?user_id=${email}`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  }, [email]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className={styles.reportsPage}>
      {selectedPhoto && (
        <div className={styles.modal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.modalContent}>
            <img src={selectedPhoto} alt="Punch photo" />
          </div>
        </div>
      )}

      <header className={styles.header}>
        <h1>Attendance Reports</h1>
        <button className={styles.exportBtn}>
          <Download size={18} />
          Export to Excel
        </button>
      </header>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Total Hours</th>
              <th>Selfies</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={index}>
                <td className={styles.dateCell}>
                  {new Date(record.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <span className={`${styles.status} ${styles[record.status]}`}>
                    {record.status}
                  </span>
                </td>
                <td className={styles.timeCell}>{formatTime(record.punch_in)}</td>
                <td className={styles.timeCell}>{formatTime(record.punch_out)}</td>
                <td className={styles.hoursCell}>
                  {record.total_hours ? `${record.total_hours.toFixed(2)}h` : '-'}
                </td>
                <td className={styles.photos}>
                  {record.punch_in_photo && (
                    <div className={styles.photoContainer}>
                      <span>In</span>
                      <img 
                        src={record.punch_in_photo} 
                        alt="Punch In" 
                        onClick={() => setSelectedPhoto(record.punch_in_photo)}
                      />
                    </div>
                  )}
                  {record.punch_out_photo && (
                    <div className={styles.photoContainer}>
                      <span>Out</span>
                      <img 
                        src={record.punch_out_photo} 
                        alt="Punch Out" 
                        onClick={() => setSelectedPhoto(record.punch_out_photo)}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
