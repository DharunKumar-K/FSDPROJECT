import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastContext';

const AttendanceHistory = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]); // grouped by subject (student) or session list (teacher)
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSession, setExpandedSession] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    setUser(u);
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attendance/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to load attendance history', 'error');
      }
    } catch {
      showToast('Error loading attendance history', 'error');
    }
    setLoading(false);
  };

  const statusColor = (s) => {
    if (s === 'Present') return 'var(--success)';
    if (s === 'Absent') return 'var(--accent)';
    if (s === 'Late') return '#f59e0b';
    return 'var(--text-muted)';
  };

  const statusBg = (s) => {
    if (s === 'Present') return 'rgba(16,185,129,0.12)';
    if (s === 'Absent') return 'rgba(244,63,94,0.12)';
    if (s === 'Late') return 'rgba(245,158,11,0.12)';
    return 'rgba(148,163,184,0.1)';
  };

  const statusIcon = (s) => s === 'Present' ? '✓' : s === 'Absent' ? '✗' : '⏰';

  const percColor = (p) => {
    if (p >= 75) return 'var(--success)';
    if (p >= 60) return '#f59e0b';
    return 'var(--accent)';
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  if (!user) return null;

  return (
    <div className="dashboard-container animate-slide-up">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.6rem', marginBottom: '0.2rem' }}>
            📊 Attendance History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            {isStudent ? 'Your subject-wise attendance breakdown' : 'Session-wise attendance records'}
          </p>
        </div>
        <button className="vibrant-button" style={{ width: 'auto', padding: '0.75rem 2rem' }}
          onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
          <LoadingSpinner size="large" message="Loading attendance history..." />
        </div>
      ) : data.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
          <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</p>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Records Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No attendance records yet for your account.</p>
        </div>
      ) : isStudent ? (
        /* ──────── STUDENT VIEW ──────── */
        <>
          {/* Overall Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Subjects', value: data.length, color: 'var(--primary)', icon: '📚' },
              { label: 'Total Classes', value: data.reduce((a, s) => a + s.total, 0), color: 'var(--secondary)', icon: '🏫' },
              { label: 'Present', value: data.reduce((a, s) => a + s.present, 0), color: 'var(--success)', icon: '✓' },
              { label: 'Absent', value: data.reduce((a, s) => a + s.absent, 0), color: 'var(--accent)', icon: '✗' },
            ].map((s, i) => (
              <div key={i} className="card animate-slide-up" style={{ padding: '1.25rem', animationDelay: `${i * 0.07}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{s.label}</p>
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
              </div>
            ))}
          </div>

          {/* Subject Tabs + Detail */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Subject List Sidebar */}
            <div className="card" style={{ padding: '1rem', position: 'sticky', top: '1rem' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.4rem' }}>
                Subjects
              </h3>
              {data.map((subject, idx) => {
                const isActive = activeTab === idx;
                const color = percColor(subject.percentage);
                return (
                  <button key={idx} onClick={() => setActiveTab(idx)} style={{
                    display: 'block', width: '100%', padding: '0.7rem 0.85rem', marginBottom: '0.3rem',
                    borderRadius: '10px', border: isActive ? `2px solid ${color}` : '2px solid transparent',
                    background: isActive ? `${color}15` : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, fontFamily: 'monospace', color: isActive ? color : 'var(--text-muted)' }}>
                        {subject.courseCode}
                      </span>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 800,
                        color: subject.percentage >= 75 ? 'var(--success)' : subject.percentage >= 60 ? '#f59e0b' : 'var(--accent)'
                      }}>
                        {subject.percentage}%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.3 }}>
                      {subject.courseTitle}
                    </p>
                    <div style={{ marginTop: '0.3rem', height: '3px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${subject.percentage}%`, background: percColor(subject.percentage), transition: 'width 0.5s' }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subject Detail Panel */}
            {data[activeTab] && (() => {
              const sub = data[activeTab];
              const color = percColor(sub.percentage);
              return (
                <div>
                  {/* Subject Header */}
                  <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem', borderLeft: `4px solid ${color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color, background: `${color}15`, padding: '0.25rem 0.75rem', borderRadius: '99px' }}>
                          {sub.courseCode}
                        </span>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.5rem 0 0.25rem' }}>
                          {sub.courseTitle}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {sub.department} · Year {sub.year} · Sem {sub.semester}
                        </p>
                      </div>
                      {/* Attendance Circle */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '90px', height: '90px', borderRadius: '50%',
                          background: `conic-gradient(${color} ${sub.percentage * 3.6}deg, var(--border-color) 0deg)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <div style={{ position: 'absolute', width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color }}>{sub.percentage}%</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          {sub.percentage >= 75 ? '✅ Safe' : sub.percentage >= 60 ? '⚠️ Warning' : '🚨 Low!'}
                        </p>
                      </div>
                    </div>

                    {/* Mini Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem' }}>
                      {[
                        { label: 'Total', val: sub.total, color: 'var(--secondary)' },
                        { label: 'Present', val: sub.present, color: 'var(--success)' },
                        { label: 'Absent', val: sub.absent, color: 'var(--accent)' },
                      ].map((st, i) => (
                        <div key={i} style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '10px', textAlign: 'center' }}>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{st.label}</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: st.color }}>{st.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Records Table */}
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                      📅 Session Records ({sub.records.length})
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            {['Date', 'Topic', 'Status'].map(h => (
                              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sub.records.map((rec, ri) => (
                            <tr key={ri} style={{ borderBottom: '1px solid var(--border-color)', background: ri % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                {rec.topic || 'Class Session'}
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                  padding: '0.25rem 0.75rem', borderRadius: '99px',
                                  background: statusBg(rec.status), color: statusColor(rec.status),
                                  fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${statusColor(rec.status)}40`
                                }}>
                                  {statusIcon(rec.status)} {rec.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      ) : (
        /* ──────── TEACHER / ADMIN VIEW ──────── */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Sessions', value: data.length, color: 'var(--primary)', icon: '📅' },
              { label: 'Total Students', value: data.reduce((a, s) => a + s.total, 0), color: 'var(--secondary)', icon: '👥' },
              { label: 'Avg Attendance', value: data.length > 0 ? `${Math.round(data.reduce((a, s) => a + s.percentage, 0) / data.length)}%` : '0%', color: 'var(--success)', icon: '📊' },
              { label: 'Low Attendance', value: data.filter(s => s.percentage < 75).length, color: 'var(--accent)', icon: '⚠️' },
            ].map((s, i) => (
              <div key={i} className="card animate-slide-up" style={{ padding: '1.25rem', animationDelay: `${i * 0.07}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{s.label}</p>
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</h3>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.map((session, idx) => {
              const isOpen = expandedSession === idx;
              const color = percColor(session.percentage);
              return (
                <div key={idx} className="card animate-slide-up" style={{ animationDelay: `${idx * 0.03}s`, padding: '1.25rem', transition: 'all 0.3s', border: `1px solid ${isOpen ? color : 'rgba(255,255,255,0.9)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                    onClick={() => setExpandedSession(isOpen ? null : idx)}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      📅
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {session.topic}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{session.courseCode}</span>
                            &nbsp;·&nbsp;{session.courseTitle}
                            &nbsp;·&nbsp;{new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700 }}>
                              ✓ {session.present}
                            </span>
                            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(244,63,94,0.1)', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}>
                              ✗ {session.absent}
                            </span>
                            {session.late > 0 && (
                              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
                                ⏰ {session.late}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color, minWidth: '46px', textAlign: 'right' }}>
                            {session.percentage}%
                          </span>
                          <span style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▾</span>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.5rem', height: '4px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${session.percentage}%`, background: color, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded student list */}
                  {isOpen && session.students && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Student Attendance ({session.students.length})
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                        {session.students.map((stu, si) => (
                          <div key={si} style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.5rem 0.75rem', borderRadius: '8px',
                            background: statusBg(stu.status), border: `1px solid ${statusColor(stu.status)}30`
                          }}>
                            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: statusColor(stu.status), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                              {statusIcon(stu.status)}
                            </span>
                            <div>
                              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{stu.name}</p>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{stu.registerNo}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceHistory;
