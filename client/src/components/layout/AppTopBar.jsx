import { useLocation, Link } from "react-router-dom";
import { Kanban, ChevronRight, User as UserIcon } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useProjectStore from "../../store/projectStore";
import NotificationDropdown from "../common/NotificationDropdown";
import ThemeToggle from "../common/ThemeToggle";
import UserAvatar from "../common/UserAvatar";

export default function AppTopBar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { currentProject } = useProjectStore();

  // Compute breadcrumb info
  const path = location.pathname;
  let pageTitle = "Espace de travail";
  let pageSubtitle = "";

  if (path.startsWith("/dashboard")) {
    pageTitle = "Vue d'ensemble";
    pageSubtitle = "Tableau de bord";
  } else if (path === "/projects") {
    pageTitle = "Projets & Tableaux";
    pageSubtitle = "Gestion d'équipe";
  } else if (path.startsWith("/projects/") && currentProject) {
    pageTitle = currentProject.titre;
    pageSubtitle = "Tableau Kanban";
  } else if (path.startsWith("/profile")) {
    pageTitle = "Mon Profil";
    pageSubtitle = "Paramètres du compte";
  }

  const initials =
    user?.nom
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "TF";

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-workspace">TaskFlow</span>
          <ChevronRight size={14} className="breadcrumb-chevron" />
          <span className="breadcrumb-current">{pageTitle}</span>
          {pageSubtitle && (
            <span className="breadcrumb-badge">{pageSubtitle}</span>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Notifications & Theme Actions */}
        <div className="topbar-actions">
          <NotificationDropdown />
          <ThemeToggle />
        </div>

        <div className="topbar-divider" />

        {/* User Profile Chip */}
        <Link to="/profile" className="topbar-user-chip" title="Accéder à mon profil">
          <UserAvatar user={user} size="xs" className="topbar-avatar" />
          <span className="topbar-user-name">{user?.nom?.split(" ")[0] || "Profil"}</span>
        </Link>
      </div>

      <style>{`
        .app-topbar {
          height: 50px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
          z-index: 50;
          position: sticky;
          top: 0;
        }

        @media (max-width: 820px) {
          .app-topbar {
            display: none !important;
          }
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .topbar-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .breadcrumb-workspace {
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: -0.01em;
        }

        .breadcrumb-chevron {
          color: var(--text-muted);
          opacity: 0.6;
          flex-shrink: 0;
        }

        .breadcrumb-current {
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .breadcrumb-badge {
          font-size: 10px;
          font-weight: 600;
          background: var(--accent-subtle);
          color: var(--accent);
          padding: 2px 7px;
          border-radius: 100px;
          border: 1px solid var(--border);
          letter-spacing: 0.02em;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .topbar-divider {
          width: 1px;
          height: 20px;
          background: var(--border);
        }

        .topbar-user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 8px 3px 4px;
          border-radius: 100px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          transition: all 0.15s ease;
          text-decoration: none;
          color: var(--text-primary);
        }

        .topbar-user-chip:hover {
          background: var(--bg-surface);
          border-color: var(--accent);
        }

        .topbar-avatar {
          width: 24px;
          height: 24px;
          font-size: 10px;
          font-weight: 700;
          overflow: hidden;
        }

        .topbar-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .topbar-user-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </header>
  );
}
