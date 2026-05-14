import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight } from "lucide-react";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.nom || form.nom.length < 2)
      e.nom = "Nom requis (min. 2 caractères)";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Email invalide";
    if (!form.password || form.password.length < 6)
      e.password = "Mot de passe trop court (min. 6)";
    if (form.password !== form.confirm)
      e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register({
      nom: form.nom,
      email: form.email,
      password: form.password,
    });
    if (result.success) {
      toast.success("Compte créé avec succès !");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow auth-glow-left" />
      </div>

      <div className="auth-container" style={{ maxWidth: 440 }}>
        <div className="auth-brand">
          <div className="auth-logo">
            <Zap size={24} strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">TaskFlow</h1>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Créer un compte</h2>
            <p>Rejoignez votre équipe sur TaskFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className={`form-input input-with-icon ${errors.nom ? "input-error" : ""}`}
                  placeholder="Jean Dupont"
                  value={form.nom}
                  onChange={set("nom")}
                />
              </div>
              {errors.nom && <span className="form-error">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className={`form-input input-with-icon ${errors.email ? "input-error" : ""}`}
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={set("email")}
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
                  placeholder="Min. 6 caractères"
                  value={form.password}
                  onChange={set("password")}
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

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  className={`form-input input-with-icon ${errors.confirm ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={set("confirm")}
                />
              </div>
              {errors.confirm && (
                <span className="form-error">{errors.confirm}</span>
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
                  Créer mon compte <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; overflow: hidden; }
        .auth-bg { position: fixed; inset: 0; pointer-events: none; }
        .auth-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .auth-glow { position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%); }
        .auth-glow-left { top: auto; right: auto; bottom: -200px; left: -200px; background: radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%); }
        .auth-container { width: 100%; position: relative; z-index: 1; }
        .auth-brand { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 28px; }
        .auth-logo { width: 40px; height: 40px; background: #000000; color: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .auth-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; }
        .auth-card { background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-lg); }
        .auth-header { margin-bottom: 24px; }
        .auth-header h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; }
        .auth-header p { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .input-icon-wrapper { position: relative; }
        .input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .input-with-icon { padding-left: 38px !important; }
        .input-with-action { padding-right: 40px !important; }
        .input-action { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; }
        .input-error { border-color: #000000 !important; }
        .auth-submit { width: 100%; justify-content: center; }
        .auth-switch { text-align: center; font-size: 14px; color: var(--text-secondary); }
        .auth-switch a { color: #000000; font-weight: 500; }
        .auth-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
