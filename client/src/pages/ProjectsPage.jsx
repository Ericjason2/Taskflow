import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  Kanban,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowUpDown,
  X,
} from "lucide-react";
import useProjectStore from "../store/projectStore";
import useAuthStore from "../store/authStore";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectModal from "../components/projects/ProjectModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { ProjectListSkeleton } from "../components/common/Skeleton";
import toast from "react-hot-toast";

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    total,
    totalPages,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectStore();
  const { user } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Favorite boards stored in localStorage (Trello style)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tf_starred_boards") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      localStorage.setItem("tf_starred_boards", JSON.stringify(next));
      return next;
    });
  };

  const [filters, setFilters] = useState({
    search: "",
    statut: "",
    priorite: "",
    page: 1,
    sort: "createdAt",
    order: "DESC",
  });

  const loadProjects = useCallback(() => {
    const params = { ...filters, limit: 12 };
    if (!params.search) delete params.search;
    if (!params.statut) delete params.statut;
    if (!params.priorite) delete params.priorite;
    fetchProjects(params);
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(loadProjects, 300);
    return () => clearTimeout(debounce);
  }, [loadProjects]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createProject(data);
      toast.success("Tableau créé avec succès !");
      setModalOpen(false);
      loadProjects();
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await updateProject(editProject.id, data);
      toast.success("Tableau mis à jour");
      setEditProject(null);
      loadProjects();
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(deleteTarget.id);
      toast.success("Tableau supprimé");
      setDeleteTarget(null);
      loadProjects();
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  // Separate starred and all boards
  const starredProjects = projects.filter((p) => favorites.includes(p.id));

  return (
    <div className="page-container fade-in">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div className="header-badge-row">
            <span className="workspace-badge">
              <Kanban size={13} /> Espace de travail
            </span>
          </div>
          <h1 className="page-title">Vos Tableaux</h1>
          <p className="page-subtitle">
            Gérez vos flux de travail collaboratifs en mode Trello
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Créer un tableau
        </button>
      </div>

      {/* Toolbar / Search / Filters */}
      <div className="trello-toolbar">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un tableau..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
          {filters.search && (
            <button
              className="clear-search-btn"
              onClick={() => setFilter("search", "")}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Quick Status Filter Tabs (Trello style) */}
        <div className="status-tabs">
          {[
            { id: "", label: "Tous" },
            { id: "actif", label: "Actifs" },
            { id: "en_pause", label: "En pause" },
            { id: "terminé", label: "Terminés" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`status-tab ${filters.statut === tab.id ? "active" : ""}`}
              onClick={() => setFilter("statut", tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <button
            className={`btn btn-secondary btn-sm ${showFilters ? "active-filter-btn" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={14} /> Filtres
          </button>

          <select
            className="form-select sort-select"
            value={`${filters.sort}-${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              setFilters((f) => ({ ...f, sort, order, page: 1 }));
            }}
          >
            <option value="createdAt-DESC">Plus récents</option>
            <option value="createdAt-ASC">Plus anciens</option>
            <option value="titre-ASC">Titre A → Z</option>
            <option value="titre-DESC">Titre Z → A</option>
          </select>

          <div className="view-toggle">
            <button
              className={`view-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
              title="Grille de tableaux"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              className={`view-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
              title="Vue en liste"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Expandable */}
      {showFilters && (
        <div className="advanced-filter-panel">
          <div className="filter-item">
            <label className="filter-label">Priorité :</label>
            <select
              className="form-select filter-select"
              value={filters.priorite}
              onChange={(e) => setFilter("priorite", e.target.value)}
            >
              <option value="">Toutes les priorités</option>
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          {(filters.statut || filters.priorite || filters.search) && (
            <button
              className="btn btn-ghost btn-sm reset-filter-btn"
              onClick={() =>
                setFilters({
                  search: "",
                  statut: "",
                  priorite: "",
                  page: 1,
                  sort: "createdAt",
                  order: "DESC",
                })
              }
            >
              <X size={13} /> Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <ProjectListSkeleton />
      ) : projects.length === 0 ? (
        <div className="empty-boards-state">
          <div className="empty-icon-bubble">
            <Kanban size={32} />
          </div>
          <h3>Aucun tableau trouvé</h3>
          <p>
            {filters.search || filters.statut || filters.priorite
              ? "Aucun résultat ne correspond à vos filtres actuels."
              : "Créez votre premier tableau pour commencer à organiser vos projets."}
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 14 }}
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} /> Créer un tableau
          </button>
        </div>
      ) : (
        <div className="boards-container">
          {/* Section: Starred Boards (like Trello) */}
          {starredProjects.length > 0 && !filters.search && !filters.statut && (
            <div className="boards-section">
              <div className="section-title-row">
                <Star size={16} fill="#eab308" color="#eab308" />
                <h2 className="section-title">Tableaux favoris</h2>
              </div>
              <div className="projects-grid">
                {starredProjects.map((p) => (
                  <ProjectCard
                    key={`starred-${p.id}`}
                    project={p}
                    currentUserId={user?.id}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    onEdit={(item) => setEditProject(item)}
                    onDelete={(item) => setDeleteTarget(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: All Workspace Boards */}
          <div className="boards-section">
            <div className="section-title-row">
              <Layers size={16} className="section-icon" />
              <h2 className="section-title">
                {filters.search || filters.statut
                  ? "Résultats de recherche"
                  : "Tous les tableaux"}
              </h2>
              <span className="count-pill">{total}</span>
            </div>

            <div className={view === "grid" ? "projects-grid" : "projects-list"}>
              {/* Card "+ Créer un tableau" (Trello style) */}
              {view === "grid" && !filters.search && (
                <div
                  className="create-board-tile"
                  onClick={() => setModalOpen(true)}
                >
                  <div className="create-tile-inner">
                    <Plus size={20} className="create-icon" />
                    <span>Créer un nouveau tableau</span>
                  </div>
                </div>
              )}

              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  currentUserId={user?.id}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={toggleFavorite}
                  onEdit={(item) => setEditProject(item)}
                  onDelete={(item) => setDeleteTarget(item)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={filters.page <= 1}
            onClick={() => setFilter("page", filters.page - 1)}
          >
            ← Précédent
          </button>
          <span className="page-indicator">
            Page {filters.page} sur {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={filters.page >= totalPages}
            onClick={() => setFilter("page", filters.page + 1)}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={saving}
      />
      <ProjectModal
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSubmit={handleEdit}
        initialData={editProject}
        isLoading={saving}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le tableau"
        message={`Voulez-vous vraiment supprimer "${deleteTarget?.titre}" et toutes ses tâches associées ? Cette action est irréversible.`}
        danger
      />

      <style>{`
        .header-badge-row {
          margin-bottom: 4px;
        }

        .workspace-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent);
          background: var(--accent-subtle);
          padding: 2px 8px;
          border-radius: 9999px;
          border: 1px solid var(--accent-border);
        }

        .trello-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          min-width: 240px;
          flex: 1;
          max-width: 380px;
        }

        .search-box .search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }

        .search-box .search-input {
          padding-left: 34px;
          padding-right: 28px;
          height: 38px;
        }

        .clear-search-btn {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          padding: 2px;
          border-radius: 50%;
        }

        .clear-search-btn:hover {
          color: var(--text-primary);
        }

        .status-tabs {
          display: flex;
          gap: 4px;
          background: var(--bg-subtle);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .status-tab {
          padding: 5px 12px;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          border: none;
          background: transparent;
          transition: all var(--transition);
        }

        .status-tab:hover {
          color: var(--text-primary);
        }

        .status-tab.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .sort-select {
          width: auto;
          height: 36px;
          padding: 6px 12px;
          font-size: 13px;
        }

        .active-filter-btn {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          background: var(--accent-subtle) !important;
        }

        .view-toggle {
          display: flex;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 3px;
          gap: 2px;
        }

        .view-btn {
          padding: 5px 8px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: all var(--transition);
        }

        .view-btn:hover {
          color: var(--text-primary);
        }

        .view-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }

        .advanced-filter-panel {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 12px 16px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-xs);
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .filter-select {
          width: auto;
          height: 34px;
          padding: 4px 10px;
          font-size: 12.5px;
        }

        .reset-filter-btn {
          margin-left: auto;
        }

        .boards-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .boards-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon {
          color: var(--text-muted);
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .count-pill {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: #f1f5f9;
          padding: 1px 7px;
          border-radius: 9999px;
          border: 1px solid var(--border);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
          gap: 18px;
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Trello "+ Créer un tableau" Tile */
        .create-board-tile {
          border: 2px dashed var(--border-strong);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-smooth);
        }

        .create-board-tile:hover {
          border-color: var(--accent);
          background: var(--accent-subtle);
          transform: translateY(-2px);
        }

        .create-tile-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 500;
          transition: color var(--transition);
        }

        .create-board-tile:hover .create-tile-inner {
          color: var(--accent);
        }

        .create-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          transition: all var(--transition);
        }

        .create-board-tile:hover .create-icon {
          background: var(--accent);
          color: #ffffff;
        }

        .empty-boards-state {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-surface);
          border: 1px dashed var(--border);
          border-radius: var(--radius-xl);
        }

        .empty-icon-bubble {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent-subtle);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .loading-state {
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 36px;
        }

        .page-indicator {
          font-size: 13px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .trello-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box {
            max-width: 100%;
          }
          .toolbar-actions {
            margin-left: 0;
            justify-content: space-between;
          }
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
