import { create } from "zustand";

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("tf_theme");
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (_) {}
  return "light";
};

const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  initTheme: () => {
    const current = get().theme;
    document.documentElement.setAttribute("data-theme", current);
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("tf_theme", next);
    } catch (_) {}
    document.documentElement.setAttribute("data-theme", next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem("tf_theme", theme);
    } catch (_) {}
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
}));

export default useThemeStore;
