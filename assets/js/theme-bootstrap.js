(() => {
  const STORAGE_KEY = "hediynailart-theme";
  const THEME_META_COLORS = {
    light: "#fffaf8",
    dark: "#16141f",
  };

  const root = document.documentElement;
  const themeMetas = Array.from(
    document.querySelectorAll('meta[name="theme-color"]'),
  );
  const systemTheme =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  let theme = systemTheme;

  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      theme = savedTheme;
    }
  } catch {}

  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  const themeColor = THEME_META_COLORS[theme];
  themeMetas.forEach((meta) => meta.setAttribute("content", themeColor));
})();
