import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  Calendar,
  GripVertical,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import useProjectStore from "../../store/projectStore";
import toast from "react-hot-toast";

const COLUMNS = [
  { id: "todo", label: "À faire", color: "#999999" },
  { id: "in_progress", label: "En cours", color: "#666666" },
  { id: "review", label: "En révision", color: "#555555" },
  { id: "done", label: "Terminé", color: "#333333" },
];

const PRIO_COLORS = {
  basse: "#888888",
  moyenne: "#666666",
  haute: "#444444",
  critique: "#000000",
};

function TaskCard({ task, index, onView, onEdit, onDelete, currentUserId }) {
  const isOverdue =
    task.echeance &&
    new Date(task.echeance) < new Date() &&
    task.statut !== "done";
  const canModify =
    task.cree_par === currentUserId || task.assigne_a === currentUserId;

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`task-card ${snapshot.isDragging ? "dragging" : ""}`}
        >
          <div className="task-card-top">
            <div {...provided.dragHandleProps} className="drag-handle">
              <GripVertical size={14} />
            </div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: PRIO_COLORS[task.priorite],
                flexShrink: 0,
              }}
              title={`Priorité ${task.priorite}`}
            />
            <div className="task-card-actions">
              <button
                className="task-action-btn"
                onClick={() => onView(task)}
                title="Voir"
              >
                <Eye size={13} />
              </button>
              {canModify && (
                <button
                  className="task-action-btn"
                  onClick={() => onEdit(task)}
                  title="Modifier"
                >
                  <Edit2 size={13} />
                </button>
              )}
              {canModify && (
                <button
                  className="task-action-btn danger"
                  onClick={() => onDelete(task)}
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          <p className="task-title" onClick={() => onView(task)}>
            {task.titre}
          </p>

          {task.description && (
            <p className="task-desc">
              {task.description.slice(0, 80)}
              {task.description.length > 80 ? "…" : ""}
            </p>
          )}

          {task.tags?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              {task.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 10,
                    background: "rgba(0,0,0,0.06)",
                    color: "#333333",
                    borderRadius: 100,
                    padding: "1px 7px",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="task-card-footer">
            {task.assigne ? (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div className="avatar avatar-sm">
                  {task.assigne.nom?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {task.assigne.nom.split(" ")[0]}
                </span>
              </div>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}
              >
                Non assigné
              </span>
            )}
            {task.echeance && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: isOverdue ? "#ef4444" : "var(--text-muted)",
                }}
              >
                {isOverdue && <AlertCircle size={11} />}
                <Calendar size={11} />
                {format(new Date(task.echeance), "dd MMM", { locale: fr })}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanBoard({
  projectId,
  tasks,
  onAddTask,
  onEditTask,
  onViewTask,
  onDeleteTask,
  currentUserId,
}) {
  const { updateTaskStatus, setTasksLocal } = useProjectStore();

  const getColumnTasks = (columnId) =>
    tasks.filter((t) => t.statut === columnId);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, statut: newStatus } : t,
    );
    setTasksLocal(updatedTasks);

    try {
      await updateTaskStatus(projectId, taskId, newStatus);
    } catch (_) {
      setTasksLocal(tasks);
      toast.error("Erreur mise à jour statut");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: col.color,
                    }}
                  />
                  <span className="kanban-col-title">{col.label}</span>
                  <span className="kanban-count">{colTasks.length}</span>
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => onAddTask(col.id)}
                >
                  <Plus size={15} />
                </button>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-drop-zone ${snapshot.isDraggingOver ? "drag-over" : ""}`}
                  >
                    {colTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={i}
                        onView={onViewTask}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        currentUserId={currentUserId}
                      />
                    ))}
                    {provided.placeholder}
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div
                        className="kanban-empty"
                        onClick={() => onAddTask(col.id)}
                      >
                        <Plus size={14} />
                        <span>Ajouter une tâche</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>

      <style>{`
        .kanban-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: start; }
        .kanban-column { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
        .kanban-column-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); }
        .kanban-col-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; }
        .kanban-count { background: var(--bg-overlay); color: var(--text-secondary); border-radius: 100px; padding: 1px 8px; font-size: 11px; font-weight: 600; border: 1px solid var(--border); }
        .kanban-drop-zone { padding: 12px; min-height: 140px; display: flex; flex-direction: column; gap: 8px; transition: background var(--transition); }
        .kanban-drop-zone.drag-over { background: var(--accent-glow); }
        .kanban-empty { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 16px; border: 1px dashed var(--border); border-radius: var(--radius-md); font-size: 12px; color: var(--text-muted); cursor: pointer; transition: all var(--transition); }
        .kanban-empty:hover { border-color: var(--accent-dim); color: var(--accent); background: var(--accent-glow); }
        .task-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 8px; transition: all var(--transition); }
        .task-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }
        .task-card.dragging { box-shadow: var(--shadow-lg); transform: rotate(1.5deg); border-color: var(--accent-dim); }
        .task-card-top { display: flex; align-items: center; gap: 6px; }
        .drag-handle { color: var(--text-muted); cursor: grab; display: flex; }
        .drag-handle:active { cursor: grabbing; }
        .task-card-actions { display: flex; gap: 2px; margin-left: auto; opacity: 0; transition: opacity var(--transition); }
        .task-card:hover .task-card-actions { opacity: 1; }
        .task-action-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 3px; border-radius: 4px; display: flex; transition: all var(--transition); }
        .task-action-btn:hover { background: var(--bg-overlay); color: var(--text-primary); }
        .task-action-btn.danger:hover { color: #ef4444; }
        .task-title { font-size: 13px; font-weight: 600; line-height: 1.4; cursor: pointer; }
        .task-title:hover { color: var(--accent); }
        .task-desc { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
        .task-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
        @media (max-width: 1100px) { .kanban-board { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .kanban-board { grid-template-columns: 1fr; } }
      `}</style>
    </DragDropContext>
  );
}
