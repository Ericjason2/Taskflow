import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, User, LogOut,
  Zap, ChevronRight, Settings
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projets' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Déconnecté');
    navigate('/login');
  };

  const initials = user?.nom?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={18} strokeWidth={2.5} />
        </div>
        <span className="logo-text">TaskFlow</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="nav-chevron" />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar avatar-md">
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.nom}</p>
            <p className="user-role">{user?.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
          </div>
        </div>
        <button className="btn btn-ghost btn-icon sidebar-logout" onClick={handleLogout} title="Déconnexion">
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 200;
          overflow: hidden;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 8px;
        }
        .logo-icon {
          width: 34px; height: 34px;
          background: var(--accent);
          color: var(--text-inverse);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .sidebar-nav { flex: 1; padding: 8px 12px; overflow-y: auto; }
        .nav-section-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding: 8px 8px 6px;
          font-weight: 600;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition);
          margin-bottom: 2px;
          position: relative;
        }
        .nav-item:hover { background: var(--bg-overlay); color: var(--text-primary); }
        .nav-item.active {
          background: var(--accent-glow);
          color: var(--accent);
          border: 1px solid rgba(0,212,255,0.15);
        }
        .nav-chevron {
          margin-left: auto;
          opacity: 0;
          transition: opacity var(--transition);
        }
        .nav-item.active .nav-chevron,
        .nav-item:hover .nav-chevron { opacity: 1; }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .user-card { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 13px; font-weight: 600; truncate; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-role { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
        .sidebar-logout { color: var(--text-muted); }
        .sidebar-logout:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
        @media (max-width: 768px) {
          .sidebar { display: none; }
        }
      `}</style>
    </aside>
  );
}
