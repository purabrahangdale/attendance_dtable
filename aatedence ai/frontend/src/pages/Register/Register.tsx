import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import styles from '../Login/Login.module.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please register your face first');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await axios.post('http://localhost:8000/auth/register', {
        email,
        full_name: fullName,
        password,
        role,
        image
      });
      navigate('/login');
    } catch (err: any) {
      // Handle FastAPI validation error (422) which returns an array of objects
      const errorData = err.response?.data?.detail;
      let errorMsg = "Registration failed";
      
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (Array.isArray(errorData)) {
        errorMsg = errorData.map((e: any) => e.msg).join(", ");
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.card}>
        <h1>Create Account</h1>
        <p className={styles.subtitle}>Join the AI Attendance System</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label>Full Name</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              placeholder="John Doe"
            />
          </div>

          <div className={styles.field}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="name@company.com"
            />
          </div>

          <div className={styles.field}>
            <label>Face Registration</label>
            {showCamera ? (
              <div className={styles.cameraPreview}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className={styles.miniWebcam}
                />
                <button type="button" onClick={capture} className={styles.captureBtn}>
                  Capture Photo
                </button>
              </div>
            ) : (
              <div className={styles.photoBox}>
                {image ? (
                  <img src={image} alt="Selfie" className={styles.previewImg} />
                ) : (
                  <div className={styles.placeholder}>No face registered</div>
                )}
                <button type="button" onClick={() => setShowCamera(true)} className={styles.openCamBtn}>
                  {image ? 'Retake Photo' : 'Open Camera to Register Face'}
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.field}>
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={styles.select}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
