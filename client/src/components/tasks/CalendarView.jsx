import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import UserAvatar from "../common/UserAvatar";

const STATUT_COLORS = {
  todo: "var(--text-muted)",
  in_progress: "var(--accent)",
  review: "#f59e0b",
  done: "#10b981",
};

const STATUT_LABELS = {
  todo: "À faire",
  in_progress: "En cours",
  review: "En révision",
  done: "Terminé",
};

export default function CalendarView({
  tasks = [],
  onTaskClick,
  onNewTaskWithDate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showUnscheduled, setShowUnscheduled] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter tasks with dates vs without dates
  const datedTasks = tasks.filter((t) => t.echeance);
  const unscheduledTasks = tasks.filter((t) => !t.echeance);

  const getTasksForDay = (day) => {
    return datedTasks.filter((t) => {
      try {
        const d = typeof t.echeance === "string" ? parseISO(t.echeance) : new Date(t.echeance);
        return isSameDay(d, day);
      } catch {
        return false;
      }
    });
  };

  const weekDayHeaders = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="calendar-view-container">
      {/* Calendar Header Controls */}
      <div className="calendar-header-bar">
        <div className="cal-title-section">
          <div className="cal-icon-wrapper">
            <CalendarIcon size={18} />
          </div>
          <h2 className="cal-month-name">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h2>
        </div>

        <div className="cal-actions-section">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={goToToday}
          >
            Aujourd'hui
          </button>
          <div className="cal-nav-buttons">
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={prevMonth}
              title="Mois précédent"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={nextMonth}
              title="Mois suivant"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            className={`btn btn-sm ${showUnscheduled ? "btn-primary" : "btn-outline"}`}
            onClick={() => setShowUnscheduled(!showUnscheduled)}
          >
            <Layers size={14} />
            <span>Sans date ({unscheduledTasks.length})</span>
          </button>
        </div>
      </div>

      <div className="calendar-body-layout">
        {/* Main Calendar Grid */}
        <div className="calendar-grid-card">
          <div className="calendar-weekdays-row">
            {weekDayHeaders.map((dayName, idx) => (
              <div key={idx} className="cal-weekday-cell">
                {dayName}
              </div>
            ))}
          </div>

          <div className="calendar-days-matrix">
            {days.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);
              const dateString = format(day, "yyyy-MM-dd");

              return (
                <div
                  key={day.toISOString()}
                  className={`cal-day-cell ${
                    !isCurrentMonth ? "other-month" : ""
                  } ${isCurrentDay ? "today-cell" : ""}`}
                >
                  <div className="cal-day-header">
                    <span
                      className={`cal-day-number ${
                        isCurrentDay ? "cal-today-badge" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>

                    <button
                      type="button"
                      className="cal-add-task-btn"
                      onClick={() => onNewTaskWithDate?.(dateString)}
                      title={`Ajouter une tâche le ${format(day, "d MMMM", { locale: fr })}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="cal-day-tasks-list">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="cal-task-pill"
                        onClick={() => onTaskClick?.(t)}
                        title={`${t.titre} (${STATUT_LABELS[t.statut] || t.statut})`}
                        style={{
                          borderLeftColor: STATUT_COLORS[t.statut] || "var(--accent)",
                        }}
                      >
                        <span className="cal-task-title">{t.titre}</span>
                        {t.assigne && (
                          <UserAvatar user={t.assigne} size="xs" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unscheduled Tasks Sidebar Drawer */}
        {showUnscheduled && (
          <div className="unscheduled-sidebar card">
            <div className="unscheduled-header">
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={15} color="var(--text-muted)" />
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                  Tâches sans date ({unscheduledTasks.length})
                </h3>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px" }}>
              Cliquez sur une tâche pour lui attribuer une date d'échéance.
            </p>

            <div className="unscheduled-list">
              {unscheduledTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
                  <CheckCircle2 size={24} color="#10b981" style={{ margin: "0 auto 8px" }} />
                  Toutes vos cartes ont une date planifiée !
                </div>
              ) : (
                unscheduledTasks.map((task) => (
                  <div
                    key={task.id}
                    className="unscheduled-item"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="unscheduled-title">{task.titre}</span>
                      <span
                        className="unscheduled-badge"
                        style={{
                          background: `${STATUT_COLORS[task.statut]}18`,
                          color: STATUT_COLORS[task.statut],
                        }}
                      >
                        {STATUT_LABELS[task.statut] || task.statut}
                      </span>
                    </div>
                    {task.assigne && <UserAvatar user={task.assigne} size="xs" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .calendar-view-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          min-height: 580px;
        }

        .calendar-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 10px 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .cal-title-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cal-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--accent-subtle);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cal-month-name {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          text-transform: capitalize;
          margin: 0;
          color: var(--text-primary);
        }

        .cal-actions-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cal-nav-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 2px;
          background: var(--bg-subtle);
        }

        .calendar-body-layout {
          display: flex;
          gap: 16px;
          flex: 1;
          min-height: 0;
        }

        .calendar-grid-card {
          flex: 1;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .calendar-weekdays-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--bg-subtle);
          border-bottom: 1px solid var(--border);
        }

        .cal-weekday-cell {
          padding: 10px;
          text-align: center;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .calendar-days-matrix {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: minmax(95px, 1fr);
          flex: 1;
        }

        .cal-day-cell {
          border-right: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          padding: 6px;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          transition: background 0.15s ease;
          min-height: 95px;
        }

        .cal-day-cell:nth-child(7n) {
          border-right: none;
        }

        .cal-day-cell.other-month {
          background: var(--bg-body);
          opacity: 0.55;
        }

        .cal-day-cell.today-cell {
          background: rgba(2, 132, 199, 0.03);
        }

        .cal-day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .cal-day-number {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .cal-today-badge {
          background: var(--accent);
          color: #ffffff !important;
          font-weight: 700;
        }

        .cal-add-task-btn {
          opacity: 0;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: opacity 0.15s ease;
        }

        .cal-day-cell:hover .cal-add-task-btn {
          opacity: 1;
        }

        .cal-add-task-btn:hover {
          color: var(--accent);
          background: var(--accent-subtle);
        }

        .cal-day-tasks-list {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          overflow-y: auto;
          max-height: 120px;
        }

        .cal-task-pill {
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-left-width: 3px;
          border-radius: 4px;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-primary);
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }

        .cal-task-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          border-color: var(--accent);
        }

        .cal-task-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        /* Unscheduled Sidebar */
        .unscheduled-sidebar {
          width: 280px;
          flex-shrink: 0;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .unscheduled-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 500px;
        }

        .unscheduled-item {
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .unscheduled-item:hover {
          border-color: var(--accent);
          background: var(--bg-surface);
          box-shadow: var(--shadow-sm);
        }

        .unscheduled-title {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-primary);
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .unscheduled-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          border-radius: 100px;
          padding: 1px 6px;
          margin-top: 2px;
        }

        @media (max-width: 900px) {
          .calendar-body-layout {
            flex-direction: column;
          }
          .unscheduled-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
