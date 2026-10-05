import { useState } from "react";
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Save,
  Hash,
  Clock,
  Link as LinkIcon,
  Tag,
} from "lucide-react";
import { projectAPI } from "../../services/api";
import toast from "react-hot-toast";

const PRESET_TYPES = [
  { id: "number", label: "Nombre / Story Points", icon: Hash },
  { id: "time", label: "Temps estimé (heures)", icon: Clock },
  { id: "link", label: "Lien URL (ex: Figma, PR)", icon: LinkIcon },
  { id: "text", label: "Texte / Environnement", icon: Tag },
];

export default function CustomFieldsModal({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
}) {
  const [fields, setFields] = useState(
    Array.isArray(project?.custom_fields_config)
      ? project.custom_fields_config
      : [],
  );
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("number");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) {
      toast.error("Le nom du champ est requis");
      return;
    }
    const id = newFieldName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (fields.some((f) => f.id === id)) {
      toast.error("Un champ avec cet identifiant existe déjà");
      return;
    }

    const fieldToAdd = {
      id,
      label: newFieldName.trim(),
      type: newFieldType,
    };

    setFields([...fields, fieldToAdd]);
    setNewFieldName("");
  };

  const handleRemoveField = (fieldId) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await projectAPI.update(project.id, {
        custom_fields_config: fields,
      });
      toast.success("Champs personnalisés enregistrés");
      onProjectUpdated?.(
        data.data || { ...project, custom_fields_config: fields },
      );
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de l'enregistrement",
      );
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-md"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540 }}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sliders size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Champs personnalisés
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {project.titre} • Données métier sur chaque carte
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            Définissez les champs personnalisés utilisables sur toutes les cartes de ce tableau (Story Points, Temps estimé, Liens de documentation, etc.).
          </p>

          {/* Add new field form */}
          <form
            onSubmit={handleAddField}
            style={{
              display: "flex",
              gap: 8,
              background: "var(--bg-subtle)",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{ flex: 2 }}
              placeholder="Nom du champ (ex: Story Points)..."
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
            />
            <select
              className="form-input"
              style={{ flex: 1.5 }}
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
            >
              {PRESET_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: "0 12px" }}>
              <Plus size={15} /> Ajouter
            </button>
          </form>

          {/* List of existing custom fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--text-muted)",
              }}
            >
              Champs configurés ({fields.length})
            </span>

            {fields.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  border: "1px dashed var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Aucun champ personnalisé configuré pour l'instant.
              </div>
            ) : (
              fields.map((f) => {
                const typeObj =
                  PRESET_TYPES.find((t) => t.id === f.type) || PRESET_TYPES[0];
                const Icon = typeObj.icon;
                return (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          background: "var(--accent-subtle)",
                          color: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={13} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {f.label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        ({typeObj.label})
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      style={{ width: 26, height: 26, color: "var(--danger)" }}
                      onClick={() => handleRemoveField(f.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="spinner" />
            ) : (
              <>
                <Save size={14} /> Enregistrer les champs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
