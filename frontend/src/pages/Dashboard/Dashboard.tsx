import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import styles from './Dashboard.module.css';
import { Camera, Clock, User as UserIcon } from 'lucide-react';

const Dashboard = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  const [history, setHistory] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const email = localStorage.getItem('email');

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`https://attendance-dtable-h8bbsnq71-purabrahangdales-projects.vercel.app/attendance/history?user_id=${email}`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  }, [email]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Location error", err)
    );
    fetchHistory();
  }, [fetchHistory]);

  const captureAndPunch = useCallback(async () => {
    if (!webcamRef.current || !location) {
      setMessage("Please allow camera and location access");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setStatus('loading');
    setMessage(`Verifying face and punching ${punchType}...`);

    try {
      const response = await axios.post('https://attendance-dtable-h8bbsnq71-purabrahangdales-projects.vercel.app/attendance/punch', {
        user_id: email,
        type: punchType,
        location: {
          latitude: location.lat,
          longitude: location.lng
        },
        image: imageSrc
      });

      setStatus('success');
      setMessage(response.data.message);
      setPunchType(punchType === 'in' ? 'out' : 'in');
      fetchHistory();
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.detail || "Verification failed");
    }
  }, [webcamRef, location, punchType, email, fetchHistory]);

  return (
    <div className={styles.dashboard}>
      {/* Modal for viewing photo */}
      {selectedPhoto && (
        <div className={styles.modal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.modalContent}>
            <img src={selectedPhoto} alt="Enlarged punch photo" />
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}><UserIcon size={24} /></div>
          <div>
            <h2>Hello, {email?.split('@')[0]}</h2>
            <p>Ready for today's shift?</p>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <Clock size={20} className={styles.blueIcon} />
            <div>
              <p className={styles.statLabel}>Today's Status</p>
              <p className={styles.statValue}>{history[0]?.status || 'Not Started'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.cameraSection}>
          <div className={styles.cameraWrapper}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className={styles.webcam}
              videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
            />
          </div>
          
          <div className={styles.controls}>
            <button 
              onClick={captureAndPunch} 
              disabled={status === 'loading'}
              className={`${styles.punchBtn} ${punchType === 'in' ? styles.in : styles.out}`}
            >
              <Camera size={20} />
              Verify & Punch {punchType === 'in' ? 'In' : 'Out'}
            </button>
          </div>
          
          {message && (
            <div className={`${styles.statusMsg} ${styles[status]}`}>
              <span>{message}</span>
            </div>
          )}
        </div>

        <div className={styles.historySection}>
          <div className={styles.card}>
            <h3>Your Attendance History</h3>
            <div className={styles.historyList}>
              {history.map((record, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyDate}>
                    <strong>{record.date}</strong>
                    <span className={record.is_fake ? styles.fake : styles[record.status]}>
                      {record.is_fake ? 'INVALID' : record.status.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.historyPhotos}>
                    {record.punch_in_photo && (
                      <div className={styles.photoThumb} onClick={() => setSelectedPhoto(record.punch_in_photo)}>
                        <img src={record.punch_in_photo} alt="Punch In" />
                        <span>In</span>
                      </div>
                    )}
                    {record.punch_out_photo && (
                      <div className={styles.photoThumb} onClick={() => setSelectedPhoto(record.punch_out_photo)}>
                        <img src={record.punch_out_photo} alt="Punch Out" />
                        <span>Out</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.historyMeta}>
                    <span>{record.total_hours} hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
