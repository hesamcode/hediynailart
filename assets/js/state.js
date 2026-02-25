export function createAppState() {
  return {
    selectedServiceIds: new Set(),
    selectedDayKey: "",
    selectedTimeMin: null,
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
}
