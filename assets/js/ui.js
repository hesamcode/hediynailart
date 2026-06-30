// ui.js
// ============================================================
// HediyeNailArt - UI Helpers (Toast, Scroll, Utilities)
// ============================================================
import { LANG } from "./config.js";

// ========== 1. متون دوزبانه برای Toast ==========
const TOAST_TEXTS = {
  fa: {
    closeLabel: "بستن پیام",
  },
  en: {
    closeLabel: "Close message",
  },
};

function getToastText(key) {
  return TOAST_TEXTS[LANG]?.[key] ?? TOAST_TEXTS.en[key] ?? key;
}

// ========== 2. escapeHtml ==========
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========== 3. ساخت داینامیک Toast ==========
let toastElements = null;

function ensureToast() {
  // اگر از قبل ساخته شده، برگردان
  if (toastElements) {
    return toastElements;
  }

  // بررسی کن آیا در DOM وجود دارد
  let toast = document.getElementById("app-toast");
  let toastText = document.getElementById("toast-text");
  let toastClose = document.getElementById("toast-close");

  if (toast && toastText && toastClose) {
    // به‌روزرسانی aria-label بر اساس زبان فعلی
    toastClose.setAttribute("aria-label", getToastText("closeLabel"));
    toastElements = { toast, toastText, toastClose };
    return toastElements;
  }

  // ساخت toast از صفر
  toast = document.createElement("div");
  toast.id = "app-toast";
  toast.className = "app-toast hidden";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon" aria-hidden="true">
        <i class="fa-solid fa-circle-info"></i>
      </span>
      <p id="toast-text" class="toast-text"></p>
    </div>
    <button
      id="toast-close"
      class="icon-button"
      type="button"
      aria-label="${getToastText("closeLabel")}"
    >
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  document.body.appendChild(toast);

  toastText = document.getElementById("toast-text");
  toastClose = document.getElementById("toast-close");

  toastElements = { toast, toastText, toastClose };
  return toastElements;
}

// ========== 4. UI Helpers ==========
export function createUiHelpers({ dom, state }) {
  function showToast(text) {
    const { toast, toastText } = ensureToast();
    if (!toast || !toastText) return;

    toastText.textContent = String(text || "");
    toast.classList.remove("hidden");

    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      toast.classList.add("hidden");
    }, 2600);
  }

  function hideToast() {
    const { toast } = ensureToast();
    toast?.classList.add("hidden");
  }

  function scrollToElement(element, options = {}) {
    if (!element) return;
    const { behavior = "smooth", block = "start" } = options;
    element.scrollIntoView({ behavior, block });
  }

  function scrollAppTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // اتصال رویداد بستن toast (یکبار)
  const { toastClose } = ensureToast();
  if (toastClose && !toastClose.dataset.bound) {
    toastClose.dataset.bound = "true";
    toastClose.addEventListener("click", hideToast);
  }

  return {
    showToast,
    hideToast,
    scrollToElement,
    scrollAppTop,
  };
}
