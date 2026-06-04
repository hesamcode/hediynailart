// config.js
// ============================================================
// HediyeNailArt - Main Configuration
// ============================================================

export const PHONE = "989150667527";
export const THEME_STORAGE_KEY = "hediynailart-theme";

export const THEME_META_COLORS = {
  light: "#fffaf8",
  dark: "#16141f",
};

// config.js
export function IOS_INSTALL_HELP() {
  if (LANG === "en") {
    return "To install on iPhone: Open Safari, tap Share, then select Add to Home Screen.";
  }
  return "برای نصب در آیفون: Safari را باز کن، Share را بزن و Add to Home Screen را انتخاب کن.";
}

// ============================================================
// Language Detection
// ============================================================
export function getCurrentLang() {
  const path = window.location.pathname;
  if (path.includes("/en/")) return "en";
  return "fa";
}

export const LANG = getCurrentLang();

export function saveLanguagePreference(targetLang) {
  try {
    localStorage.setItem("preferredLang", targetLang);
  } catch (e) {
    // ignore
  }
}

// ============================================================
// Services (Bilingual)
// ============================================================
export const SERVICES = {
  fa: [
    { id: "gelish", name: "ژلیش" },
    { id: "laminate", name: "لمینیت" },
    { id: "extension", name: "کاشت" },
    { id: "repair", name: "ترمیم" },
    { id: "manicure", name: "مانیکور" },
    { id: "pedicure", name: "پدیکور" },
  ],
  en: [
    { id: "gelish", name: "Gelish" },
    { id: "laminate", name: "Laminate" },
    { id: "extension", name: "Extension" },
    { id: "repair", name: "Repair" },
    { id: "manicure", name: "Manicure" },
    { id: "pedicure", name: "Pedicure" },
  ],
};

export function getServices() {
  return SERVICES[LANG] || SERVICES.fa;
}

// ============================================================
// Gallery Images
// ============================================================
export const GALLERY = Array.from(
  { length: 16 },
  (_, index) => `/assets/images/gallery/nail-${index + 1}.webp`,
);

// ============================================================
// Time Slot Configuration
// ============================================================
export const SLOT_CONFIG = {
  daysAhead: 10,
  stepMin: 30,
  shifts: [{ startMin: 8 * 60, endMin: 18 * 60 }],
  workingDays: [0, 1, 2, 3, 4], // Sunday to Thursday
};

// ============================================================
// UI Texts (for dynamic elements)
// ============================================================
export const UI_TEXTS = {
  fa: {
    // Toast messages
    maxServices: "حداکثر ۳ خدمت قابل انتخاب است.",
    selectServiceFirst: "لطفاً حداقل یک خدمت رو انتخاب کن.",
    selectDateFirst: "لطفاً تاریخ را انتخاب کن.",
    selectTimeFirst: "لطفاً زمان دلخواه را انتخاب کن.",
    selectDateTimeFirst: "لطفاً اطلاعات رزرو را کامل کن.",
    noTimeForDay:
      "برای این روز، زمان پیشنهادی موجود نیست. روز دیگری انتخاب کن.",
    // Help panel
    helpTitle: "راهنما",
    helpItems: [
      "حداکثر ۳ خدمت قابل انتخاب است.",
      "تاریخ و زمان دلخواه را مستقیم از لیست همان بخش انتخاب کن.",
      "در پایان، واتساپ با متن آماده باز می‌شود.",
    ],
    // Date labels
    today: "امروز",
    tomorrow: "فردا",
    nearestTime: "نزدیکترین زمان",
    customTime: "زمان دلخواه",
    customDate: "تاریخ دلخواه",
    selectDateFirstHint: "ابتدا تاریخ را انتخاب کن.",
    // Summary
    selectedServices: "خدمات انتخابی",
    selectedTime: "زمان انتخابی",
    // Helper text
    helperText: "رزرو نهایی بعد از هماهنگی در واتساپ انجام می‌شود.",
    // Install
    appInstalled: "اپلیکیشن همین الان نصب است.",
    installSuccess: "نصب اپلیکیشن انجام شد.",
    installLater: "هر زمان خواستی میتونی از دکمه نصب استفاده کنی.",
    installFailed: "باز شدن پنجره نصب ممکن نشد.",
    installFromMenu: "از منوی مرورگر، گزینه Install app را انتخاب کن.",
    newVersionReady: "نسخه جدید آماده است. یک بار صفحه را رفرش کن.",
  },
  en: {
    // Toast messages
    maxServices: "You can select up to 3 services.",
    selectServiceFirst: "Please select at least one service.",
    selectDateFirst: "Please select a date.",
    selectTimeFirst: "Please select a time.",
    selectDateTimeFirst: "Please complete the booking information.",
    noTimeForDay:
      "No available time slots for this day. Please select another day.",
    // Help panel
    helpTitle: "Help",
    helpItems: [
      "You can select up to 3 services.",
      "Select date and time directly from the lists below.",
      "WhatsApp will open with a pre-written message.",
    ],
    // Date labels
    today: "Today",
    tomorrow: "Tomorrow",
    nearestTime: "Nearest available",
    customTime: "Custom time",
    customDate: "Custom date",
    selectDateFirstHint: "Please select a date first.",
    // Summary
    selectedServices: "Selected Services",
    selectedTime: "Selected Time",
    // Helper text
    helperText: "Final booking will be confirmed via WhatsApp.",
    // Install
    appInstalled: "App is already installed.",
    installSuccess: "App installation completed.",
    installLater: "You can use the install button anytime.",
    installFailed: "Could not open installation window.",
    installFromMenu: "Select 'Install app' from your browser menu.",
    newVersionReady: "New version is ready. Please refresh the page.",
  },
};

export function getUIText(key) {
  return UI_TEXTS[LANG]?.[key] ?? UI_TEXTS.en[key] ?? key;
}
