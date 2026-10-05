import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Kanban,
  CheckSquare,
  User,
  Plus,
  Sun,
  Moon,
  LogOut,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import useProjectStore from "../../store/projectStore";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useRef(useNavigate()).current;

  const { projects, currentProject } = useProjectStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build items list based on query
  const q = query.trim().toLowerCase();

  const actions = [
    {
      id: "act-new-proj",
      category: "Actions",
      title: "Créer un nouveau projet",
      icon: Plus,
      run: () => {
        navigate("/projects");
        onClose();
      },
    },
    {
      id: "act-theme",
      category: "Actions",
      title: `Basculer vers le mode ${theme === "dark" ? "clair" : "sombre"}`,
      icon: theme === "dark" ? Sun : Moon,
      run: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: "act-profile",
      category: "Actions",
      title: "Gérer mon profil & mes préférences",
      icon: User,
      run: () => {
        navigate("/profile");
        onClose();
      },
    },
    {
      id: "act-logout",
      category: "Actions",
      title: "Se déconnecter",
      icon: LogOut,
      run: () => {
        logout();
        navigate("/login");
        onClose();
      },
    },
  ];

  const projectItems = projects.map((p) => ({
    id: `proj-${p.id}`,
    category: "Tableaux",
    title: p.titre,
    subtitle: `${p.taches?.length || p.stats?.total || 0} cartes`,
    icon: Kanban,
    color: p.couleur,
    run: () => {
      navigate(`/projects/${p.id}`);
      onClose();
    },
  }));

  // Gather tasks from current project or projects with loaded tasks
  const allTasks = [];
  if (currentProject?.taches) {
    currentProject.taches.forEach((t) => {
      allTasks.push({
        id: `task-${t.id}`,
        category: "Tâches (Tableau actuel)",
        title: t.titre,
        subtitle: `${currentProject.titre} • ${t.statut}`,
        icon: CheckSquare,
        run: () => {
          navigate(`/projects/${currentProject.id}`);
          onClose();
        },
      });
    });
  }

  // Filter all items by query
  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(q),
  );
  const filteredProjects = projectItems.filter((p) =>
    p.title.toLowerCase().includes(q),
  );
  const filteredTasks = allTasks.filter((t) =>
    t.title.toLowerCase().includes(q),
  );

  const flatResults = [
    ...filteredActions,
    ...filteredProjects,
    ...filteredTasks,
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatResults.length > 0 ? (prev + 1) % flatResults.length : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatResults.length > 0
            ? (prev - 1 + flatResults.length) % flatResults.length
            : 0,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          flatResults[selectedIndex].run();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, flatResults, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-backdrop" onClick={onClose}>
      <div
        className="cmd-palette-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cmd-input-container">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input-field"
            placeholder="Rechercher des cartes, tableaux ou actions... (↑↓ pour naviguer, Entrée pour valider)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button
              type="button"
              className="cmd-clear-btn"
              onClick={() => setQuery("")}
            >
              <X size={15} />
            </button>
          )}
          <span className="cmd-key-badge">ESC</span>
        </div>

        <div className="cmd-results-list">
          {flatResults.length === 0 ? (
            <div className="cmd-empty-state">
              <Sparkles size={24} style={{ opacity: 0.4, margin: "0 auto 8px" }} />
              <p>Aucun résultat correspondant à "{query}"</p>
            </div>
          ) : (
            flatResults.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${isSelected ? "selected" : ""}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => item.run()}
                >
                  <div
                    className="cmd-item-icon"
                    style={{
                      background: item.color
                        ? `${item.color}20`
                        : "var(--bg-subtle)",
                      color: item.color || "var(--accent)",
                    }}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="cmd-item-info">
                    <span className="cmd-item-title">{item.title}</span>
                    {item.subtitle && (
                      <span className="cmd-item-subtitle">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  <span className="cmd-item-category">{item.category}</span>
                  <ArrowRight size={13} className="cmd-item-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="cmd-palette-footer">
          <div className="cmd-shortcut-hint">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Naviguer</span>
            <span><kbd>↵</kbd> Sélectionner</span>
            <span><kbd>ESC</kbd> Fermer</span>
          </div>
        </div>
      </div>

      <style>{`
        .cmd-palette-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 12vh;
          z-index: 1000;
          animation: cmdFadeIn 0.15s ease;
        }

        @keyframes cmdFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cmd-palette-dialog {
          width: 100%;
          max-width: 620px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: cmdSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cmdSlideDown {
          from { opacity: 0; transform: translateY(-16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .cmd-input-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
        }

        .cmd-search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .cmd-input-field {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 15px;
          color: var(--text-primary);
          outline: none;
        }

        .cmd-input-field::placeholder {
          color: var(--text-muted);
          font-size: 13.5px;
        }

        .cmd-clear-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          display: flex;
        }

        .cmd-key-badge {
          font-size: 11px;
          font-weight: 600;
          background: var(--bg-subtle);
          color: var(--text-muted);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 2px 6px;
        }

        .cmd-results-list {
          max-height: 380px;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cmd-empty-state {
          text-align: center;
          padding: 36px 16px;
          color: var(--text-muted);
          font-size: 13.5px;
        }

        .cmd-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .cmd-item.selected {
          background: var(--accent-subtle);
        }

        .cmd-item-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cmd-item-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .cmd-item-title {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cmd-item-subtitle {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .cmd-item-category {
          font-size: 10.5px;
          font-weight: 600;
          background: var(--bg-subtle);
          color: var(--text-secondary);
          border-radius: 100px;
          padding: 2px 8px;
          border: 1px solid var(--border);
        }

        .cmd-item-arrow {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.1s ease;
        }

        .cmd-item.selected .cmd-item-arrow {
          opacity: 1;
          color: var(--accent);
        }

        .cmd-palette-footer {
          padding: 8px 18px;
          background: var(--bg-subtle);
          border-top: 1px solid var(--border);
        }

        .cmd-shortcut-hint {
          display: flex;
          gap: 16px;
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .cmd-shortcut-hint kbd {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 3px;
          padding: 1px 5px;
          font-family: inherit;
          font-size: 10.5px;
        }
      `}</style>
    </div>
  );
}
