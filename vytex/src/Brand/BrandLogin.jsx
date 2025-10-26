import React, { useState } from 'react';
import { Mail, Globe, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../auth/Login.css'; // Reuse card style

const validateEmail = (email) => {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUrl = (url) => {
  // Simple URL regex
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/.test(url);
};

const BrandLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    website: '',
    stripeConnected: false,
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleStripeConnect = () => {
    setForm((f) => ({ ...f, stripeConnected: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, website: true });
    setSubmitted(true);
    
    if (allValid) {
      setIsVerifying(true);
      
      // Simulate verification process
      setTimeout(() => {
        setIsVerifying(false);
        // Navigate to brand dashboard
        navigate('/brand/analytics');
      }, 2000);
    }
  };

  const emailValid = validateEmail(form.email);
  const websiteValid = validateUrl(form.website);
  const allValid = emailValid && websiteValid && form.stripeConnected;

  return (
    <>
      <div className="whoareyou-bg-effect" style={{ position: 'fixed', zIndex: 0 }} />
      <div className="login-container" style={{ minHeight: '100vh', zIndex: 1, position: 'relative' }}>
        <div className="login-card" style={{ maxWidth: 480, margin: 'auto', boxShadow: '0 8px 40px rgba(80,80,120,0.12)' }}>
          <div className="login-header">
            <h1 className="login-title" style={{ background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Brand Login</h1>
            <p className="login-subtitle">Verify your business to continue</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="login-input-group">
              <div className="login-input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="login-input"
                  placeholder="Business Email"
                  required
                  style={{ borderColor: touched.email && !emailValid ? 'var(--error-color)' : undefined }}
                />
                <div className="login-input-icon">
                  <Mail size={20} />
                </div>
              </div>
              {touched.email && !emailValid && (
                <small style={{ color: 'var(--error-color)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <XCircle size={14} /> Invalid business email
                </small>
              )}
            </div>
            <div className="login-input-group">
              <div className="login-input-wrapper">
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="login-input"
                  placeholder="Company Website URL"
                  required
                  style={{ borderColor: touched.website && !websiteValid ? 'var(--error-color)' : undefined }}
                />
                <div className="login-input-icon">
                  <Globe size={20} />
                </div>
              </div>
              {touched.website && !websiteValid && (
                <small style={{ color: 'var(--error-color)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <XCircle size={14} /> Invalid website URL
                </small>
              )}
            </div>
            <div className="login-input-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="login-button"
                style={{ flex: 1, background: form.stripeConnected ? 'linear-gradient(90deg, #00c896, #0f9d58)' : undefined }}
                onClick={handleStripeConnect}
                disabled={form.stripeConnected}
              >
                <CreditCard size={18} style={{ marginRight: 8 }} />
                {form.stripeConnected ? 'Stripe Connected' : 'Connect Stripe'}
                {form.stripeConnected && <CheckCircle size={16} style={{ marginLeft: 8 }} />}
              </button>
              {/* {!form.stripeConnected && (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Required</span>
              )} */}
            </div>
            <button
              type="submit"
              className="login-button"
              style={{ marginTop: 12, fontWeight: 700, fontSize: '1.1rem', letterSpacing: 1 }}
              disabled={!allValid || isVerifying}
            >
              {isVerifying ? 'Verifying...' : (allValid ? 'Continue' : 'Complete Verification')}
            </button>
            {submitted && !allValid && (
              <div style={{ color: 'var(--error-color)', marginTop: 12, textAlign: 'center', fontWeight: 500 }}>
                Please complete all verifications to continue.
              </div>
            )}
            {submitted && allValid && !isVerifying && (
              <div style={{ color: 'var(--primary-color)', marginTop: 12, textAlign: 'center', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle size={18} /> All verifications complete!
              </div>
            )}
            {isVerifying && (
              <div style={{ color: 'var(--primary-color)', marginTop: 12, textAlign: 'center', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div className="loading-spinner" style={{ width: 18, height: 18, border: '2px solid #f3f3f3', borderTop: '2px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Verifying your brand...
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default BrandLogin; 