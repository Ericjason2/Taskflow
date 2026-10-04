import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Tag,
  MessageSquare,
  Trash2,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { taskAPI } from "../../services/api";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const STATUT_LABELS = {
  todo: "À faire",
  in_progress: "En cours",
  review: "En révision",
  done: "Terminé",
};

const PRIO_LABELS = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique",
};

export default function TaskDetailModal({
  open,
  onClose,
  task,
  projectId,
  onUpdate,
}) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && task) loadTask();
  }, [open, task?.id]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const { data } = await taskAPI.getOne(projectId, task.id);
      setComments(data.data.commentaires || []);
    } catch (_) {}
    setLoading(false);
  };

  if (!open || !task) return null;

  const isOverdue =
    task.echeance &&
    new Date(task.echeance) < new Date() &&
    task.statut !== "done";

  const sendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const { data } = await taskAPI.addComment(projectId, task.id, {
        contenu: newComment.trim(),
      });
      setComments((c) => [...c, data.data]);
      setNewComment("");
      toast.success("Commentaire ajouté");
    } catch (_) {
      toast.error("Erreur lors de l'envoi du commentaire");
    }
    setSending(false);
  };

  const deleteComment = async (commentId) => {
    try {
      await taskAPI.deleteComment(projectId, task.id, commentId);
      setComments((c) => c.filter((cm) => cm.id !== commentId));
      toast.success("Commentaire supprimé");
    } catch (_) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ alignItems: "flex-start", padding: "20px 24px 16px" }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.3,
                marginBottom: 8,
              }}
            >
              {task.titre}
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span
                className={`badge badge-${
                  task.statut === "in_progress" ? "inprogress" : task.statut
                }`}
                style={{ fontSize: 11, padding: "2px 8px" }}
              >
                {STATUT_LABELS[task.statut] || task.statut}
              </span>
              <span
                className={`badge badge-${task.priorite}`}
                style={{ fontSize: 11, padding: "2px 8px" }}
              >
                {PRIO_LABELS[task.priorite] || task.priorite}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {task.description && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  marginBottom: 6,
                }}
              >
                Description
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  border: "1px solid var(--border)",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {task.description}
              </p>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 6px 0",
                  fontWeight: 600,
                }}
              >
                Membre assigné
              </p>
              {task.assigne ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    className="avatar avatar-sm"
                    style={{
                      background: "var(--accent-subtle)",
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {task.assigne.nom?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {task.assigne.nom}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Non assigné
                </span>
              )}
            </div>

            <div
              style={{
                background: isOverdue ? "rgba(239,68,68,0.06)" : "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                border: `1px solid ${
                  isOverdue ? "rgba(239,68,68,0.25)" : "var(--border)"
                }`,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: isOverdue ? "var(--danger)" : "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 6px 0",
                  fontWeight: 600,
                }}
              >
                Date d'échéance
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isOverdue ? (
                  <AlertCircle size={15} color="var(--danger)" />
                ) : (
                  <Calendar size={15} color="var(--text-secondary)" />
                )}
                <span
                  style={{
                    fontSize: 13,
                    color: isOverdue ? "var(--danger)" : "var(--text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {task.echeance
                    ? format(new Date(task.echeance), "dd MMMM yyyy", {
                        locale: fr,
                      })
                    : "Aucune échéance"}
                  {isOverdue && " · En retard"}
                </span>
              </div>
            </div>
          </div>

          {task.tags?.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)",
                  marginBottom: 6,
                }}
              >
                Étiquettes
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 12,
                      background: "var(--accent-subtle)",
                      color: "var(--accent)",
                      border: "1px solid rgba(2,132,199,0.25)",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontWeight: 500,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Discussion / Comments Section */}
          <div style={{ marginTop: 4, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <MessageSquare size={16} color="var(--accent)" />
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  margin: 0,
                  color: "var(--text-primary)",
                }}
              >
                Activité & Commentaires ({comments.length})
              </h4>
            </div>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 20,
                }}
              >
                <span className="spinner" />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 14,
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 14px",
                      background: "var(--bg-subtle)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="avatar avatar-sm"
                      style={{
                        flexShrink: 0,
                        background: "var(--accent-subtle)",
                        color: "var(--accent)",
                        fontWeight: 700,
                      }}
                    >
                      {c.auteur?.nom?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {c.auteur?.nom}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
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
                          {(c.auteur_id === user?.id ||
                            user?.role === "admin") && (
                            <button
                              className="btn btn-ghost btn-icon"
                              style={{ width: 22, height: 22, padding: 0 }}
                              onClick={() => deleteComment(c.id)}
                            >
                              <Trash2 size={12} color="#ef4444" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {c.contenu}
                      </p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      textAlign: "center",
                      padding: "16px 0",
                      margin: 0,
                    }}
                  >
                    Aucun commentaire pour le moment. Soyez le premier à réagir !
                  </p>
                )}
              </div>
            )}

            {/* New comment input */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                className="form-textarea"
                style={{ minHeight: 65, flex: 1, padding: "10px 12px" }}
                placeholder="Écrire un commentaire... (Ctrl+Entrée pour envoyer)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                    sendComment();
                }}
              />
              <button
                className="btn btn-primary"
                style={{ height: 42, padding: "0 16px" }}
                onClick={sendComment}
                disabled={sending || !newComment.trim()}
              >
                {sending ? (
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                ) : (
                  <>
                    <Send size={14} /> Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
