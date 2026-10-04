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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  FolderPlus,
  PlusCircle,
  RefreshCw,
  Edit3,
  Calendar,
  Layers,
} from "lucide-react";
import useProjectStore from "../store/projectStore";
import useAuthStore from "../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const COLORS = ["#64748b", "#f59e0b", "#10b981", "#6366f1"];

const renderActivityIcon = (type) => {
  switch (type) {
    case "project_created":
      return <FolderPlus size={15} color="#0284c7" />;
    case "task_created":
      return <PlusCircle size={15} color="#10b981" />;
    case "task_status_changed":
      return <RefreshCw size={15} color="#f59e0b" />;
    case "project_updated":
      return <Edit3 size={15} color="#8b5cf6" />;
    default:
      return <Layers size={15} color="#64748b" />;
  }
};

export default function DashboardPage() {
  const {
    stats,
    activities,
    fetchStats,
    fetchActivities,
    projects,
    fetchProjects,
  } = useProjectStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStats();
    fetchActivities();
    fetchProjects({ limit: 4, sort: "createdAt", order: "DESC" });
  }, []);

  const taskChartData = stats
    ? [
        { name: "À faire", value: stats.taches_todo || 0, color: "#64748b" },
        { name: "En cours", value: stats.taches_en_cours || 0, color: "#f59e0b" },
        { name: "Terminées", value: stats.taches_terminees || 0, color: "#10b981" },
      ].filter((item) => item.value > 0)
    : [];

  const barData = projects.slice(0, 5).map((p) => ({
    name: p.titre.slice(0, 14) + (p.titre.length > 14 ? "…" : ""),
    tâches: p.stats?.total || 0,
    faites: p.stats?.done || 0,
  }));

  const statCards = [
    {
      label: "Tableaux actifs",
      value: stats?.projets_actifs ?? "—",
      icon: FolderKanban,
      color: "#0284c7",
      bg: "rgba(2, 132, 199, 0.08)",
      border: "rgba(2, 132, 199, 0.2)",
    },
    {
      label: "Total des cartes",
      value: stats?.total_taches ?? "—",
      icon: CheckCircle2,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.08)",
      border: "rgba(16, 185, 129, 0.2)",
    },
    {
      label: "Mes assignations",
      value: stats?.mes_taches ?? "—",
      icon: Clock,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.08)",
      border: "rgba(139, 92, 246, 0.2)",
    },
    {
      label: "En retard",
      value: stats?.taches_en_retard ?? "—",
      icon: AlertTriangle,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.08)",
      border: "rgba(239, 68, 68, 0.2)",
    },
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent)",
                background: "var(--accent-subtle)",
                padding: "2px 8px",
                borderRadius: 6,
                letterSpacing: "0.02em",
              }}
            >
              ESPACE DE TRAVAIL
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: 26, fontWeight: 700 }}>
            Bonjour, {user?.nom?.split(" ")[0]} 👋
          </h1>
          <p className="page-subtitle">
            Voici l'avancement global de vos tableaux et cartes d'équipe
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/projects" className="btn btn-primary">
            <FolderKanban size={15} /> Voir les tableaux
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            className="stat-card"
            key={label}
            style={{
              padding: "20px 22px",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--card-shadow)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    lineHeight: 1.1,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {value}
                </div>
              </div>
              <div
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  padding: 10,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="var(--accent)" />
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  margin: 0,
                }}
              >
                Distribution des cartes
              </h3>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {stats?.total_taches || 0} cartes au total
            </span>
          </div>

          {taskChartData.length > 0 ? (
            <div style={{ display: "flex", gap: 28, alignItems: "center", justifyContent: "space-around" }}>
              <div style={{ width: 140, height: 140, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={65}
                      dataKey="value"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {taskChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, maxWidth: 220 }}>
                {taskChartData.map((item, i) => {
                  const pct = stats?.total_taches
                    ? Math.round((item.value / stats.total_taches) * 100)
                    : 0;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "var(--text-secondary)", flex: 1 }}>
                        {item.name}
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.value}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", width: 34, textAlign: "right" }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "36px 16px", textAlign: "center" }}>
              <CheckCircle2 size={32} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
                Aucune carte enregistrée pour l'instant
              </p>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} color="var(--accent)" />
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  margin: 0,
                }}
              >
                Cartes par tableau
              </h3>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Top 5 tableaux
            </span>
          </div>

          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barCategoryGap="28%">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Bar
                  dataKey="tâches"
                  name="Total"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="faites"
                  name="Terminées"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: "36px 16px", textAlign: "center" }}>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
                Aucun projet pour l'instant
              </p>
            </div>
          )}
        </div>

        {/* Recent boards */}
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FolderKanban size={16} color="var(--accent)" />
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  margin: 0,
                }}
              >
                Tableaux récents
              </h3>
            </div>
            <Link
              to="/projects"
              style={{
                fontSize: 12,
                color: "var(--accent)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Tous les tableaux <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {projects.slice(0, 4).map((p) => {
              const donePct = p.stats?.total
                ? Math.round(((p.stats?.done || 0) / p.stats.total) * 100)
                : 0;
              return (
                <Link
                  to={`/projects/${p.id}`}
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    transition: "all 0.15s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = p.couleur || "var(--accent)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: p.couleur || "#0284c7",
                      flexShrink: 0,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.titre}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "var(--border)",
                          borderRadius: 2,
                          overflow: "hidden",
                          maxWidth: 100,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${donePct}%`,
                            background: "var(--success)",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {p.stats?.done || 0}/{p.stats?.total || 0} cartes
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: donePct === 100 ? "var(--success)" : "var(--text-muted)",
                      background: donePct === 100 ? "var(--success-subtle)" : "transparent",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {donePct}%
                  </span>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <div className="empty-state" style={{ padding: 24, textAlign: "center" }}>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
                  Aucun tableau disponible
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <Activity size={16} color="var(--accent)" />
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                margin: 0,
              }}
            >
              Flux d'activité
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activities.slice(0, 6).map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {renderActivityIcon(a.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.45,
                      margin: 0,
                      color: "var(--text-primary)",
                      fontWeight: 450,
                    }}
                  >
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
                    <div
                      className="avatar avatar-sm"
                      style={{
                        width: 18,
                        height: 18,
                        fontSize: 9,
                        background: "var(--accent-subtle)",
                        color: "var(--accent)",
                        fontWeight: 700,
                      }}
                    >
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
              <div className="empty-state" style={{ padding: 24, textAlign: "center" }}>
                <Clock size={28} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
                  Aucune activité récente enregistrée
                </p>
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
