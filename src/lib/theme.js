// Theme cycle: light green/teal -> light blue -> soft dark -> light green/teal.
const KEY = "internlytic-theme";
const THEMES = ["default", "forest", "dark"];

export function getTheme() {
  try {
    const stored = localStorage.getItem(KEY);
    return THEMES.includes(stored) ? stored : "default";
  } catch {
    return "default";
  }
}

export function applyTheme(theme, { animate = false } = {}) {
  const root = document.documentElement;
  const selected = THEMES.includes(theme) ? theme : "default";

  if (animate) {
    root.classList.add("theme-fading");
    window.setTimeout(() => root.classList.remove("theme-fading"), 650);
  }

  // The dark palette is defined on .dark in styles.css.
  root.classList.toggle("dark", selected === "dark");
  if (selected === "default") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", selected);

  try { localStorage.setItem(KEY, selected); } catch {}
}
