// Theme switcher: default teal/green <-> alternate light blue.
const KEY = "internlytic-theme";

export function getTheme() {
  try {
    return localStorage.getItem(KEY) === "forest" ? "forest" : "default";
  } catch {
    return "default";
  }
}

export function applyTheme(theme, { animate = false } = {}) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-fading");
    window.setTimeout(() => root.classList.remove("theme-fading"), 650);
  }
  if (theme === "forest") root.setAttribute("data-theme", "forest");
  else root.removeAttribute("data-theme");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage unavailable: theme just won't persist */
  }
}
