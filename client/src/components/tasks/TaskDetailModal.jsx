import { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, MessageCircle, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { taskAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUT_LABELS = { todo: 'À faire', in_progress: 'En cours', review: 'En révision', done: 'Terminé' };
const PRIO_LABELS = { basse: 'Basse', moyenne: 'Moyenne', haute: 'Haute', critique: 'Critique' };

export default function TaskDetailModal({ open, onClose, task, projectId, onUpdate }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
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

  const isOverdue = task.echeance && new Date(task.echeance) < new Date() && task.statut !== 'done';

  const sendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const { data } = await taskAPI.addComment(projectId, task.id, { contenu: newComment.trim() });
      setComments(c => [...c, data.data]);
      setNewComment('');
    } catch (_) { toast.error('Erreur envoi commentaire'); }
    setSending(false);
  };

  const deleteComment = async (commentId) => {
    try {
      await taskAPI.deleteComment(projectId, task.id, commentId);
      setComments(c => c.filter(cm => cm.id !== commentId));
    } catch (_) { toast.error('Erreur suppression'); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 6 }}>{task.titre}</h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className={`badge badge-${task.statut === 'in_progress' ? 'inprogress' : task.statut}`}>
                {STATUT_LABELS[task.statut]}
              </span>
              <span className={`badge badge-${task.priorite}`}>{PRIO_LABELS[task.priorite]}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ gap: 20 }}>
          {task.description && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--border)' }}>
              {task.description}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {task.assigne && (
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>Assigné à</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar avatar-sm">{task.assigne.nom?.[0]?.toUpperCase()}</div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{task.assigne.nom}</span>
                </div>
              </div>
            )}
            {task.echeance && (
              <div style={{ background: isOverdue ? 'rgba(239,68,68,0.05)' : 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '12px 14px', border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.2)' : 'var(--border)'}` }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>Échéance</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color={isOverdue ? '#ef4444' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: 13, color: isOverdue ? '#ef4444' : 'var(--text-primary)', fontWeight: 500 }}>
                    {format(new Date(task.echeance), 'dd MMMM yyyy', { locale: fr })}
                    {isOverdue && ' — En retard'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {task.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <Tag size={13} color="var(--text-muted)" />
              {task.tags.map(tag => (
                <span key={tag} style={{ fontSize: 12, background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 100, padding: '2px 10px' }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Comments */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MessageCircle size={14} color="var(--accent)" />
              <h4 style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                Commentaires ({comments.length})
              </h4>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><span className="spinner" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, maxHeight: 200, overflowY: 'auto' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>{c.auteur?.nom?.[0]?.toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{c.auteur?.nom}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {format(new Date(c.createdAt), 'dd MMM HH:mm', { locale: fr })}
                          </span>
                          {(c.auteur_id === user?.id || user?.role === 'admin') && (
                            <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, padding: 0 }} onClick={() => deleteComment(c.id)}>
                              <Trash2 size={12} color="#ef4444" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.contenu}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Aucun commentaire</p>
                )}
              </div>
            )}

            {/* New comment */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea className="form-textarea" style={{ minHeight: 60, flex: 1 }}
                placeholder="Ajouter un commentaire..."
                value={newComment} onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendComment(); }} />
              <button className="btn btn-primary btn-sm" onClick={sendComment} disabled={sending || !newComment.trim()}>
                {sending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
