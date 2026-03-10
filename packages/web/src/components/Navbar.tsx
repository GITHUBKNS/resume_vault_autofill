import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <a href="/dashboard" className="navbar-brand" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
        ◆ Resume Vault
      </a>
      <div className="navbar-actions">
        {user && (
          <>
            <span className="navbar-user">{user.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout} id="logout-btn">
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
