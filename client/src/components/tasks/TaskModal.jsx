import { useState, useEffect } from "react";
import { X, Tag as TagIcon, CheckSquare, Plus, Paperclip, Palette, Check } from "lucide-react";

const COVER_COLORS = [
  { label: "Aucune", value: "" },
  { label: "Bleu", value: "#2563eb" },
  { label: "Vert", value: "#10b981" },
  { label: "Ambre", value: "#f59e0b" },
  { label: "Orange", value: "#f97316" },
  { label: "Rouge", value: "#ef4444" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Ardoise", value: "#475569" },
];

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  initialData,
  membres,
  members,
  customFieldsConfig = [],
  isLoading,
}) {
  const memberList = membres || members || [];
  const safeCustomFieldsConfig = Array.isArray(customFieldsConfig)
    ? customFieldsConfig
    : [];
  const [form, setForm] = useState({
    titre: "",
    description: "",
    statut: "todo",
    priorite: "moyenne",
    assigne_a: "",
    echeance: "",
    tags: [],
    checklists: [],
    couverture: "",
    pieces_jointes: [],
    custom_fields: {},
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [newChecklistText, setNewChecklistText] = useState("");
  const [attachmentNom, setAttachmentNom] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

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
        checklists: initialData.checklists || [],
        couverture: initialData.couverture || "",
        pieces_jointes: initialData.pieces_jointes || [],
        custom_fields: initialData.custom_fields || {},
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
        checklists: [],
        couverture: "",
        pieces_jointes: [],
        custom_fields: {},
      });
    }
    setErrors({});
    setTagInput("");
    setNewChecklistText("");
    setAttachmentNom("");
    setAttachmentUrl("");
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
        assigne_a: form.assigne_a ? parseInt(form.assigne_a, 10) : null,
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

  // Checklist handlers
  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: Date.now(),
      texte: newChecklistText.trim(),
      termine: false,
    };
    setForm((f) => ({ ...f, checklists: [...f.checklists, newItem] }));
    setNewChecklistText("");
  };

  const toggleChecklistItem = (id) => {
    setForm((f) => ({
      ...f,
      checklists: f.checklists.map((c) =>
        c.id === id ? { ...c, termine: !c.termine } : c
      ),
    }));
  };

  const removeChecklistItem = (id) => {
    setForm((f) => ({
      ...f,
      checklists: f.checklists.filter((c) => c.id !== id),
    }));
  };

  // Attachment handlers
  const addAttachment = () => {
    if (!attachmentNom.trim() || !attachmentUrl.trim()) return;
    let url = attachmentUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    const newAtt = {
      id: Date.now(),
      nom: attachmentNom.trim(),
      url,
      date: new Date().toISOString(),
    };
    setForm((f) => ({ ...f, pieces_jointes: [...f.pieces_jointes, newAtt] }));
    setAttachmentNom("");
    setAttachmentUrl("");
  };

  const removeAttachment = (id) => {
    setForm((f) => ({
      ...f,
      pieces_jointes: f.pieces_jointes.filter((a) => a.id !== id),
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 600, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Preview */}
        {form.couverture && (
          <div
            style={{
              height: 12,
              background: form.couverture,
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 16px -24px",
            }}
          />
        )}

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
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
              }}
            >
              {initialData ? "Modifier la carte" : "Créer une nouvelle carte"}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Title */}
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

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description détaillée</label>
              <textarea
                className="form-textarea"
                placeholder="Ajoutez des détails, instructions ou contexte..."
                value={form.description}
                onChange={set("description")}
                rows={3}
              />
            </div>

            {/* Status & Priority */}
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

            {/* Assignee & Due Date */}
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
                  <option value="">Non assigné (Libre)</option>
                  {memberList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom} {m.email ? `(${m.email})` : ""}
                    </option>
                  ))}
                </select>
                {memberList.length === 0 ? (
                  <span style={{ display: "block", marginTop: 5, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.35 }}>
                    Aucun collaborateur invité sur ce tableau. Utilisez le bouton "Inviter" du tableau pour en ajouter.
                  </span>
                ) : (
                  <span style={{ display: "block", marginTop: 5, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.35 }}>
                    Collaborateurs du projet (excepté vous-même).
                  </span>
                )}
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

            {/* Cover Color Picker */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Palette size={13} />
                <span>Couleur de couverture</span>
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {COVER_COLORS.map((c) => {
                  const isSelected = form.couverture === c.value;
                  return (
                    <button
                      key={c.label}
                      type="button"
                      title={c.label}
                      onClick={() => setForm((f) => ({ ...f, couverture: c.value }))}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                        background: c.value || "var(--bg-subtle)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.1s ease",
                        transform: isSelected ? "scale(1.15)" : "none",
                      }}
                    >
                      {isSelected && (
                        <Check size={14} color={c.value ? "#ffffff" : "var(--accent)"} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checklists / Subtasks */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckSquare size={13} />
                  <span>Checklist & Sous-tâches</span>
                </span>
                {form.checklists.length > 0 && (
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {form.checklists.filter((c) => c.termine).length}/{form.checklists.length}
                  </span>
                )}
              </label>

              {form.checklists.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {form.checklists.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "var(--bg-subtle)",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.termine}
                        onChange={() => toggleChecklistItem(item.id)}
                        style={{ cursor: "pointer", accentColor: "var(--accent)" }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          textDecoration: item.termine ? "line-through" : "none",
                          color: item.termine ? "var(--text-muted)" : "var(--text-primary)",
                        }}
                      >
                        {item.texte}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(item.id)}
                        style={{ background: "none", border: "none", color: "var(--text-light)", cursor: "pointer" }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ajouter une sous-tâche..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                  style={{ height: 34, fontSize: 12.5 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addChecklistItem}
                  style={{ height: 34 }}
                >
                  <Plus size={13} /> Ajouter
                </button>
              </div>
            </div>

            {/* Attachments / Links */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Paperclip size={13} />
                <span>Pièces jointes & Liens externes</span>
              </label>

              {form.pieces_jointes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {form.pieces_jointes.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "var(--bg-subtle)",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <Paperclip size={13} color="var(--accent)" />
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ flex: 1, fontSize: 12.5, color: "var(--accent)", textDecoration: "underline" }}
                      >
                        {att.nom}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        style={{ background: "none", border: "none", color: "var(--text-light)", cursor: "pointer" }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr auto", gap: 8 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Libellé (ex: Maquette)"
                  value={attachmentNom}
                  onChange={(e) => setAttachmentNom(e.target.value)}
                  style={{ height: 34, fontSize: 12.5 }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="URL (ex: figma.com/design...)"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  style={{ height: 34, fontSize: 12.5 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addAttachment}
                  style={{ height: 34 }}
                >
                  <Plus size={13} /> Joindre
                </button>
              </div>
            </div>

            {/* Tags */}
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

            {/* Custom Fields Section */}
            {safeCustomFieldsConfig.length > 0 && (
              <div className="form-group">
                <label className="form-label">Champs personnalisés du tableau</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    background: "var(--bg-subtle)",
                    padding: 12,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {safeCustomFieldsConfig.map((field) => (
                    <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {field.label}
                      </span>
                      <input
                        type={field.type === "number" ? "number" : field.type === "link" ? "url" : "text"}
                        className="form-input"
                        placeholder={field.label}
                        value={form.custom_fields?.[field.id] || ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            custom_fields: {
                              ...f.custom_fields,
                              [field.id]: e.target.value,
                            },
                          }))
                        }
                        style={{ height: 34, fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
