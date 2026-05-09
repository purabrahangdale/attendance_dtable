import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import styles from './Punch.module.css';
import { Camera, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Punch = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  
  const webcamRef = useRef<Webcam>(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Location error", err)
    );

    const checkFaceStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/attendance/face-status?user_id=${email}`);
        setIsRegistered(res.data.is_registered);
      } catch (err) {
        console.error("Failed to check face status");
      }
    };
    checkFaceStatus();
  }, [email]);

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
      const response = await axios.post('http://localhost:8000/attendance/punch', {
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
    } catch (err: any) {
      setStatus('error');
      
      // Handle FastAPI validation error (422) which returns an array of objects
      const errorData = err.response?.data?.detail;
      let errorMsg = "Verification failed";
      
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (Array.isArray(errorData)) {
        errorMsg = errorData.map((e: any) => e.msg).join(", ");
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      
      setMessage(errorMsg);
    }
  }, [webcamRef, location, punchType, email]);

  return (
    <div className={styles.punchPage}>
      <h1>Punch Attendance</h1>
      <p className={styles.subtitle}>Capture your live selfie to mark attendance.</p>

      {isRegistered === false && (
        <div className={styles.registrationWarning}>
          <AlertCircle size={20} />
          <div>
            <strong>Face not registered!</strong>
            <p>You need to register your face before you can punch in/out. <Link to="/profile">Register Now →</Link></p>
          </div>
        </div>
      )}

      <div className={styles.card}>
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
            {status === 'success' ? <CheckCircle size={18} /> : status === 'error' ? <XCircle size={18} /> : <Clock size={18} />}
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Punch;
