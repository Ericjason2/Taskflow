import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Shield, Trash2, Users, X } from "lucide-react";
import useAuthStore from "../store/authStore";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    nom: user?.nom || "",
    bio: user?.bio || "",
  });
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      setErrors({ nom: "Nom requis" });
      return;
    }
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success("Profil mis à jour");
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de mise à jour");
    }
    setSaving(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current_password) errs.current_password = "Requis";
    if (!pwForm.new_password || pwForm.new_password.length < 6)
      errs.new_password = "Min. 6 caractères";
    if (pwForm.new_password !== pwForm.confirm)
      errs.confirm = "Les mots de passe ne correspondent pas";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success("Mot de passe modifié avec succès");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    }
    setSaving(false);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await authAPI.getUsers();
      setUsers(data.users);
    } catch (err) {
      toast.error("Erreur lors du chargement des utilisateurs");
    }
    setLoadingUsers(false);
  };

  const handleDeleteUser = async (userId) => {
    setSaving(true);
    try {
      const userToDelete = users.find((u) => u.id === userId);
      await authAPI.deleteUser(userId);
      toast.success(`${userToDelete?.nom || "L'utilisateur"} a été supprimé`);
      setDeleteConfirm(null);
      loadUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression",
      );
    }
    setSaving(false);
  };

  useEffect(() => {
    if (tab === "admin" && user?.role === "admin") {
      loadUsers();
    }
  }, [tab]);

  const initials =
    user?.nom
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "TF";

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 700 }}>
            Mon Profil & Paramètres
          </h1>
          <p className="page-subtitle">Gérez vos informations personnelles et vos accès</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="card" style={{ textAlign: "center", padding: 28 }}>
            <div
              className="avatar avatar-xl"
              style={{
                margin: "0 auto 16px",
                width: 72,
                height: 72,
                fontSize: 22,
                fontWeight: 700,
                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
              }}
            >
              {initials}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 700,
                marginBottom: 4,
                color: "var(--text-primary)",
              }}
            >
              {user?.nom}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 14,
              }}
            >
              {user?.email}
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                background:
                  user?.role === "admin"
                    ? "var(--accent-subtle)"
                    : "var(--bg-subtle)",
                color: user?.role === "admin" ? "var(--accent)" : "var(--text-secondary)",
                borderRadius: 100,
                padding: "4px 12px",
                fontWeight: 600,
                border: "1px solid var(--border)",
              }}
            >
              <Shield size={12} />
              {user?.role === "admin" ? "Administrateur" : "Membre de l'équipe"}
            </span>
          </div>

          {user?.bio && (
            <div className="card" style={{ marginTop: 12, padding: 16 }}>
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
                Bio
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {user.bio}
              </p>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button
              className={`tab ${tab === "profile" ? "active" : ""}`}
              onClick={() => {
                setTab("profile");
                setErrors({});
              }}
            >
              <User size={14} /> Informations
            </button>
            <button
              className={`tab ${tab === "security" ? "active" : ""}`}
              onClick={() => {
                setTab("security");
                setErrors({});
              }}
            >
              <Lock size={14} /> Mot de passe
            </button>
            {user?.role === "admin" && (
              <button
                className={`tab ${tab === "admin" ? "active" : ""}`}
                onClick={() => {
                  setTab("admin");
                  setErrors({});
                }}
              >
                <Users size={14} /> Administration
              </button>
            )}
          </div>

          {tab === "profile" ? (
            <div className="card" style={{ padding: 24 }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 20,
                  color: "var(--text-primary)",
                }}
              >
                Informations personnelles
              </h3>
              <form
                onSubmit={handleProfileSave}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input
                    type="text"
                    className={`form-input ${errors.nom ? "input-error" : ""}`}
                    value={form.nom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nom: e.target.value }))
                    }
                  />
                  {errors.nom && (
                    <span className="form-error">{errors.nom}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Email{" "}
                    <span
                      style={{
                        textTransform: "none",
                        color: "var(--text-muted)",
                        fontWeight: 400,
                      }}
                    >
                      (non modifiable)
                    </span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email}
                    disabled
                    style={{ opacity: 0.65, background: "var(--bg-body)", cursor: "not-allowed" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio / Présentation</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Présentez votre rôle ou vos expertises..."
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    rows={4}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner" />
                    ) : (
                      <>
                        <Save size={15} /> Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : tab === "security" ? (
            <div className="card" style={{ padding: 24 }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "var(--text-primary)",
                }}
              >
                Modifier votre mot de passe
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 20,
                }}
              >
                Pour sécuriser votre compte, choisissez un mot de passe robuste d'au moins 6 caractères.
              </p>
              <form
                onSubmit={handlePasswordSave}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  {
                    key: "current_password",
                    label: "Mot de passe actuel",
                    placeholder: "••••••••",
                  },
                  {
                    key: "new_password",
                    label: "Nouveau mot de passe",
                    placeholder: "Min. 6 caractères",
                  },
                  {
                    key: "confirm",
                    label: "Confirmer le nouveau mot de passe",
                    placeholder: "••••••••",
                  },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="form-group">
                    <label className="form-label">{label}</label>
                    <input
                      type="password"
                      className={`form-input ${errors[key] ? "input-error" : ""}`}
                      placeholder={placeholder}
                      value={pwForm[key]}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                    {errors[key] && (
                      <span className="form-error">{errors[key]}</span>
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner" />
                    ) : (
                      <>
                        <Lock size={15} /> Mettre à jour le mot de passe
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--text-primary)",
                  }}
                >
                  Gestion des utilisateurs
                </h3>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {users.length} utilisateur{users.length > 1 ? "s" : ""}
                </span>
              </div>

              {loadingUsers ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <span className="spinner spinner-lg" />
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: "var(--bg-subtle)",
                        }}
                      >
                        <th
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
                          }}
                        >
                          Membre
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Email
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Rôle
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "10px 12px",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div
                                className="avatar avatar-sm"
                                style={{
                                  background: "var(--accent-subtle)",
                                  color: "var(--accent)",
                                  fontWeight: 700,
                                }}
                              >
                                {u.nom?.[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                {u.nom}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                            {u.email}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                background:
                                  u.role === "admin"
                                    ? "var(--accent-subtle)"
                                    : "var(--bg-subtle)",
                                color:
                                  u.role === "admin" ? "var(--accent)" : "var(--text-secondary)",
                                borderRadius: 100,
                                padding: "2px 10px",
                                fontWeight: 600,
                                border: "1px solid var(--border)",
                              }}
                            >
                              <Shield size={10} />
                              {u.role === "admin" ? "Admin" : "Membre"}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {u.id !== user.id && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteConfirm(u.id)}
                                disabled={saving}
                              >
                                <Trash2 size={13} /> Supprimer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {deleteConfirm && (
            <div
              className="modal-overlay"
              onClick={() => setDeleteConfirm(null)}
            >
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Confirmer la suppression</h2>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="modal-body">
                  <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette
                    action est irréversible et supprimera également tous ses
                    projets associés.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={saving}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(deleteConfirm)}
                    disabled={saving}
                  >
                    {saving ? <span className="spinner" /> : <>Supprimer</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-layout { display: flex; gap: 24px; align-items: flex-start; }
        .profile-sidebar { width: 260px; flex-shrink: 0; }
        @media (max-width: 768px) { .profile-layout { flex-direction: column; } .profile-sidebar { width: 100%; } }
      `}</style>
    </div>
  );
}
