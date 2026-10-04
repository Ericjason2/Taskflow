import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Users,
  Search,
  LayoutGrid,
  List,
  UserPlus,
  X,
  Star,
  CheckCircle2,
  Clock,
  HelpCircle,
  Circle,
  BarChart3,
  Calendar,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Share2,
} from "lucide-react";
import useProjectStore from "../store/projectStore";
import useAuthStore from "../store/authStore";
import { authAPI, projectAPI } from "../services/api";
import KanbanBoard from "../components/tasks/KanbanBoard";
import TaskModal from "../components/tasks/TaskModal";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { id: "todo", label: "À faire", color: "#64748b", icon: Circle },
  { id: "in_progress", label: "En cours", color: "#2563eb", icon: Clock },
  { id: "review", label: "En révision", color: "#d97706", icon: HelpCircle },
  { id: "done", label: "Terminé", color: "#16a34a", icon: CheckCircle2 },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentProject,
    tasks,
    fetchProject,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    isLoading,
  } = useProjectStore();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("todo");
  const [editTask, setEditTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Starred board state in localStorage
  const [isStarred, setIsStarred] = useState(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("tf_starred_boards") || "[]",
      );
      return stored.includes(parseInt(id));
    } catch {
      return false;
    }
  });

  const toggleStar = () => {
    setIsStarred((prev) => {
      const next = !prev;
      try {
        const stored = JSON.parse(
          localStorage.getItem("tf_starred_boards") || "[]",
        );
        const updated = next
          ? [...stored, parseInt(id)]
          : stored.filter((x) => x !== parseInt(id));
        localStorage.setItem("tf_starred_boards", JSON.stringify(updated));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    fetchProject(id).catch(() => navigate("/projects"));
  }, [id]);

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      !search || t.titre.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !filterPriority || t.priorite === filterPriority;
    return matchSearch && matchPriority;
  });

  const handleAddTask = (status = "todo") => {
    setDefaultStatus(status);
    setTaskModalOpen(true);
  };

  const handleCreateTask = async (data) => {
    setSaving(true);
    try {
      await createTask(id, { ...data, statut: data.statut || defaultStatus });
      toast.success("Tâche créée avec succès !");
      setTaskModalOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const handleEditTask = async (data) => {
    setSaving(true);
    try {
      await updateTask(id, editTask.id, data);
      toast.success("Tâche modifiée");
      setEditTask(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(id, deleteTarget.id);
      toast.success("Tâche supprimée");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const openMemberModal = async () => {
    try {
      const { data } = await authAPI.getUsers();
      setAllUsers(data.users || []);
      setMemberModalOpen(true);
    } catch {
      toast.error("Impossible de charger les utilisateurs");
    }
  };

  const addMember = async (userId) => {
    try {
      await projectAPI.addMember(id, { user_id: userId });
      toast.success("Membre ajouté au tableau");
      fetchProject(id);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur");
    }
  };

  const removeMember = async (userId) => {
    try {
      await projectAPI.removeMember(id, userId);
      toast.success("Membre retiré");
      fetchProject(id);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur");
    }
  };

  if (isLoading || !currentProject) {
    return (
      <div className="board-loading-wrapper">
        <span className="spinner" />
        <p>Ouverture du tableau...</p>
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.statut === "todo").length,
    in_progress: tasks.filter((t) => t.statut === "in_progress").length,
    review: tasks.filter((t) => t.statut === "review").length,
    done: tasks.filter((t) => t.statut === "done").length,
  };
  const progress =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const isCreator = currentProject.createur_id === user?.id;
  const memberIds = currentProject.membres?.map((m) => m.id) || [];

  return (
    <div className="board-page-container fade-in">
      {/* Trello Board Top Bar */}
      <div className="trello-board-header">
        <div className="board-header-left">
          <Link to="/projects" className="board-back-link">
            <ArrowLeft size={14} />
            <span>Tableaux</span>
          </Link>
          <span className="breadcrumb-separator">/</span>

          <div className="board-title-wrapper">
            <span
              className="board-color-dot"
              style={{ background: currentProject.couleur || "#2563eb" }}
            />
            <h1 className="board-main-title">{currentProject.titre}</h1>

            <button
              className={`board-star-toggle ${isStarred ? "starred" : ""}`}
              onClick={toggleStar}
              title={isStarred ? "Retirer des favoris" : "Marquer comme favori"}
            >
              <Star
                size={16}
                fill={isStarred ? "#eab308" : "none"}
                color={isStarred ? "#eab308" : "currentColor"}
              />
            </button>
          </div>
        </div>

        <div className="board-header-right">
          {/* Member Stack & Invite */}
          <div className="board-members-bar">
            {currentProject.membres?.length > 0 && (
              <div className="avatar-group">
                {currentProject.membres.slice(0, 4).map((m) => (
                  <div key={m.id} className="avatar avatar-sm" title={m.nom}>
                    {m.nom?.[0]?.toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            {isCreator && (
              <button
                className="btn btn-secondary btn-sm invite-btn"
                onClick={openMemberModal}
              >
                <UserPlus size={13} />
                <span>Inviter</span>
              </button>
            )}
          </div>

          {/* New Task Button */}
          {isCreator && (
            <button
              className="btn btn-primary btn-sm add-task-header-btn"
              onClick={() => handleAddTask()}
            >
              <Plus size={14} />
              <span>Nouvelle tâche</span>
            </button>
          )}
        </div>
      </div>

      {/* Board Secondary Ribbon: Views & Search & Filters */}
      <div className="board-sub-ribbon">
        {/* View Switcher Pills */}
        <div className="tabs">
          <button
            className={`tab ${view === "kanban" ? "active" : ""}`}
            onClick={() => setView("kanban")}
          >
            <LayoutGrid size={13} />
            <span>Tableau</span>
          </button>
          <button
            className={`tab ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            <List size={13} />
            <span>Liste</span>
          </button>
          <button
            className={`tab ${view === "metrics" ? "active" : ""}`}
            onClick={() => setView("metrics")}
          >
            <BarChart3 size={13} />
            <span>Métriques</span>
          </button>
        </div>

        {/* Live Search inside board */}
        <div className="board-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input board-input"
            placeholder="Filtrer les cartes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          className="form-select board-filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">Toutes les priorités</option>
          <option value="basse">Priorité Basse</option>
          <option value="moyenne">Priorité Moyenne</option>
          <option value="haute">Priorité Haute</option>
          <option value="critique">Priorité Critique</option>
        </select>

        {/* Mini stats ribbon */}
        <div className="board-quick-stats">
          <div className="stat-chip">
            <span className="stat-chip-label">Tâches</span>
            <span className="stat-chip-val">{stats.total}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-label">Fait</span>
            <span className="stat-chip-val done">{stats.done}</span>
          </div>
          <div className="stat-progress-bar" title={`${progress}% complété`}>
            <div
              className="stat-progress-fill"
              style={{
                width: `${progress}%`,
                background: currentProject.couleur || "#2563eb",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Board Body */}
      {view === "kanban" && (
        <div className="board-content-area">
          <KanbanBoard
            projectId={id}
            tasks={filteredTasks}
            onAddTask={handleAddTask}
            onEditTask={(t) => setEditTask(t)}
            onViewTask={(t) => setViewTask(t)}
            onDeleteTask={(t) => setDeleteTarget(t)}
            currentUserId={user?.id}
          />
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="trello-table-view card">
          <div className="table-header-row">
            <span className="col-header-task">Tâche</span>
            <span className="col-header-status">Statut</span>
            <span className="col-header-priority">Priorité</span>
            <span className="col-header-due">Échéance</span>
            <span className="col-header-assignee">Assigné à</span>
            <span className="col-header-actions">Actions</span>
          </div>

          <div className="table-body-rows">
            {filteredTasks.length === 0 ? (
              <div className="table-empty">
                <p>Aucune tâche trouvée</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="table-task-row">
                  <div className="col-task-title" onClick={() => setViewTask(task)}>
                    <span className="task-title-text">{task.titre}</span>
                    {task.description && (
                      <span className="task-desc-sub">
                        {task.description.slice(0, 50)}...
                      </span>
                    )}
                  </div>

                  <div className="col-task-status">
                    <select
                      className="form-select status-mini-select"
                      value={task.statut}
                      onChange={async (e) => {
                        try {
                          await updateTaskStatus(id, task.id, e.target.value);
                          toast.success("Statut mis à jour");
                        } catch {
                          toast.error("Erreur");
                        }
                      }}
                    >
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="review">En révision</option>
                      <option value="done">Terminé</option>
                    </select>
                  </div>

                  <div className="col-task-priority">
                    <span className={`badge badge-${task.priorite}`}>
                      {task.priorite}
                    </span>
                  </div>

                  <div className="col-task-due">
                    {task.echeance ? (
                      <span className="due-text">
                        <Calendar size={12} />
                        {format(new Date(task.echeance), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    ) : (
                      <span className="due-none">—</span>
                    )}
                  </div>

                  <div className="col-task-assignee">
                    {task.assigne ? (
                      <div className="assignee-cell">
                        <div className="avatar avatar-xs">
                          {task.assigne.nom?.[0]?.toUpperCase()}
                        </div>
                        <span>{task.assigne.nom.split(" ")[0]}</span>
                      </div>
                    ) : (
                      <span className="due-none">Non assigné</span>
                    )}
                  </div>

                  <div className="col-task-actions">
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => setViewTask(task)}
                      title="Voir"
                    >
                      <Eye size={13} />
                    </button>
                    {isCreator && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setEditTask(task)}
                          title="Modifier"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon danger"
                          onClick={() => setDeleteTarget(task)}
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Metrics View */}
      {view === "metrics" && (
        <div className="metrics-dashboard-grid">
          <div className="card metric-card">
            <h3 className="metric-title">Avancement global</h3>
            <div className="progress-big-number">
              <span className="big-pct">{progress}%</span>
              <span className="pct-sub">des tâches terminées</span>
            </div>
            <div className="progress-track" style={{ height: 10 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                  background: currentProject.couleur || "#2563eb",
                }}
              />
            </div>
          </div>

          <div className="card metric-card">
            <h3 className="metric-title">Répartition par statut</h3>
            <div className="status-bars-list">
              {STATUS_OPTIONS.map((st) => {
                const count = stats[st.id] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const StIcon = st.icon;
                return (
                  <div key={st.id} className="status-metric-row">
                    <div className="status-metric-name">
                      <StIcon size={14} style={{ color: st.color }} />
                      <span>{st.label}</span>
                    </div>
                    <div className="status-metric-bar-track">
                      <div
                        className="status-metric-bar-fill"
                        style={{ width: `${pct}%`, background: st.color }}
                      />
                    </div>
                    <span className="status-metric-val">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        defaultStatus={defaultStatus}
        members={currentProject.membres || []}
        isLoading={saving}
      />
      <TaskModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleEditTask}
        initialData={editTask}
        members={currentProject.membres || []}
        isLoading={saving}
      />
      <TaskDetailModal
        task={viewTask}
        open={!!viewTask}
        onClose={() => setViewTask(null)}
        onEdit={(t) => {
          setViewTask(null);
          setEditTask(t);
        }}
        onDelete={(t) => {
          setViewTask(null);
          setDeleteTarget(t);
        }}
        projectId={id}
        currentUserId={user?.id}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask}
        title="Supprimer la tâche"
        message={`Supprimer "${deleteTarget?.titre}" définitivement ?`}
        danger
      />

      {/* Member Management Modal */}
      {memberModalOpen && (
        <div className="modal-overlay" onClick={() => setMemberModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Gérer les membres du tableau</h3>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setMemberModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="members-modal-body">
              <p className="modal-section-title">Membres actuels</p>
              <div className="members-current-list">
                {currentProject.membres?.map((m) => (
                  <div key={m.id} className="member-row">
                    <div className="avatar avatar-sm">
                      {m.nom?.[0]?.toUpperCase()}
                    </div>
                    <div className="member-info">
                      <span className="member-name">{m.nom}</span>
                      <span className="member-email">{m.email}</span>
                    </div>
                    {m.id !== currentProject.createur_id && isCreator && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeMember(m.id)}
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isCreator && (
                <>
                  <p className="modal-section-title" style={{ marginTop: 20 }}>
                    Ajouter un collaborateur
                  </p>
                  <div className="members-available-list">
                    {allUsers
                      .filter((u) => !memberIds.includes(u.id))
                      .map((u) => (
                        <div key={u.id} className="member-row">
                          <div className="avatar avatar-sm">
                            {u.nom?.[0]?.toUpperCase()}
                          </div>
                          <div className="member-info">
                            <span className="member-name">{u.nom}</span>
                            <span className="member-email">{u.email}</span>
                          </div>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => addMember(u.id)}
                          >
                            <Plus size={13} /> Ajouter
                          </button>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .board-page-container {
          padding: 20px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 100vh;
        }

        .board-loading-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: 14px;
          color: var(--text-muted);
        }

        /* Top Bar */
        .trello-board-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .board-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .board-back-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          transition: color var(--transition);
        }

        .board-back-link:hover {
          color: var(--text-primary);
        }

        .breadcrumb-separator {
          color: var(--text-light);
          font-size: 14px;
        }

        .board-title-wrapper {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .board-color-dot {
          width: 13px;
          height: 13px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .board-main-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .board-star-toggle {
          background: none;
          border: none;
          color: var(--text-light);
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition);
        }

        .board-star-toggle:hover {
          color: #eab308;
        }

        .board-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .board-members-bar {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .invite-btn {
          border-style: dashed;
        }

        /* Sub-ribbon */
        .board-sub-ribbon {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          background: #ffffff;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xs);
        }

        .board-search-box {
          position: relative;
          min-width: 180px;
          max-width: 260px;
        }

        .board-search-box .search-icon {
          position: absolute;
          left: 9px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .board-input {
          padding-left: 30px;
          height: 33px;
          font-size: 12.5px;
        }

        .clear-btn {
          position: absolute;
          right: 7px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: none;
          color: var(--text-muted);
          padding: 2px;
        }

        .board-filter-select {
          width: auto;
          height: 33px;
          padding: 4px 10px;
          font-size: 12.5px;
        }

        .board-quick-stats {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .stat-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .stat-chip-label {
          color: var(--text-muted);
        }

        .stat-chip-val {
          font-weight: 600;
        }

        .stat-chip-val.done {
          color: #16a34a;
        }

        .stat-progress-bar {
          width: 70px;
          height: 6px;
          background: #e2e8f0;
          border-radius: 9999px;
          overflow: hidden;
        }

        .stat-progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        /* Table View */
        .trello-table-view {
          padding: 0;
          overflow: hidden;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 3fr 1.5fr 1.2fr 1.5fr 1.5fr 1fr;
          padding: 10px 16px;
          background: #f8fafc;
          border-bottom: 1px solid var(--border);
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .table-task-row {
          display: grid;
          grid-template-columns: 3fr 1.5fr 1.2fr 1.5fr 1.5fr 1fr;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          transition: background var(--transition);
        }

        .table-task-row:hover {
          background: #f8fafc;
        }

        .col-task-title {
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .task-title-text {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .task-title-text:hover {
          color: var(--accent);
        }

        .task-desc-sub {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .status-mini-select {
          width: auto;
          height: 30px;
          font-size: 12px;
          padding: 2px 8px;
        }

        .due-text {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .due-none {
          color: var(--text-light);
          font-size: 12px;
        }

        .assignee-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .col-task-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .table-empty {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
        }

        /* Metrics View */
        .metrics-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .metric-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .progress-big-number {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 16px;
        }

        .big-pct {
          font-size: 42px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .pct-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        .status-bars-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-metric-row {
          display: grid;
          grid-template-columns: 130px 1fr 30px;
          align-items: center;
          gap: 12px;
        }

        .status-metric-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .status-metric-bar-track {
          height: 8px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;
        }

        .status-metric-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .status-metric-val {
          font-size: 13px;
          font-weight: 600;
          text-align: right;
          color: var(--text-muted);
        }

        /* Modal member lists */
        .members-modal-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-section-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .member-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }

        .member-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .member-name {
          font-size: 13px;
          font-weight: 600;
        }

        .member-email {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .table-header-row,
          .table-task-row {
            grid-template-columns: 2fr 1fr 1fr;
          }
          .col-header-due,
          .col-task-due,
          .col-header-assignee,
          .col-task-assignee {
            display: none;
          }
          .metrics-dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
