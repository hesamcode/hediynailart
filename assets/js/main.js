import { getDomRefs } from "./dom.js";
import { createAppState } from "./state.js";
import { createUiHelpers } from "./ui.js";
import { bindThemeToggle, initTheme } from "./theme.js";
import { initInstallFlow, registerServiceWorker } from "./pwa.js";
import { initBooking } from "./booking.js";
import { initGallery } from "./gallery.js";

const dom = getDomRefs();
const state = createAppState();
const ui = createUiHelpers({ dom, state });

if (dom.footerYear) {
  dom.footerYear.textContent = String(new Date().getFullYear());
}

dom.toggleHelp?.addEventListener("click", () => {
  dom.helpPanel?.classList.toggle("app-hidden");
});

dom.heroCta?.addEventListener("click", () => {
  ui.scrollToElement(dom.bookingPanel);
});

dom.scrollTop?.addEventListener("click", () => {
  ui.scrollAppTop();
});

dom.toastClose?.addEventListener("click", () => {
  ui.hideToast();
});

initTheme({ dom, state });
bindThemeToggle({ dom, state });

initInstallFlow({ dom, state, showToast: ui.showToast });
registerServiceWorker(ui.showToast);

initBooking({ dom, state, showToast: ui.showToast });
initGallery({ dom, state });

dom.app?.scrollTo({ top: 0 });
