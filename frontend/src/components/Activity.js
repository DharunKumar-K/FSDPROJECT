import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useToast } from "./ToastContext";

function Activity() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Teacher specific state
  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("Assignment");
  const [activityDescription, setActivityDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxScore, setMaxScore] = useState(100);

  // Student specific state
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'student') fetchActivities();
      if (parsedUser.role === 'teacher') fetchCourses();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    try {
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

  const fetchActivities = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch('/api/activities', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
        if (data.length > 0) setSelectedActivity(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch activities', err);
      showToast('Failed to load activities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!selectedCourse) { showToast('Please select a course', 'error'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/addActivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ courseId: selectedCourse, title: activityTitle, description: activityDescription, type: activityType, deadline, maxScore })
      });
      if (response.ok) {
        showToast(`Activity "${activityTitle}" created successfully!`, 'success');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to create activity', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error creating activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/submitActivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activityId: selectedActivity,
          notes: submissionNotes,
          fileUrl: fileUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`Assignment submitted ${data.status}!`, 'success');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to submit assignment", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Error during submission", 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isTeacher = user.role === 'teacher';

  return (
    <div className="dashboard-container animate-fade-in" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <button 
        className="glass-button" 
        style={{ width: 'auto', marginBottom: '1rem', background: 'rgba(255,255,255,0.1)' }} 
        onClick={() => navigate('/dashboard')}
      >
        ← Back to Dashboard
      </button>

      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            {isTeacher ? '📝' : '📤'}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {isTeacher ? 'Create Activity' : 'Submit Activity'}
          </h2>
        </div>
        
        {loading ? (
          <LoadingSpinner size="medium" message={isTeacher ? "Creating activity..." : "Submitting..."} />
        ) : isTeacher ? (
          <form onSubmit={handleCreateActivity}>
            <div style={{ display: 'grid', gap: '1.25rem' }}>

              <div className="form-group">
                <label>Select Course *</label>
                <select className="glass-select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
                  {courses.length === 0
                    ? <option value="">No courses available</option>
                    : courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)
                  }
                </select>
              </div>

              <div className="form-group">
                <label>Activity Title *</label>
                <input
                  type="text"
                  className="glass-input"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Database Normalization Project"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="glass-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Provide details about the activity..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Activity Type *</label>
                  <select 
                    className="glass-select" 
                    value={activityType} 
                    onChange={(e) => setActivityType(e.target.value)}
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Lab">Lab Experiment</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Mini Project">Mini Project</option>
                    <option value="Group Discussion">Group Discussion</option>
                    <option value="Case Study">Case Study</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Maximum Score *</label>
                  <input
                    type="number"
                    className="glass-input"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Submission Deadline *</label>
                <input
                  type="datetime-local"
                  className="glass-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="glass-button" 
              disabled={loading}
              style={{ 
                marginTop: '1.5rem', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Creating...' : '✓ Publish Activity'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStudentSubmit}>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              
              <div className="form-group">
                <label>Select Activity *</label>
                <select 
                  className="glass-select"
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  required
                >
                  {activities.length === 0 ? (
                    <option value="">No activities available</option>
                  ) : (
                    activities.map(activity => {
                      const deadline = new Date(activity.deadline);
                      const isOverdue = deadline < new Date();
                      return (
                        <option key={activity._id} value={activity._id}>
                          {activity.title} - Due: {deadline.toLocaleDateString()} {isOverdue ? '(OVERDUE)' : ''}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {selectedActivity && activities.length > 0 && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(124, 58, 237, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid var(--primary)'
                }}>
                  {(() => {
                    const activity = activities.find(a => a._id === selectedActivity);
                    if (!activity) return null;
                    return (
                      <>
                        <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                          📋 {activity.type} - Max Score: {activity.maxScore}
                        </p>
                        {activity.description && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {activity.description}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              
              <div className="form-group">
                <label>File URL / Repository Link</label>
                <input
                  type="url"
                  className="glass-input"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://github.com/username/repo or drive link"
                />
              </div>

              <div className="form-group">
                <label>Submission Notes *</label>
                <textarea
                  className="glass-input"
                  style={{ height: '120px', resize: 'vertical' }}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Add any notes about your submission..."
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="glass-button" 
              disabled={loading || activities.length === 0}
              style={{ 
                marginTop: '1.5rem', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                opacity: (loading || activities.length === 0) ? 0.7 : 1
              }}
            >
              {loading ? 'Submitting...' : '📤 Submit Activity'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Activity;
