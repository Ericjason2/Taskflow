import { useState, useEffect } from "react";
import { X, Check, Kanban } from "lucide-react";

const TRELLO_COLORS = [
  "#0284c7", // Sky blue
  "#10b981", // Emerald green
  "#f59e0b", // Amber / Warm orange
  "#ef4444", // Crimson red
  "#8b5cf6", // Purple / Violet
  "#ec4899", // Magenta pink
  "#06b6d4", // Teal cyan
  "#475569", // Slate grey
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
    couleur: "#0284c7",
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
        couleur: initialData.couleur || "#0284c7",
        date_debut: initialData.date_debut || "",
        date_fin: initialData.date_fin || "",
      });
    } else {
      setForm({
        titre: "",
        description: "",
        statut: "actif",
        priorite: "moyenne",
        couleur: "#0284c7",
        date_debut: "",
        date_fin: "",
      });
    }
    setErrors({});
  }, [initialData, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.titre.trim()) e.titre = "Le titre du tableau est requis";
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
      <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        {/* Board Cover Header Preview */}
        <div
          style={{
            height: 70,
            background: `linear-gradient(135deg, ${form.couleur}, ${form.couleur}cc)`,
            borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            color: "#fff",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <Kanban size={18} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  fontWeight: 700,
                  margin: 0,
                  color: "#ffffff",
                }}
              >
                {initialData ? "Modifier le tableau" : "Créer un tableau"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ color: "#ffffff", background: "rgba(0,0,0,0.15)" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: 24 }}>
            {/* Color Palette Selector */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Fond & Thème du tableau</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {TRELLO_COLORS.map((c) => {
                  const isSelected = form.couleur === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, couleur: c }))}
                      style={{
                        width: 36,
                        height: 32,
                        borderRadius: 8,
                        background: c,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        boxShadow: isSelected
                          ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${c}`
                          : "0 1px 3px rgba(0,0,0,0.15)",
                        transform: isSelected ? "scale(1.05)" : "none",
                        transition: "all 0.15s ease",
                      }}
                      title={c}
                    >
                      {isSelected && <Check size={16} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Titre du tableau *</label>
              <input
                type="text"
                className={`form-input ${errors.titre ? "input-error" : ""}`}
                placeholder="ex: Refonte TaskFlow v2, Roadmap Q4..."
                value={form.titre}
                onChange={set("titre")}
                autoFocus
              />
              {errors.titre && (
                <span className="form-error">{errors.titre}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description (optionnelle)</label>
              <textarea
                className="form-textarea"
                placeholder="Précisez la vision ou les objectifs clés de ce tableau..."
                value={form.description}
                onChange={set("description")}
                rows={3}
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
                  <option value="annulé">Archivé</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priorité globale</label>
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
                <label className="form-label">Date de début</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date_debut}
                  onChange={set("date_debut")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Échéance cible</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date_fin}
                  onChange={set("date_fin")}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: "16px 24px" }}>
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
                "Enregistrer les modifications"
              ) : (
                "Créer le tableau"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
