export const PHONE = "989150667527";
export const THEME_STORAGE_KEY = "hediynailart-theme";

export const THEME_META_COLORS = {
  light: "#fffaf8",
  dark: "#16141f",
};

export const IOS_INSTALL_HELP =
  "برای نصب در آیفون: Safari را باز کن، Share را بزن و Add to Home Screen را انتخاب کن.";

export const SERVICES = [
  { id: "gelish", name: "ژلیش" },
  { id: "laminate", name: "لمینیت" },
  { id: "extension", name: "کاشت" },
  { id: "repair", name: "ترمیم" },
  { id: "manicure", name: "مانیکور" },
  { id: "pedicure", name: "پدیکور" },
];

export const GALLERY = Array.from(
  { length: 16 },
  (_, index) => `assets/images/gallery/nail-${index + 1}.webp`,
);

export const SLOT_CONFIG = {
  daysAhead: 10,
  stepMin: 30,
  shifts: [{ startMin: 8 * 60, endMin: 18 * 60 }],
  workingDays: [0, 1, 2, 3, 4],
};
