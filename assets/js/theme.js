import { THEME_META_COLORS, THEME_STORAGE_KEY } from "./config.js";

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSavedTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch {}

  return null;
}

function syncThemeControls({ dom, theme }) {
  const isDark = theme === "dark";

  if (dom.themeToggle) {
    dom.themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    dom.themeToggle.setAttribute(
      "aria-label",
      isDark ? "فعال سازی تم روشن" : "فعال سازی تم تاریک",
    );
    dom.themeToggle.setAttribute("title", isDark ? "تم روشن" : "تم تاریک");
  }

  if (dom.themeToggleIcon) {
    dom.themeToggleIcon.className = `fa-solid ${isDark ? "fa-sun" : "fa-moon"}`;
  }

  if (dom.themeColorMeta) {
    dom.themeColorMeta.setAttribute(
      "content",
      isDark ? THEME_META_COLORS.dark : THEME_META_COLORS.light,
    );
  }

  if (dom.appleStatusBarMeta) {
    dom.appleStatusBarMeta.setAttribute(
      "content",
      isDark ? "black-translucent" : "default",
    );
  }
}

export function applyTheme({ dom, state, theme, persist = true }) {
  const nextTheme = normalizeTheme(theme);

  state.theme = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
  syncThemeControls({ dom, theme: nextTheme });

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {}
  }
}

export function initTheme({ dom, state }) {
  const initialTheme =
    document.documentElement.getAttribute("data-theme") ||
    getSavedTheme() ||
    getSystemTheme();

  applyTheme({
    dom,
    state,
    theme: initialTheme,
    persist: false,
  });

  const hasSavedTheme = getSavedTheme() !== null;
  if (hasSavedTheme || !window.matchMedia) {
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = (event) => {
    applyTheme({
      dom,
      state,
      theme: event.matches ? "dark" : "light",
      persist: false,
    });
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleSystemThemeChange);
  }
}

export function bindThemeToggle({ dom, state }) {
  dom.themeToggle?.addEventListener("click", () => {
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    applyTheme({ dom, state, theme: nextTheme, persist: true });
  });
}
