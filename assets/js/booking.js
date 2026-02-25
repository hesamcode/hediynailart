import { PHONE, SERVICES, SLOT_CONFIG } from "./config.js";
import {
  buildPrimaryDateChoices,
  buildSlotsForDay,
  computeWorkingDayKeys,
  dateFaShort,
  dateFromDayKeyAndMinute,
  timeFa,
} from "./date-utils.js";

export function initBooking({ dom, state, showToast }) {
  function selectedServicesLabel() {
    const names = SERVICES.filter((service) =>
      state.selectedServiceIds.has(service.id),
    ).map((service) => service.name);

    return names.length ? names.join(" + ") : "—";
  }

  function selectedDatetimeLabel() {
    if (!state.selectedDayKey) {
      return "—";
    }

    const { weekday, md } = dateFaShort(state.selectedDayKey);

    if (state.timeMode === "nearest") {
      return `${weekday} ${md} - نزدیکترین زمان ممکن`;
    }

    if (state.selectedTimeMin == null) {
      return `${weekday} ${md} - زمان دلخواه`;
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

    SERVICES.forEach((service) => {
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

  function renderTimeChips() {
    if (!dom.timeChips) {
      return;
    }

    dom.timeChips.innerHTML = "";

    if (!state.selectedDayKey) {
      dom.timeChips.innerHTML =
        '<div class="helper-text">ابتدا تاریخ را انتخاب کن.</div>';
      state.selectedTimeMin = null;
      syncSummary();
      return;
    }

    const slots = buildSlotsForDay(state.selectedDayKey, SLOT_CONFIG);

    if (!slots.length) {
      dom.timeChips.innerHTML =
        '<div class="helper-text">برای این روز، زمان پیشنهادی موجود نیست. روز دیگری انتخاب کن.</div>';
      state.selectedTimeMin = null;
      syncSummary();
      return;
    }

    const slotMinutes = slots.map((slot) => slot.getHours() * 60 + slot.getMinutes());

    if (!["nearest", "custom"].includes(state.timeMode)) {
      state.timeMode = "nearest";
    }

    if (
      state.timeMode === "custom" &&
      (state.selectedTimeMin == null || !slotMinutes.includes(state.selectedTimeMin))
    ) {
      state.selectedTimeMin = null;
    }

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
      <span>نزدیکترین زمان</span>
    `;

    nearestChip.addEventListener("click", () => {
      state.timeMode = "nearest";
      renderTimeChips();
    });

    const customTimeSelect = document.createElement("select");
    customTimeSelect.className = `chip-select${
      state.timeMode === "custom" ? " selected" : ""
    }`;
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
      dom.dateChips.innerHTML =
        '<div class="helper-text">فعلاً زمان کاری در دسترس نیست.</div>';
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

    const customDateSelect = document.createElement("select");
    customDateSelect.className = `chip-select${
      state.dateMode === "custom" ? " selected" : ""
    }`;
    customDateSelect.setAttribute("aria-label", "انتخاب تاریخ دلخواه");

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "تاریخ دلخواه";
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
    if (services === "—") {
      return null;
    }

    if (!state.selectedDayKey) {
      return null;
    }

    if (state.timeMode === "custom" && state.selectedTimeMin == null) {
      return null;
    }

    const { weekday, md } = dateFaShort(state.selectedDayKey);
    const dateLabel = `${weekday} ${md}`;

    const timeLabel =
      state.timeMode === "nearest"
        ? "نزدیکترین زمان ممکن"
        : timeFa(
            dateFromDayKeyAndMinute(state.selectedDayKey, state.selectedTimeMin),
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
    const dayKeys = computeWorkingDayKeys(SLOT_CONFIG);
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

    const message = buildWhatsappMessage();
    if (!message) {
      showToast("لطفاً اطلاعات رزرو را کامل کن.");
      return;
    }

    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

  function openFastWhatsapp() {
    const message = buildFastWhatsappMessage();
    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

  dom.startWhatsapp?.addEventListener("click", openWhatsapp);
  dom.heroFastCta?.addEventListener("click", openFastWhatsapp);

  renderServicesInline();
  renderDateChips();
  syncSummary();
}
