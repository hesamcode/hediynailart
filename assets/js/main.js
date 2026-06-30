// main.js
// ============================================================
// HediyeNailArt - Main Entry Point
// این فایل در همه صفحات لود می‌شود
// context را export می‌کند و side effect ها را conditional اجرا می‌کند
// ============================================================
import { getDomRefs } from "./dom.js";
import { createAppState } from "./state.js";
import { createUiHelpers } from "./ui.js";
import { bindThemeToggle, initTheme } from "./theme.js";
import { initInstallFlow, registerServiceWorker } from "./pwa.js";
import { initBooking } from "./booking.js";
import { initGallery } from "./gallery.js";

// ========== 1. Export Context (برای استفاده در post.js و blog.js) ==========
export const dom = getDomRefs();
export const state = createAppState();
export const ui = createUiHelpers({ dom, state });

// ========== 2. تنظیمات اولیه (همیشه اجرا می‌شوند) ==========
if (dom.footerYear) {
  dom.footerYear.textContent = String(new Date().getFullYear());
}

// ========== 3. Event Listeners مشترک ==========
dom.toggleHelp?.addEventListener("click", () => {
  dom.helpPanel?.classList.toggle("hidden");
});

dom.heroCta?.addEventListener("click", () => {
  ui.scrollToElement(dom.bookingPanel);
});

dom.scrollTop?.addEventListener("click", () => {
  ui.scrollAppTop();
});

// ========== 4. تم (همیشه اجرا می‌شود - در همه صفحات لازم است) ==========
if (dom.themeToggle) {
  initTheme({ dom, state });
  bindThemeToggle({ dom, state });
}

// ========== 5. PWA (فقط در صورت وجود دکمه install) ==========
if (dom.installApp) {
  initInstallFlow({ dom, state, showToast: ui.showToast });
}

// Service Worker در همه صفحات ثبت می‌شود
registerServiceWorker(ui.showToast);

// ========== 6. Booking (فقط در صفحه اصلی) ==========
if (dom.servicesInline) {
  initBooking({ dom, state, showToast: ui.showToast });
}

// ========== 7. Gallery (فقط در صفحه اصلی) ==========
if (dom.galleryCard) {
  initGallery({ dom, state });
}

// ========== 8. اسکرول به بالا در لود صفحه ==========
dom.body?.scrollTo({ top: 0 });

// ========== 9. مدیریت تغییر زبان ==========
const langSwitch = document.getElementById("lang-switch");
if (langSwitch) {
  langSwitch.addEventListener("click", () => {
    const targetLang = langSwitch.getAttribute("href")?.includes("/en/")
      ? "en"
      : "fa";
    try {
      localStorage.setItem("preferredLang", targetLang);
    } catch (e) {
      // ignore
    }
  });
}
