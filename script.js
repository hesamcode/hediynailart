(() => {
  "use strict";

  const CONFIG = {
    adminPhone: "09150667527",
    stepMin: 15,
    cancelUserHoursLimit: 3,
    storageKeys: {
      users: "users",
      bookings: "bookings",
      currentUser: "currentUser",
      settings: "settings",
      selectedServiceIds: "selectedServiceIds",
      activeAdminTab: "activeAdminTab",
    },
  };

  const STATUS = {
    ACTIVE: "active",
    CANCELED: "canceled",
    PENDING: "pending",
    DOING: "doing",
    DONE: "done",
  };

  const ADMIN_TAB = {
    BOOKINGS: "bookings",
    SERVICES: "services",
    WORKS: "works",
    SETTINGS: "settings",
  };

  const FILTER_DEFAULT = "all";

  const DEFAULT_WORKS = [
    {
      id: "work_1",
      image: "./nail-1.png",
      title: "ژلیش کلاسیک",
      comment: "هم دوام عالی داشت، هم فرم ناخن‌هام خیلی طبیعی و مرتب شد.",
      user: "نظر نازنین",
    },
    {
      id: "work_2",
      image: "./nail-2.png",
      title: "کاشت + طراحی",
      comment:
        "رنگ‌بندی دقیقاً همونی شد که می‌خواستم و خیلی تمیز اجرا شده بود.",
      user: "نظر الهام",
    },
    {
      id: "work_3",
      image: "./nail-3.png",
      title: "لمینت ناخن",
      comment:
        "خیلی ظریف و حرفه‌ای کار شد و اصلاً احساس سنگینی روی ناخن نداشتم.",
      user: "نظر ساناز",
    },
    {
      id: "work_4",
      image: "./nail-4.png",
      title: "مانیکور درمانی",
      comment: "کیفیت کار و برخورد عالی بود؛ حتماً دوباره رزرو می‌کنم.",
      user: "نظر پریناز",
    },
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function isElement(value) {
    return value instanceof HTMLElement;
  }

  function safeJsonParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function readStore(key, fallback) {
    try {
      return safeJsonParse(localStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }

  function writeStoreBulk(data) {
    try {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    } catch {
      // localStorage may be blocked or full
    }
  }

  function clampInt(value, min = 0, max = Number.POSITIVE_INFINITY) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    const intValue = Math.floor(num);
    if (intValue < min) return min;
    if (intValue > max) return max;
    return intValue;
  }

  function normalizePhone(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function normalizeText(value, fallback = "") {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function normalizeWorkImagePath(value) {
    const raw = normalizeText(value);
    if (!raw) return "";

    const image = raw.replace(/\\/g, "/");

    const fileProtocolMatch = image.match(/^file:\/\/\/.+\/([^/]+)$/i);
    if (fileProtocolMatch) {
      return `./${fileProtocolMatch[1]}`;
    }

    const windowsAbsMatch = image.match(/^[a-z]:\/.+\/([^/]+)$/i);
    if (windowsAbsMatch) {
      return `./${windowsAbsMatch[1]}`;
    }

    if (/^(\/|\.\/|\.\.\/).+\.(png|jpe?g|gif|webp|svg|avif)$/i.test(image)) {
      return image;
    }

    if (/^[\w./ -]+\.(png|jpe?g|gif|webp|svg|avif)$/i.test(image)) {
      return `./${image}`;
    }

    return "";
  }

  function imageSrc(value) {
    const normalized = normalizeWorkImagePath(value);
    if (!normalized) return "";
    return encodeURI(normalized);
  }

  function isValidWorkImagePath(value) {
    if (!value) return false;
    return /^(\/|\.\/|\.\.\/).+\.(png|jpe?g|gif|webp|svg|avif)$/i.test(value);
  }

  function setImageWithFallback(imgEl, imageValue, altText = "تصویر") {
    if (!isElement(imgEl)) return false;

    const src = imageSrc(imageValue);
    imgEl.setAttribute("alt", altText);
    imgEl.onerror = null;
    imgEl.onload = null;
    imgEl.removeAttribute("src");

    if (!src) {
      return false;
    }

    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.removeAttribute("src");
    };

    imgEl.setAttribute("src", src);
    return true;
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function toDayKey(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function fromDayKey(dayKey) {
    return new Date(`${dayKey}T00:00:00`);
  }

  function isSameDay(dateA, dateB) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  function overlapMs(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
  }

  function uid() {
    try {
      if (crypto?.randomUUID) return crypto.randomUUID();
    } catch {
      // ignore
    }
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function toToman(value) {
    const num = Math.max(0, clampInt(value, 0));
    return `${num.toLocaleString("fa-IR")} تومان`;
  }

  function timeFa(date) {
    return date.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function dateFa(dayKey) {
    return fromDayKey(dayKey).toLocaleDateString("fa-IR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function dateTimeFa(iso) {
    return new Date(iso).toLocaleString("fa-IR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function statusText(status) {
    if (status === STATUS.PENDING) return "در انتظار";
    if (status === STATUS.DOING) return "در حال انجام";
    if (status === STATUS.DONE) return "تمام شده";
    if (status === STATUS.CANCELED) return "لغو شده";
    return "نامشخص";
  }

  function statusClass(status) {
    if (status === STATUS.PENDING) return "status-pending";
    if (status === STATUS.DOING) return "status-doing";
    if (status === STATUS.DONE) return "status-done";
    if (status === STATUS.CANCELED) return "status-canceled";
    return "";
  }

  function toastIconClass(type) {
    if (type === "success") return "fa-circle-check";
    if (type === "warn") return "fa-triangle-exclamation";
    if (type === "error") return "fa-circle-xmark";
    return "fa-circle-info";
  }

  function defaultSettings() {
    return {
      isOpen: true,
      daysAhead: 7,
      enabledDates: [],
      shifts: [
        { startMin: 10 * 60, endMin: 13 * 60 },
        { startMin: 15 * 60, endMin: 19 * 60 },
      ],
      adminWallet: 0,
      adminTotalIncome: 0,
      works: DEFAULT_WORKS.slice(),
      services: [
        { id: "gelish", name: "ژلیش", minutes: 75, price: 450000 },
        { id: "mani", name: "مانیکور", minutes: 60, price: 350000 },
        { id: "pedi", name: "پدیکور", minutes: 75, price: 450000 },
        { id: "repair", name: "ترمیم", minutes: 90, price: 650000 },
        { id: "ext", name: "کاشت", minutes: 120, price: 900000 },
        { id: "design", name: "طراحی (اضافه)", minutes: 30, price: 150000 },
        { id: "laminate", name: "لمینت", minutes: 90, price: 800000 },
        { id: "remove", name: "ریموو", minutes: 45, price: 250000 },
        { id: "strength", name: "استحکام سازی", minutes: 60, price: 500000 },
      ],
    };
  }

  function normalizeUsers(input) {
    const list = Array.isArray(input) ? input : [];
    const usersMap = new Map();

    list.forEach((entry) => {
      if (!entry || typeof entry !== "object") return;
      const phone = normalizePhone(entry.phone);
      if (!phone) return;

      usersMap.set(phone, {
        phone,
        name: normalizeText(entry.name, "کاربر"),
        wallet: clampInt(entry.wallet, 0),
      });
    });

    return [...usersMap.values()];
  }

  function normalizeServices(input, fallbackServices) {
    const base =
      Array.isArray(input) && input.length ? input : fallbackServices;
    const services = [];

    base.forEach((entry) => {
      const id = normalizeText(entry?.id);
      const name = normalizeText(entry?.name);
      const minutes = clampInt(entry?.minutes, 0);
      const price = clampInt(entry?.price, 0);
      if (!id || !name || minutes <= 0) return;
      services.push({ id, name, minutes, price });
    });

    if (!services.length) return fallbackServices;

    const uniqMap = new Map();
    services.forEach((service) => uniqMap.set(service.id, service));
    return [...uniqMap.values()];
  }

  function normalizeWorks(input, fallbackWorks) {
    const hasInputArray = Array.isArray(input);
    const base = hasInputArray ? input : fallbackWorks;
    const works = [];

    base.forEach((entry) => {
      const id = normalizeText(entry?.id);
      const image = normalizeWorkImagePath(entry?.image);
      const title = normalizeText(entry?.title);
      const comment = normalizeText(entry?.comment);
      const user = normalizeText(entry?.user);
      if (!id || !image || !title || !comment || !user) return;
      works.push({ id, image, title, comment, user });
    });

    if (!works.length) return hasInputArray ? [] : fallbackWorks;

    const uniqMap = new Map();
    works.forEach((work) => uniqMap.set(work.id, work));
    return [...uniqMap.values()];
  }

  function normalizeShifts(input) {
    const list = Array.isArray(input) ? input : [];
    const shifts = list
      .map((entry) => {
        const startMin = clampInt(entry?.startMin, 0, 24 * 60);
        const endMin = clampInt(entry?.endMin, 0, 24 * 60);
        return { startMin, endMin };
      })
      .filter((shift) => shift.endMin > shift.startMin)
      .sort((a, b) => a.startMin - b.startMin);

    return shifts.length ? shifts : [{ startMin: 10 * 60, endMin: 19 * 60 }];
  }

  function normalizeSettings(input) {
    const defaults = defaultSettings();
    const source = input && typeof input === "object" ? input : {};
    const hasIsOpen = Object.prototype.hasOwnProperty.call(source, "isOpen");
    const hasDaysAhead = Object.prototype.hasOwnProperty.call(
      source,
      "daysAhead",
    );
    const adminWallet = clampInt(source.adminWallet, 0);
    const hasTotalIncome = Object.prototype.hasOwnProperty.call(
      source,
      "adminTotalIncome",
    );
    const adminTotalIncome = hasTotalIncome
      ? clampInt(source.adminTotalIncome, 0)
      : adminWallet;

    const parsedDaysAhead = Number(source.daysAhead);
    const daysAhead =
      hasDaysAhead && Number.isFinite(parsedDaysAhead) && parsedDaysAhead > 0
        ? clampInt(parsedDaysAhead, 1, 90)
        : defaults.daysAhead;

    return {
      isOpen: hasIsOpen ? !!source.isOpen : defaults.isOpen,
      daysAhead,
      enabledDates: Array.isArray(source.enabledDates)
        ? source.enabledDates.map((value) => String(value))
        : defaults.enabledDates.slice(),
      shifts: normalizeShifts(
        Array.isArray(source.shifts) ? source.shifts : defaults.shifts,
      ),
      adminWallet,
      adminTotalIncome,
      works: normalizeWorks(source.works, defaults.works),
      services: normalizeServices(source.services, defaults.services),
    };
  }

  function normalizeBookingEntry(entry, servicesMap) {
    if (!entry || typeof entry !== "object") return null;

    const id = normalizeText(entry.id);
    const phone = normalizePhone(entry.phone);
    const name = normalizeText(entry.name, "کاربر");

    const serviceIds = Array.isArray(entry.serviceIds)
      ? entry.serviceIds.map((value) => String(value)).filter(Boolean)
      : [];

    const startIso = normalizeText(entry.startIso);
    const endIso = normalizeText(entry.endIso);
    const startMs = Date.parse(startIso);
    const endMs = Date.parse(endIso);

    if (
      !id ||
      !phone ||
      !Number.isFinite(startMs) ||
      !Number.isFinite(endMs) ||
      endMs <= startMs
    ) {
      return null;
    }

    const fallbackMinutes = serviceIds.reduce((acc, serviceId) => {
      const service = servicesMap.get(serviceId);
      return acc + (service ? service.minutes : 0);
    }, 0);

    const fallbackPrice = serviceIds.reduce((acc, serviceId) => {
      const service = servicesMap.get(serviceId);
      return acc + (service ? service.price : 0);
    }, 0);

    const totalMinutes = clampInt(entry.totalMinutes, 0) || fallbackMinutes;
    const totalPrice = clampInt(entry.totalPrice, 0) || fallbackPrice;

    let walletUsed = clampInt(entry.walletUsed, 0);
    let paidCash = clampInt(entry.paidCash, 0);
    if (walletUsed + paidCash === 0 && totalPrice > 0) {
      paidCash = totalPrice;
    }

    return {
      id,
      phone,
      name,
      serviceIds,
      totalMinutes,
      totalPrice,
      walletUsed,
      paidCash,
      startIso: new Date(startMs).toISOString(),
      endIso: new Date(endMs).toISOString(),
      status:
        entry.status === STATUS.CANCELED ? STATUS.CANCELED : STATUS.ACTIVE,
      createdAt: normalizeText(entry.createdAt, new Date().toISOString()),
    };
  }

  function normalizeBookings(input, services) {
    const list = Array.isArray(input) ? input : [];
    const servicesMap = new Map(
      services.map((service) => [service.id, service]),
    );
    const uniqMap = new Map();

    list.forEach((entry) => {
      const normalized = normalizeBookingEntry(entry, servicesMap);
      if (!normalized) return;
      uniqMap.set(normalized.id, normalized);
    });

    return [...uniqMap.values()];
  }

  function normalizeCurrentUser(input) {
    if (typeof input === "string") {
      const phone = normalizePhone(input);
      return phone ? { phone } : null;
    }

    if (input && typeof input === "object") {
      const phone = normalizePhone(input.phone);
      return phone ? { phone } : null;
    }

    return null;
  }

  function normalizeSelectedServiceIds(input, services) {
    const ids = Array.isArray(input) ? input.map(String) : [];
    const validIds = new Set(services.map((service) => service.id));
    const filtered = ids.filter((id) => validIds.has(id));
    if (filtered.length) return filtered;
    return services[0] ? [services[0].id] : [];
  }

  function normalizeActiveAdminTab(input) {
    const tab = String(input || "");
    if (Object.values(ADMIN_TAB).includes(tab)) return tab;
    return ADMIN_TAB.BOOKINGS;
  }

  let settings = normalizeSettings(
    readStore(CONFIG.storageKeys.settings, null),
  );
  let users = normalizeUsers(readStore(CONFIG.storageKeys.users, []));
  let bookings = normalizeBookings(
    readStore(CONFIG.storageKeys.bookings, []),
    settings.services,
  );
  let currentUser = normalizeCurrentUser(
    readStore(CONFIG.storageKeys.currentUser, null),
  );
  let selectedServiceIds = normalizeSelectedServiceIds(
    readStore(CONFIG.storageKeys.selectedServiceIds, []),
    settings.services,
  );
  let activeAdminTab = normalizeActiveAdminTab(
    readStore(CONFIG.storageKeys.activeAdminTab, ADMIN_TAB.BOOKINGS),
  );

  let userFilter = FILTER_DEFAULT;
  let adminFilter = FILTER_DEFAULT;

  const sentCodes = Object.create(null);

  let guestPhoneCache = "";
  let authPhoneCache = "";
  let pendingPayment = null;
  let walletSelected = false;
  let galleryIndex = 0;

  const dom = {
    footerYear: byId("footer-year"),

    toast: byId("app-toast"),
    toastIcon: byId("toast-icon"),
    toastText: byId("toast-text"),
    toastClose: byId("toast-close"),

    openAccount: byId("open-account"),
    focusBooking: byId("focus-booking"),
    bookingForm: byId("booking-form"),

    toggleHelp: byId("toggle-help"),
    helpPanel: byId("help-panel"),

    bookingClosed: byId("booking-closed"),

    guestAuth: byId("guest-auth"),
    guestStepPhone: byId("guest-step-phone"),
    guestStepCode: byId("guest-step-code"),
    guestStepName: byId("guest-step-name"),
    guestPhone: byId("guest-phone"),
    guestSend: byId("guest-send"),
    guestPhonePreview: byId("guest-phone-preview"),
    guestPhoneEdit: byId("guest-phone-edit"),
    guestCode: byId("guest-code"),
    guestVerify: byId("guest-verify"),
    guestName: byId("guest-name"),
    guestNameSave: byId("guest-name-save"),

    openServices: byId("open-services"),
    selectedServices: byId("selected-services"),

    bookingDate: byId("booking-date"),
    bookingTime: byId("booking-time"),
    startPayment: byId("start-payment"),

    summaryDuration: byId("summary-duration"),
    summaryPrice: byId("summary-price"),
    summaryWallet: byId("summary-wallet"),
    galleryPrev: byId("gallery-prev"),
    galleryNext: byId("gallery-next"),
    galleryImage: byId("gallery-image"),
    galleryTitle: byId("gallery-title"),
    galleryComment: byId("gallery-comment"),
    galleryUser: byId("gallery-user"),

    scrollTop: byId("scroll-top"),

    modalOverlay: byId("modal-overlay"),

    servicesModal: byId("services-modal"),
    closeServices: byId("close-services"),
    servicesList: byId("services-list"),
    confirmServices: byId("confirm-services"),

    paymentModal: byId("payment-modal"),
    closePayment: byId("close-payment"),
    paymentServices: byId("payment-services"),
    paymentDuration: byId("payment-duration"),
    paymentTotal: byId("payment-total"),
    walletRow: byId("wallet-row"),
    paymentWallet: byId("payment-wallet"),
    walletToggle: byId("wallet-toggle"),
    paymentFinal: byId("payment-final"),
    paymentConfirm: byId("payment-confirm"),

    authModal: byId("auth-modal"),
    closeAuth: byId("close-auth"),
    authTitle: byId("auth-title"),
    authStepPhone: byId("auth-step-phone"),
    authStepCode: byId("auth-step-code"),
    authStepName: byId("auth-step-name"),
    authPhone: byId("auth-phone"),
    authSend: byId("auth-send"),
    authPhonePreview: byId("auth-phone-preview"),
    authPhoneEdit: byId("auth-phone-edit"),
    authCode: byId("auth-code"),
    authVerify: byId("auth-verify"),
    authName: byId("auth-name"),
    authNameSave: byId("auth-name-save"),

    dashboardModal: byId("dashboard-modal"),
    closeDashboard: byId("close-dashboard"),
    dashboardName: byId("dashboard-name"),
    dashboardPhone: byId("dashboard-phone"),
    dashboardLogout: byId("dashboard-logout"),
    dashboardWalletPanel: byId("dashboard-wallet-panel"),
    dashboardWallet: byId("dashboard-wallet"),

    adminIncomePanel: byId("admin-income-panel"),
    adminIncome: byId("admin-income"),
    adminIncomeTotal: byId("admin-income-total"),
    adminIncomeReset: byId("admin-income-reset"),

    userSection: byId("user-section"),
    userFilter: byId("user-filter"),
    userBookings: byId("user-bookings"),
    userCancelAll: byId("user-cancel-all"),

    adminSection: byId("admin-section"),
    adminTabs: byId("admin-tabs"),
    adminFilter: byId("admin-filter"),
    adminBookingsPanel: byId("admin-bookings-panel"),
    adminServicesPanel: byId("admin-services-panel"),
    adminWorksPanel: byId("admin-works-panel"),
    adminSettingsPanel: byId("admin-settings-panel"),
    adminBookings: byId("admin-bookings"),
    adminCancelAll: byId("admin-cancel-all"),

    serviceName: byId("service-name"),
    serviceMinutes: byId("service-minutes"),
    servicePrice: byId("service-price"),
    serviceSave: byId("service-save"),
    serviceList: byId("service-list"),
    workImage: byId("work-image"),
    workTitle: byId("work-title"),
    workComment: byId("work-comment"),
    workUser: byId("work-user"),
    workSave: byId("work-save"),
    worksList: byId("works-list"),

    toggleBookingStatus: byId("toggle-booking-status"),
    daysAhead: byId("days-ahead"),
    rebuildDays: byId("rebuild-days"),
    daysList: byId("days-list"),
    addShift: byId("add-shift"),
    shiftsList: byId("shifts-list"),
    saveSettings: byId("save-settings"),
  };

  function persist() {
    writeStoreBulk({
      [CONFIG.storageKeys.users]: users,
      [CONFIG.storageKeys.bookings]: bookings,
      [CONFIG.storageKeys.currentUser]: currentUser,
      [CONFIG.storageKeys.settings]: settings,
      [CONFIG.storageKeys.selectedServiceIds]: selectedServiceIds,
      [CONFIG.storageKeys.activeAdminTab]: activeAdminTab,
    });
  }

  function setHidden(el, hidden) {
    if (!isElement(el)) return;
    el.classList.toggle("app-hidden", !!hidden);
  }

  function findUser(phone) {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;
    return users.find((user) => user.phone === normalized) || null;
  }

  function ensureUser(phone, fallbackName = "کاربر") {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;

    let user = findUser(normalized);
    if (!user) {
      user = {
        phone: normalized,
        name: normalizeText(fallbackName, "کاربر"),
        wallet: 0,
      };
      users.push(user);
    }

    user.name = normalizeText(user.name, "کاربر");
    user.wallet = clampInt(user.wallet, 0);
    return user;
  }

  function isAdmin() {
    return !!currentUser && currentUser.phone === CONFIG.adminPhone;
  }

  function serviceById(id) {
    return settings.services.find((service) => service.id === id) || null;
  }

  function galleryWorks() {
    const works = normalizeWorks(settings.works, DEFAULT_WORKS);
    settings.works = works;
    return works;
  }

  function workById(id) {
    return galleryWorks().find((work) => work.id === id) || null;
  }

  function selectedServices() {
    return selectedServiceIds.map((id) => serviceById(id)).filter(Boolean);
  }

  function selectionTotals() {
    const list = selectedServices();
    const totalMinutes = list.reduce(
      (sum, service) => sum + clampInt(service.minutes, 0),
      0,
    );
    const totalPrice = list.reduce(
      (sum, service) => sum + clampInt(service.price, 0),
      0,
    );
    return { list, totalMinutes, totalPrice };
  }

  function selectionLabel() {
    const list = selectedServices();
    if (!list.length) return "—";
    return list.map((service) => service.name).join(" + ");
  }

  function bookingAmount(booking) {
    const explicitAmount =
      clampInt(booking.walletUsed, 0) + clampInt(booking.paidCash, 0);
    if (explicitAmount > 0) return explicitAmount;
    return clampInt(booking.totalPrice, 0);
  }

  function computedBookingStatus(booking) {
    if (booking.status === STATUS.CANCELED) return STATUS.CANCELED;

    const now = Date.now();
    const start = Date.parse(booking.startIso);
    const end = Date.parse(booking.endIso);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return STATUS.CANCELED;
    }

    if (now < start) return STATUS.PENDING;
    if (now >= start && now < end) return STATUS.DOING;
    return STATUS.DONE;
  }

  function isDateEnabled(dayKey) {
    if (
      !Array.isArray(settings.enabledDates) ||
      settings.enabledDates.length === 0
    ) {
      return true;
    }
    return settings.enabledDates.includes(dayKey);
  }

  function isBlockingBooking(booking) {
    return computedBookingStatus(booking) !== STATUS.CANCELED;
  }

  function buildSlotsForDay(dayKey, durationMinutes) {
    const dayDate = fromDayKey(dayKey);
    const slots = [];
    if (durationMinutes <= 0) return slots;

    const validShifts = normalizeShifts(settings.shifts);

    validShifts.forEach((shift) => {
      const latestStart = shift.endMin - durationMinutes;
      for (
        let minute = shift.startMin;
        minute <= latestStart;
        minute += CONFIG.stepMin
      ) {
        const slotStart = new Date(dayDate);
        slotStart.setMinutes(minute);

        if (
          isSameDay(slotStart, new Date()) &&
          slotStart.getTime() < Date.now()
        ) {
          continue;
        }

        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
        const hasConflict = bookings.some((booking) => {
          if (!isBlockingBooking(booking)) return false;
          return overlapMs(
            slotStart.getTime(),
            slotEnd.getTime(),
            Date.parse(booking.startIso),
            Date.parse(booking.endIso),
          );
        });

        if (!hasConflict) {
          slots.push({ start: slotStart, end: slotEnd });
        }
      }
    });

    slots.sort((a, b) => a.start.getTime() - b.start.getTime());
    return slots;
  }

  function computeAvailableDays(durationMinutes) {
    const days = [];
    if (durationMinutes <= 0) return days;

    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const maxDays = clampInt(settings.daysAhead, 1, 90);
    for (let i = 0; i < maxDays; i += 1) {
      const currentDay = new Date(base);
      currentDay.setDate(base.getDate() + i);
      const dayKey = toDayKey(currentDay);

      if (!isDateEnabled(dayKey)) continue;

      const slots = buildSlotsForDay(dayKey, durationMinutes);
      if (slots.length) days.push(dayKey);
    }

    return days;
  }

  let toastTimer = null;

  function hideToast() {
    setHidden(dom.toast, true);
  }

  function showToast(message, type = "info") {
    if (
      !isElement(dom.toast) ||
      !isElement(dom.toastIcon) ||
      !isElement(dom.toastText)
    )
      return;

    dom.toast.classList.remove("toast-success", "toast-warn", "toast-error");
    if (type === "success") dom.toast.classList.add("toast-success");
    if (type === "warn") dom.toast.classList.add("toast-warn");
    if (type === "error") dom.toast.classList.add("toast-error");

    dom.toastText.textContent = normalizeText(message);
    dom.toastIcon.innerHTML = `<i class="fa-solid ${toastIconClass(type)}"></i>`;

    setHidden(dom.toast, false);

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      hideToast();
    }, 3000);
  }

  function openModal(modalElement) {
    if (!isElement(modalElement) || !isElement(dom.modalOverlay)) return;

    setHidden(dom.modalOverlay, false);
    setHidden(modalElement, false);
    document.body.style.overflow = "hidden";
  }

  function closeAllModals() {
    setHidden(dom.modalOverlay, true);
    setHidden(dom.servicesModal, true);
    setHidden(dom.paymentModal, true);
    setHidden(dom.authModal, true);
    setHidden(dom.dashboardModal, true);
    document.body.style.overflow = "";
  }

  function renderYear() {
    if (isElement(dom.footerYear)) {
      dom.footerYear.textContent = String(new Date().getFullYear());
    }
  }

  function focusWithoutScroll(el) {
    if (!isElement(el)) return;
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  }

  function renderGallery() {
    if (
      !isElement(dom.galleryImage) ||
      !isElement(dom.galleryTitle) ||
      !isElement(dom.galleryComment) ||
      !isElement(dom.galleryUser) ||
      !isElement(dom.galleryPrev) ||
      !isElement(dom.galleryNext)
    ) {
      return;
    }

    const works = galleryWorks();
    const total = works.length;
    if (!total) {
      dom.galleryTitle.textContent = "نمونه‌کاری ثبت نشده است.";
      dom.galleryComment.textContent =
        "برای مشاهده نمونه‌کارها بعداً مراجعه کنید.";
      dom.galleryUser.textContent = "—";
      dom.galleryImage.removeAttribute("src");
      dom.galleryImage.setAttribute("alt", "نمونه‌کار موجود نیست");
      dom.galleryPrev.disabled = true;
      dom.galleryNext.disabled = true;
      return;
    }

    galleryIndex = ((galleryIndex % total) + total) % total;
    const work = works[galleryIndex];

    setImageWithFallback(dom.galleryImage, work.image, work.title);
    dom.galleryTitle.textContent = work.title;
    dom.galleryComment.textContent = work.comment;
    dom.galleryUser.textContent = work.user;

    const singleItem = total <= 1;
    dom.galleryPrev.disabled = singleItem;
    dom.galleryNext.disabled = singleItem;
  }

  function moveGallery(step) {
    const works = galleryWorks();
    if (!works.length) return;
    galleryIndex += step;
    renderGallery();
  }

  function focusBookingForm() {
    if (!isElement(dom.bookingForm)) return;

    dom.bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      focusWithoutScroll(dom.bookingForm);
    }, 320);
  }

  function renderAccountButton() {
    if (!isElement(dom.openAccount)) return;
    dom.openAccount.textContent = currentUser ? "داشبورد" : "ورود";
  }

  function renderClosedState() {
    const closed = !settings.isOpen;
    setHidden(dom.bookingClosed, !closed);

    if (isElement(dom.bookingDate)) dom.bookingDate.disabled = closed;
    if (isElement(dom.bookingTime)) dom.bookingTime.disabled = closed;

    if (!isElement(dom.startPayment)) return;

    if (currentUser && isAdmin()) {
      dom.startPayment.textContent = "ادمین نمی تواند رزرو کند";
      dom.startPayment.disabled = true;
      return;
    }

    if (closed) {
      dom.startPayment.textContent = "رزرو بسته است";
      dom.startPayment.disabled = true;
      return;
    }

    dom.startPayment.textContent = "ادامه و پرداخت";
    dom.startPayment.disabled = false;
  }

  function renderGuestVisibility() {
    if (!isElement(dom.guestAuth)) return;
    setHidden(dom.guestAuth, !!currentUser);
  }

  function renderSummary() {
    const totals = selectionTotals();

    if (isElement(dom.summaryDuration)) {
      dom.summaryDuration.textContent =
        totals.totalMinutes > 0 ? `${totals.totalMinutes} دقیقه` : "—";
    }

    if (isElement(dom.summaryPrice)) {
      dom.summaryPrice.textContent =
        totals.totalMinutes > 0 ? toToman(totals.totalPrice) : "—";
    }

    if (isElement(dom.summaryWallet)) {
      if (!currentUser) {
        dom.summaryWallet.textContent = "بعد از ورود نمایش داده می شود";
      } else {
        const user = ensureUser(currentUser.phone);
        dom.summaryWallet.textContent = toToman(user?.wallet || 0);
      }
    }
  }

  function renderSelectedServices() {
    if (!isElement(dom.selectedServices)) return;
    dom.selectedServices.innerHTML = "";

    const services = selectedServices();
    if (!services.length) {
      dom.selectedServices.innerHTML = `<div class="empty-note">خدمتی انتخاب نشده.</div>`;
      return;
    }

    services.forEach((service) => {
      const chip = document.createElement("div");
      chip.className = "service-chip";

      const text = document.createElement("span");
      text.className = "service-chip-text";
      text.textContent = service.name;

      const removeButton = document.createElement("button");
      removeButton.className = "service-chip-remove";
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", `حذف ${service.name}`);
      removeButton.dataset.serviceId = service.id;
      removeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';

      chip.appendChild(text);
      chip.appendChild(removeButton);
      dom.selectedServices.appendChild(chip);
    });
  }

  function fillDateSelect() {
    if (!isElement(dom.bookingDate) || !isElement(dom.bookingTime)) return;

    const totals = selectionTotals();
    dom.bookingDate.innerHTML = "";
    dom.bookingTime.innerHTML = "";

    if (totals.totalMinutes <= 0) {
      dom.bookingDate.innerHTML =
        '<option value="">ابتدا خدمت را انتخاب کن</option>';
      dom.bookingTime.innerHTML = '<option value="">—</option>';
      dom.bookingTime.disabled = true;
      return;
    }

    const availableDays = computeAvailableDays(totals.totalMinutes);
    if (!availableDays.length) {
      dom.bookingDate.innerHTML =
        '<option value="">تاریخ آزادی موجود نیست</option>';
      dom.bookingTime.innerHTML = '<option value="">—</option>';
      dom.bookingTime.disabled = true;
      return;
    }

    availableDays.forEach((dayKey) => {
      const option = document.createElement("option");
      option.value = dayKey;
      option.textContent = dateFa(dayKey);
      dom.bookingDate.appendChild(option);
    });

    dom.bookingDate.value = availableDays[0];
    fillTimeSelect();
  }

  function fillTimeSelect() {
    if (!isElement(dom.bookingDate) || !isElement(dom.bookingTime)) return;

    dom.bookingTime.innerHTML = "";

    const dayKey = dom.bookingDate.value;
    const totals = selectionTotals();

    if (!dayKey || totals.totalMinutes <= 0) {
      dom.bookingTime.innerHTML =
        '<option value="">ابتدا تاریخ را انتخاب کن</option>';
      dom.bookingTime.disabled = true;
      return;
    }

    const slots = buildSlotsForDay(dayKey, totals.totalMinutes);
    if (!slots.length) {
      dom.bookingTime.innerHTML =
        '<option value="">ساعت آزادی موجود نیست</option>';
      dom.bookingTime.disabled = true;
      return;
    }

    slots.forEach((slot) => {
      const option = document.createElement("option");
      option.value = slot.start.toISOString();
      option.textContent = `${timeFa(slot.start)} تا ${timeFa(slot.end)}`;
      dom.bookingTime.appendChild(option);
    });

    dom.bookingTime.disabled = false;
    dom.bookingTime.value = dom.bookingTime.options[0]?.value || "";
  }

  function rebuildBookingSelectors() {
    fillDateSelect();
  }

  function syncMainUI() {
    renderYear();
    renderAccountButton();
    renderGuestVisibility();
    renderClosedState();
    renderSummary();
    renderSelectedServices();
    renderGallery();
  }

  function renderServicesModal() {
    if (!isElement(dom.servicesList)) return;
    dom.servicesList.innerHTML = "";

    const sorted = settings.services
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "fa"));

    sorted.forEach((service) => {
      const row = document.createElement("div");
      row.className = "service-option";
      row.dataset.serviceId = service.id;
      const selected = selectedServiceIds.includes(service.id);
      row.classList.toggle("service-option-active", selected);

      const meta = document.createElement("div");
      meta.className = "service-option-meta";

      const title = document.createElement("div");
      title.className = "service-option-name";
      title.textContent = `${service.name} - ${service.minutes} دقیقه`;

      const price = document.createElement("span");
      price.className = "service-option-price";
      price.textContent = toToman(service.price);

      const toggleButton = document.createElement("button");
      toggleButton.className = "soft-button service-option-toggle";
      toggleButton.type = "button";
      toggleButton.dataset.serviceId = service.id;
      toggleButton.textContent = selected ? "لغو انتخاب" : "انتخاب";

      meta.append(title, price);
      row.append(meta, toggleButton);
      dom.servicesList.appendChild(row);
    });
  }

  function validatePhone(phoneRaw) {
    const phone = normalizePhone(phoneRaw);
    if (phone.length < 10) return null;
    return phone;
  }

  function sendFakeCode(phoneRaw) {
    const phone = validatePhone(phoneRaw);
    if (!phone) {
      showToast("شماره موبایل معتبر نیست.", "error");
      return null;
    }
    sentCodes[phone] = true;
    showToast("کد ارسال شد. آزمایشی است.", "success");
    return phone;
  }

  function loginUser(phone) {
    const user = ensureUser(phone);
    if (!user) return false;

    currentUser = { phone: user.phone };
    persist();
    syncMainUI();
    return true;
  }

  function registerUser(phone, nameRaw) {
    const name = normalizeText(nameRaw);
    if (name.length < 2) {
      showToast("نام کوتاه است.", "error");
      return false;
    }

    const user = ensureUser(phone, name);
    if (!user) return false;

    user.name = name;
    currentUser = { phone: user.phone };
    persist();
    syncMainUI();
    return true;
  }

  function showGuestStep(step) {
    setHidden(dom.guestStepPhone, step !== "phone");
    setHidden(dom.guestStepCode, step !== "code");
    setHidden(dom.guestStepName, step !== "name");
  }

  function resetGuestFlow() {
    guestPhoneCache = "";

    if (isElement(dom.guestPhone)) dom.guestPhone.value = "";
    if (isElement(dom.guestCode)) dom.guestCode.value = "";
    if (isElement(dom.guestName)) dom.guestName.value = "";
    if (isElement(dom.guestPhonePreview))
      dom.guestPhonePreview.textContent = "";

    showGuestStep("phone");
  }

  function showAuthStep(step) {
    setHidden(dom.authStepPhone, step !== "phone");
    setHidden(dom.authStepCode, step !== "code");
    setHidden(dom.authStepName, step !== "name");
  }

  function resetAuthFlow() {
    authPhoneCache = "";

    if (isElement(dom.authTitle)) dom.authTitle.textContent = "ورود";
    if (isElement(dom.authVerify)) dom.authVerify.textContent = "ورود";
    if (isElement(dom.authPhone)) dom.authPhone.value = "";
    if (isElement(dom.authCode)) dom.authCode.value = "";
    if (isElement(dom.authName)) dom.authName.value = "";
    if (isElement(dom.authPhonePreview)) dom.authPhonePreview.textContent = "";

    showAuthStep("phone");
  }

  function openAuthModal() {
    resetAuthFlow();
    openModal(dom.authModal);
    setTimeout(() => {
      dom.authPhone?.focus();
    }, 0);
  }

  function hoursUntil(iso) {
    const target = Date.parse(iso);
    if (!Number.isFinite(target)) return -1;
    return (target - Date.now()) / (1000 * 60 * 60);
  }

  function canUserCancel(booking) {
    if (computedBookingStatus(booking) !== STATUS.PENDING) return false;
    return hoursUntil(booking.startIso) >= CONFIG.cancelUserHoursLimit;
  }

  function canAdminCancel(booking) {
    const status = computedBookingStatus(booking);
    if (status === STATUS.CANCELED) return false;
    if (status === STATUS.DONE) return false;
    return true;
  }

  function cancelBookingById(bookingId, adminMode, silent = false) {
    const booking = bookings.find((entry) => entry.id === bookingId);
    if (!booking) {
      if (!silent) showToast("رزرو پیدا نشد.", "error");
      return false;
    }

    if (!adminMode && !canUserCancel(booking)) {
      if (!silent) showToast("این رزرو قابل لغو نیست.", "warn");
      return false;
    }

    if (adminMode && !canAdminCancel(booking)) {
      if (!silent) showToast("این رزرو قابل لغو نیست.", "warn");
      return false;
    }

    const owner = ensureUser(booking.phone, booking.name);
    if (!owner) {
      if (!silent) showToast("مالک رزرو نامعتبر است.", "error");
      return false;
    }

    const refundAmount = bookingAmount(booking);
    owner.wallet = clampInt(owner.wallet, 0) + refundAmount;
    settings.adminWallet = Math.max(
      0,
      clampInt(settings.adminWallet, 0) - refundAmount,
    );
    booking.status = STATUS.CANCELED;

    persist();
    return true;
  }

  function cancelAllUserBookings() {
    if (!currentUser) return;

    let count = 0;
    bookings.forEach((booking) => {
      if (booking.phone !== currentUser.phone) return;
      if (cancelBookingById(booking.id, false, true)) count += 1;
    });

    if (count === 0) {
      showToast("موردی برای لغو نیست.", "warn");
      return;
    }

    showToast(`لغو شد (${count})`, "success");
    rebuildBookingSelectors();
    syncMainUI();
    renderDashboard();
  }

  function cancelAllAdminBookings() {
    if (!currentUser || !isAdmin()) return;

    let count = 0;
    bookings.forEach((booking) => {
      if (cancelBookingById(booking.id, true, true)) count += 1;
    });

    if (count === 0) {
      showToast("موردی برای لغو نیست.", "warn");
      return;
    }

    showToast(`لغو شد (${count})`, "success");
    rebuildBookingSelectors();
    syncMainUI();
    renderDashboard();
  }

  function createStatusChip(status) {
    const chip = document.createElement("span");
    chip.className = `status-chip ${statusClass(status)}`;
    chip.textContent = statusText(status);
    return chip;
  }

  function bookingServiceText(booking) {
    const names = (Array.isArray(booking.serviceIds) ? booking.serviceIds : [])
      .map((serviceId) => serviceById(serviceId)?.name)
      .filter(Boolean);
    return names.length ? names.join(" + ") : "—";
  }

  function createBookingCard(booking, adminMode) {
    const card = document.createElement("div");
    card.className = "booking-card";

    const cardInfo = document.createElement("div");
    cardInfo.className = "booking-card-info";

    const cardBox = document.createElement("div");
    cardBox.className = "booking-card-box";

    const title = document.createElement("div");
    title.className = "booking-card-title";

    const startDate = new Date(booking.startIso);
    const endDate = new Date(booking.endIso);
    title.textContent = `${dateTimeFa(booking.startIso)} (${timeFa(startDate)} تا ${timeFa(endDate)})`;

    cardBox.appendChild(title);

    const canCancel = adminMode
      ? canAdminCancel(booking)
      : canUserCancel(booking);
    if (canCancel) {
      const cancelButton = document.createElement("button");
      cancelButton.className = "cancel-booking-button";
      cancelButton.type = "button";
      cancelButton.textContent = "لغو";
      cancelButton.addEventListener("click", () => {
        const ok = cancelBookingById(booking.id, adminMode, false);
        if (!ok) return;

        showToast("رزرو لغو شد.", "success");
        rebuildBookingSelectors();
        syncMainUI();
        renderDashboard();
      });
      cardBox.appendChild(cancelButton);
    }

    const cardStatus = document.createElement("div");
    cardStatus.className = "booking-card-status";
    cardStatus.appendChild(createStatusChip(computedBookingStatus(booking)));

    cardInfo.append(cardBox, cardStatus);

    const subtitle = document.createElement("div");
    subtitle.className = "booking-card-subtitle";

    const serviceText = document.createElement("span");
    serviceText.textContent = bookingServiceText(booking);
    subtitle.appendChild(serviceText);

    const amount = document.createElement("span");
    amount.textContent = toToman(bookingAmount(booking));
    subtitle.appendChild(amount);

    if (adminMode) {
      const owner = document.createElement("span");
      owner.textContent = `${booking.name} (${booking.phone})`;
      subtitle.appendChild(owner);
    }

    card.appendChild(cardInfo);
    card.appendChild(subtitle);

    return card;
  }

  function applyFilter(list, filter) {
    if (filter === FILTER_DEFAULT) return list;
    return list.filter((booking) => computedBookingStatus(booking) === filter);
  }

  function setFilterButtons(container, activeValue) {
    if (!isElement(container)) return;
    container.querySelectorAll("button[data-filter]").forEach((button) => {
      button.classList.toggle(
        "filter-button-active",
        button.dataset.filter === activeValue,
      );
    });
  }

  function setTabButtons(activeTab) {
    if (!isElement(dom.adminTabs)) return;
    dom.adminTabs.querySelectorAll("button[data-tab]").forEach((button) => {
      button.classList.toggle(
        "tab-button-active",
        button.dataset.tab === activeTab,
      );
    });
  }

  function renderDashboardWallet(user) {
    if (isAdmin()) {
      setHidden(dom.dashboardWalletPanel, true);
      setHidden(dom.adminIncomePanel, false);
      if (isElement(dom.adminIncome))
        dom.adminIncome.textContent = toToman(settings.adminWallet || 0);
      if (isElement(dom.adminIncomeTotal)) {
        dom.adminIncomeTotal.textContent = toToman(
          settings.adminTotalIncome || 0,
        );
      }
    } else {
      setHidden(dom.dashboardWalletPanel, false);
      if (isElement(dom.dashboardWallet)) {
        dom.dashboardWallet.textContent = toToman(user.wallet || 0);
      }
      setHidden(dom.adminIncomePanel, true);
    }
  }

  function renderUserBookings(user) {
    if (!isElement(dom.userBookings)) return;

    dom.userBookings.innerHTML = "";

    const mine = bookings
      .filter((booking) => booking.phone === user.phone)
      .sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso));

    const filtered = applyFilter(mine, userFilter);

    if (!filtered.length) {
      dom.userBookings.innerHTML =
        '<div class="empty-note">موردی برای نمایش نیست.</div>';
      return;
    }

    filtered.forEach((booking) => {
      dom.userBookings.appendChild(createBookingCard(booking, false));
    });
  }

  function renderAdminBookings() {
    if (!isElement(dom.adminBookings)) return;

    dom.adminBookings.innerHTML = "";

    const sorted = bookings
      .slice()
      .sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso));

    const filtered = applyFilter(sorted, adminFilter);

    if (!filtered.length) {
      dom.adminBookings.innerHTML =
        '<div class="empty-note">موردی برای نمایش نیست.</div>';
      return;
    }

    filtered.forEach((booking) => {
      dom.adminBookings.appendChild(createBookingCard(booking, true));
    });
  }

  function showAdminTab(tab) {
    activeAdminTab = normalizeActiveAdminTab(tab);
    persist();

    setTabButtons(activeAdminTab);

    setHidden(dom.adminBookingsPanel, activeAdminTab !== ADMIN_TAB.BOOKINGS);
    setHidden(dom.adminServicesPanel, activeAdminTab !== ADMIN_TAB.SERVICES);
    setHidden(dom.adminWorksPanel, activeAdminTab !== ADMIN_TAB.WORKS);
    setHidden(dom.adminSettingsPanel, activeAdminTab !== ADMIN_TAB.SETTINGS);
    setHidden(dom.adminFilter, activeAdminTab !== ADMIN_TAB.BOOKINGS);
  }

  function clearServiceForm() {
    if (isElement(dom.serviceName)) dom.serviceName.value = "";
    if (isElement(dom.serviceMinutes)) dom.serviceMinutes.value = "";
    if (isElement(dom.servicePrice)) dom.servicePrice.value = "";

    if (isElement(dom.serviceSave)) {
      dom.serviceSave.textContent = "افزودن";
      delete dom.serviceSave.dataset.editId;
    }
  }

  function renderServiceManager() {
    if (!isElement(dom.serviceList)) return;

    dom.serviceList.innerHTML = "";

    const sorted = settings.services
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "fa"));
    if (!sorted.length) {
      dom.serviceList.innerHTML =
        '<div class="empty-note">خدمتی وجود ندارد.</div>';
      return;
    }

    sorted.forEach((service) => {
      const card = document.createElement("div");
      card.className = "service-card";

      const cardBox = document.createElement("div");
      cardBox.className = "service-card-box";

      const title = document.createElement("div");
      title.className = "service-card-title";
      title.textContent = `${service.name} - ${service.minutes} دقیقه`;

      const price = document.createElement("span");
      price.textContent = toToman(service.price);

      const actions = document.createElement("div");
      actions.className = "service-card-actions";

      const editButton = document.createElement("button");
      editButton.className = "edit-service-button";
      editButton.type = "button";
      editButton.textContent = "ویرایش";
      editButton.addEventListener("click", () => {
        if (isElement(dom.serviceName)) dom.serviceName.value = service.name;
        if (isElement(dom.serviceMinutes))
          dom.serviceMinutes.value = String(service.minutes);
        if (isElement(dom.servicePrice))
          dom.servicePrice.value = String(service.price);

        if (isElement(dom.serviceSave)) {
          dom.serviceSave.textContent = "ذخیره تغییرات";
          dom.serviceSave.dataset.editId = service.id;
        }

        showToast("تغییرات را ذخیره کن.", "info");
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-service-button danger-button";
      deleteButton.type = "button";
      deleteButton.textContent = "حذف";
      deleteButton.addEventListener("click", () => {
        if (settings.services.length <= 1) {
          showToast("حداقل یک خدمت لازم است.", "warn");
          return;
        }

        settings.services = settings.services.filter(
          (entry) => entry.id !== service.id,
        );
        selectedServiceIds = normalizeSelectedServiceIds(
          selectedServiceIds,
          settings.services,
        );

        persist();
        clearServiceForm();
        renderServiceManager();
        renderServicesModal();
        syncMainUI();
        rebuildBookingSelectors();
        showToast("خدمت حذف شد.", "success");
      });

      cardBox.append(title, price);
      actions.append(editButton, deleteButton);
      card.append(cardBox, actions);

      dom.serviceList.appendChild(card);
    });
  }

  function validateServiceForm() {
    const name = normalizeText(dom.serviceName?.value);
    const minutes = clampInt(dom.serviceMinutes?.value, 0);
    const price = clampInt(dom.servicePrice?.value, 0);

    if (name.length < 2) return { ok: false, message: "نام خدمت معتبر نیست." };
    if (minutes < 5) return { ok: false, message: "زمان خدمت معتبر نیست." };
    if (price < 0) return { ok: false, message: "قیمت معتبر نیست." };

    return { ok: true, name, minutes, price };
  }

  function saveServiceFromForm() {
    const result = validateServiceForm();
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    const editId = normalizeText(dom.serviceSave?.dataset.editId);

    if (editId) {
      const target = serviceById(editId);
      if (!target) {
        showToast("خدمت پیدا نشد.", "error");
        return;
      }

      target.name = result.name;
      target.minutes = result.minutes;
      target.price = result.price;
      showToast("خدمت ویرایش شد.", "success");
    } else {
      const newId = `svc_${uid().slice(0, 8)}`;
      settings.services.push({
        id: newId,
        name: result.name,
        minutes: result.minutes,
        price: result.price,
      });
      showToast("خدمت اضافه شد.", "success");
    }

    selectedServiceIds = normalizeSelectedServiceIds(
      selectedServiceIds,
      settings.services,
    );
    persist();
    clearServiceForm();
    renderServiceManager();
    renderServicesModal();
    syncMainUI();
    rebuildBookingSelectors();
  }

  function clearWorkForm() {
    if (isElement(dom.workImage)) dom.workImage.value = "";
    if (isElement(dom.workTitle)) dom.workTitle.value = "";
    if (isElement(dom.workComment)) dom.workComment.value = "";
    if (isElement(dom.workUser)) dom.workUser.value = "";

    if (isElement(dom.workSave)) {
      dom.workSave.textContent = "افزودن نمونه‌کار";
      delete dom.workSave.dataset.editId;
    }
  }

  function validateWorkForm() {
    const image = normalizeWorkImagePath(dom.workImage?.value);
    const title = normalizeText(dom.workTitle?.value);
    const comment = normalizeText(dom.workComment?.value);
    const user = normalizeText(dom.workUser?.value);

    if (!isValidWorkImagePath(image)) {
      return { ok: false, message: "مسیر تصویر محلی معتبر نیست." };
    }
    if (title.length < 2) return { ok: false, message: "عنوان معتبر نیست." };
    if (comment.length < 5) return { ok: false, message: "نظر کوتاه است." };
    if (user.length < 2) return { ok: false, message: "نام کاربر معتبر نیست." };

    return { ok: true, image, title, comment, user };
  }

  function renderWorksManager() {
    if (!isElement(dom.worksList)) return;

    dom.worksList.innerHTML = "";
    const works = galleryWorks();

    if (!works.length) {
      dom.worksList.innerHTML =
        '<div class="empty-note">نمونه‌کاری برای نمایش نیست.</div>';
      return;
    }

    works.forEach((work) => {
      const card = document.createElement("div");
      card.className = "work-card";

      const preview = document.createElement("img");
      preview.className = "work-card-image";
      setImageWithFallback(preview, work.image, work.title);
      preview.loading = "lazy";

      const meta = document.createElement("div");
      meta.className = "work-card-meta";

      const title = document.createElement("div");
      title.className = "work-card-title";
      title.textContent = work.title;

      const comment = document.createElement("div");
      comment.className = "work-card-comment";
      comment.textContent = work.comment;

      const user = document.createElement("div");
      user.className = "work-card-user";
      user.textContent = work.user;

      const actions = document.createElement("div");
      actions.className = "service-card-actions";

      const editButton = document.createElement("button");
      editButton.className = "edit-service-button";
      editButton.type = "button";
      editButton.textContent = "ویرایش";
      editButton.addEventListener("click", () => {
        if (isElement(dom.workImage)) dom.workImage.value = work.image;
        if (isElement(dom.workTitle)) dom.workTitle.value = work.title;
        if (isElement(dom.workComment)) dom.workComment.value = work.comment;
        if (isElement(dom.workUser)) dom.workUser.value = work.user;

        if (isElement(dom.workSave)) {
          dom.workSave.textContent = "ذخیره تغییرات";
          dom.workSave.dataset.editId = work.id;
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-service-button danger-button";
      deleteButton.type = "button";
      deleteButton.textContent = "حذف";
      deleteButton.addEventListener("click", () => {
        settings.works = galleryWorks().filter((entry) => entry.id !== work.id);
        if (galleryIndex >= settings.works.length) {
          galleryIndex = Math.max(0, settings.works.length - 1);
        }
        persist();
        clearWorkForm();
        renderWorksManager();
        renderGallery();
        showToast("نمونه‌کار حذف شد.", "success");
      });

      actions.append(editButton, deleteButton);
      meta.append(title, comment, user, actions);
      card.append(preview, meta);
      dom.worksList.appendChild(card);
    });
  }

  function saveWorkFromForm() {
    const result = validateWorkForm();
    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    const editId = normalizeText(dom.workSave?.dataset.editId);
    settings.works = galleryWorks();

    if (editId) {
      const target = workById(editId);
      if (!target) {
        showToast("نمونه‌کار پیدا نشد.", "error");
        return;
      }

      target.image = result.image;
      target.title = result.title;
      target.comment = result.comment;
      target.user = result.user;
      showToast("نمونه‌کار ویرایش شد.", "success");
    } else {
      settings.works.unshift({
        id: `work_${uid().slice(0, 8)}`,
        image: result.image,
        title: result.title,
        comment: result.comment,
        user: result.user,
      });
      galleryIndex = 0;
      showToast("نمونه‌کار اضافه شد.", "success");
    }

    persist();
    clearWorkForm();
    renderWorksManager();
    renderGallery();
  }

  function buildFutureDays(limit) {
    const days = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    for (let i = 0; i < limit; i += 1) {
      const next = new Date(base);
      next.setDate(base.getDate() + i);
      days.push(toDayKey(next));
    }

    return days;
  }

  function renderDaysList() {
    if (!isElement(dom.daysList) || !isElement(dom.daysAhead)) return;

    dom.daysList.innerHTML = "";

    const limit = clampInt(dom.daysAhead.value, 1, 90) || settings.daysAhead;
    const days = buildFutureDays(limit);

    const explicitMode =
      Array.isArray(settings.enabledDates) && settings.enabledDates.length > 0;
    const enabledSet = new Set(settings.enabledDates || []);
    const toggleDay = (dayKey) => {
      if (
        !Array.isArray(settings.enabledDates) ||
        settings.enabledDates.length === 0
      ) {
        settings.enabledDates = days.slice();
      }

      const currentSet = new Set(settings.enabledDates);
      if (currentSet.has(dayKey)) {
        currentSet.delete(dayKey);
      } else {
        currentSet.add(dayKey);
      }

      settings.enabledDates = [...currentSet].sort();
      persist();
      renderDaysList();
    };

    days.forEach((dayKey) => {
      const card = document.createElement("div");
      card.className = "day-card";

      const isEnabled = explicitMode ? enabledSet.has(dayKey) : true;
      card.classList.toggle("day-card-active", isEnabled);

      const info = document.createElement("div");
      info.className = "day-card-info";

      const title = document.createElement("div");
      title.className = "day-card-title";
      title.textContent = dateFa(dayKey);

      const subtitle = document.createElement("div");
      subtitle.className = "day-card-subtitle";
      subtitle.textContent = dayKey;

      const toggleButton = document.createElement("button");
      toggleButton.className = "soft-button day-card-toggle";
      toggleButton.type = "button";
      toggleButton.textContent = isEnabled ? "لغو انتخاب" : "انتخاب";
      toggleButton.addEventListener("click", () => {
        toggleDay(dayKey);
      });

      card.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.closest("button")) return;
        toggleDay(dayKey);
      });

      info.append(title, subtitle);
      card.append(info, toggleButton);
      dom.daysList.appendChild(card);
    });
  }

  function minToHHMM(minutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${pad2(hour)}:${pad2(minute)}`;
  }

  function hhmmToMin(value) {
    const parts = String(value || "").split(":");
    if (parts.length !== 2) return 0;
    const hour = clampInt(parts[0], 0, 23);
    const minute = clampInt(parts[1], 0, 59);
    return hour * 60 + minute;
  }

  function buildTimeOptions(step = 15) {
    const options = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += step) {
      options.push(minToHHMM(minutes));
    }
    return options;
  }

  const timeOptions = buildTimeOptions(15);

  function renderShiftsList() {
    if (!isElement(dom.shiftsList)) return;

    dom.shiftsList.innerHTML = "";

    const shiftList = normalizeShifts(settings.shifts);
    settings.shifts = shiftList;

    shiftList.forEach((shift, index) => {
      const card = document.createElement("div");
      card.className = "shift-card";

      const selectRow = document.createElement("div");
      selectRow.className = "shift-select-row";

      const startSelect = document.createElement("select");
      startSelect.className = "shift-select";

      const endSelect = document.createElement("select");
      endSelect.className = "shift-select";

      timeOptions.forEach((timeValue) => {
        const startOption = document.createElement("option");
        startOption.value = timeValue;
        startOption.textContent = `از ${timeValue}`;
        startSelect.appendChild(startOption);

        const endOption = document.createElement("option");
        endOption.value = timeValue;
        endOption.textContent = `تا ${timeValue}`;
        endSelect.appendChild(endOption);
      });

      startSelect.value = minToHHMM(shift.startMin);
      endSelect.value = minToHHMM(shift.endMin);

      function commitShift() {
        const next = normalizeShifts(settings.shifts);
        next[index] = {
          startMin: hhmmToMin(startSelect.value),
          endMin: hhmmToMin(endSelect.value),
        };
        settings.shifts = next;
        persist();
      }

      startSelect.addEventListener("change", commitShift);
      endSelect.addEventListener("change", commitShift);

      const removeButton = document.createElement("button");
      removeButton.className = "shift-remove";
      removeButton.type = "button";
      removeButton.textContent = "حذف";
      removeButton.addEventListener("click", () => {
        const next = settings.shifts.filter(
          (_, shiftIndex) => shiftIndex !== index,
        );
        settings.shifts = normalizeShifts(next);
        persist();
        renderShiftsList();
      });

      selectRow.appendChild(startSelect);
      selectRow.appendChild(endSelect);

      card.appendChild(selectRow);
      card.appendChild(removeButton);

      dom.shiftsList.appendChild(card);
    });
  }

  function renderAdminSettings() {
    if (!isAdmin()) return;

    if (isElement(dom.toggleBookingStatus)) {
      dom.toggleBookingStatus.textContent = settings.isOpen
        ? "باز است (بستن)"
        : "بسته است (باز کردن)";
    }

    if (isElement(dom.daysAhead)) {
      dom.daysAhead.value = String(settings.daysAhead);
    }

    renderDaysList();
    renderShiftsList();
  }

  function saveAdminSettings() {
    if (!isAdmin()) return;

    const daysAhead =
      clampInt(dom.daysAhead?.value, 1, 90) || settings.daysAhead;
    settings.daysAhead = daysAhead;

    const availableDays = buildFutureDays(daysAhead);
    if (
      Array.isArray(settings.enabledDates) &&
      settings.enabledDates.length > 0
    ) {
      settings.enabledDates = settings.enabledDates
        .filter((dayKey) => availableDays.includes(dayKey))
        .sort();
    }

    settings.shifts = normalizeShifts(settings.shifts);

    persist();
    syncMainUI();
    rebuildBookingSelectors();
    renderDashboard();
    showToast("تنظیمات ذخیره شد.", "success");
  }

  function renderDashboard() {
    if (!currentUser) return;

    const user = ensureUser(currentUser.phone);
    if (!user) return;

    if (isElement(dom.dashboardName)) {
      dom.dashboardName.textContent = isAdmin()
        ? `${user.name} (ادمین)`
        : user.name;
    }

    if (isElement(dom.dashboardPhone)) {
      dom.dashboardPhone.textContent = user.phone;
    }

    renderDashboardWallet(user);

    const adminMode = isAdmin();
    setHidden(dom.userSection, adminMode);
    setHidden(dom.adminSection, !adminMode);

    setFilterButtons(dom.userFilter, userFilter);
    setFilterButtons(dom.adminFilter, adminFilter);

    if (!adminMode) {
      renderUserBookings(user);
      return;
    }

    showAdminTab(activeAdminTab);
    renderAdminBookings();
    renderServiceManager();
    renderWorksManager();
    renderAdminSettings();
  }

  function openDashboard() {
    if (!currentUser) return;
    renderDashboard();
    openModal(dom.dashboardModal);
  }

  function openPayment(startIso) {
    if (!settings.isOpen) {
      showToast("رزرو بسته است.", "warn");
      return;
    }

    if (!currentUser) {
      showToast("اول وارد شو.", "warn");
      return;
    }

    if (isAdmin()) {
      showToast("ادمین رزرو نمی کند.", "error");
      return;
    }

    const totals = selectionTotals();
    if (!totals.list.length || totals.totalMinutes <= 0) {
      showToast("خدمت انتخاب نشده.", "warn");
      return;
    }

    const startMs = Date.parse(startIso);
    if (!Number.isFinite(startMs)) {
      showToast("زمان معتبر نیست.", "error");
      return;
    }

    const endMs = startMs + totals.totalMinutes * 60000;

    const conflict = bookings.some((booking) => {
      if (!isBlockingBooking(booking)) return false;
      return overlapMs(
        startMs,
        endMs,
        Date.parse(booking.startIso),
        Date.parse(booking.endIso),
      );
    });

    if (conflict) {
      showToast("این ساعت پر است.", "warn");
      rebuildBookingSelectors();
      return;
    }

    pendingPayment = {
      startIso: new Date(startMs).toISOString(),
      endIso: new Date(endMs).toISOString(),
      serviceIds: totals.list.map((service) => service.id),
      totalMinutes: totals.totalMinutes,
      totalPrice: totals.totalPrice,
      walletUsed: 0,
      paidCash: totals.totalPrice,
    };

    walletSelected = false;

    if (isElement(dom.paymentServices)) {
      dom.paymentServices.textContent = selectionLabel();
    }
    if (isElement(dom.paymentDuration)) {
      dom.paymentDuration.textContent = `${totals.totalMinutes} دقیقه`;
    }
    if (isElement(dom.paymentTotal)) {
      dom.paymentTotal.textContent = toToman(totals.totalPrice);
    }

    renderPaymentAmounts();
    openModal(dom.paymentModal);
  }

  function renderPaymentAmounts() {
    if (!pendingPayment || !currentUser) return;

    const user = ensureUser(currentUser.phone);
    if (!user) return;

    const wallet = clampInt(user.wallet, 0);
    const walletUsed = walletSelected
      ? Math.min(wallet, pendingPayment.totalPrice)
      : 0;
    const finalAmount = Math.max(0, pendingPayment.totalPrice - walletUsed);

    pendingPayment.walletUsed = walletUsed;
    pendingPayment.paidCash = finalAmount;

    if (isElement(dom.paymentWallet)) {
      dom.paymentWallet.textContent = walletSelected
        ? `${toToman(walletUsed)} (از ${toToman(wallet)})`
        : `استفاده نمی شود (${toToman(wallet)})`;
    }

    if (isElement(dom.paymentFinal)) {
      dom.paymentFinal.textContent = toToman(finalAmount);
    }

    if (isElement(dom.walletToggle)) {
      dom.walletToggle.textContent = walletSelected ? "لغو انتخاب" : "انتخاب";
      dom.walletToggle.disabled = wallet <= 0;
    }

    if (isElement(dom.walletRow)) {
      dom.walletRow.classList.toggle("wallet-row-active", walletSelected);
    }
  }

  function toggleWalletUsage() {
    if (!pendingPayment || !currentUser) return;

    const user = ensureUser(currentUser.phone);
    if (!user) return;

    if (clampInt(user.wallet, 0) <= 0) {
      walletSelected = false;
      renderPaymentAmounts();
      showToast("کیف پول موجودی ندارد.", "warn");
      return;
    }

    walletSelected = !walletSelected;
    renderPaymentAmounts();
  }

  function finalizePayment() {
    if (!pendingPayment || !currentUser) return;

    const user = ensureUser(currentUser.phone);
    if (!user) return;

    const startMs = Date.parse(pendingPayment.startIso);
    const endMs = Date.parse(pendingPayment.endIso);

    if (
      !Number.isFinite(startMs) ||
      !Number.isFinite(endMs) ||
      endMs <= startMs
    ) {
      showToast("زمان رزرو نامعتبر است.", "error");
      pendingPayment = null;
      closeAllModals();
      return;
    }

    const conflict = bookings.some((booking) => {
      if (!isBlockingBooking(booking)) return false;
      return overlapMs(
        startMs,
        endMs,
        Date.parse(booking.startIso),
        Date.parse(booking.endIso),
      );
    });

    if (conflict) {
      showToast("ساعت پر شده است.", "warn");
      pendingPayment = null;
      closeAllModals();
      rebuildBookingSelectors();
      return;
    }

    const walletUsed = Math.max(
      0,
      Math.min(
        clampInt(user.wallet, 0),
        clampInt(pendingPayment.walletUsed, 0),
      ),
    );
    const paidCash = Math.max(0, clampInt(pendingPayment.paidCash, 0));
    const totalPaid = walletUsed + paidCash;

    user.wallet = clampInt(user.wallet, 0) - walletUsed;
    settings.adminWallet = clampInt(settings.adminWallet, 0) + totalPaid;
    settings.adminTotalIncome =
      clampInt(settings.adminTotalIncome, 0) + totalPaid;

    bookings.push({
      id: uid(),
      phone: user.phone,
      name: user.name,
      serviceIds: pendingPayment.serviceIds.slice(),
      totalMinutes: pendingPayment.totalMinutes,
      totalPrice: pendingPayment.totalPrice,
      walletUsed,
      paidCash,
      startIso: pendingPayment.startIso,
      endIso: pendingPayment.endIso,
      status: STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
    });

    pendingPayment = null;
    walletSelected = false;

    persist();

    showToast("رزرو ثبت شد.", "success");
    closeAllModals();
    syncMainUI();
    rebuildBookingSelectors();
    renderDashboard();
  }

  function bindServiceSelection() {
    dom.servicesList?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const row = target.closest(".service-option");
      if (!(row instanceof HTMLElement)) return;

      const serviceId = normalizeText(row.dataset.serviceId);
      if (!serviceId) return;

      const selectedSet = new Set(selectedServiceIds);
      if (selectedSet.has(serviceId)) {
        selectedSet.delete(serviceId);
      } else {
        selectedSet.add(serviceId);
      }

      selectedServiceIds = [...selectedSet];
      if (selectedServiceIds.length === 0) {
        selectedServiceIds = [serviceId];
        showToast("حداقل یک خدمت لازم است.", "warn");
      }

      persist();
      renderServicesModal();
      syncMainUI();
      rebuildBookingSelectors();
    });

    dom.selectedServices?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const removeButton = target.closest(".service-chip-remove");
      if (!(removeButton instanceof HTMLElement)) return;

      const serviceId = normalizeText(removeButton.dataset.serviceId);
      if (!serviceId) return;

      if (selectedServiceIds.length <= 1) {
        showToast("حداقل یک خدمت لازم است.", "warn");
        return;
      }

      selectedServiceIds = selectedServiceIds.filter((id) => id !== serviceId);
      selectedServiceIds = normalizeSelectedServiceIds(
        selectedServiceIds,
        settings.services,
      );

      persist();
      syncMainUI();
      rebuildBookingSelectors();
    });
  }

  function bindFilters() {
    dom.userFilter?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const button = target.closest("button[data-filter]");
      if (!(button instanceof HTMLButtonElement)) return;

      userFilter = button.dataset.filter || FILTER_DEFAULT;
      setFilterButtons(dom.userFilter, userFilter);
      renderDashboard();
    });

    dom.adminFilter?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const button = target.closest("button[data-filter]");
      if (!(button instanceof HTMLButtonElement)) return;

      adminFilter = button.dataset.filter || FILTER_DEFAULT;
      setFilterButtons(dom.adminFilter, adminFilter);
      renderDashboard();
    });
  }

  function bindTabs() {
    dom.adminTabs?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const button = target.closest("button[data-tab]");
      if (!(button instanceof HTMLButtonElement)) return;

      showAdminTab(button.dataset.tab || ADMIN_TAB.BOOKINGS);
      renderDashboard();
    });
  }

  function bindEvents() {
    dom.toastClose?.addEventListener("click", hideToast);

    dom.modalOverlay?.addEventListener("click", () => {
      pendingPayment = null;
      walletSelected = false;
      closeAllModals();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      pendingPayment = null;
      walletSelected = false;
      closeAllModals();
    });

    dom.toggleHelp?.addEventListener("click", () => {
      if (!isElement(dom.helpPanel)) return;
      dom.helpPanel.classList.toggle("app-hidden");
    });

    dom.openAccount?.addEventListener("click", () => {
      if (currentUser) {
        openDashboard();
      } else {
        openAuthModal();
      }
    });
    dom.focusBooking?.addEventListener("click", focusBookingForm);
    dom.galleryPrev?.addEventListener("click", () => moveGallery(-1));
    dom.galleryNext?.addEventListener("click", () => moveGallery(1));

    dom.scrollTop?.addEventListener("click", () => {
      window.scrollTo(0, 0);
    });

    dom.openServices?.addEventListener("click", () => {
      renderServicesModal();
      openModal(dom.servicesModal);
    });

    dom.closeServices?.addEventListener("click", closeAllModals);
    dom.confirmServices?.addEventListener("click", () => {
      closeAllModals();
      syncMainUI();
      rebuildBookingSelectors();
    });

    dom.closePayment?.addEventListener("click", () => {
      pendingPayment = null;
      walletSelected = false;
      closeAllModals();
    });

    dom.closeAuth?.addEventListener("click", closeAllModals);
    dom.closeDashboard?.addEventListener("click", closeAllModals);

    dom.bookingDate?.addEventListener("change", fillTimeSelect);

    dom.startPayment?.addEventListener("click", () => {
      if (!settings.isOpen) {
        showToast("رزرو بسته است.", "warn");
        return;
      }

      if (currentUser && isAdmin()) {
        showToast("ادمین رزرو نمی کند.", "error");
        return;
      }

      const totals = selectionTotals();
      if (totals.totalMinutes <= 0) {
        showToast("خدمت انتخاب نشده.", "warn");
        return;
      }

      const startIso = normalizeText(dom.bookingTime?.value);
      if (!startIso) {
        showToast("تاریخ و ساعت را انتخاب کن.", "warn");
        return;
      }

      if (!currentUser) {
        showToast("برای رزرو وارد شو.", "info");
        dom.guestPhone?.focus();
        return;
      }

      openPayment(startIso);
    });

    dom.walletToggle?.addEventListener("click", toggleWalletUsage);
    dom.walletRow?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest("button")) return;
      toggleWalletUsage();
    });

    dom.paymentConfirm?.addEventListener("click", () => {
      if (!pendingPayment || !currentUser) return;
      showToast("درگاه آزمایشی فعال شد.", "info");
      setTimeout(finalizePayment, 500);
    });

    dom.dashboardLogout?.addEventListener("click", () => {
      currentUser = null;
      persist();

      resetGuestFlow();
      closeAllModals();
      syncMainUI();
      rebuildBookingSelectors();
      showToast("خارج شدی.", "info");
    });

    dom.guestSend?.addEventListener("click", () => {
      const phone = sendFakeCode(dom.guestPhone?.value);
      if (!phone) return;

      guestPhoneCache = phone;
      if (isElement(dom.guestPhonePreview))
        dom.guestPhonePreview.textContent = phone;

      showGuestStep("code");
      dom.guestCode?.focus();
    });

    dom.guestPhoneEdit?.addEventListener("click", () => {
      guestPhoneCache = "";
      showGuestStep("phone");
      dom.guestPhone?.focus();
    });

    dom.guestVerify?.addEventListener("click", () => {
      const phone = guestPhoneCache || validatePhone(dom.guestPhone?.value);
      const code = normalizeText(dom.guestCode?.value);

      if (!phone) {
        showToast("شماره موبایل معتبر نیست.", "error");
        showGuestStep("phone");
        dom.guestPhone?.focus();
        return;
      }

      if (!sentCodes[phone]) {
        showToast("اول کد بگیر.", "warn");
        showGuestStep("phone");
        dom.guestPhone?.focus();
        return;
      }

      if (!code) {
        showToast("کد تایید لازم است.", "error");
        dom.guestCode?.focus();
        return;
      }

      const exists = !!findUser(phone);
      if (exists) {
        loginUser(phone);
        resetGuestFlow();
        rebuildBookingSelectors();
        showToast("ورود انجام شد.", "success");
        return;
      }

      guestPhoneCache = phone;
      showGuestStep("name");
      dom.guestName?.focus();
    });

    dom.guestNameSave?.addEventListener("click", () => {
      const phone = guestPhoneCache || validatePhone(dom.guestPhone?.value);
      if (!phone) {
        showToast("شماره موبایل معتبر نیست.", "error");
        showGuestStep("phone");
        return;
      }

      if (!sentCodes[phone]) {
        showToast("اول کد بگیر.", "warn");
        showGuestStep("phone");
        return;
      }

      const ok = registerUser(phone, dom.guestName?.value);
      if (!ok) return;

      resetGuestFlow();
      rebuildBookingSelectors();
      showToast("ثبت نام انجام شد.", "success");
    });

    dom.guestPhone?.addEventListener("input", () => {
      guestPhoneCache = "";
      if (isElement(dom.guestPhonePreview))
        dom.guestPhonePreview.textContent = "";
      if (isElement(dom.guestCode)) dom.guestCode.value = "";
      if (isElement(dom.guestName)) dom.guestName.value = "";
      showGuestStep("phone");
    });

    dom.authSend?.addEventListener("click", () => {
      const phone = sendFakeCode(dom.authPhone?.value);
      if (!phone) return;

      authPhoneCache = phone;
      if (isElement(dom.authPhonePreview))
        dom.authPhonePreview.textContent = phone;

      const exists = !!findUser(phone);
      if (isElement(dom.authTitle))
        dom.authTitle.textContent = exists ? "ورود" : "ثبت نام";
      if (isElement(dom.authVerify))
        dom.authVerify.textContent = exists ? "ورود" : "ثبت نام";

      showAuthStep("code");
      dom.authCode?.focus();
    });

    dom.authPhoneEdit?.addEventListener("click", () => {
      authPhoneCache = "";
      if (isElement(dom.authTitle)) dom.authTitle.textContent = "ورود";
      if (isElement(dom.authVerify)) dom.authVerify.textContent = "ورود";
      showAuthStep("phone");
      dom.authPhone?.focus();
    });

    dom.authVerify?.addEventListener("click", () => {
      const phone = authPhoneCache;
      const code = normalizeText(dom.authCode?.value);

      if (!phone) {
        showToast("شماره موبایل معتبر نیست.", "error");
        showAuthStep("phone");
        dom.authPhone?.focus();
        return;
      }

      if (!sentCodes[phone]) {
        showToast("اول کد بگیر.", "warn");
        showAuthStep("phone");
        dom.authPhone?.focus();
        return;
      }

      if (!code) {
        showToast("کد تایید لازم است.", "error");
        dom.authCode?.focus();
        return;
      }

      const exists = !!findUser(phone);
      if (exists) {
        loginUser(phone);
        closeAllModals();
        rebuildBookingSelectors();
        showToast("ورود انجام شد.", "success");
        return;
      }

      showAuthStep("name");
      dom.authName?.focus();
    });

    dom.authNameSave?.addEventListener("click", () => {
      const phone = authPhoneCache;

      if (!phone) {
        showToast("شماره موبایل معتبر نیست.", "error");
        showAuthStep("phone");
        return;
      }

      if (!sentCodes[phone]) {
        showToast("اول کد بگیر.", "warn");
        showAuthStep("phone");
        return;
      }

      const ok = registerUser(phone, dom.authName?.value);
      if (!ok) return;

      closeAllModals();
      rebuildBookingSelectors();
      showToast("ثبت نام انجام شد.", "success");
    });

    dom.userCancelAll?.addEventListener("click", cancelAllUserBookings);
    dom.adminCancelAll?.addEventListener("click", cancelAllAdminBookings);

    bindFilters();
    bindTabs();
    bindServiceSelection();

    dom.serviceSave?.addEventListener("click", saveServiceFromForm);
    dom.workSave?.addEventListener("click", saveWorkFromForm);

    dom.toggleBookingStatus?.addEventListener("click", () => {
      if (!isAdmin()) return;
      settings.isOpen = !settings.isOpen;
      persist();
      syncMainUI();
      rebuildBookingSelectors();
      renderDashboard();
      showToast(settings.isOpen ? "رزرو باز شد." : "رزرو بسته شد.", "success");
    });

    dom.rebuildDays?.addEventListener("click", () => {
      if (!isAdmin()) return;
      renderDaysList();
      showToast("لیست روزها بازسازی شد.", "success");
    });

    dom.addShift?.addEventListener("click", () => {
      if (!isAdmin()) return;
      settings.shifts = normalizeShifts(settings.shifts);
      settings.shifts.push({ startMin: 15 * 60, endMin: 19 * 60 });
      persist();
      renderShiftsList();
      showToast("شیفت اضافه شد.", "success");
    });

    dom.saveSettings?.addEventListener("click", saveAdminSettings);

    dom.adminIncomeReset?.addEventListener("click", () => {
      if (!isAdmin()) return;

      if (clampInt(settings.adminWallet, 0) <= 0) {
        showToast("درآمد دوره صفر است.", "info");
        return;
      }

      const confirmed = window.confirm("درآمد دوره ادمین ریست شود؟");
      if (!confirmed) return;

      settings.adminWallet = 0;
      persist();
      syncMainUI();
      renderDashboard();
      showToast("درآمد ریست شد.", "success");
    });
  }

  function initState() {
    if (currentUser?.phone) {
      const user = findUser(currentUser.phone);
      if (!user) currentUser = null;
    }

    bookings.forEach((booking) => {
      ensureUser(booking.phone, booking.name);
    });

    selectedServiceIds = normalizeSelectedServiceIds(
      selectedServiceIds,
      settings.services,
    );
    settings.works = normalizeWorks(settings.works, DEFAULT_WORKS);
    settings.shifts = normalizeShifts(settings.shifts);
    activeAdminTab = normalizeActiveAdminTab(activeAdminTab);
    galleryIndex = clampInt(
      galleryIndex,
      0,
      Math.max(0, settings.works.length - 1),
    );

    persist();
  }

  function init() {
    initState();
    bindEvents();

    syncMainUI();
    rebuildBookingSelectors();
    resetGuestFlow();
    resetAuthFlow();

    setFilterButtons(dom.userFilter, userFilter);
    setFilterButtons(dom.adminFilter, adminFilter);
    setTabButtons(activeAdminTab);

    setInterval(() => {
      if (!currentUser) return;
      if (!isElement(dom.dashboardModal)) return;
      if (dom.dashboardModal.classList.contains("app-hidden")) return;
      renderDashboard();
    }, 30000);
  }

  init();
})();
