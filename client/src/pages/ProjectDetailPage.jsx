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
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchProject(id).catch(() => navigate("/projects"));
  }, [id]);

  const filteredTasks = tasks.filter(
    (t) => !search || t.titre.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddTask = (status = "todo") => {
    setDefaultStatus(status);
    setTaskModalOpen(true);
  };

  const handleCreateTask = async (data) => {
    setSaving(true);
    try {
      await createTask(id, { ...data, statut: data.statut || defaultStatus });
      toast.success("Tâche créée !");
      setTaskModalOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur");
    }
    setSaving(false);
  };

  const handleEditTask = async (data) => {
    setSaving(true);
    try {
      await updateTask(id, editTask.id, data);
      toast.success("Tâche modifiée");
      setEditTask(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur");
    }
    setSaving(false);
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(id, deleteTarget.id);
      toast.success("Tâche supprimée");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur");
    }
  };

  const openMemberModal = async () => {
    const { data } = await authAPI.getUsers();
    setAllUsers(data.users);
    setMemberModalOpen(true);
  };

  const addMember = async (userId) => {
    try {
      await projectAPI.addMember(id, { user_id: userId });
      toast.success("Membre ajouté");
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <span className="spinner spinner-lg" />
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
    <div className="page-container fade-in">
      <Link
        to="/projects"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "var(--text-muted)",
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Retour aux projets
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: currentProject.couleur,
              }}
            />
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {currentProject.titre}
            </h1>
          </div>
          {currentProject.description && (
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                maxWidth: 600,
              }}
            >
              {currentProject.description}
            </p>
          )}
          {!isCreator && (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 8,
                fontStyle: "italic",
              }}
            >
              Créé par <strong>{currentProject.createur?.nom}</strong>
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isCreator && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={openMemberModal}
              >
                <Users size={14} /> Membres ({memberIds.length})
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleAddTask()}
              >
                <Plus size={14} /> Nouvelle tâche
              </button>
            </>
          )}
          {!isCreator && (
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                padding: "6px 12px",
                background: "var(--bg-elevated)",
                borderRadius: "6px",
                border: "1px solid var(--border)",
              }}
            >
              👁️ Mode lecture seule
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="proj-stats">
        {[
          { label: "Total", val: stats.total, color: "var(--text-primary)" },
          { label: "À faire", val: stats.todo, color: "#4a5a70" },
          { label: "En cours", val: stats.in_progress, color: "#f59e0b" },
          { label: "Révision", val: stats.review, color: "#8b5cf6" },
          { label: "Terminé", val: stats.done, color: "#10b981" },
        ].map((s) => (
          <div key={s.label} className="proj-stat-item">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: s.color,
              }}
            >
              {s.val}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingLeft: 8,
          }}
        >
          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: currentProject.couleur,
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 36 }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher une tâche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            className={`btn btn-sm ${view === "kanban" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setView("kanban")}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
          <button
            className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setView("list")}
          >
            <List size={14} /> Liste
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard
          projectId={parseInt(id)}
          tasks={filteredTasks}
          onAddTask={handleAddTask}
          onEditTask={setEditTask}
          onViewTask={setViewTask}
          onDeleteTask={setDeleteTarget}
          currentUserId={user?.id}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>📋</div>
              <h3>Aucune tâche</h3>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue =
                task.echeance &&
                new Date(task.echeance) < new Date() &&
                task.statut !== "done";
              const statusColors = {
                todo: "#4a5a70",
                in_progress: "#f59e0b",
                review: "#8b5cf6",
                done: "#10b981",
              };
              const statusLabels = {
                todo: "À faire",
                in_progress: "En cours",
                review: "Révision",
                done: "Terminé",
              };
              return (
                <div
                  key={task.id}
                  onClick={() => setViewTask(task)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "all var(--transition)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.background = "var(--bg-elevated)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-surface)";
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: statusColors[task.statut],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.titre}
                  </span>
                  {task.assigne && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {task.assigne.nom.split(" ")[0]}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      background: `${statusColors[task.statut]}20`,
                      color: statusColors[task.statut],
                      border: `1px solid ${statusColors[task.statut]}30`,
                      borderRadius: 100,
                      padding: "2px 10px",
                    }}
                  >
                    {statusLabels[task.statut]}
                  </span>
                  {task.echeance && (
                    <span
                      style={{
                        fontSize: 12,
                        color: isOverdue ? "#ef4444" : "var(--text-muted)",
                      }}
                    >
                      {format(new Date(task.echeance), "dd MMM", {
                        locale: fr,
                      })}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Members Modal */}
      {memberModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMemberModalOpen(false)}
        >
          <div
            className="modal"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
                Membres du projet
              </h2>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setMemberModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Membres ({currentProject.membres?.length})
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 20,
                }}
              >
                {currentProject.membres?.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="avatar avatar-sm">
                      {m.nom?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{m.nom}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {m.email}
                      </p>
                    </div>
                    {isCreator && m.id !== user?.id && (
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => removeMember(m.id)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isCreator &&
                allUsers.filter((u) => !memberIds.includes(u.id)).length >
                  0 && (
                  <>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      Ajouter
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {allUsers
                        .filter((u) => !memberIds.includes(u.id))
                        .map((u) => (
                          <div
                            key={u.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 12px",
                              background: "var(--bg-elevated)",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div className="avatar avatar-sm">
                              {u.nom?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13, flex: 1 }}>
                              {u.nom}
                            </span>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => addMember(u.id)}
                            >
                              <UserPlus size={13} /> Ajouter
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

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        initialData={{ statut: defaultStatus }}
        membres={currentProject.membres}
        isLoading={saving}
      />
      <TaskModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleEditTask}
        initialData={editTask}
        membres={currentProject.membres}
        isLoading={saving}
      />
      <TaskDetailModal
        open={!!viewTask}
        onClose={() => setViewTask(null)}
        task={viewTask}
        projectId={parseInt(id)}
      />
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask}
        title="Supprimer la tâche"
        message={`Supprimer "${deleteTarget?.titre}" ?`}
        danger
      />

      <style>{`
        .proj-stats { display: flex; align-items: center; gap: 24px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 24px; margin-bottom: 24px; flex-wrap: wrap; }
        .proj-stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 50px; }
      `}</style>
    </div>
  );
}
