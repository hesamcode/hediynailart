import { IOS_INSTALL_HELP } from "./config.js";

function isStandaloneMode() {
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

function isIosDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

function syncInstallButton({ dom, state }) {
  if (!dom.installApp) {
    return;
  }

  const shouldShow =
    !isStandaloneMode() && (Boolean(state.deferredInstallPrompt) || isIosDevice());

  dom.installApp.classList.toggle("app-hidden", !shouldShow);
  dom.installApp.setAttribute("aria-label", "نصب اپلیکیشن");
  dom.installApp.setAttribute("title", "نصب اپلیکیشن");
  dom.installApp.innerHTML = '<i class="fa-solid fa-download" aria-hidden="true"></i>';
}

async function triggerInstall({ dom, state, showToast }) {
  if (isStandaloneMode()) {
    showToast("اپلیکیشن همین الان نصب است.");
    return;
  }

  if (state.deferredInstallPrompt) {
    const promptEvent = state.deferredInstallPrompt;
    state.deferredInstallPrompt = null;
    syncInstallButton({ dom, state });

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice?.outcome === "accepted") {
        showToast("نصب اپلیکیشن انجام شد.");
      } else {
        showToast("هر زمان خواستی میتونی از دکمه نصب استفاده کنی.");
      }
    } catch {
      showToast("باز شدن پنجره نصب ممکن نشد.");
    }
    return;
  }

  if (isIosDevice()) {
    showToast(IOS_INSTALL_HELP);
    return;
  }

  showToast("از منوی مرورگر، گزینه Install app را انتخاب کن.");
}

export function initInstallFlow({ dom, state, showToast }) {
  dom.installApp?.addEventListener("click", () => {
    void triggerInstall({ dom, state, showToast });
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    syncInstallButton({ dom, state });
  });

  window.addEventListener("appinstalled", () => {
    state.deferredInstallPrompt = null;
    syncInstallButton({ dom, state });
    showToast("اپلیکیشن به صفحه اصلی اضافه شد.");
  });

  syncInstallButton({ dom, state });
}

export function registerServiceWorker(showToast) {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker
    .register("./sw.js")
    .then((registration) => {
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) {
          return;
        }

        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            showToast("نسخه جدید آماده است. یک بار صفحه را رفرش کن.");
          }
        });
      });
    })
    .catch(() => {});
}
