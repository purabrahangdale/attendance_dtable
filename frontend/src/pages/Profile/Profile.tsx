import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import styles from './Profile.module.css';
import { Camera, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const Profile = () => {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [registeredImage, setRegisteredImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const email = localStorage.getItem('email');

  const checkStatus = useCallback(async () => {
    try {
      const res = await axios.get(`https://attendance-dtable-qz85y53gd-purabrahangdales-projects.vercel.app//attendance/face-status?user_id=${email}`);
      setIsRegistered(res.data.is_registered);
      if (res.data.image) {
        setRegisteredImage(res.data.image);
      }
    } catch (err) {
      console.error("Failed to check face status");
    }
  }, [email]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleRegister = async () => {
    if (!image) return;
    
    setLoading(true);
    setStatus(null);
    
    try {
      await axios.post('https://attendance-dtable-qz85y53gd-purabrahangdales-projects.vercel.app//attendance/register-face', {
        user_id: email,
        image: image
      });
      
      setStatus({ type: 'success', msg: 'Face registered successfully!' });
      setIsRegistered(true);
      setRegisteredImage(image);
      setImage(null);
    } catch (err: any) {
      const errorData = err.response?.data?.detail;
      let errorMsg = "Registration failed";
      if (typeof errorData === 'string') errorMsg = errorData;
      else if (Array.isArray(errorData)) errorMsg = errorData.map((e: any) => e.msg).join(", ");
      
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profilePage}>
      {selectedPhoto && (
        <div className={styles.modal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.modalContent}>
            <img src={selectedPhoto} alt="Full view" />
          </div>
        </div>
      )}

      <h1>User Profile & Security</h1>
      <p className={styles.subtitle}>Manage your face biometric registration for secure attendance.</p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Face Biometrics</h2>
          
          <div className={styles.statusSection}>
            {isRegistered === null ? (
              <p>Checking status...</p>
            ) : isRegistered ? (
              <div className={styles.registeredView}>
                <div className={styles.statusBadge_success}>
                  <CheckCircle size={20} />
                  <span>Face Registered</span>
                </div>
                {registeredImage ? (
                  <div className={styles.currentFaceWrapper}>
                    <p>Current Registered Face:</p>
                    <img 
                      src={registeredImage} 
                      alt="Registered face" 
                      className={styles.registeredThumb} 
                      onClick={() => setSelectedPhoto(registeredImage)}
                    />
                    <span className={styles.zoomHint}>Click to view full size</span>
                  </div>
                ) : (
                  <div className={styles.missingImageNote}>
                    <AlertCircle size={16} />
                    <p>No preview available. Please re-register to enable image viewing.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.statusBadge_warning}>
                <AlertCircle size={20} />
                <span>Face Not Registered</span>
              </div>
            )}
          </div>

          <p className={styles.cardInfo}>
            {isRegistered 
              ? "Your face is registered. You can re-register if you're having trouble with verification during punch in/out."
              : "You must register your face before you can mark your attendance. Use the camera tool below."}
          </p>

          <div className={styles.cameraTool}>
            {showCamera ? (
              <div className={styles.webcamWrapper}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className={styles.webcam}
                />
                <button onClick={capture} className={styles.captureBtn}>
                  Capture Photo
                </button>
              </div>
            ) : image ? (
              <div className={styles.previewWrapper}>
                <img src={image} alt="Preview" className={styles.preview} />
                <div className={styles.actions}>
                  <button onClick={() => setImage(null)} className={styles.secondaryBtn}>Retake</button>
                  <button onClick={handleRegister} disabled={loading} className={styles.primaryBtn}>
                    {loading ? <RefreshCw className={styles.spin} size={18} /> : 'Save Registration'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCamera(true)} className={styles.openCamBtn}>
                <Camera size={20} />
                <span>{isRegistered ? 'Update Face Registration' : 'Register Face Now'}</span>
              </button>
            )}
          </div>

          {status && (
            <div className={`${styles.alert} ${styles[status.type]}`}>
              {status.msg}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h2>Account Information</h2>
          <div className={styles.infoRow}>
            <label>Email Address</label>
            <p>{email}</p>
          </div>
          <div className={styles.infoRow}>
            <label>Role</label>
            <p>{localStorage.getItem('role')}</p>
          </div>
          <div className={styles.infoRow}>
            <label>Account Status</label>
            <p className={styles.active}>Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
