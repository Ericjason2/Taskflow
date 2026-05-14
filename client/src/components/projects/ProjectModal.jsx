import { useState, useEffect } from "react";
import { X } from "lucide-react";

const COLORS = [
  "#000000",
  "#333333",
  "#555555",
  "#777777",
  "#999999",
  "#bbbbbb",
  "#dddddd",
  "#f5f5f5",
];

export default function ProjectModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) {
  const [form, setForm] = useState({
    titre: "",
    description: "",
    statut: "actif",
    priorite: "moyenne",
    couleur: "#333333",
    date_debut: "",
    date_fin: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        titre: initialData.titre || "",
        description: initialData.description || "",
        statut: initialData.statut || "actif",
        priorite: initialData.priorite || "moyenne",
        couleur: initialData.couleur || "#333333",
        date_debut: initialData.date_debut || "",
        date_fin: initialData.date_fin || "",
      });
    } else {
      setForm({
        titre: "",
        description: "",
        statut: "actif",
        priorite: "moyenne",
        couleur: "#333333",
        date_debut: "",
        date_fin: "",
      });
    }
    setErrors({});
  }, [initialData, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.titre.trim()) e.titre = "Titre requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
            {initialData ? "Modifier le projet" : "Nouveau projet"}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Titre *</label>
              <input
                type="text"
                className={`form-input ${errors.titre ? "input-error" : ""}`}
                placeholder="Nom du projet"
                value={form.titre}
                onChange={set("titre")}
                autoFocus
              />
              {errors.titre && (
                <span className="form-error">{errors.titre}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Description du projet..."
                value={form.description}
                onChange={set("description")}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  className="form-select"
                  value={form.statut}
                  onChange={set("statut")}
                >
                  <option value="actif">Actif</option>
                  <option value="en_pause">En pause</option>
                  <option value="terminé">Terminé</option>
                  <option value="annulé">Annulé</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priorité</label>
                <select
                  className="form-select"
                  value={form.priorite}
                  onChange={set("priorite")}
                >
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Date début</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date_debut}
                  onChange={set("date_debut")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date fin</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date_fin}
                  onChange={set("date_fin")}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Couleur</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, couleur: c }))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border:
                        form.couleur === c
                          ? `3px solid #000000`
                          : "3px solid transparent",
                      cursor: "pointer",
                      transition: "all var(--transition)",
                      outline: form.couleur === c ? `2px solid ${c}` : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : initialData ? (
                "Enregistrer"
              ) : (
                "Créer le projet"
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`.input-error { border-color: #000000 !important; }`}</style>
    </div>
  );
}
