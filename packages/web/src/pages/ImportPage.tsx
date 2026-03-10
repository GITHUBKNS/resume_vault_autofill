import { useState, useRef, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ParseResult } from '@resume-vault/core';
import { uploadResume, createProfile } from '../lib/api';

export default function ImportPage() {
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = async (file: File) => {
    setError('');
    setResult(null);
    setParsing(true);

    try {
      const parsed = await uploadResume(file);
      setResult(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSaveAsProfile = async () => {
    if (!result?.extractedFields) return;
    setSaving(true);

    try {
      const { id } = await createProfile({
        ...result.extractedFields,
        experience: result.extractedFields.experience || [],
        education: result.extractedFields.education || [],
        skills: result.extractedFields.skills || [],
      });
      navigate(`/profiles/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confidenceLabel = result
    ? result.confidence >= 0.6 ? 'high' : result.confidence >= 0.3 ? 'medium' : 'low'
    : 'low';

  return (
    <div className="page-container fade-in" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Import Resume</h1>
          <p>Upload a PDF or DOCX to extract profile data</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        id="upload-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {parsing ? (
          <>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <h3>Parsing your resume…</h3>
            <p>Extracting text and identifying fields</p>
          </>
        ) : (
          <>
            <div className="upload-zone-icon">📄</div>
            <h3>Drop your resume here, or click to browse</h3>
            <p>Supports PDF, DOCX, and plain text files (max 10 MB)</p>
          </>
        )}
      </div>

      {result && (
        <div className="parse-preview">
          <div className="parse-preview-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Extracted Data</h2>
            <span className={`confidence-badge confidence-${confidenceLabel}`}>
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '1rem', fontSize: '0.9375rem', fontWeight: 600 }}>Detected Fields</h3>
              {result.extractedFields.name && (
                <div className="form-group">
                  <div className="form-label">Name</div>
                  <div style={{ color: 'var(--text-primary)' }}>{result.extractedFields.name}</div>
                </div>
              )}
              {result.extractedFields.email && (
                <div className="form-group">
                  <div className="form-label">Email</div>
                  <div style={{ color: 'var(--accent)' }}>{result.extractedFields.email}</div>
                </div>
              )}
              {result.extractedFields.phone && (
                <div className="form-group">
                  <div className="form-label">Phone</div>
                  <div style={{ color: 'var(--text-primary)' }}>{result.extractedFields.phone}</div>
                </div>
              )}
              {result.extractedFields.summary && (
                <div className="form-group">
                  <div className="form-label">Summary</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{result.extractedFields.summary}</div>
                </div>
              )}
              {result.extractedFields.skills && result.extractedFields.skills.length > 0 && (
                <div className="form-group">
                  <div className="form-label">Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {result.extractedFields.skills.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.25rem 0.625rem',
                          background: 'var(--accent-subtle)',
                          color: 'var(--accent)',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9375rem', fontWeight: 600 }}>Raw Text</h3>
              <pre style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflow: 'auto',
                lineHeight: 1.5,
              }}>
                {result.rawText.slice(0, 2000)}{result.rawText.length > 2000 ? '…' : ''}
              </pre>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSaveAsProfile}
              disabled={saving}
              id="save-import-btn"
            >
              {saving ? <span className="spinner" /> : 'Save as Profile'}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => { setResult(null); setError(''); }}
            >
              Upload another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
