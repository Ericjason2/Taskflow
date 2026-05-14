import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Shield, Trash2, Users } from "lucide-react";
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
      toast.error(err.response?.data?.message || "Erreur");
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
      errs.confirm = "Ne correspondent pas";
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
      toast.success("Mot de passe modifié");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
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
      toast.success(`${userToDelete.nom} a été supprimé`);
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
      .slice(0, 2) || "??";

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="card" style={{ textAlign: "center", padding: 28 }}>
            <div className="avatar avatar-xl" style={{ margin: "0 auto 14px" }}>
              {initials}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              {user?.nom}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 12,
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
                    ? "rgba(0,0,0,0.08)"
                    : "rgba(0,0,0,0.04)",
                color: user?.role === "admin" ? "#000000" : "#333333",
                borderRadius: 100,
                padding: "3px 12px",
                fontWeight: 600,
              }}
            >
              <Shield size={11} />
              {user?.role === "admin" ? "Administrateur" : "Membre"}
            </span>
          </div>
          {user?.bio && (
            <div className="card" style={{ marginTop: 10 }}>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
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
              <User size={13} /> Informations
            </button>
            <button
              className={`tab ${tab === "security" ? "active" : ""}`}
              onClick={() => {
                setTab("security");
                setErrors({});
              }}
            >
              <Lock size={13} /> Sécurité
            </button>
            {user?.role === "admin" && (
              <button
                className={`tab ${tab === "admin" ? "active" : ""}`}
                onClick={() => {
                  setTab("admin");
                  setErrors({});
                }}
              >
                <Users size={13} /> Administration
              </button>
            )}
          </div>

          {tab === "profile" ? (
            <div className="card">
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 20,
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
                    style={{ opacity: 0.5 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Décrivez-vous en quelques mots..."
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner" />
                    ) : (
                      <>
                        <Save size={15} /> Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : tab === "security" ? (
            <div className="card">
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Changer le mot de passe
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 20,
                }}
              >
                Choisissez un mot de passe fort d'au moins 6 caractères.
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
                    label: "Confirmer",
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner" />
                    ) : (
                      <>
                        <Lock size={15} /> Modifier
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 20,
                }}
              >
                Gestion des utilisateurs
              </h3>
              {loadingUsers ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <span className="spinner spinner-lg" />
                </div>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginBottom: 16,
                    }}
                  >
                    {users.length} utilisateur{users.length > 1 ? "s" : ""}{" "}
                    enregistré{users.length > 1 ? "s" : ""}
                  </p>
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
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 0",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Nom
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 0",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Email
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 0",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            Rôle
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "12px 0",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
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
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 0",
                                color: "var(--text-primary)",
                              }}
                            >
                              <strong>{u.nom}</strong>
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {u.email}
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 11,
                                  background:
                                    u.role === "admin"
                                      ? "rgba(0,0,0,0.08)"
                                      : "rgba(0,0,0,0.04)",
                                  color:
                                    u.role === "admin" ? "#000000" : "#333333",
                                  borderRadius: 100,
                                  padding: "2px 10px",
                                  fontWeight: 600,
                                  border:
                                    u.role === "admin"
                                      ? "1px solid rgba(0,0,0,0.15)"
                                      : "1px solid rgba(0,0,0,0.08)",
                                }}
                              >
                                <Shield size={10} />
                                {u.role === "admin" ? "Admin" : "Membre"}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "12px 0",
                                textAlign: "right",
                              }}
                            >
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
                </>
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
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette
                    action est irréversible et supprimera également tous ses
                    projets.
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
        .profile-sidebar { width: 240px; flex-shrink: 0; }
        .input-error { border-color: #000000 !important; }
        @media (max-width: 768px) { .profile-layout { flex-direction: column; } .profile-sidebar { width: 100%; } }
      `}</style>
    </div>
  );
}
