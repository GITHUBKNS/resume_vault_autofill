import type { ProfileListItem } from '@resume-vault/core';

interface Props {
  profile: ProfileListItem;
  onClick: () => void;
}

export default function ProfileCard({ profile, onClick }: Props) {
  const formattedDate = new Date(profile.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="card profile-card fade-in" onClick={onClick} id={`profile-card-${profile.id}`}>
      <div className="card-body">
        <div>
          <div className="profile-card-name">{profile.name || 'Untitled Profile'}</div>
          {profile.email && <div className="profile-card-email">{profile.email}</div>}
        </div>
        {profile.summary && (
          <div className="profile-card-summary">{profile.summary}</div>
        )}
        <div className="profile-card-meta">Updated {formattedDate}</div>
      </div>
    </div>
  );
}
