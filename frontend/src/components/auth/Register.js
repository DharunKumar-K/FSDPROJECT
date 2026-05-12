import React, { useState } from 'react';
import { useToast } from '../ToastContext';
import Confetti from '../Confetti';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    identifier: '', department: '', year: '', semester: ''
  });

  // Password strength logic
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    return score;
  };
  const getStrengthLabel = (score) => {
    switch (score) {
      case 0:
      case 1: return 'Weak';
      case 2: return 'Medium';
      case 3: return 'Strong';
      case 4:
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      const score = getPasswordStrength(e.target.value);
      setPasswordStrength(score);
      setPasswordStrengthLabel(getStrengthLabel(score));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let missing = [];
    if (!formData.name) missing.push('Full Legal Name');
    if (!formData.identifier) missing.push('Register Number');
    if (!formData.email) missing.push('Email Address');
    if (!formData.password) missing.push('Password');
    if (!formData.department) missing.push('Department');
    if (!formData.year) missing.push('Current Year');
    if (!formData.semester) missing.push('Semester');
    if (missing.length > 0) {
      showToast('Please fill the following required field(s): ' + missing.join(', '), 'error');
      return;
    }
    setLoading(true);
    try {
      const endpoint = '/api/register';
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        institutionType: 'college',
        registerNo: formData.identifier,
        department: formData.department,
        year: formData.year,
        semester: formData.semester
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setConfetti(true);
        showToast('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
          setConfetti(false);
          navigate('/login');
        }, 2000);
      } else {
        const err = await response.json();
        showToast(err.error || err.message || 'Registration failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to hub', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {confetti && <Confetti trigger={confetti} />}
      <div className="auth-container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '640px', padding: '3rem 2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--success) 0%, var(--secondary) 100%)', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(16,185,129,0.3)', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2rem' }}>🚀</span>
          </div>
          <h2 className="auth-title text-gradient" style={{ marginBottom: '0.5rem' }}>Initialize Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>Join the Advanced Educational Intelligence Network</p>
        </div>

        {/* Role Toggle removed — only student self-registration is allowed.
             Teachers are registered by admins via the admin panel. */}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Full Legal Name</label>
              <input type="text" name="name" className="input-field" placeholder="e.g. Jane Smith" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Register Number</label>
              <input type="text" name="identifier" className="input-field" placeholder="e.g. 2021001" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="input-field" placeholder="you@college.edu" onChange={handleChange} required />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Access Password</label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="input-field"
                      placeholder="Choose a strong password"
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        fontSize: '1.2rem',
                        zIndex: 2
                      }}
                      tabIndex={0}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div className="password-strength">
                    <div className={`password-strength-bar password-strength-${passwordStrengthLabel.replace(' ', '-').toLowerCase()}`}
                      style={{ width: `${(passwordStrength/5)*100}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: passwordStrength === 0 ? '#f43f5e' : passwordStrength === 1 ? '#fbbf24' : passwordStrength >= 3 ? '#10b981' : '#38bdf8' }}>
                    {passwordStrengthLabel && `Strength: ${passwordStrengthLabel}`}
                  </span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 1' }}>
              <label>Department</label>
              <input type="text" name="department" className="input-field" placeholder="e.g. AI & Data Science" onChange={handleChange} required />
            </div>


            <div className="insight-section">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#fff', fontWeight: 700 }}>Current Year</label>
                  <input type="text" name="year" className="input-field" placeholder="e.g. 2nd Year" onChange={handleChange} required style={{ background: 'rgba(255,255,255,0.95)', color: '#0f172a' }} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff', fontWeight: 700 }}>Semester</label>
                  <input type="text" name="semester" className="input-field" placeholder="e.g. 4" onChange={handleChange} required style={{ background: 'rgba(255,255,255,0.95)', color: '#0f172a' }} />
                </div>
              </div>


          </div>

          <div style={{ marginTop: '2.5rem', position: 'relative' }}>
            <button type="submit" className="vibrant-button" style={{
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? 'none' : 'auto',
              position: 'relative'
            }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: 22, height: 22, border: '3px solid #fff', borderTop: '3px solid var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></span>
                  Registering...
                </span>
              ) : (
                'Complete Initialization ✓'
              )}
            </button>
          </div>

        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Login here →</Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Register;
