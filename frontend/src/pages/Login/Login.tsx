import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('https://attendance-dtable.vercel.app//auth/login', 
        new URLSearchParams({
          'username': email,
          'password': password
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('email', email);
      
      navigate('/dashboard');
    } catch (err: any) {
      // Handle FastAPI validation error (422) which returns an array of objects
      const errorData = err.response?.data?.detail;
      let errorMsg = "Login failed";
      
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (Array.isArray(errorData)) {
        errorMsg = errorData.map((e: any) => e.msg).join(", ");
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      
      setError(errorMsg);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.card}>
        <h1>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
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
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>
        </form>
        
        <p className={styles.footer}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
