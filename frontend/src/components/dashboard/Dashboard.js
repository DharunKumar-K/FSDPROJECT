import React, { useEffect, useState } from 'react';
import ProfileAvatar from './ProfileAvatar';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import LoadingSpinner from '../LoadingSpinner';
import { useToast } from '../ToastContext';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    attended: 0,
    percentage: 0,
    pendingActivities: 0,
    completedActivities: 0
  });
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchDashboardData(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchDashboardData = async (userData) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Fetch attendance records
      const attendanceRes = await fetch('/api/attendance/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (attendanceRes.ok) {
        const attendanceRecords = await attendanceRes.json();
        // /api/attendance/my returns grouped array for students, flat for teachers
        const flat = Array.isArray(attendanceRecords) && attendanceRecords[0]?.records
          ? attendanceRecords.flatMap(g => g.records)
          : attendanceRecords;
        processAttendanceData(flat);
      }

      // Fetch activities
      const activitiesRes = await fetch('/api/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.slice(0, 5));
        calculateActivityStats(activitiesData);
      }

      // Fetch recent sessions
      const sessionsRes = await fetch('/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setRecentSessions(sessionsData.slice(0, 3));
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = (records) => {
    if (!records || records.length === 0) {
      setStats(prev => ({ ...prev, totalClasses: 0, attended: 0, percentage: 0 }));
      return;
    }

    const attended = records.filter(r => r.status === 'Present').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    setStats(prev => ({
      ...prev,
      totalClasses: total,
      attended: attended,
      percentage: percentage
    }));

    // Process last 7 days trend
    const last7Days = records.slice(-7);
    const trendData = last7Days.map((record, idx) => ({
      day: `Day ${idx + 1}`,
      status: record.status === 'Present' ? 100 : 0
    }));
    
    setAttendanceData(trendData);
  };

  const calculateActivityStats = (activitiesData) => {
    const now = new Date();
    const pending = activitiesData.filter(a => new Date(a.deadline) > now).length;
    const pastDue = activitiesData.length - pending;
    setStats(prev => ({
      ...prev,
      pendingActivities: pending,
      completedActivities: pastDue
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
      <LoadingSpinner size="large" message="Initializing Workspace..." />
    </div>
  );

  const isTeacher = user.role === 'teacher';
  const isAdmin = user.role === 'admin';
  const isStudent = user.role === 'student';

  // Attendance status color
  const getAttendanceColor = () => {
    if (stats.percentage >= 75) return 'var(--success)';
    if (stats.percentage >= 60) return 'var(--warning)';
    return 'var(--accent)';
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation / Header */}
      <header className="dashboard-header animate-slide-up">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>
            {isTeacher ? 'Faculty Portal' : isAdmin ? 'Admin Dashboard' : 'Student Hub'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>
            Welcome back, <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user.name}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className={`role-badge ${isTeacher ? 'teacher-badge' : 'student-badge'} float-anim`}>
            {user.role}
          </div>
          <ProfileAvatar user={user} onLogout={handleLogout} />
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <LoadingSpinner size="large" message="Loading dashboard..." />
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Main Content */}
          <section className="animate-slide-up delay-1" style={{ gridColumn: 'span 8' }}>
            
            {/* Stats Cards */}
            <h2 className="section-title"><span>📊</span> {isStudent ? 'My Performance' : 'Overview'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {isStudent && (
                <>
                  <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>📅</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total Classes</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-main)' }}>{stats.totalClasses}</h3>
                  </div>

                  <div className="card" style={{ borderTop: `4px solid ${getAttendanceColor()}` }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>✓</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Attendance Rate</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0 1rem 0', color: 'var(--text-main)' }}>
                      {stats.percentage}<span style={{fontSize:'1.2rem', color:'var(--text-light)'}}>%</span>
                    </h3>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${stats.percentage}%`, background: getAttendanceColor() }}></div>
                    </div>
                  </div>

                  <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>🎯</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Pending Tasks</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-main)' }}>{stats.pendingActivities}</h3>
                  </div>

                  <div className="card" style={{ borderTop: '4px solid var(--secondary)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>📝</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Completed</p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-main)' }}>{stats.completedActivities}</h3>
                  </div>
                </>
              )}
            </div>

            {/* Attendance Visualization */}
            {isStudent && attendanceData.length > 0 && (
              <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📈</span> Recent Attendance Pattern
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="day" stroke="var(--text-muted)" />
                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
                    <Tooltip 
                      formatter={(value) => value === 100 ? 'Present' : 'Absent'}
                      contentStyle={{ 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border-glass)', 
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="status" radius={[8, 8, 0, 0]}>
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.status === 100 ? '#7c3aed' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Activities */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> {isStudent ? 'Upcoming Activities' : 'Recent Activities'}
              </h3>
              
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
                  <p>No activities available</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activities.map((activity, idx) => {
                    const deadline = new Date(activity.deadline);
                    const isOverdue = deadline < new Date();
                    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={activity._id || idx} style={{
                        padding: '1.25rem',
                        background: 'var(--bg-glass)',
                        borderRadius: '12px',
                        border: `2px solid ${isOverdue ? 'var(--accent)' : 'var(--border-glass)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.3s'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ 
                              padding: '0.25rem 0.75rem', 
                              background: 'rgba(124, 58, 237, 0.1)', 
                              color: 'var(--primary)', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700 
                            }}>
                              {activity.type || 'Assignment'}
                            </span>
                            {isOverdue && (
                              <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                background: 'rgba(244, 63, 94, 0.1)', 
                                color: 'var(--accent)', 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700 
                              }}>
                                Overdue
                              </span>
                            )}
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            {activity.title}
                          </h4>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Due: {deadline.toLocaleDateString()} {!isOverdue && `(${daysLeft} days left)`}
                          </p>
                        </div>
                        <button 
                          className="vibrant-button" 
                          onClick={() => navigate('/activity')}
                          style={{ 
                            width: 'auto', 
                            padding: '0.5rem 1.5rem',
                            fontSize: '0.9rem',
                            background: isOverdue ? 'linear-gradient(135deg, var(--accent) 0%, #be185d 100%)' : ''
                          }}
                        >
                          {isStudent ? 'Submit' : 'View'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="animate-slide-up delay-2" style={{ gridColumn: 'span 4' }}>
            <h2 className="section-title"><span>⚡</span> Quick Actions</h2>
            
            <div className="card mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem' }}>
              <button className="vibrant-button" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/attendance')}>
                <span>{isTeacher ? 'Launch Session' : 'Mark Attendance'}</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>📍</span>
              </button>
              
              {(isTeacher || isAdmin) && (
                <button className="vibrant-button" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16,185,129,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/manual-attendance')}>
                  <span>Manual Attendance</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>📝</span>
                </button>
              )}
              
              <button className="vibrant-button" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #0369a1 100%)', boxShadow: '0 4px 14px rgba(14,165,233,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/curriculum')}>
                <span>View Curriculum</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>📖</span>
              </button>

              <button className="vibrant-button" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: '0 4px 14px rgba(5,150,105,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/attendance-history')}>
                <span>Attendance History</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>📊</span>
              </button>
              
              <button className="vibrant-button" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #be123c 100%)', boxShadow: '0 4px 14px rgba(244,63,94,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/activity')}>
                <span>{isTeacher ? 'Manage Activities' : 'My Activities'}</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>🎯</span>
              </button>
              
              {isAdmin && (
                <button className="vibrant-button" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate('/students')}>
                  <span>Manage Students</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>👥</span>
                </button>
              )}
            </div>

            {/* Student Info Card */}
            <div className="dashboard-insight-card delay-4">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>ℹ️</span> {isTeacher ? 'Faculty Info' : 'Student Info'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {isStudent && stats.percentage < 75 && (
                  <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(244, 63, 94, 0.1)', 
                    borderRadius: '8px',
                    border: '1px solid var(--accent)'
                  }}>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      ⚠️ Attendance Alert
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Your attendance is below 75%. Attend {Math.ceil((75 * stats.totalClasses - stats.attended * 100) / 25)} more classes to be safe.
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Department</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.department || 'N/A'}</span>
                </div>
                
                {isStudent && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Year</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.year || 'N/A'}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Semester</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.semester || 'N/A'}</span>
                    </div>
                  </>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>ID</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--primary)' }}>
                    {user.registerNo || user.teacherId || user.adminId || user.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                  🕐 Recent Sessions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentSessions.map((session, idx) => (
                    <div key={session._id || idx} style={{
                      padding: '0.75rem',
                      background: 'var(--bg-glass)',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{session.topic || 'Class Session'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Code: <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{session.sessionCode}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
