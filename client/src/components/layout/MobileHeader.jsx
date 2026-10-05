import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Menu, X, Kanban, LayoutDashboard, User, LogOut, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import NotificationDropdown from '../common/NotificationDropdown';
import ThemeToggle from '../common/ThemeToggle';
import UserAvatar from '../common/UserAvatar';
import toast from 'react-hot-toast';

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();
  const navigate = useNavigate();

  // Lock background scroll & handle escape when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  const handleLogout = () => {
    logout();
    toast.success('Déconnecté avec succès');
    navigate('/login');
    setOpen(false);
  };

  return (
    <>
      <header className="mobile-header fixed top-0 inset-x-0 h-14 z-40 bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 flex items-center justify-between shadow-xs">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-bold text-[17px] text-[var(--text-primary)]"
          onClick={() => setOpen(false)}
        >
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-xs">
            <Kanban size={15} />
          </div>
          <span className="tracking-tight">TaskFlow</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <ThemeToggle />
          <button
            type="button"
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] flex items-center justify-center transition-all cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Menu de navigation"
            aria-expanded={open}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          className="fixed inset-0 top-14 z-50 bg-slate-950/50 backdrop-blur-xs flex flex-col justify-start"
          onClick={() => setOpen(false)}
        >
          <nav
            className="w-full bg-[var(--bg-surface)] border-b border-[var(--border)] shadow-2xl p-4 flex flex-col gap-3.5 max-h-[calc(100vh-56px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Navigation mobile"
          >
            {/* User Profile Card */}
            <div className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
              <UserAvatar user={user} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {user?.nom || 'Utilisateur'}
                </span>
                <span className="text-xs text-[var(--text-muted)] truncate">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex flex-col gap-1">
              {[
                { to: '/dashboard', icon: LayoutDashboard, label: "Vue d'ensemble" },
                { to: '/projects', icon: Kanban, label: 'Tableaux (Projets)' },
                { to: '/profile', icon: User, label: 'Mon Profil & Paramètres' },
              ].map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={14} className="opacity-50" />
                </NavLink>
              ))}
            </div>

            {/* Recent Boards shortcut */}
            {projects?.length > 0 && (
              <div className="pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Tableaux récents
                  </span>
                  <Link
                    to="/projects"
                    onClick={() => setOpen(false)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="flex flex-col gap-1">
                  {projects.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ background: p.couleur || 'var(--accent)' }}
                      />
                      <span className="truncate flex-1">{p.titre}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Logout button */}
            <div className="pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut size={18} className="shrink-0" />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @media (min-width: 821px) {
          .mobile-header {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
