// date-utils.js
// ============================================================
// HediyeNailArt - Date Utilities (Bilingual)
// ============================================================

import { LANG } from "./config.js";

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function toDayKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

export function fromDayKey(dayKey) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function dateFaShort(dayKey) {
  const date = fromDayKey(dayKey);
  const locale = LANG === "en" ? "en-US" : "fa-IR";

  return {
    weekday: date.toLocaleDateString(locale, { weekday: "short" }),
    md: date.toLocaleDateString(locale, { month: "short", day: "numeric" }),
  };
}

export function weekdayFaLong(dayKey) {
  const date = fromDayKey(dayKey);
  const locale = LANG === "en" ? "en-US" : "fa-IR";
  return date.toLocaleDateString(locale, { weekday: "long" });
}

export function dayKeyWithOffset(offset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toDayKey(date);
}

export function dateFromDayKeyAndMinute(dayKey, minute) {
  const date = fromDayKey(dayKey);
  date.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
  return date;
}

export function timeFa(date) {
  const locale = LANG === "en" ? "en-US" : "fa-IR";
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function minutesNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function isWorkingDay(date, slotConfig) {
  return slotConfig.workingDays.includes(date.getDay());
}

export function buildSlotsForDay(dayKey, slotConfig) {
  const dayDate = fromDayKey(dayKey);
  const slots = [];

  const now = new Date();
  const isToday =
    dayDate.getFullYear() === now.getFullYear() &&
    dayDate.getMonth() === now.getMonth() &&
    dayDate.getDate() === now.getDate();

  const currentMin = isToday
    ? Math.ceil(minutesNow() / slotConfig.stepMin) * slotConfig.stepMin
    : null;

  slotConfig.shifts.forEach((shift) => {
    for (
      let minute = shift.startMin;
      minute <= shift.endMin - slotConfig.stepMin;
      minute += slotConfig.stepMin
    ) {
      if (isToday && minute < currentMin) {
        continue;
      }

      const slot = new Date(dayDate);
      slot.setHours(0, 0, 0, 0);
      slot.setMinutes(minute);
      slots.push(slot);
    }
  });

  return slots;
}

export function computeWorkingDayKeys(slotConfig) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  const todayWorking = isWorkingDay(base, slotConfig);
  const todayKey = toDayKey(base);
  const todayHasSlots =
    todayWorking && buildSlotsForDay(todayKey, slotConfig).length > 0;

  if (todayWorking && !todayHasSlots) {
    base.setDate(base.getDate() + 1);
  }

  const dayKeys = [];
  let offset = 0;
  let safetyCounter = 0;

  while (dayKeys.length < slotConfig.daysAhead && safetyCounter < 60) {
    const date = new Date(base);
    date.setDate(base.getDate() + offset);

    if (isWorkingDay(date, slotConfig)) {
      const dayKey = toDayKey(date);
      if (buildSlotsForDay(dayKey, slotConfig).length > 0) {
        dayKeys.push(dayKey);
      }
    }

    offset += 1;
    safetyCounter += 1;
  }

  return dayKeys;
}

export function buildPrimaryDateChoices(dayKeys) {
  const todayKey = dayKeyWithOffset(0);
  const tomorrowKey = dayKeyWithOffset(1);

  const firstKey = dayKeys[0] || "";
  const secondKey = dayKeys[1] || firstKey;

  const todayLabel = LANG === "en" ? "Today" : "امروز";
  const tomorrowLabel = LANG === "en" ? "Tomorrow" : "فردا";

  const firstLabel = firstKey
    ? firstKey === todayKey
      ? todayLabel
      : weekdayFaLong(firstKey)
    : "—";
  const secondLabel = secondKey
    ? secondKey === tomorrowKey
      ? tomorrowLabel
      : weekdayFaLong(secondKey)
    : "—";

  return [
    { mode: "today", label: firstLabel, dayKey: firstKey },
    { mode: "tomorrow", label: secondLabel, dayKey: secondKey },
  ];
}
