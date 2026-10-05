export default function UserAvatar({
  user,
  name,
  avatar,
  size = "sm",
  className = "",
  style = {},
  title,
}) {
  const avatarUrl = avatar || user?.avatar;
  const displayName = name || user?.nom || "Utilisateur";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "TF";

  const sizeStyles = {
    xs: { width: 22, height: 22, fontSize: 10 },
    sm: { width: 28, height: 28, fontSize: 11 },
    md: { width: 36, height: 36, fontSize: 13 },
    lg: { width: 44, height: 44, fontSize: 16 },
    xl: { width: 72, height: 72, fontSize: 24 },
  };

  const dim = sizeStyles[size] || sizeStyles.sm;

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      title={title || displayName}
      style={{
        ...dim,
        borderRadius: "50%",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        flexShrink: 0,
        position: "relative",
        background: "var(--accent-subtle)",
        color: "var(--accent)",
        border: "1px solid var(--border)",
        ...style,
      }}
    >
      <span style={{ position: "absolute", pointerEvents: "none" }}>{initials}</span>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={displayName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "relative",
            zIndex: 1,
            borderRadius: "50%",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}
