import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  initialData,
  membres,
  isLoading,
}) {
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
        assigne_a: initialData.assigne_a || "",
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
    if (!form.titre.trim()) e.titre = "Titre requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, assigne_a: form.assigne_a || null });
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
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
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>
            {initialData ? "Modifier la tâche" : "Nouvelle tâche"}
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
                placeholder="Titre de la tâche"
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
                placeholder="Décrivez la tâche..."
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
                <label className="form-label">Assigner à</label>
                <select
                  className="form-select"
                  value={form.assigne_a}
                  onChange={set("assigne_a")}
                >
                  <option value="">Non assigné</option>
                  {membres?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Échéance</label>
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
                Tags{" "}
                <span
                  style={{
                    textTransform: "none",
                    color: "var(--text-muted)",
                    fontWeight: 400,
                  }}
                >
                  (Entrée pour ajouter)
                </span>
              </label>
              <div className="tags-container">
                {form.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input"
                  placeholder="ajouter un tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
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
                "Créer la tâche"
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .input-error { border-color: #000000 !important; }
        .tags-container { display: flex; flex-wrap: wrap; gap: 6px; background: #f0f0f0; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; min-height: 44px; align-items: center; transition: all var(--transition); }
        .tags-container:focus-within { border-color: #000000; box-shadow: none; }
        .tag { display: inline-flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.08); color: #333333; border: 1px solid rgba(0,0,0,0.15); border-radius: 100px; padding: 2px 8px; font-size: 12px; }
        .tag-remove { background: none; border: none; color: #333333; cursor: pointer; font-size: 15px; line-height: 1; padding: 0; opacity: 0.7; }
        .tag-remove:hover { opacity: 1; }
        .tag-input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; min-width: 120px; font-family: var(--font-body); }
        .tag-input::placeholder { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
