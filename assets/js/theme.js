// theme.js
// ============================================================
// HediyeNailArt - Theme Management (یکپارچه)
// ============================================================

import { THEME_META_COLORS, THEME_STORAGE_KEY } from "./config.js";

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

function getSystemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
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
  const themeColor = isDark ? THEME_META_COLORS.dark : THEME_META_COLORS.light;

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
    dom.themeColorMeta.setAttribute("content", themeColor);
  }
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", themeColor));

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
  // ابتدا از localStorage، سپس از system، و در آخر از data-theme
  const savedTheme = getSavedTheme();
  const systemTheme = getSystemTheme();
  const initialTheme = savedTheme || systemTheme || "light";

  // اعمال تم
  applyTheme({
    dom,
    state,
    theme: initialTheme,
    persist: false,
  });

  // گوش دادن به تغییرات سیستم
  if (!window.matchMedia) {
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = (event) => {
    // فقط اگر کاربر تم را ذخیره نکرده باشه، تغییر کن
    if (!getSavedTheme()) {
      applyTheme({
        dom,
        state,
        theme: event.matches ? "dark" : "light",
        persist: false,
      });
    }
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
