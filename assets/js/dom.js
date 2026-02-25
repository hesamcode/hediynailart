const $ = (id) => document.getElementById(id);

export function getDomRefs() {
  return {
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
    appleStatusBarMeta: $("apple-status-bar-meta"),

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
}
