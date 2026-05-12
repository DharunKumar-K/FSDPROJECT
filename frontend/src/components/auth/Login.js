import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ id: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint, payload;
      
      if (role === 'student') {
        endpoint = '/api/login';
        payload = { registerNo: formData.id, password: formData.password };
      } else if (role === 'teacher') {
        endpoint = '/api/teacher/login';
        payload = { teacherId: formData.id, password: formData.password };
      } else if (role === 'admin') {
        endpoint = '/api/admin/login';
        payload = { adminId: formData.id, password: formData.password };
      }

      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        const userToStore = { ...data.user, role, id: data.user._id };
        localStorage.setItem('user', JSON.stringify(userToStore));
        navigate('/dashboard');
      } else {
        let errMsg = 'Invalid credentials';
        try {
          const err = await response.json();
          errMsg = err.error || err.message || errMsg;
        } catch (_) {}
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
      alert('Login failed. Please check if the server is running.');
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card animate-slide-up" style={{ padding: '3rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(99,102,241,0.3)' }}>
            <span style={{ fontSize: '2rem', color: 'white' }}>📚</span>
          </div>
        </div>
        
        <h2 className="auth-title text-gradient">Smart Curriculum Activity & Attendance</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem', fontWeight: 500, fontSize: '0.95rem' }}>Smart Attendance & Faculty Management Hub</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', background: 'var(--bg-main)', padding: '0.35rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
          <button 
            className="vibrant-button"
            style={{ 
                background: role === 'student' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent', 
                color: role === 'student' ? 'white' : 'var(--text-muted)',
                boxShadow: role === 'student' ? '0 4px 14px var(--primary-glow)' : 'none',
                padding: '0.75rem 0.75rem',
                flex: 1,
                fontSize: '0.9rem'
            }}
            onClick={(e) => { e.preventDefault(); setRole('student'); }}
          >
            Student
          </button>
          <button 
             className="vibrant-button"
             style={{ 
                 background: role === 'teacher' ? 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)' : 'transparent', 
                 color: role === 'teacher' ? 'white' : 'var(--text-muted)',
                 boxShadow: role === 'teacher' ? '0 4px 14px var(--accent-glow)' : 'none',
                 padding: '0.75rem 0.75rem',
                 flex: 1,
                 fontSize: '0.9rem'
             }}
             onClick={(e) => { e.preventDefault(); setRole('teacher'); }}
          >
            Staff
          </button>
          <button 
             className="vibrant-button"
             style={{ 
                 background: role === 'admin' ? 'linear-gradient(135deg, var(--warning) 0%, var(--accent) 100%)' : 'transparent', 
                 color: role === 'admin' ? 'white' : 'var(--text-muted)',
                 boxShadow: role === 'admin' ? '0 4px 14px rgba(245, 158, 11, 0.4)' : 'none',
                 padding: '0.75rem 0.75rem',
                 flex: 1,
                 fontSize: '0.9rem'
             }}
             onClick={(e) => { e.preventDefault(); setRole('admin'); }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label>
               {role === 'student' ? 'Register Number' : role === 'teacher' ? 'Staff ID' : 'Admin ID'}
            </label>
            <input
              type="text"
              className="input-field"
              placeholder={role === 'student' ? "e.g. 2021001" : role === 'teacher' ? "e.g. TCH882" : "e.g. admin"}
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              required
            />
          </div>
          <div className="form-group mb-8">
            <label>Secure Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="vibrant-button" style={{ 
              background: role === 'student' ? '' : role === 'teacher' ? 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)' : 'linear-gradient(135deg, var(--warning) 0%, var(--accent) 100%)',
              boxShadow: role === 'student' ? '' : role === 'teacher' ? '0 4px 14px var(--accent-glow)' : '0 4px 14px rgba(245, 158, 11, 0.4)'
          }}>
            Authenticate & Proceed
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>
          New to the hub? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, transition: 'color 0.2s', borderBottom: '2px solid transparent', paddingBottom: '2px' }} onMouseEnter={(e) => e.target.style.borderBottom='2px solid var(--primary)'} onMouseLeave={(e) => e.target.style.borderBottom='2px solid transparent'}>Initialize Profile</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
