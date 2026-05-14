import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight } from "lucide-react";
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
    console.log("Login result:", result); // DEBUG
    if (result.success) {
      toast.success("Bienvenue !");
      navigate("/dashboard");
    } else {
      console.error("Login error message:", result.message); // DEBUG
      toast.error(result.message);
    }
  };

  const fillDemo = (email, pw) => setForm({ email, password: pw });

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow" />
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <Zap size={24} strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">TaskFlow</h1>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace de travail</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className={`form-input input-with-icon ${errors.email ? "input-error" : ""}`}
                  placeholder="votre@email.com"
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
                  Connexion <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; overflow: hidden; }
        .auth-bg { position: fixed; inset: 0; pointer-events: none; }
        .auth-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .auth-glow { position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%); }
        .auth-container { width: 100%; max-width: 420px; position: relative; z-index: 1; }
        .auth-brand { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 32px; }
        .auth-logo { width: 40px; height: 40px; background: #000000; color: #ffffff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .auth-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; }
        .auth-card { background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-lg); }
        .auth-header { margin-bottom: 28px; }
        .auth-header h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; }
        .auth-header p { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }
        .input-icon-wrapper { position: relative; }
        .input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .input-with-icon { padding-left: 38px !important; }
        .input-with-action { padding-right: 40px !important; }
        .input-action { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex; }
        .input-action:hover { color: var(--text-secondary); }
        .input-error { border-color: #000000 !important; }
        .auth-submit { width: 100%; justify-content: center; }
        .auth-demo { background: #f0f0f0; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; }
        .auth-demo-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 600; margin-bottom: 10px; }
        .auth-demo-btns { display: flex; flex-direction: column; gap: 6px; }
        .demo-btn { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; color: var(--text-secondary); cursor: pointer; transition: all var(--transition); text-align: left; font-family: var(--font-body); }
        .demo-btn:hover { border-color: #000000; color: var(--text-primary); }
        .demo-role { background: rgba(0,0,0,0.08); color: #000000; padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; border: 1px solid rgba(0,0,0,0.2); }
        .demo-role.admin { background: rgba(0,0,0,0.12); color: #000000; border-color: rgba(0,0,0,0.25); }
        .auth-switch { text-align: center; font-size: 14px; color: var(--text-secondary); }
        .auth-switch a { color: #000000; font-weight: 500; }
        .auth-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
