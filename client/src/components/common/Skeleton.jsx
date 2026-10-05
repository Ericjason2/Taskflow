export function Skeleton({
  width,
  height,
  borderRadius,
  className = "",
  style = {},
}) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{
        width: width || "100%",
        height: height || "16px",
        borderRadius: borderRadius || "var(--radius-sm)",
        ...style,
      }}
    />
  );
}

export function BoardSkeleton() {
  return (
    <div className="board-skeleton-wrapper" style={{ padding: "16px 20px" }}>
      {/* Board Header Skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Skeleton width="90px" height="28px" borderRadius="100px" />
          <Skeleton width="180px" height="28px" borderRadius="8px" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <Skeleton width="28px" height="28px" className="skeleton-circle" />
            <Skeleton width="28px" height="28px" className="skeleton-circle" />
            <Skeleton width="28px" height="28px" className="skeleton-circle" />
          </div>
          <Skeleton width="90px" height="32px" borderRadius="6px" />
          <Skeleton width="110px" height="32px" borderRadius="6px" />
        </div>
      </div>

      {/* Board Ribbon Skeleton */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          background: "var(--bg-surface)",
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
      >
        <Skeleton width="260px" height="32px" borderRadius="6px" />
        <Skeleton width="180px" height="32px" borderRadius="6px" />
        <Skeleton width="140px" height="32px" borderRadius="6px" />
      </div>

      {/* Kanban Columns Skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((colIndex) => (
          <div
            key={colIndex}
            style={{
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "12px",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton width="110px" height="20px" borderRadius="4px" />
              <Skeleton width="24px" height="20px" borderRadius="100px" />
            </div>

            {/* Simulated Cards */}
            {[1, 2, 3].slice(0, 4 - colIndex + 1).map((cardIndex) => (
              <div
                key={cardIndex}
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <Skeleton width="50px" height="18px" borderRadius="4px" />
                  <Skeleton width="40px" height="18px" borderRadius="4px" />
                </div>
                <Skeleton width="85%" height="16px" borderRadius="4px" />
                <Skeleton width="60%" height="12px" borderRadius="4px" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <Skeleton width="65px" height="16px" borderRadius="4px" />
                  <Skeleton width="22px" height="22px" className="skeleton-circle" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <Skeleton width="220px" height="28px" borderRadius="6px" style={{ marginBottom: 8 }} />
        <Skeleton width="340px" height="16px" borderRadius="4px" />
      </div>

      {/* Stat cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card"
            style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton width="100px" height="14px" borderRadius="4px" />
              <Skeleton width="36px" height="36px" borderRadius="8px" />
            </div>
            <Skeleton width="50px" height="32px" borderRadius="4px" />
          </div>
        ))}
      </div>

      {/* Main dashboard content skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton width="160px" height="20px" borderRadius="4px" />
          {[1, 2, 3].map((j) => (
            <Skeleton key={j} width="100%" height="60px" borderRadius="8px" />
          ))}
        </div>
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton width="140px" height="20px" borderRadius="4px" />
          {[1, 2, 3, 4].map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Skeleton width="28px" height="28px" className="skeleton-circle" />
              <div style={{ flex: 1 }}>
                <Skeleton width="80%" height="14px" borderRadius="4px" style={{ marginBottom: 4 }} />
                <Skeleton width="40%" height="11px" borderRadius="4px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectListSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
        gap: 16,
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="card"
          style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Skeleton width="12px" height="12px" className="skeleton-circle" />
            <Skeleton width="150px" height="18px" borderRadius="4px" />
          </div>
          <Skeleton width="90%" height="13px" borderRadius="4px" />
          <Skeleton width="100%" height="6px" borderRadius="100px" style={{ marginTop: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <Skeleton width="70px" height="14px" borderRadius="4px" />
            <Skeleton width="50px" height="22px" borderRadius="100px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
