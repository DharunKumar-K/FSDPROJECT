import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastContext';

const ManualAttendance = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'teacher' && userData.role !== 'admin') {
      showToast('Access denied. Teachers/Admins only.', 'error');
      navigate('/dashboard');
      return;
    }
    
    setUser(userData);
    fetchData(userData.role);
  }, [navigate]);

  const fetchData = async (role) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      // Both admin and teacher use /api/students now
      // Backend handles role-based filtering
      const studentsRes = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (studentsRes.status === 401 || studentsRes.status === 404) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
        const initialRecords = {};
        studentsData.forEach(student => { initialRecords[student._id] = 'Present'; });
        setAttendanceRecords(initialRecords);
      } else {
        const errorData = await studentsRes.json();
        showToast(errorData.error || 'Failed to load students', 'error');
      }

      // Fetch sessions
      const sessionsRes = await fetch('/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
        if (sessionsData.length > 0) {
          setSelectedSession(sessionsData[0]._id);
          fetchExistingAttendance(sessionsData[0]._id);
        }
      } else {
        console.error('Failed to fetch sessions:', sessionsRes.status);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/session-attendance/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const existing = {};
        data.forEach(record => {
          existing[record.studentId._id || record.studentId] = record.status;
        });
        setExistingAttendance(existing);
      }
    } catch (err) {
      console.error('Error fetching existing attendance:', err);
    }
  };

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);
    fetchExistingAttendance(sessionId);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSelectAll = (status) => {
    const newRecords = {};
    filteredStudents.forEach(student => {
      newRecords[student._id] = status;
    });
    setAttendanceRecords(prev => ({ ...prev, ...newRecords }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSession) {
      showToast('Please select a session', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const attendanceData = filteredStudents.map(student => ({
        studentId: student._id,
        sessionId: selectedSession,
        status: attendanceRecords[student._id] || 'Present'
      }));

      const response = await fetch('/api/mark-bulk-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ attendanceRecords: attendanceData })
      });

      if (response.ok) {
        const result = await response.json();
        showToast(`Attendance marked for ${result.marked} students!`, 'success');
        fetchExistingAttendance(selectedSession);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to mark attendance', 'error');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      showToast('Error marking attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.registerNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(students.map(s => s.department))];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present': return 'var(--success)';
      case 'Absent': return 'var(--accent)';
      case 'Late': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Present': return 'rgba(16, 185, 129, 0.1)';
      case 'Absent': return 'rgba(244, 63, 94, 0.1)';
      case 'Late': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(148, 163, 184, 0.1)';
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header animate-slide-up">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>
            📝 Manual Attendance
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>
            Mark attendance for multiple students at once
          </p>
        </div>
        <button 
          className="vibrant-button" 
          onClick={() => navigate('/dashboard')}
          style={{ width: 'auto', padding: '0.75rem 2rem' }}
        >
          ← Back
        </button>
      </header>

      {loading && !students.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <LoadingSpinner size="large" message="Loading students..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            {/* Session Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Select Session *
              </label>
              <select
                className="glass-select"
                value={selectedSession}
                onChange={(e) => handleSessionChange(e.target.value)}
                required
                style={{ maxWidth: '500px' }}
              >
                {sessions.length === 0 ? (
                  <option value="">No sessions available</option>
                ) : (
                  sessions.map(session => (
                    <option key={session._id} value={session._id}>
                      {session.topic || 'Class Session'} - {session.sessionCode} ({new Date(session.createdAt).toLocaleDateString()})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="🔍 Search by name or register number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="glass-select"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="vibrant-button"
                onClick={() => handleSelectAll('Present')}
                style={{ 
                  width: 'auto', 
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)'
                }}
              >
                ✓ Mark All Present
              </button>
              <button
                type="button"
                className="vibrant-button"
                onClick={() => handleSelectAll('Absent')}
                style={{ 
                  width: 'auto', 
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--accent) 0%, #be185d 100%)'
                }}
              >
                ✗ Mark All Absent
              </button>
              <button
                type="button"
                className="vibrant-button"
                onClick={() => handleSelectAll('Late')}
                style={{ 
                  width: 'auto', 
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)'
                }}
              >
                ⏰ Mark All Late
              </button>
            </div>

            {/* Students List */}
            <div style={{ 
              maxHeight: '500px', 
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              {filteredStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
                  <p>No students found</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredStudents.map((student, idx) => {
                    const currentStatus = attendanceRecords[student._id] || 'Present';
                    const alreadyMarked = existingAttendance[student._id];
                    
                    return (
                      <div 
                        key={student._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem',
                          background: getStatusBg(currentStatus),
                          borderRadius: '8px',
                          border: `2px solid ${alreadyMarked ? getStatusColor(alreadyMarked) : 'var(--border-color)'}`,
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '1.1rem'
                            }}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                {student.name}
                              </h4>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {student.registerNo} • {student.department}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {alreadyMarked && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              background: getStatusBg(alreadyMarked),
                              color: getStatusColor(alreadyMarked),
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              border: `1px solid ${getStatusColor(alreadyMarked)}`
                            }}>
                              Already: {alreadyMarked}
                            </span>
                          )}
                          
                          <select
                            className="glass-select"
                            value={currentStatus}
                            onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                            style={{ 
                              width: '140px',
                              padding: '0.5rem',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: getStatusColor(currentStatus),
                              borderColor: getStatusColor(currentStatus)
                            }}
                          >
                            <option value="Present">✓ Present</option>
                            <option value="Absent">✗ Absent</option>
                            <option value="Late">⏰ Late</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'var(--bg-glass)', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Students</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {filteredStudents.length}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Present</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                    {Object.values(attendanceRecords).filter(s => s === 'Present').length}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>Absent</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {Object.values(attendanceRecords).filter(s => s === 'Absent').length}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>Late</span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>
                    {Object.values(attendanceRecords).filter(s => s === 'Late').length}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="vibrant-button"
                disabled={loading || !selectedSession || filteredStudents.length === 0}
                style={{
                  width: 'auto',
                  padding: '0.75rem 2.5rem',
                  fontSize: '1.1rem',
                  opacity: (loading || !selectedSession || filteredStudents.length === 0) ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : '💾 Save Attendance'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ManualAttendance;
