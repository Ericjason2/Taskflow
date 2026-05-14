import { useState, useEffect } from "react";
import { X, Send, Trash2, Calendar, User, Tag, Clock } from "lucide-react";
import { taskAPI } from "../../services/api";
import useAuthStore from "../../store/authStore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

const STATUT_LABELS = {
  todo: "À faire",
  in_progress: "En cours",
  review: "En révision",
  done: "Terminé",
};
const PRIO_COLORS = {
  basse: "#888888",
  moyenne: "#666666",
  haute: "#444444",
  critique: "#000000",
};
const PRIO_LABELS = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique",
};

export default function TaskDetail({
  taskId,
  projectId,
  onClose,
  onEdit,
  onDelete,
}) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuthStore();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await taskAPI.getOne(projectId, taskId);
      setTask(data.data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [taskId]);

  const sendComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try {
      await taskAPI.addComment(projectId, taskId, { contenu: comment });
      setComment("");
      load();
      toast.success("Commentaire ajouté");
    } catch (_) {
      toast.error("Erreur");
    }
    setSending(false);
  };

  const removeComment = async (commentId) => {
    try {
      await taskAPI.deleteComment(projectId, taskId, commentId);
      load();
    } catch (_) {
      toast.error("Erreur");
    }
  };

  return (
    <div className="task-detail-overlay" onClick={onClose}>
      <div className="task-detail-panel" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 40 }}
          >
            <span className="spinner spinner-lg" />
          </div>
        ) : task ? (
          <>
            <div className="td-header">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  className={`badge badge-${task.statut === "in_progress" ? "inprogress" : task.statut}`}
                >
                  {STATUT_LABELS[task.statut]}
                </span>
                <span
                  className="badge"
                  style={{
                    background: `${PRIO_COLORS[task.priorite]}18`,
                    color: PRIO_COLORS[task.priorite],
                    border: `1px solid ${PRIO_COLORS[task.priorite]}30`,
                  }}
                >
                  {PRIO_LABELS[task.priorite]}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onEdit(task)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    onDelete(task);
                    onClose();
                  }}
                >
                  Supprimer
                </button>
                <button className="btn btn-ghost btn-icon" onClick={onClose}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="td-body">
              <h2 className="td-title">{task.titre}</h2>
              {task.description && (
                <p className="td-desc">{task.description}</p>
              )}

              <div className="td-meta">
                {task.assigne && (
                  <div className="td-meta-item">
                    <User size={14} className="td-meta-icon" />
                    <div className="avatar avatar-sm">
                      {task.assigne.nom?.[0]}
                    </div>
                    <span>{task.assigne.nom}</span>
                  </div>
                )}
                {task.echeance && (
                  <div className="td-meta-item">
                    <Calendar size={14} className="td-meta-icon" />
                    <span>
                      {format(new Date(task.echeance), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}
                <div className="td-meta-item">
                  <Clock size={14} className="td-meta-icon" />
                  <span>
                    Créé{" "}
                    {format(new Date(task.createdAt), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                {task.createur && (
                  <div className="td-meta-item">
                    <span style={{ color: "var(--text-muted)" }}>par</span>
                    <span>{task.createur.nom}</span>
                  </div>
                )}
              </div>

              {Array.isArray(task.tags) && task.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {task.tags.map((t) => (
                    <span
                      key={t}
                      className="task-tag"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "var(--bg-overlay)",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                        padding: "3px 10px",
                        borderRadius: 100,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <Tag size={11} />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Comments */}
              <div className="td-section">
                <h3 className="td-section-title">
                  Commentaires ({task.commentaires?.length || 0})
                </h3>
                <div className="td-comments">
                  {task.commentaires?.map((c) => (
                    <div key={c.id} className="td-comment">
                      <div
                        className="avatar avatar-sm"
                        style={{ flexShrink: 0 }}
                      >
                        {c.auteur?.nom?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: 13 }}>
                            {c.auteur?.nom}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              {format(new Date(c.createdAt), "dd MMM HH:mm", {
                                locale: fr,
                              })}
                            </span>
                            {c.auteur_id === user?.id && (
                              <button
                                className="btn btn-ghost btn-icon"
                                style={{ padding: 2, width: 20, height: 20 }}
                                onClick={() => removeComment(c.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--text-secondary)",
                            marginTop: 4,
                            lineHeight: 1.5,
                          }}
                        >
                          {c.contenu}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!task.commentaires || task.commentaires.length === 0) && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        textAlign: "center",
                        padding: "20px 0",
                      }}
                    >
                      Aucun commentaire. Soyez le premier !
                    </p>
                  )}
                </div>
                <form onSubmit={sendComment} className="td-comment-form">
                  <div className="avatar avatar-sm">
                    {user?.nom?.[0]?.toUpperCase()}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ajouter un commentaire..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={sending || !comment.trim()}
                  >
                    {sending ? (
                      <span
                        className="spinner"
                        style={{ width: 14, height: 14 }}
                      />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            Tâche introuvable
          </div>
        )}

        <style>{`
          .task-detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); z-index: 500; display: flex; justify-content: flex-end; }
          .task-detail-panel { width: 480px; max-width: 100%; background: #ffffff; border-left: 1px solid var(--border); height: 100%; overflow-y: auto; animation: slideInRight 0.25s ease; display: flex; flex-direction: column; }
          @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .td-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; position: sticky; top: 0; background: #ffffff; z-index: 1; }
          .td-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; flex: 1; }
          .td-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; line-height: 1.3; }
          .td-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
          .td-meta { display: flex; flex-direction: column; gap: 8px; padding: 14px; background: #f5f5f5; border: 1px solid var(--border); border-radius: var(--radius-md); }
          .td-meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
          .td-meta-icon { color: var(--text-muted); }
          .td-section { display: flex; flex-direction: column; gap: 12px; }
          .td-section-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-secondary); }
          .td-comments { display: flex; flex-direction: column; gap: 14px; max-height: 320px; overflow-y: auto; padding-right: 4px; }
          .td-comment { display: flex; gap: 10px; align-items: flex-start; }
          .td-comment-form { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
          @media (max-width: 600px) { .task-detail-panel { width: 100%; } }
        `}</style>
      </div>
    </div>
  );
}
