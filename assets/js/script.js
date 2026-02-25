(() => {
  "use strict";

  const PHONE = "989150667527"; // wa.me
  const THEME_STORAGE_KEY = "hediynailart-theme";
  const APP_INSTALLED_STORAGE_KEY = "hediynailart-installed";
  const THEME_META_COLORS = {
    light: "#fffaf8",
    dark: "#16141f",
  };
  const IOS_INSTALL_HELP =
    "برای نصب در آیفون: Safari را باز کن، Share را بزن و Add to Home Screen را انتخاب کن.";

  const SERVICES = [
    { id: "gelish", name: "ژلیش" },
    { id: "laminate", name: "لمینیت" },
    { id: "extension", name: "کاشت" },
    { id: "repair", name: "ترمیم" },
    { id: "manicure", name: "مانیکور" },
    { id: "pedicure", name: "پدیکور" },
  ];

  // Gallery (16 images)
  const GALLERY = Array.from(
    { length: 16 },
    (_, i) => `assets/images/gallery/nail-${i + 1}.webp`,
  );

  // Slots independent of services
  const SLOT_CONFIG = {
    daysAhead: 10, // number of WORKING days to show
    stepMin: 30,
    shifts: [{ startMin: 8 * 60, endMin: 18 * 60 }],
    workingDays: [0, 1, 2, 3, 4], // یکشنبه تا پنجشنبه (0=Sun ... 6=Sat)
  };

  const $ = (id) => document.getElementById(id);

  const dom = {
    app: $("app"),

    heroCta: $("hero-cta"),
    heroFastCta: $("hero-fast-cta"),
    bookingPanel: $("booking-panel"),

    toggleHelp: $("toggle-help"),
    helpPanel: $("help-panel"),

    installApp: $("install-app"),
    themeToggle: $("theme-toggle"),
    themeToggleIcon: $("theme-toggle-icon"),
    themeColorMeta: $("theme-color-meta"),

    servicesInline: $("services-inline"),
    dateChips: $("date-chips"),
    timeChips: $("time-chips"),
    bookingNote: $("booking-note"),

    summaryServices: $("summary-services"),
    summaryDatetime: $("summary-datetime"),
    startWhatsapp: $("start-whatsapp"),

    galleryCard: $("gallery-card"),
    galleryImage: $("gallery-image"),
    galleryDots: $("gallery-dots"),

    scrollTop: $("scroll-top"),
    footerYear: $("footer-year"),

    toast: $("app-toast"),
    toastText: $("toast-text"),
    toastClose: $("toast-close"),
  };

  const state = {
    selectedServiceIds: new Set(),
    selectedDayKey: "",
    selectedTimeMin: null, // minute-of-day | null
    dateMode: "today",
    timeMode: "nearest",
    customDayKey: "",

    galleryIndex: 0,
    autoTimer: null,
    theme: "light",
    deferredInstallPrompt: null,
    isAppInstalled: false,

    swipe: { active: false, startX: 0, startY: 0, locked: false },
    toastTimer: null,
  };

  // =========================
  // Small utils
  // =========================
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toDayKey(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
      date.getDate(),
    )}`;
  }

  function fromDayKey(dayKey) {
    const [y, m, d] = dayKey.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function dateFaShort(dayKey) {
    const d = fromDayKey(dayKey);
    const weekday = d.toLocaleDateString("fa-IR", { weekday: "short" });
    const md = d.toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    });
    return { weekday, md };
  }

  function weekdayFaLong(dayKey) {
    return fromDayKey(dayKey).toLocaleDateString("fa-IR", { weekday: "long" });
  }

  function dayKeyWithOffset(offset) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return toDayKey(d);
  }

  function dateFromDayKeyAndMinute(dayKey, minute) {
    const d = fromDayKey(dayKey);
    d.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    return d;
  }

  function timeFa(date) {
    return date.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function minutesNow() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  function showToast(text) {
    if (!dom.toast || !dom.toastText) return;

    dom.toastText.textContent = String(text || "");
    dom.toast.classList.remove("app-hidden");

    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      dom.toast?.classList.add("app-hidden");
    }, 2600);
  }

  function normalizeTheme(theme) {
    return theme === "dark" ? "dark" : "light";
  }

  function syncThemeControls(theme) {
    const isDark = theme === "dark";

    if (dom.themeToggle) {
      dom.themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      dom.themeToggle.setAttribute(
        "aria-label",
        isDark ? "فعال‌سازی تم روشن" : "فعال‌سازی تم تاریک",
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
  }

  function applyTheme(theme, options = {}) {
    const { persist = true } = options;
    const nextTheme = normalizeTheme(theme);

    state.theme = nextTheme;
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
    syncThemeControls(nextTheme);

    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {}
    }
  }

  function initTheme() {
    const systemTheme =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    const initial = normalizeTheme(
      document.documentElement.getAttribute("data-theme") || systemTheme,
    );

    applyTheme(initial, { persist: false });
  }

  function isStandaloneMode() {
    return (
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true
    );
  }

  function isIosDevice() {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }

  function saveInstalledState(value) {
    state.isAppInstalled = Boolean(value);
    try {
      localStorage.setItem(APP_INSTALLED_STORAGE_KEY, value ? "1" : "0");
    } catch {}
  }

  function syncInstallButtonMode(mode) {
    if (!dom.installApp) return;

    if (mode === "open") {
      dom.installApp.classList.add("open-mode");
      dom.installApp.setAttribute("aria-label", "باز کردن اپلیکیشن");
      dom.installApp.setAttribute("title", "Open");
      dom.installApp.innerHTML = `
        <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
        <span class="install-label">Open</span>
      `;
      return;
    }

    dom.installApp.classList.remove("open-mode");
    dom.installApp.setAttribute("aria-label", "نصب اپلیکیشن");
    dom.installApp.setAttribute("title", "نصب اپلیکیشن");
    dom.installApp.innerHTML =
      '<i class="fa-solid fa-download" aria-hidden="true"></i>';
  }

  function syncInstallButton() {
    if (!dom.installApp) return;

    const standalone = isStandaloneMode();
    const showOpen = state.isAppInstalled && !standalone;
    const showInstall =
      !standalone &&
      (Boolean(state.deferredInstallPrompt) || isIosDevice());
    const shouldShow = showOpen || showInstall;

    syncInstallButtonMode(showOpen ? "open" : "install");
    dom.installApp.classList.toggle("app-hidden", !shouldShow);
  }

  async function installApp() {
    if (state.isAppInstalled && !isStandaloneMode()) {
      window.location.href = "./?source=open-app";
      return;
    }

    if (isStandaloneMode()) {
      showToast("اپلیکیشن همین الان نصب است.");
      return;
    }

    if (state.deferredInstallPrompt) {
      const promptEvent = state.deferredInstallPrompt;
      state.deferredInstallPrompt = null;
      syncInstallButton();

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === "accepted") {
          saveInstalledState(true);
          syncInstallButton();
          showToast("نصب اپلیکیشن انجام شد.");
        } else {
          showToast("هر زمان خواستی می‌تونی از دکمه نصب استفاده کنی.");
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

  function initInstallFlow() {
    if (isStandaloneMode()) {
      saveInstalledState(true);
    } else {
      try {
        state.isAppInstalled =
          localStorage.getItem(APP_INSTALLED_STORAGE_KEY) === "1";
      } catch {}
    }

    if (dom.installApp) {
      dom.installApp.addEventListener("click", () => {
        void installApp();
      });
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      syncInstallButton();
    });

    window.addEventListener("appinstalled", () => {
      saveInstalledState(true);
      state.deferredInstallPrompt = null;
      syncInstallButton();
      showToast("اپلیکیشن به صفحه اصلی اضافه شد.");
    });

    syncInstallButton();
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              showToast("نسخه جدید آماده است. یک بار صفحه را رفرش کن.");
            }
          });
        });
      })
      .catch(() => {});
  }

  // Generic scroll helper (DRY)
  function scrollToEl(el, options = {}) {
    if (!el) return;
    const { behavior = "smooth", block = "start" } = options;
    el.scrollIntoView({ behavior, block });
  }

  function scrollAppTop() {
    dom.app?.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =========================
  // Labels
  // =========================
  function selectedServicesLabel() {
    const names = SERVICES.filter((s) =>
      state.selectedServiceIds.has(s.id),
    ).map((s) => s.name);
    return names.length ? names.join(" + ") : "—";
  }

  function selectedDatetimeLabel() {
    if (!state.selectedDayKey) return "—";

    const { weekday, md } = dateFaShort(state.selectedDayKey);

    if (state.timeMode === "nearest") {
      return `${weekday} ${md} - نزدیک‌ترین زمان ممکن`;
    }

    if (state.selectedTimeMin == null) {
      return `${weekday} ${md} - زمان دلخواه`;
    }

    const dt = dateFromDayKeyAndMinute(
      state.selectedDayKey,
      state.selectedTimeMin,
    );
    return `${weekday} ${md} - ${timeFa(dt)}`;
  }

  // =========================
  // Services (tap toggle)
  // =========================
  function renderServicesInline() {
    if (!dom.servicesInline) return;
    dom.servicesInline.innerHTML = "";

    SERVICES.forEach((service) => {
      const selected = state.selectedServiceIds.has(service.id);

      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (selected ? " selected" : "");
      chip.setAttribute("aria-pressed", selected ? "true" : "false");

      chip.innerHTML = `
        <span class="chip-icon" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
        <span>${service.name}</span>
      `;

      chip.addEventListener("click", () => {
        if (selected) state.selectedServiceIds.delete(service.id);
        else {
          if (state.selectedServiceIds.size >= 3) {
            showToast("حداکثر ۳ خدمت قابل انتخاب است.");
            return;
          }
          state.selectedServiceIds.add(service.id);
        }

        renderServicesInline();
        syncSummary();
      });

      dom.servicesInline.appendChild(chip);
    });
  }

  // =========================
  // Working days + slots
  // =========================
  function isWorkingDay(date) {
    return SLOT_CONFIG.workingDays.includes(date.getDay());
  }

  // Build available slots for a specific dayKey
  function buildSlotsForDay(dayKey) {
    const dayDate = fromDayKey(dayKey);
    const slots = [];

    const now = new Date();
    const isToday =
      dayDate.getFullYear() === now.getFullYear() &&
      dayDate.getMonth() === now.getMonth() &&
      dayDate.getDate() === now.getDate();

    // Round "now" UP to next step (so 10:10 -> 10:30 when stepMin=30)
    const currentMin = isToday
      ? Math.ceil(minutesNow() / SLOT_CONFIG.stepMin) * SLOT_CONFIG.stepMin
      : null;

    SLOT_CONFIG.shifts.forEach((shift) => {
      for (
        let minute = shift.startMin;
        minute <= shift.endMin - SLOT_CONFIG.stepMin;
        minute += SLOT_CONFIG.stepMin
      ) {
        if (isToday && minute < currentMin) continue;

        const start = new Date(dayDate);
        start.setHours(0, 0, 0, 0);
        start.setMinutes(minute);

        slots.push(start);
      }
    });

    return slots;
  }

  // Show next N working days; if today has no slots, start from next day
  function computeWorkingDayKeys() {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const todayWorking = isWorkingDay(base);
    const todayKey = toDayKey(base);
    const todayHasSlots = todayWorking && buildSlotsForDay(todayKey).length > 0;

    if (todayWorking && !todayHasSlots) {
      base.setDate(base.getDate() + 1);
    }

    const days = [];
    let offset = 0;

    while (days.length < SLOT_CONFIG.daysAhead) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);

      if (isWorkingDay(d)) {
        const dayKey = toDayKey(d);
        if (buildSlotsForDay(dayKey).length) days.push(dayKey);
      }
      offset += 1;
    }

    return days;
  }

  function buildPrimaryDateChoices(dayKeys) {
    const todayKey = dayKeyWithOffset(0);
    const tomorrowKey = dayKeyWithOffset(1);

    const firstKey = dayKeys[0] || "";
    const secondKey = dayKeys[1] || firstKey;

    const firstLabel = firstKey
      ? firstKey === todayKey
        ? "امروز"
        : weekdayFaLong(firstKey)
      : "—";
    const secondLabel = secondKey
      ? secondKey === tomorrowKey
        ? "فردا"
        : weekdayFaLong(secondKey)
      : "—";

    return [
      { mode: "today", label: firstLabel, dayKey: firstKey },
      { mode: "tomorrow", label: secondLabel, dayKey: secondKey },
      { mode: "custom", label: "تاریخ دلخواه", dayKey: state.customDayKey },
    ];
  }

  // =========================
  // Date chips
  // =========================
  function renderDateChips() {
    if (!dom.dateChips) return;
    const days = computeWorkingDayKeys();
    dom.dateChips.innerHTML = "";

    if (!days.length) {
      dom.dateChips.innerHTML = `<div class="helper-text">فعلاً زمان کاری در دسترس نیست.</div>`;
      state.selectedDayKey = "";
      state.selectedTimeMin = null;
      renderTimeChips();
      return;
    }

    if (!state.customDayKey || !days.includes(state.customDayKey)) {
      state.customDayKey = days[0];
    }

    if (!["today", "tomorrow", "custom"].includes(state.dateMode)) {
      state.dateMode = "today";
    }

    const choices = buildPrimaryDateChoices(days);

    if (state.dateMode === "today") {
      state.selectedDayKey = choices[0].dayKey;
    } else if (state.dateMode === "tomorrow") {
      state.selectedDayKey = choices[1].dayKey;
    } else {
      state.selectedDayKey = state.customDayKey;
    }

    if (!state.selectedDayKey || !days.includes(state.selectedDayKey)) {
      state.dateMode = "today";
      state.selectedDayKey = choices[0].dayKey;
    }

    choices.slice(0, 2).forEach((choice) => {
      const selected = state.dateMode === choice.mode;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip date-chip" + (selected ? " selected" : "");
      chip.setAttribute("aria-pressed", selected ? "true" : "false");

      chip.innerHTML = `
        <span class="chip-icon" aria-hidden="true"><i class="fa-solid fa-calendar-days"></i></span>
        <span class="date-title">${choice.label}</span>
      `;

      chip.addEventListener("click", () => {
        state.dateMode = choice.mode;
        state.timeMode = "nearest";
        state.selectedTimeMin = null;
        renderDateChips();
      });

      dom.dateChips.appendChild(chip);
    });

    const customDateSelect = document.createElement("select");
    customDateSelect.className =
      "chip-select" + (state.dateMode === "custom" ? " selected" : "");
    customDateSelect.setAttribute("aria-label", "انتخاب تاریخ دلخواه");

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "تاریخ دلخواه";
    customDateSelect.appendChild(placeholder);

    days.forEach((dayKey) => {
      const { weekday, md } = dateFaShort(dayKey);
      const option = document.createElement("option");
      option.value = dayKey;
      option.textContent = `${weekday} ${md}`;
      customDateSelect.appendChild(option);
    });

    customDateSelect.value =
      state.dateMode === "custom" ? state.customDayKey : "";
    customDateSelect.addEventListener("change", (event) => {
      const nextDay = event.target.value;
      if (!nextDay) return;

      state.customDayKey = nextDay;
      state.dateMode = "custom";
      state.selectedDayKey = nextDay;
      state.timeMode = "nearest";
      state.selectedTimeMin = null;
      renderDateChips();
    });

    dom.dateChips.appendChild(customDateSelect);
    renderTimeChips();
  }

  // =========================
  // Time chips
  // =========================
  function renderTimeChips() {
    if (!dom.timeChips) return;
    dom.timeChips.innerHTML = "";

    if (!state.selectedDayKey) {
      dom.timeChips.innerHTML = `<div class="helper-text">ابتدا تاریخ را انتخاب کن.</div>`;
      state.selectedTimeMin = null;
      syncSummary();
      return;
    }

    const slots = buildSlotsForDay(state.selectedDayKey);

    if (!slots.length) {
      dom.timeChips.innerHTML = `<div class="helper-text">برای این روز، زمان پیشنهادی موجود نیست. روز دیگری انتخاب کن.</div>`;
      state.selectedTimeMin = null;
      syncSummary();
      return;
    }

    const slotMins = slots.map((s) => s.getHours() * 60 + s.getMinutes());
    if (!["nearest", "custom"].includes(state.timeMode)) {
      state.timeMode = "nearest";
    }

    if (
      state.timeMode === "custom" &&
      (state.selectedTimeMin == null ||
        !slotMins.includes(state.selectedTimeMin))
    ) {
      state.selectedTimeMin = null;
    }

    const nearestChip = document.createElement("button");
    nearestChip.type = "button";
    nearestChip.className =
      "chip time-chip" + (state.timeMode === "nearest" ? " selected" : "");
    nearestChip.setAttribute(
      "aria-pressed",
      state.timeMode === "nearest" ? "true" : "false",
    );
    nearestChip.innerHTML = `
      <span class="chip-icon" aria-hidden="true"><i class="fa-solid fa-clock"></i></span>
      <span>نزدیک‌ترین زمان</span>
    `;
    nearestChip.addEventListener("click", () => {
      state.timeMode = "nearest";
      renderTimeChips();
    });

    const customTimeSelect = document.createElement("select");
    customTimeSelect.className =
      "chip-select" + (state.timeMode === "custom" ? " selected" : "");
    customTimeSelect.setAttribute("aria-label", "انتخاب زمان دلخواه");

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "زمان دلخواه";
    customTimeSelect.appendChild(placeholder);

    slots.forEach((slot) => {
      const minute = slot.getHours() * 60 + slot.getMinutes();
      const option = document.createElement("option");
      option.value = String(minute);
      option.textContent = timeFa(slot);
      customTimeSelect.appendChild(option);
    });

    customTimeSelect.value =
      state.timeMode === "custom" && state.selectedTimeMin != null
        ? String(state.selectedTimeMin)
        : "";

    customTimeSelect.addEventListener("change", (event) => {
      const minute = Number(event.target.value);
      if (!Number.isFinite(minute)) return;

      state.timeMode = "custom";
      state.selectedTimeMin = minute;
      renderTimeChips();
    });

    dom.timeChips.appendChild(nearestChip);
    dom.timeChips.appendChild(customTimeSelect);
    syncSummary();
  }

  // =========================
  // Summary + WhatsApp
  // =========================
  function syncSummary() {
    if (dom.summaryServices)
      dom.summaryServices.textContent = selectedServicesLabel();
    if (dom.summaryDatetime)
      dom.summaryDatetime.textContent = selectedDatetimeLabel();
  }

  function buildWhatsappMessage() {
    const services = selectedServicesLabel();
    if (services === "—") return null;
    if (!state.selectedDayKey) return null;
    if (state.timeMode === "custom" && state.selectedTimeMin == null)
      return null;

    const { weekday, md } = dateFaShort(state.selectedDayKey);
    const dateLabel = `${weekday} ${md}`;

    const timeLabel =
      state.timeMode === "nearest"
        ? "نزدیک‌ترین زمان ممکن"
        : timeFa(
            dateFromDayKeyAndMinute(
              state.selectedDayKey,
              state.selectedTimeMin,
            ),
          );

    const note = (dom.bookingNote?.value || "").trim();

    return `سلام عزیزم 🌸

برای ${services} می‌خواستم وقت بگیرم 💅

📅 ${dateLabel}
🕒 ${timeLabel}
${note ? `\n📝 ${note}` : ""}

اگه اوکیه لطفاً خبرم کن 🤍
مرسی ❤️`;
  }

  function buildFastWhatsappMessage() {
    const dayKeys = computeWorkingDayKeys();
    const fastLabel = buildPrimaryDateChoices(dayKeys)[0]?.label || "امروز";
    return `سلام عزیزم

برای ${fastLabel} وقت میخواستم`;
  }

  function openWhatsapp() {
    if (!state.selectedServiceIds.size) {
      showToast("لطفاً حداقل یک خدمت رو انتخاب کن.");
      return;
    }

    if (!state.selectedDayKey) {
      showToast("لطفاً تاریخ را انتخاب کن.");
      return;
    }

    if (state.timeMode === "custom" && state.selectedTimeMin == null) {
      showToast("لطفاً زمان دلخواه را انتخاب کن.");
      return;
    }

    const msg = buildWhatsappMessage();
    if (!msg) {
      showToast("لطفاً اطلاعات رزرو را کامل کن.");
      return;
    }
    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  }

  function openFastWhatsapp() {
    const msg = buildFastWhatsappMessage();
    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  }

  // =========================
  // Gallery (Swipe)
  // =========================
  function swipeDirFromDx(dx) {
    // اصلاح جهت
    return dx < 0 ? -1 : +1;
  }

  function renderDots(total, active) {
    if (!dom.galleryDots) return;
    dom.galleryDots.innerHTML = "";

    for (let i = 0; i < total; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot" + (i === active ? " active" : "");

      dot.addEventListener("click", () => {
        state.galleryIndex = i;
        renderGallery();
        restartAuto();
      });

      dom.galleryDots.appendChild(dot);
    }
  }

  function renderGallery() {
    if (!dom.galleryImage || !GALLERY.length) return;

    const total = GALLERY.length;
    state.galleryIndex = ((state.galleryIndex % total) + total) % total;

    dom.galleryImage.setAttribute(
      "src",
      encodeURI(GALLERY[state.galleryIndex]),
    );
    renderDots(total, state.galleryIndex);
  }

  function restartAuto() {
    clearInterval(state.autoTimer);
    if (GALLERY.length <= 1) return;

    state.autoTimer = setInterval(() => {
      state.galleryIndex += 1;
      renderGallery();
    }, 4500);
  }

  function swipeToNext(dir) {
    if (GALLERY.length <= 1) return;
    state.galleryIndex += dir;
    renderGallery();
    restartAuto();
  }

  function onPointerDown(e) {
    clearInterval(state.autoTimer);

    state.swipe.active = true;
    state.swipe.locked = false;
    state.swipe.startX = e.clientX;
    state.swipe.startY = e.clientY;

    try {
      dom.galleryCard?.setPointerCapture(e.pointerId);
    } catch {}
  }

  function onPointerMove(e) {
    if (!state.swipe.active) return;

    const dx = e.clientX - state.swipe.startX;
    const dy = e.clientY - state.swipe.startY;

    if (!state.swipe.locked) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        state.swipe.locked = true;
      } else if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
        state.swipe.active = false;
        state.swipe.locked = false;
        return;
      }
    }

    if (state.swipe.locked) e.preventDefault();
  }

  function onPointerUp(e) {
    if (!state.swipe.active) return;

    const dx = e.clientX - state.swipe.startX;
    state.swipe.active = false;

    if (!state.swipe.locked) {
      restartAuto();
      return;
    }

    if (Math.abs(dx) >= 45) swipeToNext(swipeDirFromDx(dx));
    else restartAuto();
  }

  function onPointerCancel() {
    state.swipe.active = false;
    state.swipe.locked = false;
    restartAuto();
  }

  // =========================
  // Events
  // =========================
  dom.toggleHelp?.addEventListener("click", () => {
    dom.helpPanel?.classList.toggle("app-hidden");
  });

  dom.heroCta?.addEventListener("click", () => scrollToEl(dom.bookingPanel));
  dom.heroFastCta?.addEventListener("click", openFastWhatsapp);
  dom.themeToggle?.addEventListener("click", () => {
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });

  dom.startWhatsapp?.addEventListener("click", openWhatsapp);

  dom.scrollTop?.addEventListener("click", scrollAppTop);

  dom.toastClose?.addEventListener("click", () => {
    dom.toast?.classList.add("app-hidden");
  });

  if (dom.galleryCard) {
    dom.galleryCard.addEventListener("pointerdown", onPointerDown, {
      passive: true,
    });
    dom.galleryCard.addEventListener("pointermove", onPointerMove, {
      passive: false,
    });
    dom.galleryCard.addEventListener("pointerup", onPointerUp, {
      passive: true,
    });
    dom.galleryCard.addEventListener("pointercancel", onPointerCancel, {
      passive: true,
    });
    dom.galleryCard.addEventListener("lostpointercapture", onPointerCancel);
  }

  // =========================
  // Init
  // =========================
  if (dom.footerYear)
    dom.footerYear.textContent = String(new Date().getFullYear());

  initTheme();
  initInstallFlow();
  registerServiceWorker();
  dom.app?.scrollTo({ top: 0 });

  renderServicesInline();
  renderDateChips();
  syncSummary();

  renderGallery();
  restartAuto();
})();
