import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import useProjectStore from "../store/projectStore";
import useAuthStore from "../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const COLORS = ["#4a5a70", "#f59e0b", "#8b5cf6", "#10b981"];

const activityIcons = {
  project_created: "🗂️",
  task_created: "✅",
  task_status_changed: "🔄",
  project_updated: "✏️",
};

export default function DashboardPage() {
  const {
    stats,
    activities,
    fetchStats,
    fetchActivities,
    projects,
    fetchProjects,
    isLoading,
  } = useProjectStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStats();
    fetchActivities();
    fetchProjects({ limit: 4, sort: "createdAt", order: "DESC" });
  }, []);

  const taskChartData = stats
    ? [
        { name: "À faire", value: stats.taches_todo, color: "#4a5a70" },
        { name: "En cours", value: stats.taches_en_cours, color: "#f59e0b" },
        { name: "Terminées", value: stats.taches_terminees, color: "#10b981" },
      ]
    : [];

  const barData = projects.slice(0, 5).map((p) => ({
    name: p.titre.slice(0, 14) + (p.titre.length > 14 ? "…" : ""),
    tâches: p.stats?.total || 0,
    done: p.stats?.done || 0,
  }));

  const statCards = [
    {
      label: "Projets actifs",
      value: stats?.projets_actifs ?? "—",
      icon: FolderKanban,
      color: "#00d4ff",
    },
    {
      label: "Total tâches",
      value: stats?.total_taches ?? "—",
      icon: CheckSquare,
      color: "#10b981",
    },
    {
      label: "Mes tâches",
      value: stats?.mes_taches ?? "—",
      icon: Clock,
      color: "#8b5cf6",
    },
    {
      label: "En retard",
      value: stats?.taches_en_retard ?? "—",
      icon: AlertTriangle,
      color: "#ef4444",
    },
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bonjour, {user?.nom?.split(" ")[0]}</h1>
          <p className="page-subtitle">
            Voici un aperçu de vos projets en cours
          </p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          <FolderKanban size={16} /> Voir les projets
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            className="stat-card"
            key={label}
            style={{ "--accent-color": color }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div className="stat-value" style={{ color }}>
                  {value}
                </div>
                <div className="stat-label">{label}</div>
              </div>
              <div
                style={{
                  background: `${color}18`,
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Task distribution */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <TrendingUp size={16} color="var(--accent)" />
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-display)",
              }}
            >
              Distribution des tâches
            </h3>
          </div>
          {taskChartData.length > 0 ? (
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={taskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {taskChartData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {taskChartData.map((item, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: COLORS[i],
                      }}
                    />
                    <span
                      style={{ fontSize: 13, color: "var(--text-secondary)" }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginLeft: "auto",
                        paddingLeft: 16,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>Aucune tâche pour l'instant</p>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Activity size={16} color="var(--accent)" />
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-display)",
              }}
            >
              Tâches par projet
            </h3>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="tâches"
                  fill="var(--border-strong)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="done"
                  fill="var(--done-color)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>Aucun projet pour l'instant</p>
            </div>
          )}
        </div>

        {/* Recent projects */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-display)",
              }}
            >
              Projets récents
            </h3>
            <Link
              to="/projects"
              style={{
                fontSize: 12,
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {projects.slice(0, 4).map((p) => (
              <Link
                to={`/projects/${p.id}`}
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  transition: "all var(--transition)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = p.couleur)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: p.couleur,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.titre}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {p.stats?.total || 0} tâches
                </span>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="empty-state" style={{ padding: 24 }}>
                <p>Aucun projet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Activity size={16} color="var(--accent)" />
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-display)",
              }}
            >
              Activité récente
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activities.slice(0, 6).map((a) => (
              <div
                key={a.id}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: "var(--bg-overlay)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {activityIcons[a.type] || "📌"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, lineHeight: 1.4 }}>
                    {a.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <div className="avatar avatar-sm">
                      {a.user?.nom?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {a.user?.nom} ·{" "}
                      {formatDistanceToNow(new Date(a.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="empty-state" style={{ padding: 16 }}>
                <p>Aucune activité</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
