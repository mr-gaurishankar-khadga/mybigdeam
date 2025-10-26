// src/components/auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Lock, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, username, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Check username availability when username changes
    if (e.target.name === 'username' && e.target.value.length >= 3) {
      checkUsernameAvailability(e.target.value);
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      // Fixed URL - added the /api prefix that was missing
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/check-username/${username}`);

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        const text = await response.text();
        console.error('Response text:', text);
        return;
      }

      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (err) {
      console.error('Error checking username:', err);
      // Don't set username availability on error - let user proceed
      setUsernameAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form data
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!usernameAvailable) {
      setError('Username is already taken');
      return;
    }
    
    setLoading(true);

    try {
      // Fixed URL - added the /api prefix that was missing
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          username,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
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
    <div className="auth-register-container">
      <div className="auth-register-card">
        <div className="auth-register-header">
          <h1 className="auth-register-title">Create Account</h1>
          <p className="auth-register-subtitle">Join us today and start your journey</p>
        </div>
        
        {error && <div className="auth-register-error">{error}</div>}
        
        <form className="auth-register-form" onSubmit={handleSubmit}>
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="auth-register-input"
                placeholder="Enter your email"
                required
              />
              <div className="auth-register-input-icon">
                <Mail size={20} />
              </div>
            </div>
          </div>
          
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleChange}
                className="auth-register-input"
                placeholder="Choose a username"
                minLength="3"
                required
              />
              <div className="auth-register-input-icon">
                <User size={20} />
              </div>
            </div>
            {username.length >= 3 && usernameAvailable !== null && (
              <small style={{ 
                color: usernameAvailable ? '#4CD964' : '#FF3B30',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {usernameAvailable ? (
                  <>
                    <Check size={14} /> Username is available
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Username is already taken
                  </>
                )}
              </small>
            )}
          </div>
          
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                className="auth-register-input"
                placeholder="Create a password"
                minLength="6"
                required
              />
              <div className="auth-register-input-icon">
                <Lock size={20} />
              </div>
            </div>
          </div>
          
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                className="auth-register-input"
                placeholder="Confirm your password"
                minLength="6"
                required
              />
              <div className="auth-register-input-icon">
                <Lock size={20} />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-register-button"
            disabled={loading || (username.length >= 3 && !usernameAvailable)}
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>
        
        <div className="auth-register-links">
          <Link to="/login" className="auth-register-signin-link">
            Already have an account? <span>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;