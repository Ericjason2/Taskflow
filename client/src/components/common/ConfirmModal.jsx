import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, danger }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {danger && <AlertTriangle size={20} color="#ef4444" />}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{title}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
