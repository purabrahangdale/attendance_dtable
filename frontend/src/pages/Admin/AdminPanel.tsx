import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './AdminPanel.module.css';
import { Users, FileText, MessageSquare, AlertTriangle } from 'lucide-react';

const AdminPanel = () => {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamHistory, setTeamHistory] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchTeamHistory = useCallback(async () => {
    try {
      const response = await axios.get('https://attendance-dtable-mpa4rzye7-purabrahangdales-projects.vercel.app/attendance/team-history');
      setTeamHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch team history");
    }
  }, []);

  useEffect(() => {
    fetchTeamHistory();
  }, [fetchTeamHistory]);

  const askAI = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.post('https://attendance-dtable-mpa4rzye7-purabrahangdales-projects.vercel.app/ai/chat', { query });
      setAiResponse(response.data.response);
    } catch (err) {
      setAiResponse("Failed to get AI response. Check backend configuration.");
    } finally {
      setLoading(false);
    }
  };

  const markInvalid = async (userId: string, date: string) => {
    if (!window.confirm("Are you sure you want to mark this attendance as invalid?")) return;
    try {
      await axios.post('https://attendance-dtable-mpa4rzye7-purabrahangdales-projects.vercel.app/attendance/mark-invalid', { user_id: userId, date });
      fetchTeamHistory();
    } catch (err) {
      alert("Failed to mark record as invalid");
    }
  };

  return (
    <div className={styles.adminPanel}>
      {selectedPhoto && (
        <div className={styles.modal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.modalContent}>
            <img src={selectedPhoto} alt="Enlarged punch photo" />
          </div>
        </div>
      )}

      <h1>Admin Control Tower</h1>
      
      <div className={styles.statsRow}>
        <div className={styles.miniCard}>
          <Users color="#4f46e5" />
          <span>{new Set(teamHistory.map(h => h.user_id)).size} Employees</span>
        </div>
        <div className={styles.miniCard}>
          <AlertTriangle color="#f59e0b" />
          <span>{teamHistory.filter(h => h.is_fake).length} Invalid Records</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.historyTableSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FileText size={20} />
              <h3>Recent Team Attendance</h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>In Photo</th>
                    <th>Out Photo</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamHistory.map((record, index) => (
                    <tr key={index} className={record.is_fake ? styles.rowInvalid : ''}>
                      <td>{record.user_name || record.user_id}</td>
                      <td>{record.date}</td>
                      <td>
                        {record.punch_in_photo && (
                          <img 
                            src={record.punch_in_photo} 
                            className={styles.tableThumb} 
                            onClick={() => setSelectedPhoto(record.punch_in_photo)}
                            alt="In"
                          />
                        )}
                      </td>
                      <td>
                        {record.punch_out_photo && (
                          <img 
                            src={record.punch_out_photo} 
                            className={styles.tableThumb} 
                            onClick={() => setSelectedPhoto(record.punch_out_photo)}
                            alt="Out"
                          />
                        )}
                      </td>
                      <td>{record.total_hours}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[record.status]}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        {!record.is_fake && (
                          <button 
                            className={styles.btnInvalid}
                            onClick={() => markInvalid(record.user_id, record.date)}
                          >
                            Mark Invalid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.aiSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <MessageSquare size={20} />
              <h3>AI Attendance Assistant</h3>
            </div>
            <div className={styles.chatArea}>
              {aiResponse && (
                <div className={styles.response}>
                  <strong>AI:</strong> {aiResponse}
                </div>
              )}
              <div className={styles.inputArea}>
                <input 
                  type="text" 
                  placeholder="Ask me anything about team attendance..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askAI()}
                />
                <button onClick={askAI} disabled={loading}>
                  {loading ? 'Thinking...' : 'Ask AI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
