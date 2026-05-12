import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastContext';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    avgAttendance: 0,
    lowAttendance: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      navigate('/dashboard');
      return;
    }
    
    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        fetch('/api/students', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const studentsData = studentsRes.ok ? await studentsRes.json() : [];
      const teachersData = teachersRes.ok ? await teachersRes.json() : [];

      setStudents(studentsData);
      setTeachers(teachersData);
      processStudentStats(studentsData, teachersData);

    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processStudentStats = (studentsData, teachersData = []) => {
    const total = studentsData.length;
    
    // Calculate department distribution
    const deptCount = {};
    studentsData.forEach(s => {
      deptCount[s.department] = (deptCount[s.department] || 0) + 1;
    });
    
    const deptData = Object.keys(deptCount).map(dept => ({
      name: dept,
      value: deptCount[dept]
    }));
    
    setDepartmentData(deptData);
    
    setStats(prev => ({
      ...prev,
      totalStudents: total,
      totalTeachers: teachersData.length
    }));
  };

  const viewStudentDetails = async (student) => {
    setSelectedStudent(student);
    
    // Fetch student attendance
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const attendanceRes = await fetch(`/api/attendance/${student._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (attendanceRes.ok) {
        const attendance = await attendanceRes.json();
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'Present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        setSelectedStudent({
          ...student,
          attendanceRecords: attendance,
          attendancePercentage: percentage,
          totalClasses: total,
          presentCount: present
        });
      }
    } catch (err) {
      console.error('Error fetching student attendance:', err);
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        showToast('Student deleted successfully', 'success');
        setStudents(students.filter(s => s._id !== studentId));
        setSelectedStudent(null);
      } else {
        showToast('Failed to delete student', 'error');
      }
    } catch (err) {
      showToast('Error deleting student', 'error');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.registerNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(students.map(s => s.department))];
  const pieColors = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header animate-slide-up">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>
            Admin Control Panel
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>
            Manage students, teachers, and system analytics
          </p>
        </div>
        <button 
          className="vibrant-button" 
          onClick={() => navigate('/dashboard')}
          style={{ width: 'auto', padding: '0.75rem 2rem' }}
        >
          ← Dashboard
        </button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <LoadingSpinner size="large" message="Loading admin data..." />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card animate-slide-up" style={{ borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  👥
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total Students</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalStudents}</h3>
                </div>
              </div>
            </div>

            <div className="card animate-slide-up delay-1" style={{ borderTop: '4px solid var(--secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  👨‍🏫
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total Teachers</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalTeachers}</h3>
                </div>
              </div>
            </div>

            <div className="card animate-slide-up delay-2" style={{ borderTop: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  📚
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Departments</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{departmentData.length}</h3>
                </div>
              </div>
            </div>

            <div className="card animate-slide-up delay-3" style={{ borderTop: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  ⚠️
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Low Attendance</p>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.lowAttendance}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Students List */}
            <section style={{ gridColumn: 'span 8' }}>
              <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    📋 Student Management
                  </h2>
                  <button
                    className="vibrant-button"
                    onClick={() => navigate('/bulk-import')}
                    style={{
                      width: 'auto',
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)'
                    }}
                  >
                    📊 Bulk Import
                  </button>
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

                {/* Students Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Register No</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Department</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Year</th>
                        <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontWeight: 700 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No students found
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student, idx) => (
                          <tr 
                            key={student._id} 
                            style={{ 
                              borderBottom: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{student.name}</td>
                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--primary)' }}>{student.registerNo}</td>
                            <td style={{ padding: '1rem' }}>{student.department}</td>
                            <td style={{ padding: '1rem' }}>{student.year}</td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <button
                                className="vibrant-button"
                                onClick={() => viewStudentDetails(student)}
                                style={{ 
                                  width: 'auto', 
                                  padding: '0.5rem 1rem', 
                                  fontSize: '0.85rem',
                                  marginRight: '0.5rem'
                                }}
                              >
                                View
                              </button>
                              <button
                                className="vibrant-button"
                                onClick={() => deleteStudent(student._id)}
                                style={{ 
                                  width: 'auto', 
                                  padding: '0.5rem 1rem', 
                                  fontSize: '0.85rem',
                                  background: 'linear-gradient(135deg, var(--accent) 0%, #be185d 100%)'
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department Distribution Chart */}
              {departmentData.length > 0 && (
                <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    📊 Department Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {/* Student Details Sidebar */}
            <aside style={{ gridColumn: 'span 4' }}>
              <div className="card" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                  👤 Student Details
                </h3>
                
                {!selectedStudent ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</p>
                    <p>Select a student to view details</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ 
                      padding: '1rem', 
                      background: 'var(--bg-glass)', 
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        color: '#fff',
                        margin: '0 auto 1rem'
                      }}>
                        {selectedStudent.name.charAt(0).toUpperCase()}
                      </div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {selectedStudent.name}
                      </h4>
                      <p style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                        {selectedStudent.registerNo}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Email</span>
                        <span style={{ fontWeight: 600 }}>{selectedStudent.email}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Department</span>
                        <span style={{ fontWeight: 600 }}>{selectedStudent.department}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Year</span>
                        <span style={{ fontWeight: 600 }}>{selectedStudent.year}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Semester</span>
                        <span style={{ fontWeight: 600 }}>{selectedStudent.semester}</span>
                      </div>
                    </div>

                    {selectedStudent.attendancePercentage !== undefined && (
                      <div style={{ 
                        padding: '1.5rem', 
                        background: selectedStudent.attendancePercentage >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        borderRadius: '12px',
                        border: `2px solid ${selectedStudent.attendancePercentage >= 75 ? 'var(--success)' : 'var(--accent)'}`,
                        marginTop: '1rem'
                      }}>
                        <p style={{ 
                          color: selectedStudent.attendancePercentage >= 75 ? 'var(--success)' : 'var(--accent)', 
                          fontWeight: 700, 
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem'
                        }}>
                          📊 Attendance Status
                        </p>
                        <h3 style={{ 
                          fontSize: '2.5rem', 
                          fontWeight: 800, 
                          color: selectedStudent.attendancePercentage >= 75 ? 'var(--success)' : 'var(--accent)',
                          marginBottom: '0.5rem'
                        }}>
                          {selectedStudent.attendancePercentage}%
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {selectedStudent.presentCount} / {selectedStudent.totalClasses} classes attended
                        </p>
                        <div className="progress-track" style={{ marginTop: '1rem' }}>
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${selectedStudent.attendancePercentage}%`, 
                              background: selectedStudent.attendancePercentage >= 75 ? 'var(--success)' : 'var(--accent)'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
