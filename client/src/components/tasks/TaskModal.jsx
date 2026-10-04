import { useState, useEffect } from "react";
import { X, Tag as TagIcon, CheckSquare } from "lucide-react";

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  initialData,
  membres,
  members,
  isLoading,
}) {
  const memberList = membres || members || [];
  const [form, setForm] = useState({
    titre: "",
    description: "",
    statut: "todo",
    priorite: "moyenne",
    assigne_a: "",
    echeance: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        titre: initialData.titre || "",
        description: initialData.description || "",
        statut: initialData.statut || "todo",
        priorite: initialData.priorite || "moyenne",
        assigne_a: initialData.assigne_a || initialData.assigne?.id || "",
        echeance: initialData.echeance || "",
        tags: initialData.tags || [],
      });
    } else {
      setForm({
        titre: "",
        description: "",
        statut: "todo",
        priorite: "moyenne",
        assigne_a: "",
        echeance: "",
        tags: [],
      });
    }
    setErrors({});
    setTagInput("");
  }, [initialData, open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.titre.trim()) e.titre = "Le titre est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...form,
        assigne_a: form.assigne_a ? parseInt(form.assigne_a) : null,
      });
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (!form.tags.includes(tag))
        setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckSquare size={18} />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, margin: 0 }}>
              {initialData ? "Modifier la carte" : "Créer une nouvelle carte"}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: "20px 24px" }}>
            <div className="form-group">
              <label className="form-label">Titre de la carte *</label>
              <input
                type="text"
                className={`form-input ${errors.titre ? "input-error" : ""}`}
                placeholder="ex: Rédiger la spécification de l'API..."
                value={form.titre}
                onChange={set("titre")}
                autoFocus
              />
              {errors.titre && (
                <span className="form-error">{errors.titre}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description détaillée</label>
              <textarea
                className="form-textarea"
                placeholder="Ajoutez des détails, instructions ou liens utiles..."
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
                <label className="form-label">Colonne / Liste</label>
                <select
                  className="form-select"
                  value={form.statut}
                  onChange={set("statut")}
                >
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="review">En révision</option>
                  <option value="done">Terminé</option>
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
                <label className="form-label">Membre assigné</label>
                <select
                  className="form-select"
                  value={form.assigne_a || ""}
                  onChange={set("assigne_a")}
                >
                  <option value="">Non assigné</option>
                  {memberList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom} {m.email ? `(${m.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date d'échéance</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.echeance}
                  onChange={set("echeance")}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Étiquettes / Tags{" "}
                <span
                  style={{
                    textTransform: "none",
                    color: "var(--text-muted)",
                    fontWeight: 400,
                  }}
                >
                  (appuyez sur Entrée)
                </span>
              </label>
              <div className="tags-container">
                <TagIcon size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                {form.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    #{tag}
                    <button
                      type="button"
                      className="tag-remove-btn"
                      onClick={() => removeTag(tag)}
                      title="Supprimer l'étiquette"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input"
                  placeholder="ajouter un tag (ex: design, urgent)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
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
                "Enregistrer"
              ) : (
                "Ajouter la carte"
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 12px;
          min-height: 42px;
          align-items: center;
          transition: all var(--transition);
        }
        .tags-container:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-subtle);
        }
        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--accent-subtle);
          color: var(--accent);
          border: 1px solid rgba(2, 132, 199, 0.2);
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 500;
        }
        .tag-remove-btn {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          opacity: 0.7;
          display: flex;
          align-items: center;
        }
        .tag-remove-btn:hover { opacity: 1; }
        .tag-input {
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 13px;
          min-width: 140px;
          flex: 1;
          font-family: var(--font-body);
        }
        .tag-input::placeholder { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
