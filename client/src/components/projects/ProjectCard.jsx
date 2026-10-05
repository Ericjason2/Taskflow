import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Users,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  Star,
  ExternalLink,
  Kanban,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import UserAvatar from "../common/UserAvatar";

const PRIORITE_CONFIG = {
  basse: { label: "Basse", class: "badge-basse" },
  moyenne: { label: "Moyenne", class: "badge-moyenne" },
  haute: { label: "Haute", class: "badge-haute" },
  critique: { label: "Critique", class: "badge-critique" },
};

const STATUT_CONFIG = {
  actif: { label: "Actif", class: "badge-done" },
  en_pause: { label: "En pause", class: "badge-review" },
  terminé: { label: "Terminé", class: "badge-inprogress" },
  annulé: { label: "Annulé", class: "badge-todo" },
};

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  currentUserId,
  isFavorite = false,
  onToggleFavorite,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const {
    id,
    titre,
    description,
    statut,
    priorite,
    couleur = "#2563eb",
    stats,
    membres = [],
    createur,
    createdAt,
  } = project;

  const total = stats?.total || 0;
  const done = stats?.done || 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const canEdit = project.createur_id === currentUserId;

  return (
    <div className="trello-board-card">
      {/* Top Banner / Cover */}
      <div
        className="board-card-cover"
        style={{
          background: couleur.startsWith("#")
            ? `linear-gradient(135deg, ${couleur} 0%, #1e293b 140%)`
            : couleur,
        }}
      >
        <div className="cover-badge-row">
          <span className={`badge ${STATUT_CONFIG[statut]?.class || "badge-todo"}`}>
            {STATUT_CONFIG[statut]?.label || statut}
          </span>
          <span className={`badge ${PRIORITE_CONFIG[priorite]?.class || "badge-moyenne"}`}>
            {PRIORITE_CONFIG[priorite]?.label || priorite}
          </span>
        </div>

        <div className="cover-actions">
          {onToggleFavorite && (
            <button
              className={`cover-action-btn ${isFavorite ? "starred" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(id);
              }}
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star
                size={15}
                fill={isFavorite ? "#eab308" : "none"}
                color={isFavorite ? "#eab308" : "#ffffff"}
              />
            </button>
          )}

          {canEdit && (
            <div className="dropdown" ref={menuRef}>
              <button
                className="cover-action-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                title="Options"
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      onEdit(project);
                      setMenuOpen(false);
                    }}
                  >
                    <Edit2 size={13} /> Modifier
                  </button>
                  <button
                    className="dropdown-item danger"
                    onClick={() => {
                      onDelete(project);
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 size={13} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <Link to={`/projects/${id}`} className="board-card-content">
        <h3 className="board-title">{titre}</h3>
        {description ? (
          <p className="board-description">{description}</p>
        ) : (
          <p className="board-description empty">Aucune description</p>
        )}

        {/* Progress bar */}
        <div className="board-progress-container">
          <div className="board-progress-header">
            <span className="progress-label">Progression</span>
            <span className="progress-fraction">
              {done}/{total} ({progress}%)
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background:
                  progress === 100
                    ? "#10b981"
                    : couleur.startsWith("#")
                    ? couleur
                    : "#2563eb",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="board-card-footer">
          <div className="footer-left">
            {membres.length > 0 ? (
              <div className="avatar-group">
                {membres.slice(0, 3).map((m) => (
                  <UserAvatar key={m.id} user={m} size="xs" />
                ))}
                {membres.length > 3 && (
                  <div className="avatar avatar-xs extra-badge">
                    +{membres.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <span className="member-count-hint">
                <Users size={12} /> Seul
              </span>
            )}
          </div>

          <div className="footer-right">
            <span className="open-board-hint">
              Ouvrir <ExternalLink size={12} />
            </span>
          </div>
        </div>
      </Link>

      <style>{`
        .trello-board-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-smooth);
          display: flex;
          flex-direction: column;
        }

        .trello-board-card:hover {
          border-color: #cbd5e1;
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-3px);
        }

        .board-card-cover {
          height: 68px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
        }

        .cover-badge-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .cover-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cover-action-btn {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          border: none;
          background: rgba(0, 0, 0, 0.25);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .cover-action-btn:hover {
          background: rgba(0, 0, 0, 0.45);
        }

        .cover-action-btn.starred {
          background: rgba(0, 0, 0, 0.4);
        }

        .board-card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .board-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
          margin-bottom: 6px;
        }

        .board-description {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .board-description.empty {
          color: var(--text-light);
          font-style: italic;
        }

        .board-progress-container {
          margin-top: auto;
          margin-bottom: 14px;
        }

        .board-progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 5px;
          font-weight: 500;
        }

        .progress-track {
          height: 6px;
          background: #e2e8f0;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .board-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--border);
          font-size: 12px;
        }

        .member-count-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .extra-badge {
          background: #e2e8f0 !important;
          color: #475569 !important;
          font-size: 9px !important;
        }

        .open-board-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--accent);
          font-size: 12px;
          font-weight: 500;
          opacity: 0.85;
          transition: opacity var(--transition);
        }

        .trello-board-card:hover .open-board-hint {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
