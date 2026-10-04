import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Kanban, Mail, Lock, ArrowRight } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.password) e.password = "Mot de passe requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form);
    if (result.success) {
      toast.success("Bienvenue dans votre espace !");
      navigate("/dashboard");
    } else {
      toast.error(result.message || "Erreur de connexion");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow" />
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <Kanban size={22} />
          </div>
          <h1 className="auth-title">TaskFlow</h1>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Connexion</h2>
            <p>Accédez à vos tableaux et vos tâches</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email professionnel</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className={`form-input input-with-icon ${errors.email ? "input-error" : ""}`}
                  placeholder="nom@entreprise.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              {errors.email && (
                <span className="form-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPw ? "text" : "password"}
                  className={`form-input input-with-icon input-with-action ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : (
                <>
                  Se connecter <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; overflow: hidden; background: var(--bg-body); }
        .auth-bg { position: fixed; inset: 0; pointer-events: none; }
        .auth-grid { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px); background-size: 24px 24px; }
        .auth-glow { position: absolute; top: -150px; right: -150px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(2,132,199,0.12) 0%, transparent 70%); }
        .auth-container { width: 100%; max-width: 420px; position: relative; z-index: 1; }
        .auth-brand { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 28px; }
        .auth-logo { width: 40px; height: 40px; background: var(--accent); color: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(2,132,199,0.3); }
        .auth-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text-primary); }
        .auth-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-lg); }
        .auth-header { margin-bottom: 24px; }
        .auth-header h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); }
        .auth-header p { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }
        .input-icon-wrapper { position: relative; }
        .input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .input-with-icon { padding-left: 38px !important; }
        .input-with-action { padding-right: 40px !important; }
        .input-action { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; }
        .input-action:hover { color: var(--text-secondary); }
        .input-error { border-color: var(--danger) !important; }
        .auth-submit { width: 100%; justify-content: center; font-weight: 600; }
        .auth-switch { text-align: center; font-size: 14px; color: var(--text-secondary); }
        .auth-switch a { color: var(--accent); font-weight: 600; }
        .auth-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
