// Theme cycle: light green/teal -> light blue -> light red -> light green/teal.
const KEY = "internlytic-theme";
const THEMES = ["default", "forest", "rose"];

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

  // Keep the existing dark utility class active for theme-aware utilities; the third palette is light red.
  root.classList.toggle("dark", selected === "rose");
  if (selected === "default") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", selected);

  try { localStorage.setItem(KEY, selected); } catch {}
}
