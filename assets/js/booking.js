// booking.js
// ============================================================
// HediyeNailArt - Booking Logic (Bilingual)
// ============================================================

import {
  PHONE,
  SERVICES,
  SLOT_CONFIG,
  getServices,
  LANG,
  getUIText,
  saveLanguagePreference,
} from "./config.js";
import {
  buildPrimaryDateChoices,
  buildSlotsForDay,
  computeWorkingDayKeys,
  dateFaShort,
  dateFromDayKeyAndMinute,
  timeFa,
} from "./date-utils.js";

export function initBooking({ dom, state, showToast }) {
  function getCurrentServices() {
    return getServices();
  }

  function selectedServicesLabel() {
    const serviceList = getCurrentServices();
    const names = serviceList
      .filter((service) => state.selectedServiceIds.has(service.id))
      .map((service) => service.name);
    return names.length ? names.join(" + ") : "—";
  }

  function selectedDatetimeLabel() {
    if (!state.selectedDayKey) {
      return "—";
    }

    const { weekday, md } = dateFaShort(state.selectedDayKey);

    if (state.timeMode === "nearest") {
      return `${weekday} ${md} - ${getUIText("nearestTime")}`;
    }

    if (state.selectedTimeMin == null) {
      return `${weekday} ${md} - ${getUIText("customTime")}`;
    }

    const dateTime = dateFromDayKeyAndMinute(
      state.selectedDayKey,
      state.selectedTimeMin,
    );
    return `${weekday} ${md} - ${timeFa(dateTime)}`;
  }

  function syncSummary() {
    if (dom.summaryServices) {
      dom.summaryServices.textContent = selectedServicesLabel();
    }
    if (dom.summaryDatetime) {
      dom.summaryDatetime.textContent = selectedDatetimeLabel();
    }
  }

  function renderServicesInline() {
    if (!dom.servicesInline) {
      return;
    }

    dom.servicesInline.innerHTML = "";
    const serviceList = getCurrentServices();

    serviceList.forEach((service) => {
      const selected = state.selectedServiceIds.has(service.id);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `chip${selected ? " selected" : ""}`;
      chip.setAttribute("aria-pressed", selected ? "true" : "false");

      chip.innerHTML = `
        <span class="chip-icon" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
        <span>${service.name}</span>
      `;

      chip.addEventListener("click", () => {
        if (selected) {
          state.selectedServiceIds.delete(service.id);
        } else {
          if (state.selectedServiceIds.size >= 3) {
            showToast(getUIText("maxServices"));
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

  function renderTimeChips() {
    if (!dom.timeChips) {
      return;
    }

    dom.timeChips.innerHTML = "";

    if (!state.selectedDayKey) {
      const hintText = document.createElement("div");
      hintText.className = "helper-text";
      hintText.textContent = getUIText("selectDateFirstHint");
      dom.timeChips.appendChild(hintText);
      state.selectedTimeMin = null;
      syncSummary();
      return;
    }

    const slots = buildSlotsForDay(state.selectedDayKey, SLOT_CONFIG);

    if (!slots.length) {
      const noTimeText = document.createElement("div");
      noTimeText.className = "helper-text";
      noTimeText.textContent = getUIText("noTimeForDay");
      dom.timeChips.appendChild(noTimeText);
      state.selectedTimeMin = null;
      syncSummary();
      return;
    }

    const slotMinutes = slots.map(
      (slot) => slot.getHours() * 60 + slot.getMinutes(),
    );

    if (!["nearest", "custom"].includes(state.timeMode)) {
      state.timeMode = "nearest";
    }

    if (
      state.timeMode === "custom" &&
      (state.selectedTimeMin == null ||
        !slotMinutes.includes(state.selectedTimeMin))
    ) {
      state.selectedTimeMin = null;
    }

    // Nearest time chip
    const nearestChip = document.createElement("button");
    nearestChip.type = "button";
    nearestChip.className = `chip time-chip${
      state.timeMode === "nearest" ? " selected" : ""
    }`;
    nearestChip.setAttribute(
      "aria-pressed",
      state.timeMode === "nearest" ? "true" : "false",
    );

    nearestChip.innerHTML = `
      <span class="chip-icon" aria-hidden="true"><i class="fa-solid fa-clock"></i></span>
      <span>${getUIText("nearestTime")}</span>
    `;

    nearestChip.addEventListener("click", () => {
      state.timeMode = "nearest";
      renderTimeChips();
    });

    // Custom time select
    const customTimeSelect = document.createElement("select");
    customTimeSelect.className = `chip-select${
      state.timeMode === "custom" ? " selected" : ""
    }`;
    customTimeSelect.setAttribute("aria-label", getUIText("customTime"));

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getUIText("customTime");
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
      if (!Number.isFinite(minute)) {
        return;
      }

      state.timeMode = "custom";
      state.selectedTimeMin = minute;
      renderTimeChips();
    });

    dom.timeChips.appendChild(nearestChip);
    dom.timeChips.appendChild(customTimeSelect);
    syncSummary();
  }

  function renderDateChips() {
    if (!dom.dateChips) {
      return;
    }

    const dayKeys = computeWorkingDayKeys(SLOT_CONFIG);
    dom.dateChips.innerHTML = "";

    if (!dayKeys.length) {
      const noDateText = document.createElement("div");
      noDateText.className = "helper-text";
      noDateText.textContent = "فعلاً زمان کاری در دسترس نیست.";
      dom.dateChips.appendChild(noDateText);
      state.selectedDayKey = "";
      state.selectedTimeMin = null;
      renderTimeChips();
      return;
    }

    if (!state.customDayKey || !dayKeys.includes(state.customDayKey)) {
      state.customDayKey = dayKeys[0];
    }

    if (!["today", "tomorrow", "custom"].includes(state.dateMode)) {
      state.dateMode = "today";
    }

    const choices = buildPrimaryDateChoices(dayKeys);

    if (state.dateMode === "today") {
      state.selectedDayKey = choices[0].dayKey;
    } else if (state.dateMode === "tomorrow") {
      state.selectedDayKey = choices[1].dayKey;
    } else {
      state.selectedDayKey = state.customDayKey;
    }

    if (!state.selectedDayKey || !dayKeys.includes(state.selectedDayKey)) {
      state.dateMode = "today";
      state.selectedDayKey = choices[0].dayKey;
    }

    // Today & Tomorrow chips
    choices.forEach((choice) => {
      const selected = state.dateMode === choice.mode;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `chip date-chip${selected ? " selected" : ""}`;
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

    // Custom date select
    const customDateSelect = document.createElement("select");
    customDateSelect.className = `chip-select${
      state.dateMode === "custom" ? " selected" : ""
    }`;
    customDateSelect.setAttribute("aria-label", getUIText("customDate"));

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getUIText("customDate");
    customDateSelect.appendChild(placeholder);

    dayKeys.forEach((dayKey) => {
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
      if (!nextDay) {
        return;
      }

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
        ? getUIText("nearestTime")
        : timeFa(
            dateFromDayKeyAndMinute(
              state.selectedDayKey,
              state.selectedTimeMin,
            ),
          );

    const note = (dom.bookingNote?.value || "").trim();

    if (LANG === "en") {
      return `Hello dear 🌸

I'd like to book an appointment for ${services} 💅

📅 ${dateLabel}
🕒 ${timeLabel}
${note ? `\n📝 ${note}` : ""}

Please let me know if this works 🤍
Thanks ❤️`;
    } else {
      return `سلام عزیزم 🌸

برای ${services} می‌خواستم وقت بگیرم 💅

📅 ${dateLabel}
🕒 ${timeLabel}
${note ? `\n📝 ${note}` : ""}

اگه اوکیه لطفاً خبرم کن 🤍
مرسی ❤️`;
    }
  }

  function buildFastSmsMessage() {
    const dayKeys = computeWorkingDayKeys(SLOT_CONFIG);
    const choices = buildPrimaryDateChoices(dayKeys);
    const fastLabel = choices[0]?.label || (LANG === "en" ? "today" : "امروز");

    if (LANG === "en") {
      return `Hello dear

I'd like to book an appointment for ${fastLabel}`;
    } else {
      return `سلام عزیزم

برای ${fastLabel} وقت میخواستم`;
    }
  }

  function openWhatsapp() {
    if (!state.selectedServiceIds.size) {
      showToast(getUIText("selectServiceFirst"));
      return;
    }

    if (!state.selectedDayKey) {
      showToast(getUIText("selectDateFirst"));
      return;
    }

    if (state.timeMode === "custom" && state.selectedTimeMin == null) {
      showToast(getUIText("selectTimeFirst"));
      return;
    }

    const message = buildWhatsappMessage();
    if (!message) {
      showToast(getUIText("selectDateTimeFirst"));
      return;
    }

    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

  function openFastSmsApp() {
    const message = buildFastSmsMessage();

    window.location.href = `sms:${PHONE}?body=${encodeURIComponent(message)}`;
  }

  function openTelegram() {
    if (!state.selectedServiceIds.size) {
      showToast(getUIText("selectServiceFirst"));
      return;
    }

    if (!state.selectedDayKey) {
      showToast(getUIText("selectDateFirst"));
      return;
    }

    if (state.timeMode === "custom" && state.selectedTimeMin == null) {
      showToast(getUIText("selectTimeFirst"));
      return;
    }

    const message = buildWhatsappMessage();
    if (!message) {
      showToast(getUIText("selectDateTimeFirst"));
      return;
    }

    window.open(`https://t.me/hediynail?text=${encodeURIComponent(message)}`);
  }

  // Event listeners
  dom.startWhatsapp?.addEventListener("click", openWhatsapp);
  dom.startTelegram?.addEventListener("click", openTelegram);
  dom.heroFastCta?.addEventListener("click", openFastSmsApp);

  // Initial render
  renderServicesInline();
  renderDateChips();
  syncSummary();
}
