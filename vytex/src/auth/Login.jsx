// src/components/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import './Login.css'


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/login`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Use AuthContext login method
      login(data.user, data.token);

      // Redirect to home (root is protected)
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Welcome back! Please login to your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <div className="login-input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="login-input"
                placeholder="Enter your email"
                required
              />
              <div className="login-input-icon">
                <Mail size={20} />
              </div>
            </div>
          </div>
          
          <div className="login-input-group">
            <div className="login-input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                className="login-input"
                placeholder="Enter your password"
                required
              />
              <div className="login-input-icon">
                <Lock size={20} />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to Account'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <div className="login-links">
          <Link to="/register" className="login-signup-link">
            Don't have an account? <span>Sign up</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;