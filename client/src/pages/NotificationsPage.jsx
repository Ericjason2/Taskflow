import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Inbox,
  ExternalLink,
  Layers,
  Sparkles,
  UserPlus,
  CheckSquare,
  MessageSquare,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useNotificationStore from "../store/notificationStore";
import useAuthStore from "../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import UserAvatar from "../components/common/UserAvatar";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'invitations' | 'tasks'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const isNotificationUnread = (notif) => {
    if (!notif) return false;
    return (
      notif.lu === false ||
      notif.lu === 0 ||
      notif.lu === "0" ||
      notif.lu === "false" ||
      !notif.lu
    );
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success("Notification marquée comme lue");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success("Notification supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      toast.success("Toutes les notifications sont marquées comme lues");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (window.confirm("Voulez-vous vraiment supprimer toutes vos notifications ?")) {
      try {
        await clearAllNotifications();
        toast.success("Toutes les notifications ont été supprimées");
      } catch {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleNavigateProject = (notif) => {
    if (isNotificationUnread(notif)) {
      markAsRead(notif.id).catch(() => {});
    }
    if (notif.projet_id) {
      navigate(`/projects/${notif.projet_id}`);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return isNotificationUnread(notif);
    if (filter === "invitations") return notif.type === "project_invitation";
    if (filter === "tasks") return notif.type === "task_assigned" || notif.type === "critical_alert";
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case "project_invitation":
        return <UserPlus size={15} color="var(--accent)" />;
      case "task_assigned":
        return <CheckSquare size={15} color="#10b981" />;
      case "critical_alert":
        return <AlertTriangle size={15} color="#ef4444" />;
      case "comment_added":
        return <MessageSquare size={15} color="#8b5cf6" />;
      default:
        return <Bell size={15} color="var(--accent)" />;
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="header-badge-row">
            <span className="workspace-badge">
              <Bell size={13} /> Activité d'équipe
            </span>
          </div>
          <h1 className="page-title">Centre de Notifications</h1>
          <p className="page-subtitle">
            Consultez toutes vos assignations, invitations et alertes d'équipe
          </p>
        </div>

        <div className="header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMarkAll}
            >
              <CheckCheck size={16} />
              <span>Tout marquer comme lu ({unreadCount})</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost delete-all-btn"
              onClick={handleClearAll}
              title="Supprimer toutes les notifications"
            >
              <Trash2 size={15} />
              <span>Tout effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="notif-page-toolbar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Toutes <span className="pill-count">{notifications.length}</span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Non lues <span className="pill-count">{unreadCount}</span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === "invitations" ? "active" : ""}`}
            onClick={() => setFilter("invitations")}
          >
            Invitations{" "}
            <span className="pill-count">
              {notifications.filter((n) => n.type === "project_invitation").length}
            </span>
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === "tasks" ? "active" : ""}`}
            onClick={() => setFilter("tasks")}
          >
            Tâches{" "}
            <span className="pill-count">
              {notifications.filter((n) => n.type === "task_assigned" || n.type === "critical_alert").length}
            </span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="notif-page-content">
        {filteredNotifications.length === 0 ? (
          <div className="notif-page-empty">
            <div className="empty-icon-circle">
              <Inbox size={42} strokeWidth={1.5} color="var(--text-muted)" />
            </div>
            <h3 className="empty-title">
              {filter === "unread"
                ? "Aucune notification non lue"
                : "Vous êtes parfaitement à jour !"}
            </h3>
            <p className="empty-desc">
              {filter === "unread"
                ? "Toutes vos notifications sont déjà lues."
                : "Aucune notification pour le moment dans cette catégorie."}
            </p>
          </div>
        ) : (
          <div className="notif-cards-grid">
            {filteredNotifications.map((notif) => {
              const unread = isNotificationUnread(notif);
              return (
                <div
                  key={notif.id}
                  className={`notif-card ${unread ? "is-unread" : "is-read"}`}
                >
                  <div className="notif-card-main">
                    <div className="notif-sender-avatar">
                      <UserAvatar user={notif.expediteur} size="md" />
                      <div className="notif-type-badge">
                        {getNotifIcon(notif.type)}
                      </div>
                    </div>

                    <div className="notif-card-body">
                      <div className="notif-card-header">
                        <div className="notif-meta-left">
                          <span className="notif-title-text">{notif.titre}</span>
                          {notif.projet && (
                            <span
                              className="notif-project-pill"
                              style={{
                                borderColor: notif.projet.couleur || "var(--border)",
                              }}
                            >
                              <span
                                className="project-color-dot"
                                style={{ background: notif.projet.couleur || "var(--accent)" }}
                              />
                              {notif.projet.titre}
                            </span>
                          )}
                        </div>

                        <span className="notif-card-time">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>

                      <p className="notif-card-message">{notif.message}</p>

                      <div className="notif-card-footer">
                        <div className="notif-status-badge">
                          {unread ? (
                            <span className="badge-unread">
                              <span className="unread-pulse" /> Non lue
                            </span>
                          ) : (
                            <span className="badge-read">
                              <CheckCheck size={13} /> Lues
                            </span>
                          )}
                        </div>

                        <div className="notif-actions-group">
                          {notif.projet_id && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleNavigateProject(notif)}
                            >
                              <ExternalLink size={13} />
                              <span>Ouvrir le tableau</span>
                            </button>
                          )}

                          {unread ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm mark-read-action"
                              onClick={() => handleMarkAsRead(notif.id)}
                              title="Marquer comme lue"
                            >
                              <Check size={14} />
                              <span>Marquer comme lu</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm delete-action"
                            onClick={() => handleDelete(notif.id)}
                            title="Supprimer la notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .header-badge-row {
          margin-bottom: 4px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .delete-all-btn {
          color: var(--text-muted);
        }
        .delete-all-btn:hover {
          color: var(--prio-critique);
          background: var(--prio-critique-bg);
        }

        .notif-page-toolbar {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .filter-pill-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
        }

        .filter-pill:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .filter-pill.active {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
          font-weight: 600;
        }

        .pill-count {
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.08);
        }
        .filter-pill.active .pill-count {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .notif-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 900px;
        }

        .notif-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          transition: all 0.15s ease;
          position: relative;
        }

        .notif-card:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-sm);
        }

        .notif-card.is-unread {
          border-left: 4px solid var(--accent);
          background: var(--bg-surface);
        }

        .notif-card.is-read {
          border-left: 4px solid transparent;
          opacity: 0.88;
        }

        .notif-card.is-read:hover {
          opacity: 1;
        }

        .notif-card-main {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .notif-sender-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .notif-type-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 2px solid var(--bg-surface);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notif-card-body {
          flex: 1;
          min-width: 0;
        }

        .notif-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
        }

        .notif-meta-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .notif-title-text {
          font-weight: 700;
          font-size: 14.5px;
          color: var(--text-primary);
        }

        .notif-project-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          padding: 1px 8px;
          border-radius: 9999px;
          border: 1px solid var(--border);
          background: var(--bg-subtle);
          color: var(--text-secondary);
        }

        .project-color-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .notif-card-time {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .notif-card-message {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .notif-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }

        .badge-unread {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          color: var(--accent);
        }

        .unread-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          display: inline-block;
          box-shadow: 0 0 0 2px var(--accent-subtle);
        }

        .badge-read {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .notif-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mark-read-action {
          color: var(--accent);
        }
        .mark-read-action:hover {
          background: var(--accent-subtle);
        }

        .delete-action {
          color: var(--text-muted);
        }
        .delete-action:hover {
          color: var(--prio-critique);
          background: var(--prio-critique-bg);
        }

        .notif-page-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          background: var(--bg-surface);
          border: 1px dashed var(--border);
          border-radius: var(--radius-xl);
          max-width: 900px;
        }

        .empty-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--bg-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .empty-desc {
          font-size: 13.5px;
          color: var(--text-muted);
          max-width: 400px;
        }
      `}</style>
    </div>
  );
}
