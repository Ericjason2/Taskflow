import { useEffect, useRef } from "react";
import { Bell, CheckCheck, Check, Trash2, ExternalLink, Inbox } from "lucide-react";
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
  } = useNotificationStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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

  const handleNotificationClick = async (notif) => {
    if (!notif.lu) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.projet_id) {
      navigate(`/projects/${notif.projet_id}`);
    }
  };

  return (
    <div className="notif-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="notif-trigger-btn"
        onClick={toggleOpen}
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
          <div className="notif-header">
            <div className="notif-title-row">
              <span className="notif-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-count-chip">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="notif-action-btn"
                onClick={markAllAsRead}
                title="Tout marquer comme lu"
              >
                <CheckCheck size={14} />
                <span>Tout marquer lu</span>
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Inbox size={28} strokeWidth={1.5} color="var(--text-light)" />
                <p>Aucune notification pour le moment</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${!notif.lu ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <UserAvatar
                    user={notif.expediteur}
                    size="sm"
                    className="notif-avatar"
                  />
                  <div className="notif-content">
                    <p className="notif-item-title">{notif.titre}</p>
                    <p className="notif-item-msg">{notif.message}</p>
                    <span className="notif-time">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <div className="notif-item-actions">
                    {!notif.lu && (
                      <button
                        className="notif-item-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        title="Marquer comme lue"
                        aria-label="Marquer comme lue"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    {!notif.lu && <span className="unread-dot" />}
                  </div>
                </div>
              ))
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .notif-popover {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          max-width: 90vw;
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
          padding: 12px 14px;
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
        }

        .notif-action-btn:hover {
          text-decoration: underline;
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
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background var(--transition);
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
        }

        .notif-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .notif-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .notif-content {
          flex: 1;
          min-width: 0;
        }

        .notif-item-title {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .notif-item-msg {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .notif-time {
          font-size: 10.5px;
          color: var(--text-muted);
        }

        .notif-item-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .notif-item-read-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-item-read-btn:hover {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
        }

        .unread-dot {
          width: 7px;
          height: 7px;
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
