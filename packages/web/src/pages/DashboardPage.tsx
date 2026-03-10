import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProfileListItem } from '@resume-vault/core';
import { getProfiles } from '../lib/api';
import ProfileCard from '../components/ProfileCard';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Your Profiles</h1>
          <p>{profiles.length} resume profile{profiles.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/import')}
            id="import-btn"
          >
            📄 Import Resume
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/profiles/new')}
            id="create-profile-btn"
          >
            + New Profile
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No profiles yet</h3>
          <p>Create your first resume profile or import an existing resume to get started.</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/profiles/new')}
            id="empty-create-btn"
          >
            + Create your first profile
          </button>
        </div>
      ) : (
        <div className="profile-grid">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={() => navigate(`/profiles/${profile.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
