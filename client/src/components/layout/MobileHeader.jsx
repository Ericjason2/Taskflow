import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Menu, X, Kanban, LayoutDashboard, User, LogOut, Plus, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import NotificationDropdown from '../common/NotificationDropdown';
import ThemeToggle from '../common/ThemeToggle';
import toast from 'react-hot-toast';

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Déconnecté avec succès');
    navigate('/login');
    setOpen(false);
  };

  const initials =
    user?.nom
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'TF';

  return (
    <>
      <header className="mobile-header">
        <Link to="/dashboard" className="mobile-logo" onClick={() => setOpen(false)}>
          <div className="logo-icon-sm">
            <Kanban size={15} />
          </div>
          <span>TaskFlow</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NotificationDropdown />
          <ThemeToggle />
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setOpen(!open)}
            aria-label="Menu de navigation"
            style={{ width: 34, height: 34 }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {open && (
        <div className="mobile-nav-overlay" onClick={() => setOpen(false)}>
          <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
            {/* User Profile Card */}
            <div className="mobile-user-card">
              <div className="avatar avatar-md" style={{ overflow: 'hidden' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <div className="mobile-user-info">
                <span className="mobile-user-name">{user?.nom || 'Utilisateur'}</span>
                <span className="mobile-user-email">{user?.email}</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="mobile-links-section">
              {[
                { to: '/dashboard', icon: LayoutDashboard, label: "Vue d'ensemble" },
                { to: '/projects', icon: Kanban, label: 'Tableaux (Projets)' },
                { to: '/profile', icon: User, label: 'Mon Profil & Paramètres' },
              ].map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} className="mobile-icon" />
                  <span>{label}</span>
                  <ChevronRight size={14} className="mobile-chevron" />
                </NavLink>
              ))}
            </div>

            {/* Recent Boards shortcut on mobile */}
            {projects?.length > 0 && (
              <div className="mobile-recent-section">
                <span className="mobile-section-title">Tableaux récents</span>
                <div className="mobile-recent-list">
                  {projects.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className="mobile-recent-item"
                      onClick={() => setOpen(false)}
                    >
                      <span
                        className="mobile-board-dot"
                        style={{ background: p.couleur || 'var(--accent)' }}
                      />
                      <span className="mobile-board-title">{p.titre}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Logout button */}
            <div className="mobile-footer">
              <button className="mobile-nav-item danger" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          padding: 0 16px;
          align-items: center;
          justify-content: space-between;
          z-index: 300;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-logo);
          font-weight: 800;
          font-size: 17px;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .logo-icon-sm {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(37,99,235,0.25);
        }

        .mobile-nav-overlay {
          position: fixed;
          inset: 56px 0 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          z-index: 250;
          animation: fadeIn 0.15s ease;
        }

        .mobile-nav {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: calc(100vh - 56px);
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }

        .mobile-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .mobile-user-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-user-email {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-links-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition);
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: var(--font-body);
        }

        .mobile-nav-item:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .mobile-nav-item.active {
          background: var(--accent-subtle);
          color: var(--accent);
          font-weight: 600;
        }

        .mobile-chevron {
          margin-left: auto;
          color: var(--text-muted);
          opacity: 0.6;
        }

        .mobile-recent-section {
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }

        .mobile-section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          display: block;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        .mobile-recent-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mobile-recent-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--text-secondary);
          transition: background var(--transition);
        }

        .mobile-recent-item:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .mobile-board-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .mobile-board-title {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-footer {
          border-top: 1px solid var(--border);
          padding-top: 8px;
        }

        .mobile-nav-item.danger {
          color: var(--prio-critique);
        }
        .mobile-nav-item.danger:hover {
          background: var(--prio-critique-bg);
          color: #dc2626;
        }

        @media (max-width: 820px) {
          .mobile-header {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
