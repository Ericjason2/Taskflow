import { useState } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  ListChecks,
  Save,
  Sparkles,
} from "lucide-react";
import { projectAPI } from "../../services/api";
import toast from "react-hot-toast";

const AVAILABLE_AUTOMATIONS = [
  {
    id: "auto_done_checklists",
    title: "Complétion automatique des sous-tâches",
    description:
      "Quand une carte passe dans 'Terminé', toutes ses sous-tâches de checklist sont automatiquement marquées comme faites.",
    icon: CheckCircle2,
    color: "#10b981",
  },
  {
    id: "auto_critical_alert",
    title: "Alerte de priorité critique",
    description:
      "Dès qu'une tâche est passée en priorité 'Critique', une notification d'urgence est envoyée au créateur du tableau.",
    icon: AlertTriangle,
    color: "#ef4444",
  },
  {
    id: "auto_assign_start",
    title: "Démarrage automatique à l'assignation",
    description:
      "Quand une carte 'À faire' est assignée à un membre, elle passe automatiquement dans la colonne 'En cours'.",
    icon: Play,
    color: "#0284c7",
  },
  {
    id: "auto_checklist_review",
    title: "Passage en révision quand la checklist est finie",
    description:
      "Dès que 100% des sous-tâches d'une carte sont cochées, elle est automatiquement transférée vers 'En révision'.",
    icon: ListChecks,
    color: "#f59e0b",
  },
];

export default function AutomationModal({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
}) {
  const [activeRules, setActiveRules] = useState(
    Array.isArray(project?.automations) ? project.automations : [],
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleRule = (ruleId) => {
    setActiveRules((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await projectAPI.update(project.id, {
        automations: activeRules,
      });
      toast.success("Règles d'automatisation mises à jour");
      onProjectUpdated?.(data.data || { ...project, automations: activeRules });
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
        style={{ maxWidth: 560 }}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Automatisations du Tableau
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {project.titre} • Règles intelligentes sans code
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            Activez des règles automatisées inspirées de Trello Butler pour gagner du temps et fluidifier vos flux de travail.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {AVAILABLE_AUTOMATIONS.map((rule) => {
              const Icon = rule.icon;
              const isEnabled = activeRules.includes(rule.id);
              return (
                <div
                  key={rule.id}
                  onClick={() => toggleRule(rule.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: isEnabled
                      ? "1.5px solid var(--accent)"
                      : "1px solid var(--border)",
                    background: isEnabled
                      ? "var(--accent-subtle)"
                      : "var(--bg-subtle)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: `${rule.color}20`,
                      color: rule.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Icon size={15} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {rule.title}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isEnabled ? "var(--accent)" : "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {isEnabled ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        lineHeight: 1.45,
                        margin: 0,
                      }}
                    >
                      {rule.description}
                    </p>
                  </div>
                </div>
              );
            })}
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
                <Save size={14} /> Enregistrer les règles
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
