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
  CheckSquare,
  Plus,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { taskAPI } from "../../services/api";
import useAuthStore from "../../store/authStore";
import useProjectStore from "../../store/projectStore";
import UserAvatar from "../common/UserAvatar";
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
  customFieldsConfig = [],
  onUpdate,
}) {
  const { user } = useAuthStore();
  const { updateTask } = useProjectStore();
  const [comments, setComments] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newAttNom, setNewAttNom] = useState("");
  const [newAttUrl, setNewAttUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && task) {
      loadTask();
      setChecklists(task.checklists || []);
      setAttachments(task.pieces_jointes || []);
    }
  }, [open, task?.id]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const { data } = await taskAPI.getOne(projectId, task.id);
      setComments(data.data.commentaires || []);
      if (data.data.checklists) setChecklists(data.data.checklists);
      if (data.data.pieces_jointes) setAttachments(data.data.pieces_jointes);
    } catch (_) {}
    setLoading(false);
  };

  if (!open || !task) return null;

  const isOverdue =
    task.echeance &&
    new Date(task.echeance) < new Date() &&
    task.statut !== "done";

  // Checklists
  const completedChecklistCount = checklists.filter((c) => c.termine).length;
  const checklistPercent =
    checklists.length > 0
      ? Math.round((completedChecklistCount / checklists.length) * 100)
      : 0;

  const handleToggleChecklist = async (itemId) => {
    const updated = checklists.map((c) =>
      c.id === itemId ? { ...c, termine: !c.termine } : c
    );
    setChecklists(updated);
    try {
      await updateTask(projectId, task.id, { checklists: updated });
    } catch (_) {
      toast.error("Erreur de sauvegarde");
    }
  };

  const handleAddChecklist = async () => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: Date.now(),
      texte: newChecklistText.trim(),
      termine: false,
    };
    const updated = [...checklists, newItem];
    setChecklists(updated);
    setNewChecklistText("");
    try {
      await updateTask(projectId, task.id, { checklists: updated });
      toast.success("Sous-tâche ajoutée");
    } catch (_) {
      toast.error("Erreur");
    }
  };

  const handleDeleteChecklist = async (itemId) => {
    const updated = checklists.filter((c) => c.id !== itemId);
    setChecklists(updated);
    try {
      await updateTask(projectId, task.id, { checklists: updated });
    } catch (_) {}
  };

  // Attachments
  const handleAddAttachment = async () => {
    if (!newAttNom.trim() || !newAttUrl.trim()) return;
    let url = newAttUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    const newAtt = {
      id: Date.now(),
      nom: newAttNom.trim(),
      url,
      date: new Date().toISOString(),
    };
    const updated = [...attachments, newAtt];
    setAttachments(updated);
    setNewAttNom("");
    setNewAttUrl("");
    try {
      await updateTask(projectId, task.id, { pieces_jointes: updated });
      toast.success("Lien ajouté");
    } catch (_) {
      toast.error("Erreur");
    }
  };

  const handleDeleteAttachment = async (attId) => {
    const updated = attachments.filter((a) => a.id !== attId);
    setAttachments(updated);
    try {
      await updateTask(projectId, task.id, { pieces_jointes: updated });
    } catch (_) {}
  };

  // Comments
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
        style={{ maxWidth: 640, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Band */}
        {task.couverture && (
          <div
            style={{
              height: 14,
              background: task.couverture,
              borderRadius: "14px 14px 0 0",
              margin: "-24px -24px 18px -24px",
            }}
          />
        )}

        <div className="modal-header" style={{ alignItems: "flex-start", padding: "16px 24px 14px" }}>
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
          {/* Description */}
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

          {/* Member & Due Date */}
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
                  <UserAvatar user={task.assigne} size="sm" />
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
                  color: isOverdue ? "#ef4444" : "var(--text-muted)",
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
                  <AlertCircle size={15} color="#ef4444" />
                ) : (
                  <Calendar size={15} color="var(--text-secondary)" />
                )}
                <span
                  style={{
                    fontSize: 13,
                    color: isOverdue ? "#ef4444" : "var(--text-primary)",
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

          {/* Tags */}
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

          {/* Interactive Checklists / Subtasks */}
          <div
            style={{
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckSquare size={16} color="var(--accent)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  Checklist & Sous-tâches
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                {completedChecklistCount}/{checklists.length} ({checklistPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 6,
                background: "var(--border)",
                borderRadius: 9999,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${checklistPercent}%`,
                  background: checklistPercent === 100 ? "#10b981" : "var(--accent)",
                  transition: "width 0.25s ease",
                  borderRadius: 9999,
                }}
              />
            </div>

            {/* Checklist items */}
            {checklists.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {checklists.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "6px 10px",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.termine}
                      onChange={() => handleToggleChecklist(item.id)}
                      style={{ cursor: "pointer", width: 16, height: 16, accentColor: "var(--accent)" }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        textDecoration: item.termine ? "line-through" : "none",
                        color: item.termine ? "var(--text-muted)" : "var(--text-primary)",
                      }}
                    >
                      {item.texte}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklist(item.id)}
                      style={{ background: "none", border: "none", color: "var(--text-light)", cursor: "pointer", padding: 2 }}
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add checklist item */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ajouter une sous-tâche..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                style={{ height: 34, fontSize: 12.5 }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddChecklist}
                style={{ height: 34 }}
              >
                <Plus size={13} /> Ajouter
              </button>
            </div>
          </div>

          {/* Attachments & Links */}
          <div
            style={{
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Paperclip size={16} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Pièces jointes & Liens ({attachments.length})
              </span>
            </div>

            {attachments.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <ExternalLink size={14} color="var(--accent)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--accent)",
                          textDecoration: "underline",
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {att.nom}
                      </a>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {att.url}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(att.id)}
                      style={{ background: "none", border: "none", color: "var(--text-light)", cursor: "pointer", padding: 2 }}
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr auto", gap: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Nom du lien (ex: Spécification)"
                value={newAttNom}
                onChange={(e) => setNewAttNom(e.target.value)}
                style={{ height: 34, fontSize: 12.5 }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="URL (ex: figma.com/...)"
                value={newAttUrl}
                onChange={(e) => setNewAttUrl(e.target.value)}
                style={{ height: 34, fontSize: 12.5 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddAttachment}
                style={{ height: 34 }}
              >
                <Plus size={13} /> Joindre
              </button>
            </div>
          </div>

          {/* Custom Fields Section */}
          {(() => {
            const safeConfig = Array.isArray(customFieldsConfig) ? customFieldsConfig : [];
            let cf = task.custom_fields;
            if (typeof cf === "string") {
              try { cf = JSON.parse(cf); } catch { cf = null; }
            }
            if (safeConfig.length === 0 || !cf || typeof cf !== "object" || Array.isArray(cf) || Object.keys(cf).length === 0) return null;
            const hasAny = safeConfig.some((c) => cf[c.id]);
            if (!hasAny) return null;

            return (
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Champs personnalisés
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                  {safeConfig.map((field) => {
                    const val = cf[field.id];
                    if (!val) return null;
                    return (
                      <div
                        key={field.id}
                        style={{
                          padding: "8px 10px",
                          background: "var(--bg-subtle)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>
                          {field.label}
                        </span>
                        {field.type === "link" ? (
                          <a
                            href={val.startsWith("http") ? val : `https://${val}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: "var(--accent)",
                              textDecoration: "none",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {val}
                          </a>
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            {val} {field.type === "time" ? "h" : ""}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Comments Section */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <MessageSquare size={16} color="var(--text-secondary)" />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Activité & Commentaires ({comments.length})
              </span>
            </div>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 24,
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
                  marginBottom: 16,
                  maxHeight: 280,
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
                    <UserAvatar user={c.auteur} size="sm" style={{ flexShrink: 0 }} />
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
