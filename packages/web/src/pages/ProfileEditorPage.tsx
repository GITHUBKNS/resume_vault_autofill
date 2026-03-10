import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ResumeProfile, Experience, Education } from '@resume-vault/core';
import { getProfile, createProfile, updateProfile, deleteProfile } from '../lib/api';

const emptyExperience: Experience = { company: '', title: '', startDate: '', endDate: '', description: '' };
const emptyEducation: Education = { institution: '', degree: '', field: '', graduationDate: '' };

export default function ProfileEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skillsText, setSkillsText] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      loadProfile(id);
    }
  }, [id, isNew]);

  const loadProfile = async (profileId: string) => {
    try {
      const profile = await getProfile(profileId);
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setSummary(profile.summary || '');
      setExperience(profile.experience || []);
      setEducation(profile.education || []);
      setSkillsText((profile.skills || []).join(', '));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const profile: Partial<ResumeProfile> = {
      name, email, phone, summary, experience, education,
      skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (isNew) {
        const result = await createProfile(profile);
        navigate(`/profiles/${result.id}`, { replace: true });
      } else {
        await updateProfile(id!, profile);
        setSuccess('Profile saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    try {
      await deleteProfile(id!);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ─── Dynamic Field Helpers ───────────────────────────────────────

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-container fade-in" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{isNew ? 'New Profile' : 'Edit Profile'}</h1>
          <p>{isNew ? 'Create a new resume profile' : 'Update your profile details'}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* ── Personal Info ────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input id="profile-name" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email</label>
                <input id="profile-email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">Phone</label>
              <input id="profile-phone" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-summary">Professional Summary</label>
              <textarea id="profile-summary" className="form-textarea" rows={3} value={summary} onChange={e => setSummary(e.target.value)} placeholder="A brief summary of your professional background..." />
            </div>
          </div>
        </div>

        {/* ── Experience ───────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body">
            <div className="section-header">
              <h3>Work Experience</h3>
              <button type="button" className="btn btn-secondary" onClick={() => setExperience([...experience, { ...emptyExperience }])}>
                + Add
              </button>
            </div>
            {experience.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No experience entries yet.</p>
            )}
            {experience.map((exp, i) => (
              <div className="section-entry" key={i}>
                <button
                  type="button"
                  className="btn btn-ghost section-entry-remove"
                  onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}
                  style={{ fontSize: '0.75rem' }}
                >
                  ✕
                </button>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} placeholder="Acme Corp" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} placeholder="Software Engineer" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" value={exp.startDate} onChange={e => updateExperience(i, 'startDate', e.target.value)} placeholder="Jan 2022" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" value={exp.endDate} onChange={e => updateExperience(i, 'endDate', e.target.value)} placeholder="Present" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={2} value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Education ────────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body">
            <div className="section-header">
              <h3>Education</h3>
              <button type="button" className="btn btn-secondary" onClick={() => setEducation([...education, { ...emptyEducation }])}>
                + Add
              </button>
            </div>
            {education.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No education entries yet.</p>
            )}
            {education.map((edu, i) => (
              <div className="section-entry" key={i}>
                <button
                  type="button"
                  className="btn btn-ghost section-entry-remove"
                  onClick={() => setEducation(education.filter((_, idx) => idx !== i))}
                  style={{ fontSize: '0.75rem' }}
                >
                  ✕
                </button>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input className="form-input" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} placeholder="University of…" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input className="form-input" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="B.S." />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Field of Study</label>
                    <input className="form-input" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} placeholder="Computer Science" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Graduation Date</label>
                    <input className="form-input" value={edu.graduationDate} onChange={e => updateEducation(i, 'graduationDate', e.target.value)} placeholder="May 2020" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Skills ──────────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Skills</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-skills">Comma-separated list</label>
              <textarea
                id="profile-skills"
                className="form-textarea"
                rows={2}
                value={skillsText}
                onChange={e => setSkillsText(e.target.value)}
                placeholder="JavaScript, React, Node.js, Python, SQL..."
              />
            </div>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={saving}
              id="save-profile-btn"
            >
              {saving ? <span className="spinner" /> : (isNew ? 'Create Profile' : 'Save Changes')}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
          {!isNew && (
            <button
              className="btn btn-danger btn-lg"
              type="button"
              onClick={handleDelete}
              id="delete-profile-btn"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
