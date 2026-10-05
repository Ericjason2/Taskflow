import { Sun, Moon } from "lucide-react";
import useThemeStore from "../../store/themeStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
      aria-label="Changer de thème"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
      <style>{`
        .theme-toggle-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .theme-toggle-btn:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }
      `}</style>
    </button>
  );
}
