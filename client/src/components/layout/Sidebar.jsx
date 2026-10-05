import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  User,
  LogOut,
  FolderKanban,
  Plus,
  Sparkles,
  ChevronRight,
  Briefcase,
  Star,
  Check,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useProjectStore from "../../store/projectStore";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { to: "/projects", icon: Kanban, label: "Tableaux (Projets)" },
  { to: "/profile", icon: User, label: "Mon Profil" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Déconnecté avec succès");
    navigate("/login");
  };

  const initials =
    user?.nom
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "TF";

  const recentProjects = (projects || []).slice(0, 5);

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand">
          <div className="brand-icon">
            <Kanban size={20} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <span className="brand-name">TaskFlow</span>
            <span className="brand-sub">Espace d'équipe</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-content">
        <div className="nav-group">
          <p className="nav-group-title">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={16} className="nav-icon" />
              <span>{label}</span>
              <ChevronRight size={13} className="nav-arrow" />
            </NavLink>
          ))}
        </div>

        {/* Trello-like Recent Boards Section */}
        {recentProjects.length > 0 && (
          <div className="nav-group boards-group">
            <div className="nav-group-header">
              <span className="nav-group-title">Vos Tableaux récents</span>
              <Link to="/projects" className="see-all-btn" title="Tout voir">
                <Plus size={13} />
              </Link>
            </div>

            <div className="recent-boards-list">
              {recentProjects.map((p) => (
                <NavLink
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className={({ isActive }) =>
                    `board-link ${isActive ? "active" : ""}`
                  }
                >
                  <span
                    className="board-tile-indicator"
                    style={{ background: p.couleur || "#2563eb" }}
                  />
                  <span className="board-link-title">{p.titre}</span>
                  {p.stats?.done === p.stats?.total && p.stats?.total > 0 && (
                    <Check size={12} color="#10b981" strokeWidth={3} />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar avatar-sm">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.nom || "Utilisateur"}</p>
            <span className="user-role-pill">
              {user?.role === "admin" ? "Admin" : "Membre"}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Déconnexion"
        >
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .sidebar-header {
          padding: 18px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          width: 100%;
          transition: opacity 0.15s ease;
        }

        .sidebar-brand:hover {
          opacity: 0.92;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          color: #ffffff;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(37, 99, 235, 0.25);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .brand-name {
          font-family: var(--font-logo);
          font-weight: 800;
          font-size: 17.5px;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          line-height: 1.15;
        }

        .brand-sub {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .sidebar-content {
          flex: 1;
          padding: 14px 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .nav-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 4px;
        }

        .nav-group-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-light);
          padding: 4px 8px 8px;
        }

        .see-all-btn {
          color: var(--text-muted);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition);
        }
        .see-all-btn:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition);
          margin-bottom: 2px;
        }

        .nav-link:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--accent-subtle);
          color: var(--accent);
          font-weight: 600;
        }

        .nav-icon {
          color: inherit;
          opacity: 0.85;
        }

        .nav-arrow {
          margin-left: auto;
          opacity: 0;
          transition: opacity var(--transition);
        }

        .nav-link:hover .nav-arrow,
        .nav-link.active .nav-arrow {
          opacity: 0.6;
        }

        .recent-boards-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .board-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--text-secondary);
          transition: all var(--transition);
        }

        .board-link:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .board-link.active {
          background: #eff6ff;
          color: var(--accent);
          font-weight: 600;
        }

        .board-tile-indicator {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        .board-link-title {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .board-check {
          font-size: 11px;
          color: #10b981;
          font-weight: bold;
        }

        .sidebar-footer {
          padding: 12px 14px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-subtle);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          flex: 1;
        }

        .user-details {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role-pill {
          font-size: 10.5px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .logout-button {
          padding: 7px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .logout-button:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        @media (max-width: 820px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
