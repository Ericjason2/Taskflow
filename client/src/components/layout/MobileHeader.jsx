import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, LayoutDashboard, FolderKanban, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); toast.success('Déconnecté'); navigate('/login'); setOpen(false);
  };

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-logo">
          <div className="logo-icon-sm"><Zap size={14} /></div>
          <span>TaskFlow</span>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {open && (
        <div className="mobile-nav-overlay" onClick={() => setOpen(false)}>
          <nav className="mobile-nav" onClick={e => e.stopPropagation()}>
            {[
              { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { to: '/projects', icon: FolderKanban, label: 'Projets' },
              { to: '/profile', icon: User, label: 'Profil' },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <Icon size={18} />{label}
              </NavLink>
            ))}
            <button className="mobile-nav-item danger" onClick={handleLogout}>
              <LogOut size={18} />Déconnexion
            </button>
          </nav>
        </div>
      )}
      <style>{`
        .mobile-header {
          display: none;
          position: fixed; top: 0; left: 0; right: 0;
          height: 56px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          padding: 0 16px;
          align-items: center;
          justify-content: space-between;
          z-index: 300;
        }
        .mobile-logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 800; font-size: 16px; }
        .logo-icon-sm { width: 26px; height: 26px; background: var(--accent); color: var(--text-inverse); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .mobile-nav-overlay { position: fixed; inset: 56px 0 0; background: rgba(8,11,20,0.7); backdrop-filter: blur(4px); z-index: 250; }
        .mobile-nav { background: var(--bg-elevated); border-bottom: 1px solid var(--border); padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .mobile-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-md); font-size: 15px; color: var(--text-secondary); transition: all var(--transition); border: none; background: none; cursor: pointer; width: 100%; text-align: left; font-family: var(--font-body); }
        .mobile-nav-item:hover, .mobile-nav-item.active { background: var(--bg-overlay); color: var(--text-primary); }
        .mobile-nav-item.active { color: var(--accent); }
        .mobile-nav-item.danger { color: #ef4444; }
        @media (max-width: 768px) {
          .mobile-header { display: flex; }
          .main-content { padding-top: 56px; }
        }
      `}</style>
    </>
  );
}
