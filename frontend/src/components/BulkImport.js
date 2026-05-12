import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import LoadingSpinner from './LoadingSpinner';

const BulkImport = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      showToast('Please upload a CSV or Excel file', 'error');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        showToast('File is empty or invalid', 'error');
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }

      setPreview(data);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) {
      showToast('Please select a file first', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bulk-import-students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setImportResults(result);
        showToast(`Successfully imported ${result.success} students!`, 'success');
        
        // Clear file after successful import
        setTimeout(() => {
          setFile(null);
          setPreview([]);
        }, 3000);
      } else {
        const error = await response.json();
        showToast(error.error || 'Import failed', 'error');
      }
    } catch (err) {
      console.error('Import error:', err);
      showToast('Error importing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,registerNo,email,password,department,year,semester
John Doe,CS001,john@college.edu,password123,Computer Science,1,1
Jane Smith,CS002,jane@college.edu,password123,Computer Science,1,1`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header animate-slide-up">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>
            📊 Bulk Import Students
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>
            Upload CSV or Excel file to import multiple students at once
          </p>
        </div>
        <button 
          className="vibrant-button" 
          onClick={() => navigate('/students')}
          style={{ width: 'auto', padding: '0.75rem 2rem' }}
        >
          ← Back
        </button>
      </header>

      <div className="dashboard-grid">
        {/* Upload Section */}
        <section style={{ gridColumn: 'span 8' }}>
          <div className="card animate-slide-up" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              📁 Upload File
            </h2>

            {/* File Upload Area */}
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              background: 'var(--bg-glass)',
              marginBottom: '2rem',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📤</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {file ? file.name : 'Choose a file or drag it here'}
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Supports CSV, XLSX, XLS files
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <button
                  className="vibrant-button"
                  onClick={() => document.getElementById('file-upload').click()}
                  style={{ width: 'auto', padding: '0.75rem 2rem' }}
                  type="button"
                >
                  📂 Select File
                </button>
              </label>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
                  👀 Preview (First 5 rows)
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-glass)', borderBottom: '2px solid var(--border-color)' }}>
                        {Object.keys(preview[0]).map(key => (
                          <th key={key} style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          {Object.values(row).map((value, vidx) => (
                            <td key={vidx} style={{ padding: '0.75rem' }}>
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Button */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="vibrant-button"
                onClick={handleImport}
                disabled={!file || loading}
                style={{
                  width: 'auto',
                  padding: '0.75rem 2.5rem',
                  opacity: (!file || loading) ? 0.6 : 1,
                  background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner size="small" message="" />
                    Importing...
                  </span>
                ) : (
                  '✓ Import Students'
                )}
              </button>
            </div>

            {/* Import Results */}
            {importResults && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: importResults.failed > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                borderRadius: '12px',
                border: `2px solid ${importResults.failed > 0 ? 'var(--warning)' : 'var(--success)'}`,
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: importResults.failed > 0 ? 'var(--warning)' : 'var(--success)' }}>
                  📊 Import Results
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Processed</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800 }}>{importResults.total}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Successful</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{importResults.success}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Failed</p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{importResults.failed}</p>
                  </div>
                </div>
                {importResults.errors && importResults.errors.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent)' }}>Errors:</p>
                    <ul style={{ paddingLeft: '1.5rem' }}>
                      {importResults.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          Row {error.row}: {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Instructions Sidebar */}
        <aside style={{ gridColumn: 'span 4' }}>
          <div className="card animate-slide-up delay-1" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              📋 Instructions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  1. Download Template
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Get the CSV template with correct format
                </p>
                <button
                  className="vibrant-button"
                  onClick={downloadTemplate}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, var(--secondary) 0%, #0369a1 100%)'
                  }}
                >
                  📥 Download Template
                </button>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  2. Fill Data
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Add student information in the template
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  3. Upload File
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Select and upload your CSV/Excel file
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  4. Review & Import
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Check preview and click Import
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(14, 165, 233, 0.1)',
              borderRadius: '8px',
              border: '1px solid var(--secondary)'
            }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                💡 Required Fields
              </h4>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>name</li>
                <li>registerNo (unique)</li>
                <li>email (unique)</li>
                <li>password</li>
                <li>department</li>
                <li>year</li>
                <li>semester</li>
              </ul>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              border: '1px solid var(--warning)'
            }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--warning)' }}>
                ⚠️ Important Notes
              </h4>
              <ul style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>Duplicate emails/registerNo will be skipped</li>
                <li>Passwords will be hashed automatically</li>
                <li>Maximum 1000 students per import</li>
                <li>Invalid rows will be reported</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BulkImport;
