import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from './LoadingSpinner';

const AttendanceScanner = () => {
  const [user, setUser] = useState(null);
  const [sessionCode, setSessionCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [topic, setTopic] = useState('Regular Class');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    if (userData.role === 'teacher') fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedCourse) { alert('Please select a course first'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ courseId: selectedCourse, topic, sessionCode: newCode })
      });

      if (response.ok) {
        setGeneratedCode(newCode);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create session');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating session');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const sessionRes = await fetch('/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sessions = await sessionRes.json();
      const currentSession = sessions.find(s => s.sessionCode === sessionCode);

      if (!currentSession) {
        alert('Invalid or expired session code');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/markAttendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId: currentSession._id, status: 'Present' })
      });

      if (response.ok) {
        alert(`✓ Successfully checked into Session: ${sessionCode}`);
        setSessionCode('');
        navigate('/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error(err);
      alert('Error during check-in');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <button className="glass-button" style={{ width: 'auto', marginBottom: '1rem' }} onClick={() => navigate('/dashboard')}>
        ← Back to Hub
      </button>

      <div className="glass-panel">
        <h2 style={{ fontSize: '1.8rem', textAlign: 'left', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {user.role === 'teacher' ? 'Launch Session & QR' : 'Smart Check-In'}
        </h2>

        {user.role === 'teacher' ? (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Start a live attendance session for your class.</p>

            {!generatedCode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Select Course</label>
                  <select
                    className="glass-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                  >
                    {courses.length === 0
                      ? <option value="">No courses available</option>
                      : courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label>Topic</label>
                  <input
                    type="text"
                    className="glass-input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Arrays & Linked Lists"
                  />
                </div>
                <button
                  className="glass-button"
                  onClick={handleCreateSession}
                  disabled={loading || !selectedCourse}
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <LoadingSpinner size="small" message="" /> : 'Start Live Session'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', background: 'var(--bg-glass)', padding: '2rem', borderRadius: '12px', border: '2px solid var(--border-glass)' }}>
                <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>Active Session Code</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <h1 style={{ fontSize: '3.5rem', letterSpacing: '8px', color: '#7c3aed', margin: 0, fontWeight: 900 }}>{generatedCode}</h1>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      background: copied ? 'var(--success)' : 'var(--primary)',
                      border: 'none', borderRadius: '8px', padding: '0.5rem 1rem',
                      color: '#fff', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.3s'
                    }}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', background: '#ffffff', padding: '1rem', borderRadius: '12px', width: 'fit-content', margin: '0 auto', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', border: '2px solid #e2e8f0' }}>
                  <QRCodeSVG value={generatedCode} size={180} fgColor="#1e1b4b" bgColor="#ffffff" />
                </div>
                <p style={{ color: 'var(--text-main)', marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Instruct students to enter this PIN or scan the QR to check-in.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleStudentCheckIn}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enter the Session Code provided by your instructor to mark your attendance.</p>

            <div className="form-group">
              <label>Session PIN Code</label>
              <input
                type="text"
                className="glass-input"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="e.g. X72B9P"
                maxLength={6}
                style={{ fontSize: '1.5rem', letterSpacing: '4px', textAlign: 'center', textTransform: 'uppercase' }}
                required
              />
            </div>

            <button
              type="submit"
              className="glass-button"
              disabled={loading}
              style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Confirm Presence'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendanceScanner;
