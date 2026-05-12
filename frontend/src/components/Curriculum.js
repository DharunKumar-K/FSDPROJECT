import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastContext';

const safeUnits = (units) => Array.isArray(units) ? units : [];

const Curriculum = () => {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubjectIdx, setActiveSubjectIdx] = useState(0);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopics, setNewTopics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      fetchCurriculum();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/curriculum/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const normalized = data.map(s => ({
          ...s,
          units: Array.isArray(s.units)
            ? s.units
            : (typeof s.units === 'string' ? (() => { try { return JSON.parse(s.units); } catch { return []; } })() : [])
        }));
        setSubjects(normalized);
      } else {
        showToast('Failed to load curriculum', 'error');
      }
    } catch (err) {
      showToast('Error loading curriculum', 'error');
    }
    setLoading(false);
  };

  const handleMarkUnit = async (curriculumId, unitNum, newProgress) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/curriculum/unit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ curriculumId, unit: unitNum, progress: newProgress })
      });
      if (res.ok) {
        showToast(`Unit marked as ${newProgress === 100 ? 'completed' : 'in-progress'}!`, 'success');
        fetchCurriculum();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update', 'error');
      }
    } catch {
      showToast('Server error', 'error');
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const activeSubject = subjects[activeSubjectIdx];
      const res = await fetch('/api/curriculum/add-unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: newTitle,
          topics: newTopics,
          subjectCode: activeSubject?.courseCode
        })
      });
      if (res.ok) {
        setShowModal(false); setNewTitle(''); setNewTopics('');
        showToast('Unit added!', 'success');
        fetchCurriculum();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add unit', 'error');
      }
    } catch {
      showToast('Server error', 'error');
    }
    setIsSubmitting(false);
  };

  const progressColor = (p) => {
    if (p >= 80) return 'var(--success)';
    if (p >= 50) return '#f59e0b';
    if (p >= 20) return 'var(--secondary)';
    return 'var(--accent)';
  };

  const progressLabel = (p) => {
    if (p === 100) return '✓ Complete';
    if (p >= 75) return '🔥 Almost Done';
    if (p >= 50) return '📈 Halfway';
    if (p >= 20) return '🚀 In Progress';
    return '⏳ Not Started';
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  // Always safe — units guaranteed to be array
  const safeSubjects = subjects.map(s => ({ ...s, units: safeUnits(s.units) }));
  const activeSubject = safeSubjects[activeSubjectIdx];

  const overallProgress = safeSubjects.length > 0
    ? Math.round(safeSubjects.reduce((acc, s) => {
        const avg = s.units.length > 0
          ? s.units.reduce((a, u) => a + (u.progress || 0), 0) / s.units.length
          : 0;
        return acc + avg;
      }, 0) / safeSubjects.length)
    : 0;

  if (!user) return null;

  return (
    <div className="dashboard-container animate-slide-up">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.6rem', marginBottom: '0.2rem' }}>
            📖 Curriculum Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1rem' }}>
            {isTeacher ? `Teaching ${safeSubjects.length} subjects` : `${user.department || 'Your'} dept — ${safeSubjects.length} subjects`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isTeacher && (
            <button className="vibrant-button" style={{ width: 'auto', borderRadius: '99px', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)' }}
              onClick={() => setShowModal(true)}>
              + Add Unit
            </button>
          )}
          <button className="vibrant-button" style={{ width: 'auto', borderRadius: '99px', padding: '0.75rem 1.5rem' }}
            onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
          <LoadingSpinner size="large" message="Loading your curriculum..." />
        </div>
      ) : safeSubjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</p>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Curriculum Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            No subjects have been assigned for your department yet.
          </p>
        </div>
      ) : (
        <>
          {/* ── Overall Stats Row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Subjects', value: safeSubjects.length, color: 'var(--primary)', icon: '📚' },
              { label: 'Total Units', value: safeSubjects.reduce((a, s) => a + s.units.length, 0), color: 'var(--secondary)', icon: '📋' },
              { label: 'Completed Units', value: safeSubjects.reduce((a, s) => a + s.units.filter(u => u.progress === 100).length, 0), color: 'var(--success)', icon: '✅' },
              { label: 'Overall Progress', value: `${overallProgress}%`, color: progressColor(overallProgress), icon: '🎯' },
            ].map((stat, i) => (
              <div key={i} className="card animate-slide-up" style={{ animationDelay: `${i * 0.08}s`, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{stat.label}</p>
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* ── Layout: Subject Tabs + Content ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Subject Sidebar */}
            <div className="card" style={{ padding: '1rem', position: 'sticky', top: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                Subjects
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {safeSubjects.map((sub, idx) => {
                  const subProgress = sub.units.length > 0
                    ? Math.round(sub.units.reduce((a, u) => a + (u.progress || 0), 0) / sub.units.length)
                    : 0;
                  const isActive = idx === activeSubjectIdx;
                  const color = progressColor(subProgress);
                  return (
                    <button
                      key={sub._id}
                      onClick={() => { setActiveSubjectIdx(idx); setExpandedUnit(null); }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: isActive ? `2px solid ${color}` : '2px solid transparent',
                        background: isActive ? `${color}15` : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isActive ? color : 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {sub.courseCode}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isActive ? color : 'var(--text-muted)' }}>
                          {subProgress}%
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.3 }}>
                        {sub.courseName || sub.subject}
                      </p>
                      <div style={{ marginTop: '0.4rem', height: '3px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${subProgress}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Content */}
            {activeSubject && (
              <div>
                {/* Subject Header Card */}
                <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem', borderLeft: `4px solid var(--primary)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', background: 'rgba(99,102,241,0.1)', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>
                        {activeSubject.courseCode}
                      </span>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.5rem 0 0.25rem' }}>
                        {activeSubject.courseName || activeSubject.subject}
                      </h2>
                      {activeSubject.teacher && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          👩🏫 {activeSubject.teacher.name} &nbsp;·&nbsp; {activeSubject.department} · Year {activeSubject.year} · Sem {activeSubject.semester}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {(() => {
                        const p = activeSubject.units.length > 0
                          ? Math.round(activeSubject.units.reduce((a, u) => a + (u.progress || 0), 0) / activeSubject.units.length)
                          : 0;
                        return (
                          <>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: progressColor(p) }}>{p}%</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{progressLabel(p)}</div>
                            <div style={{ marginTop: '0.4rem', width: '120px', height: '6px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${p}%`, background: progressColor(p), transition: 'width 0.6s ease' }} />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Unit List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activeSubject.units.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</p>
                      <p>No units added yet for this subject.</p>
                    </div>
                  ) : activeSubject.units.map((unit, uidx) => {
                    const color = progressColor(unit.progress || 0);
                    const isOpen = expandedUnit === uidx;
                    return (
                      <div
                        key={uidx}
                        className="card animate-slide-up"
                        style={{ padding: '1.25rem', animationDelay: `${uidx * 0.05}s`, border: `1px solid ${isOpen ? color : 'rgba(255,255,255,0.9)'}`, transition: 'all 0.3s' }}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                          onClick={() => setExpandedUnit(isOpen ? null : uidx)}
                        >
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color, flexShrink: 0 }}>
                            {unit.progress === 100 ? '✓' : unit.unit}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                Unit {unit.unit}: {unit.title}
                              </h4>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color, background: `${color}15`, padding: '0.2rem 0.6rem', borderRadius: '99px' }}>
                                {unit.progress || 0}%
                              </span>
                            </div>
                            <div style={{ height: '5px', borderRadius: '99px', background: 'var(--border-color)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${unit.progress || 0}%`, background: color, transition: 'width 0.6s ease' }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                              {unit.topics?.length || 0} topics &nbsp;·&nbsp; {progressLabel(unit.progress || 0)}
                            </p>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▾</span>
                        </div>

                        {isOpen && (
                          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                              {(unit.topics || []).map((topic, tidx) => (
                                <span key={tidx} style={{
                                  padding: '0.35rem 0.85rem',
                                  borderRadius: '8px',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  background: topic.completed ? `${color}20` : 'rgba(248,250,252,0.9)',
                                  color: topic.completed ? color : 'var(--text-muted)',
                                  border: `1px solid ${topic.completed ? `${color}40` : 'var(--border-color)'}`,
                                }}>
                                  {topic.completed ? '✓ ' : ''}{typeof topic === 'string' ? topic : topic.name}
                                </span>
                              ))}
                            </div>

                            {isTeacher && (
                              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {[25, 50, 75, 100].map(p => (
                                  <button
                                    key={p}
                                    className="vibrant-button"
                                    onClick={() => handleMarkUnit(activeSubject._id, unit.unit, p)}
                                    style={{
                                      width: 'auto',
                                      padding: '0.4rem 1rem',
                                      fontSize: '0.82rem',
                                      background: (unit.progress || 0) >= p
                                        ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
                                        : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                                      opacity: (unit.progress || 0) >= p ? 1 : 0.6
                                    }}
                                  >
                                    {p === 100 ? '✓ Complete' : `${p}%`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Unit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card animate-slide-up" style={{ width: '90%', maxWidth: '520px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Add Unit to <em style={{ color: 'var(--primary)' }}>{activeSubject?.courseCode}</em></span>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem' }} onClick={() => setShowModal(false)}>✕</button>
            </h2>
            <form onSubmit={handleAddUnit}>
              <div className="form-group">
                <label>Unit Title *</label>
                <input type="text" className="input-field" placeholder="e.g. Sorting Algorithms" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Topics (comma separated) *</label>
                <input type="text" className="input-field" placeholder="e.g. Bubble sort, Merge sort, Quick sort" value={newTopics} onChange={e => setNewTopics(e.target.value)} required />
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="vibrant-button" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', boxShadow: 'none', width: 'auto', padding: '0.6rem 1.5rem' }} onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="vibrant-button" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : '+ Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curriculum;
