import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 800, lineHeight: 1, background: 'linear-gradient(135deg, var(--accent), #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Page introuvable</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15, textAlign: 'center', maxWidth: 400 }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/dashboard" className="btn btn-primary btn-lg">
        <Zap size={16} /> Retour au dashboard
      </Link>
    </div>
  );
}
