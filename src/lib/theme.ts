export type Theme = "dark" | "light";

const KEY = "app-theme";

export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const t = localStorage.getItem(KEY);
  return t === "light" ? "light" : "dark";
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === "light") root.classList.remove("dark");
  else root.classList.add("dark");
  localStorage.setItem(KEY, theme);
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
};

export const initTheme = () => applyTheme(getStoredTheme());
