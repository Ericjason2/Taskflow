import { Link } from "react-router-dom";
import {
  MoreVertical,
  Users,
  CheckSquare,
  Calendar,
  Trash2,
  Edit2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PRIORITE_LABELS = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique",
};
const STATUT_LABELS = {
  actif: "Actif",
  en_pause: "En pause",
  terminé: "Terminé",
  annulé: "Annulé",
};

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  currentUserId,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const {
    titre,
    description,
    statut,
    priorite,
    couleur,
    stats,
    membres,
    createur,
    createdAt,
  } = project;
  const progress =
    stats?.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const canEdit = project.createur_id === currentUserId;
  const isOthersMember = createur && createur.id !== currentUserId;

  return (
    <div className="project-card">
      <div className="project-card-accent" style={{ background: couleur }} />

      <div className="project-card-header">
        <div className="project-card-dot" style={{ background: couleur }} />
        <div className="project-meta">
          <span
            className={`badge badge-${statut === "actif" ? "done" : statut === "en_pause" ? "inprogress" : "todo"}`}
          >
            {STATUT_LABELS[statut]}
          </span>
          <span className={`badge badge-${priorite}`}>
            {PRIORITE_LABELS[priorite]}
          </span>
          {isOthersMember && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              Créé par {createur?.nom}
            </span>
          )}
        </div>
        {canEdit && (
          <div
            className="dropdown"
            ref={menuRef}
            style={{ marginLeft: "auto" }}
          >
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={15} />
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
                  <Edit2 size={14} /> Modifier
                </button>
                <button
                  className="dropdown-item danger"
                  onClick={() => {
                    onDelete(project);
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Link to={`/projects/${project.id}`} className="project-card-body">
        <h3 className="project-title">{titre}</h3>
        {description && <p className="project-description">{description}</p>}
      </Link>

      {/* Progress */}
      {stats?.total > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            <span>
              {stats.done}/{stats.total} tâches terminées
            </span>
            <span
              style={{
                fontWeight: 600,
                color:
                  progress === 100
                    ? "var(--done-color)"
                    : "var(--text-secondary)",
              }}
            >
              {progress}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, background: couleur }}
            />
          </div>
        </div>
      )}

      <div className="project-card-footer">
        {/* Members */}
        <div className="members-stack">
          {membres?.slice(0, 4).map((m, i) => (
            <div
              key={m.id}
              className="avatar avatar-sm members-avatar"
              style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }}
              title={m.nom}
            >
              {m.nom?.[0]?.toUpperCase()}
            </div>
          ))}
          {membres?.length > 4 && (
            <div
              className="avatar avatar-sm members-avatar"
              style={{
                marginLeft: -8,
                background: "var(--bg-overlay)",
                color: "var(--text-muted)",
                border: "2px solid var(--bg-surface)",
                fontSize: 10,
              }}
            >
              +{membres.length - 4}
            </div>
          )}
        </div>

        <div className="project-card-stats">
          <span title="Tâches">
            <CheckSquare size={13} />
            {stats?.total || 0}
          </span>
          {createdAt && (
            <span title="Date création">
              <Calendar size={13} />
              {format(new Date(createdAt), "dd MMM", { locale: fr })}
            </span>
          )}
        </div>
      </div>

      <style>{`
        .project-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; position: relative; overflow: hidden; transition: all var(--transition); display: flex; flex-direction: column; gap: 14px; }
        .project-card:hover { border-color: var(--border-strong); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .project-card-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .project-card-header { display: flex; align-items: center; gap: 8px; }
        .project-card-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .project-meta { display: flex; gap: 6px; flex-wrap: wrap; }
        .project-card-body { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .project-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; line-height: 1.3; color: var(--text-primary); }
        .project-title:hover { color: var(--accent); }
        .project-description { font-size: 13px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .project-card-footer { display: flex; align-items: center; justify-content: space-between; }
        .members-stack { display: flex; align-items: center; }
        .members-avatar { border: 2px solid var(--bg-surface); }
        .project-card-stats { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-muted); }
        .project-card-stats span { display: flex; align-items: center; gap: 4px; }
      `}</style>
    </div>
  );
}
