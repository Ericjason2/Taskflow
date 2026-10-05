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
  Clock,
  CheckCircle2,
  Circle,
  HelpCircle,
  MessageSquare,
  Tag,
  MoreHorizontal,
  Sparkles,
  CheckSquare,
  Paperclip,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import useProjectStore from "../../store/projectStore";
import UserAvatar from "../common/UserAvatar";
import toast from "react-hot-toast";

const COLUMNS = [
  {
    id: "todo",
    label: "À faire",
    icon: Circle,
    color: "#64748b",
    badgeClass: "badge-todo",
  },
  {
    id: "in_progress",
    label: "En cours",
    icon: Clock,
    color: "#2563eb",
    badgeClass: "badge-inprogress",
  },
  {
    id: "review",
    label: "En révision",
    icon: HelpCircle,
    color: "#d97706",
    badgeClass: "badge-review",
  },
  {
    id: "done",
    label: "Terminé",
    icon: CheckCircle2,
    color: "#16a34a",
    badgeClass: "badge-done",
  },
];

const PRIORITE_STYLES = {
  basse: { label: "Basse", bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  moyenne: { label: "Moyenne", bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  haute: { label: "Haute", bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  critique: { label: "Critique", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

function TaskCard({ task, index, onView, onEdit, onDelete, currentUserId, isCreator }) {
  const isOverdue =
    task.echeance &&
    new Date(task.echeance) < new Date() &&
    task.statut !== "done";
  const isDone = task.statut === "done";
  const isAssignee =
    task.assigne_a === currentUserId ||
    (Array.isArray(task.assignes) && task.assignes.includes(currentUserId)) ||
    (Array.isArray(task.assignes_details) && task.assignes_details.some((u) => u.id === currentUserId));
  const canModify =
    isCreator || task.cree_par === currentUserId || isAssignee;

  const prio = PRIORITE_STYLES[task.priorite] || PRIORITE_STYLES.moyenne;
  const assigneesList =
    Array.isArray(task.assignes_details) && task.assignes_details.length > 0
      ? task.assignes_details
      : task.assigne
      ? [task.assigne]
      : [];

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`trello-card ${snapshot.isDragging ? "is-dragging" : ""}`}
        >
          {/* Card Cover */}
          {task.couverture && (
            <div
              className="card-cover-band"
              style={{ background: task.couverture }}
            />
          )}

          {/* Card Top: Tags & Priority & Quick Actions */}
          <div className="card-top-bar">
            <div className="card-labels-wrapper">
              <span
                className="prio-chip"
                style={{
                  background: prio.bg,
                  color: prio.color,
                  borderColor: prio.border,
                }}
              >
                <span
                  className="prio-indicator-dot"
                  style={{ background: prio.color }}
                />
                {prio.label}
              </span>

              {task.tags?.slice(0, 2).map((t) => (
                <span key={t} className="trello-label-tag">
                  #{t}
                </span>
              ))}
            </div>

            <div className="card-quick-actions">
              <button
                className="card-action-icon"
                onClick={() => onView(task)}
                title="Consulter"
              >
                <Eye size={13} />
              </button>
              {canModify && (
                <>
                  <button
                    className="card-action-icon"
                    onClick={() => onEdit(task)}
                    title="Modifier"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="card-action-icon danger"
                    onClick={() => onDelete(task)}
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
              <div {...provided.dragHandleProps} className="drag-grip-handle">
                <GripVertical size={14} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h4 className="card-title-text" onClick={() => onView(task)}>
            {task.titre}
          </h4>

          {/* Description snippet */}
          {task.description && (
            <p className="card-description-snippet">
              {task.description.slice(0, 85)}
              {task.description.length > 85 ? "…" : ""}
            </p>
          )}

          {/* Custom Fields Badges */}
          {(() => {
            let cf = task.custom_fields;
            if (typeof cf === "string") {
              try { cf = JSON.parse(cf); } catch { cf = null; }
            }
            if (!cf || typeof cf !== "object" || Array.isArray(cf) || Object.keys(cf).length === 0) return null;
            return (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "4px 0 6px" }}>
                {Object.entries(cf).map(([k, v]) => {
                  if (!v) return null;
                  return (
                    <span
                      key={k}
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        background: "var(--bg-subtle)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        padding: "1px 5px",
                      }}
                    >
                      {v}
                    </span>
                  );
                })}
              </div>
            );
          })()}

          {/* Card Bottom: Metadata, Due Date & Assignee */}
          <div className="card-bottom-bar">
            <div className="card-badges-left">
              {task.echeance && (
                <div
                  className={`due-date-pill ${
                    isDone ? "done" : isOverdue ? "overdue" : "normal"
                  }`}
                  title={
                    isOverdue
                      ? "Échéance dépassée !"
                      : `Échéance : ${format(new Date(task.echeance), "dd MMMM yyyy", { locale: fr })}`
                  }
                >
                  {isDone ? (
                    <CheckCircle2 size={12} />
                  ) : isOverdue ? (
                    <AlertCircle size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                  <span>
                    {format(new Date(task.echeance), "dd MMM", { locale: fr })}
                  </span>
                </div>
              )}

              {task.commentaires?.length > 0 && (
                <div className="comment-badge" title="Commentaires">
                  <MessageSquare size={12} />
                  <span>{task.commentaires.length}</span>
                </div>
              )}

              {/* Subtasks / Checklist count badge */}
              {task.checklists?.length > 0 && (
                <div
                  className={`comment-badge checklist-badge ${
                    task.checklists.every((c) => c.termine) ? "all-done" : ""
                  }`}
                  title={`${task.checklists.filter((c) => c.termine).length} sur ${task.checklists.length} sous-tâches`}
                >
                  <CheckSquare size={12} />
                  <span>
                    {task.checklists.filter((c) => c.termine).length}/{task.checklists.length}
                  </span>
                </div>
              )}

              {/* Attachments / Links badge */}
              {task.pieces_jointes?.length > 0 && (
                <div className="comment-badge" title="Pièces jointes / Liens">
                  <Paperclip size={12} />
                  <span>{task.pieces_jointes.length}</span>
                </div>
              )}
            </div>

            <div className="card-assignee-right">
              {assigneesList.length > 1 ? (
                <div
                  className="avatar-stack"
                  title={`Assigné à : ${assigneesList.map((u) => u.nom).join(", ")}`}
                >
                  {assigneesList.slice(0, 3).map((u, i) => (
                    <div
                      key={u.id || i}
                      className="avatar-stack-item"
                      style={{ zIndex: 5 - i }}
                    >
                      <UserAvatar user={u} size="xs" />
                    </div>
                  ))}
                  {assigneesList.length > 3 && (
                    <span className="avatar-stack-more">
                      +{assigneesList.length - 3}
                    </span>
                  )}
                </div>
              ) : assigneesList.length === 1 ? (
                <UserAvatar
                  user={assigneesList[0]}
                  size="xs"
                  title={`Assigné à ${assigneesList[0].nom}`}
                />
              ) : (
                <span className="unassigned-hint" title="Non assigné">
                  Libre
                </span>
              )}
            </div>
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
  isCreator,
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

    // Optimistic UI update
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, statut: newStatus } : t,
    );
    setTasksLocal(updatedTasks);

    try {
      await updateTaskStatus(projectId, taskId, newStatus);
    } catch {
      toast.error("Erreur lors du déplacement de la tâche");
      setTasksLocal(tasks);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="trello-board-canvas">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="trello-list-column">
              {/* Column Header */}
              <div className="column-header">
                <div className="column-title-group">
                  <ColIcon
                    size={15}
                    style={{ color: col.color }}
                    strokeWidth={2.4}
                  />
                  <h3 className="column-title">{col.label}</h3>
                  <span className="column-counter">{colTasks.length}</span>
                </div>

                <button
                  className="quick-add-col-btn"
                  onClick={() => onAddTask(col.id)}
                  title="Ajouter une tâche à cette colonne"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-drop-zone ${
                      snapshot.isDraggingOver ? "is-drag-over" : ""
                    }`}
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
                        isCreator={isCreator}
                      />
                    ))}
                    {provided.placeholder}

                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div
                        className="empty-column-placeholder"
                        onClick={() => onAddTask(col.id)}
                      >
                        <Plus size={13} />
                        <span>Ajouter une carte</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>

              {/* Trello "+ Ajouter une carte" Bottom Footer */}
              <div className="column-footer">
                <button
                  className="trello-add-card-btn"
                  onClick={() => onAddTask(col.id)}
                >
                  <Plus size={14} />
                  <span>Ajouter une carte</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .trello-board-canvas {
          display: flex;
          gap: 16px;
          align-items: stretch;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          padding-bottom: 10px;
          flex: 1;
          min-height: 0;
          height: 100%;
        }

        .trello-list-column {
          background: var(--kanban-col-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 100%;
          flex: 0 0 285px;
          width: 285px;
          scroll-snap-align: start;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px 10px;
        }

        .column-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .column-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .column-counter {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 1px 7px;
          border-radius: 9999px;
          border: 1px solid var(--border);
        }

        .quick-add-col-btn {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .quick-add-col-btn:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .column-drop-zone {
          padding: 4px 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 120px;
          flex: 1;
          transition: background var(--transition);
        }

        .column-drop-zone.is-drag-over {
          background: rgba(37, 99, 235, 0.05);
          border-radius: var(--radius-md);
        }

        /* Trello Cards */
        .trello-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all var(--transition);
        }

        .card-cover-band {
          height: 6px;
          border-radius: 3px;
          margin-bottom: 2px;
        }

        .checklist-badge.all-done {
          color: #10b981 !important;
          background: rgba(16, 185, 129, 0.12) !important;
        }

        .trello-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07);
          transform: translateY(-1px);
        }

        .trello-card.is-dragging {
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          transform: rotate(2deg);
          border-color: var(--accent);
          background: #ffffff;
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .card-labels-wrapper {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .prio-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 9999px;
          border: 1px solid transparent;
        }

        .prio-indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .trello-label-tag {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
          background: #f1f5f9;
          padding: 1px 6px;
          border-radius: 9999px;
          border: 1px solid var(--border);
        }

        .card-quick-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          opacity: 0;
          transition: opacity var(--transition);
          margin-left: auto;
        }

        .trello-card:hover .card-quick-actions {
          opacity: 1;
        }

        .card-action-icon {
          width: 22px;
          height: 22px;
          border-radius: var(--radius-xs);
          border: none;
          background: transparent;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .card-action-icon:hover {
          background: #f1f5f9;
          color: var(--text-primary);
        }

        .card-action-icon.danger:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .drag-grip-handle {
          color: var(--text-light);
          cursor: grab;
          display: flex;
          align-items: center;
          padding: 2px;
        }

        .drag-grip-handle:active {
          cursor: grabbing;
        }

        .card-title-text {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          letter-spacing: -0.01em;
        }

        .card-title-text:hover {
          color: var(--accent);
        }

        .card-description-snippet {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .card-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
          margin-top: 2px;
        }

        .card-badges-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .due-date-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: var(--radius-sm);
        }

        .due-date-pill.normal {
          background: #f8fafc;
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        .due-date-pill.overdue {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          font-weight: 600;
        }

        .due-date-pill.done {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .comment-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .card-assignee-right {
          display: flex;
          align-items: center;
        }

        .avatar-stack {
          display: flex;
          align-items: center;
        }

        .avatar-stack-item {
          margin-left: -7px;
          border-radius: 50%;
          box-shadow: 0 0 0 1.5px var(--bg-card);
          transition: transform 0.15s ease;
        }

        .avatar-stack-item:first-child {
          margin-left: 0;
        }

        .avatar-stack-item:hover {
          transform: translateY(-2px) scale(1.1);
          z-index: 10 !important;
        }

        .avatar-stack-more {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-subtle);
          margin-left: -5px;
          border-radius: 9999px;
          padding: 1px 5px;
          box-shadow: 0 0 0 1.5px var(--bg-card);
          z-index: 1;
        }

        .unassigned-hint {
          font-size: 11px;
          color: var(--text-light);
          font-style: italic;
        }

        .empty-column-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 16px 12px;
          border: 1px dashed #cbd5e1;
          border-radius: var(--radius-md);
          font-size: 12px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition);
          margin: 6px 0;
        }

        .empty-column-placeholder:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: #eff6ff;
        }

        .column-footer {
          padding: 8px 10px 10px;
        }

        .trello-add-card-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          transition: all var(--transition);
        }

        .trello-add-card-btn:hover {
          background: #e2e8f0;
          color: var(--text-primary);
        }

        @media (max-width: 540px) {
          .trello-list-column {
            flex: 0 0 calc(100vw - 44px);
            width: calc(100vw - 44px);
          }
        }
      `}</style>
    </DragDropContext>
  );
}
