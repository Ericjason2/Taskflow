import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Inbox,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useNotificationStore from "../../store/notificationStore";
import useAuthStore from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import UserAvatar from "./UserAvatar";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setIsOpen,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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

  const handleNotificationClick = async (notif) => {
    if (isNotificationUnread(notif)) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.projet_id) {
      navigate(`/projects/${notif.projet_id}`);
    }
  };

  const handleTriggerClick = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    toggleOpen();
  };

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter(isNotificationUnread)
      : notifications;

  return (
    <div className="notif-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="notif-trigger-btn"
        onClick={handleTriggerClick}
        title="Notifications"
        aria-label="Centre de notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-popover">
          {/* Header */}
          <div className="notif-header">
            <div className="notif-title-row">
              <span className="notif-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-count-chip">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button
                  className="notif-action-btn"
                  onClick={markAllAsRead}
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={14} />
                  <span>Tout lire</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notif-action-btn delete-all"
                  onClick={clearAllNotifications}
                  title="Effacer toutes les notifications"
                >
                  <Trash2 size={13} />
                  <span>Vider</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          {notifications.length > 0 && (
            <div className="notif-filter-tabs">
              <button
                className={`notif-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Toutes ({notifications.length})
              </button>
              <button
                className={`notif-tab ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Non lues ({unreadCount})
              </button>
            </div>
          )}

          {/* List */}
          <div className="notif-list">
            {displayedNotifications.length === 0 ? (
              <div className="notif-empty">
                <Inbox size={30} strokeWidth={1.5} color="var(--text-muted)" />
                <p>
                  {filter === "unread"
                    ? "Aucune notification non lue"
                    : "Aucune notification pour le moment"}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const unread = isNotificationUnread(notif);
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${unread ? "unread" : "read"}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <UserAvatar
                      user={notif.expediteur}
                      size="sm"
                      className="notif-avatar"
                    />

                    <div className="notif-content">
                      <div className="notif-content-head">
                        <p className="notif-item-title">{notif.titre}</p>
                        <span className="notif-time">
                          {formatDistanceToNow(new Date(notif.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>

                      <p className="notif-item-msg">{notif.message}</p>

                      <div className="notif-status-line">
                        {unread ? (
                          <span className="status-indicator-unread">
                            <span className="unread-dot" /> Non lue
                          </span>
                        ) : (
                          <span className="status-indicator-read">
                            <CheckCheck size={12} /> Déjà lue
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="notif-item-actions">
                      {unread && (
                        <button
                          className="notif-btn-icon mark-read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          title="Marquer comme lue"
                          aria-label="Marquer comme lue"
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                      )}
                      <button
                        className="notif-btn-icon delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        title="Supprimer la notification"
                        aria-label="Supprimer la notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        .notif-dropdown-wrapper {
          position: relative;
          display: inline-flex;
        }

        .notif-trigger-btn {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
        }

        .notif-trigger-btn:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          height: 17px;
          min-width: 17px;
          padding: 0 4px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-surface);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .notif-popover {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 350px;
          max-width: 92vw;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: 1000;
          overflow: hidden;
          animation: scaleIn 0.15s ease-out;
        }

        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-subtle);
        }

        .notif-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .notif-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .notif-count-chip {
          font-size: 10.5px;
          background: var(--accent-subtle);
          color: var(--accent);
          padding: 1px 6px;
          border-radius: 9999px;
          font-weight: 600;
        }

        .notif-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notif-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: var(--radius-xs);
          transition: opacity var(--transition);
        }

        .notif-action-btn:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .notif-action-btn.delete-all {
          color: var(--text-muted);
        }

        .notif-action-btn.delete-all:hover {
          color: var(--prio-critique);
        }

        .notif-filter-tabs {
          display: flex;
          background: var(--bg-subtle);
          border-bottom: 1px solid var(--border);
          padding: 4px 10px;
          gap: 6px;
        }

        .notif-tab {
          font-size: 11.5px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition);
        }

        .notif-tab:hover {
          color: var(--text-primary);
        }

        .notif-tab.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          font-weight: 600;
          box-shadow: var(--shadow-xs);
        }

        .notif-list {
          max-height: 380px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 14px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background var(--transition), opacity var(--transition);
          position: relative;
        }

        .notif-item:last-child {
          border-bottom: none;
        }

        .notif-item:hover {
          background: var(--bg-subtle);
        }

        .notif-item.unread {
          background: var(--accent-subtle);
          border-left: 3px solid var(--accent);
        }

        .notif-item.read {
          background: var(--bg-surface);
          border-left: 3px solid transparent;
          opacity: 0.76;
        }

        .notif-item.read:hover {
          opacity: 1;
        }

        .notif-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notif-content {
          flex: 1;
          min-width: 0;
        }

        .notif-content-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 2px;
        }

        .notif-item-title {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notif-time {
          font-size: 10.5px;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .notif-item-msg {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 5px;
          word-break: break-word;
        }

        .notif-status-line {
          display: flex;
          align-items: center;
          font-size: 10.5px;
        }

        .status-indicator-unread {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--accent);
          font-weight: 600;
        }

        .status-indicator-read {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .notif-item-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notif-btn-icon {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-btn-icon.mark-read:hover {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
        }

        .notif-btn-icon.delete-btn:hover {
          background: var(--prio-critique-bg);
          color: var(--prio-critique);
          border-color: var(--prio-critique-border);
        }

        .unread-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }

        .notif-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          gap: 8px;
          color: var(--text-muted);
          font-size: 12.5px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
