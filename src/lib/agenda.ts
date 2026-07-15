import type { CollectionEntry } from "astro:content";

export type AgendaEntryKind = "permanence" | "event";

export type AgendaEntry = {
  id: string;
  kind: AgendaEntryKind;
  date: Date;
  startsAt: string | null;
  title: string;
  location?: string;
  detailId: string;
  sourceId: string;
};

export type AgendaMonth = {
  key: string;
  titleDate: Date;
  days: CalendarDay[];
  weeks: CalendarWeek[];
};

export type CalendarWeek = {
  weekNumber: number;
  days: CalendarDay[];
};

export type CalendarDay = {
  date: Date | null;
  entries: AgendaEntry[];
};

type LocationEntry = CollectionEntry<"locations">;
type EventEntry = CollectionEntry<"events">;
type PermanenceEntry = CollectionEntry<"permanences">;

export const agendaTimeZone = "Europe/Paris";

const agendaDatePartsFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: agendaTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const agendaTimePartsFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: agendaTimeZone,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const getAgendaDateParts = (date: Date) => {
  const parts = Object.fromEntries(
    agendaDatePartsFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
};

export const getAgendaTime = (date: Date) => {
  const parts = Object.fromEntries(
    agendaTimePartsFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return `${parts.hour}:${parts.minute}`;
};

const dayIndexes = new Map([
  ["lundi", 1],
  ["mardi", 2],
  ["mercredi", 3],
  ["jeudi", 4],
  ["vendredi", 5],
  ["samedi", 6],
  ["dimanche", 0],
]);

const monthIndexes = new Map([
  ["janvier", 0],
  ["fevrier", 1],
  ["mars", 2],
  ["avril", 3],
  ["mai", 4],
  ["juin", 5],
  ["juillet", 6],
  ["aout", 7],
  ["septembre", 8],
  ["octobre", 9],
  ["novembre", 10],
  ["decembre", 11],
]);

type RecurrenceRule = {
  weekday: number;
  ordinal?: number;
  last?: boolean;
  weekly?: boolean;
  evenWeek?: boolean;
  monthParity?: "even" | "odd";
  includedMonths?: Set<number>;
  excludedMonths?: Set<number>;
  startsAt: string | null;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'");

const detailId = (prefix: string, id: string) => `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

const isSameDay = (date: Date, other: Date) => {
  const dateParts = getAgendaDateParts(date);
  const otherParts = getAgendaDateParts(other);

  return (
    dateParts.year === otherParts.year &&
    dateParts.month === otherParts.month &&
    dateParts.day === otherParts.day
  );
};

export const getIsoWeekNumber = (date: Date) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const parseStartTime = (text: string) => {
  const match = text.match(/(\d{1,2})h(?:(\d{2}))?(?=\s*-)/);
  if (!match) return null;

  const hour = match[1].padStart(2, "0");
  const minute = match[2] ?? "00";
  return `${hour}:${minute}`;
};

const dateWithTime = (date: Date, startsAt: string | null) => {
  const withTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (!startsAt) return withTime;

  const [hours, minutes] = startsAt.split(":").map(Number);
  withTime.setHours(hours, minutes, 0, 0);
  return withTime;
};

const getWeekday = (text: string) => {
  for (const [day, index] of dayIndexes) {
    if (text.includes(day)) return index;
  }
  return null;
};

const parseOrdinalRules = (text: string, startsAt: string | null): RecurrenceRule[] => {
  const weekday = getWeekday(text);
  if (weekday === null) return [];

  const ordinals = [...text.matchAll(/(\d)(?:er|e)/g)].map((match) => Number(match[1]));
  const hasLast = text.includes("dernier");
  const rules: RecurrenceRule[] = [];

  for (const ordinal of ordinals) {
    rules.push({ weekday, ordinal, startsAt });
  }

  if (hasLast) {
    rules.push({ weekday, last: true, startsAt });
  }

  return rules;
};

const applyMonthConstraints = (rules: RecurrenceRule[], text: string) => {
  const excludedMonths = new Set<number>();
  const exceptMatch = text.match(/sauf\s+(.+)$/);
  if (exceptMatch) {
    for (const [month, index] of monthIndexes) {
      if (exceptMatch[1].includes(month)) excludedMonths.add(index);
    }
  }

  const includedMonths = new Set<number>();
  const rangeMatch = text.match(/d[' ]([a-z]+)\s+a\s+([a-z]+)/);
  if (rangeMatch) {
    const start = monthIndexes.get(rangeMatch[1]);
    const end = monthIndexes.get(rangeMatch[2]);
    if (start !== undefined && end !== undefined) {
      let cursor = start;
      while (true) {
        includedMonths.add(cursor);
        if (cursor === end) break;
        cursor = (cursor + 1) % 12;
      }
    }
  }

  for (const rule of rules) {
    if (excludedMonths.size > 0) rule.excludedMonths = excludedMonths;
    if (includedMonths.size > 0) rule.includedMonths = includedMonths;
    if (text.includes("mois pair")) rule.monthParity = "even";
    if (text.includes("mois impair")) rule.monthParity = "odd";
  }
};

const parseLocationRules = (hours: string): RecurrenceRule[] => {
  const text = normalize(hours);
  const startsAt = parseStartTime(text);
  const rules: RecurrenceRule[] = [];

  const parts = text.split(/\s*,\s*et\s+|\s+et\s+chaque\s+/);
  for (const rawPart of parts) {
    const part = rawPart.trim();
    const partStartsAt = parseStartTime(part) ?? startsAt;

    if (part.includes("semaines paires")) {
      const weekday = getWeekday(part);
      if (weekday !== null) rules.push({ weekday, weekly: true, evenWeek: true, startsAt: partStartsAt });
      continue;
    }

    if (part.includes("tous les") || part.startsWith("chaque ")) {
      const weekday = getWeekday(part);
      if (weekday !== null) rules.push({ weekday, weekly: true, startsAt: partStartsAt });
      continue;
    }

    rules.push(...parseOrdinalRules(part, partStartsAt));
  }

  applyMonthConstraints(rules, text);
  return rules;
};

const ruleAppliesToDate = (rule: RecurrenceRule, date: Date) => {
  if (date.getDay() !== rule.weekday) return false;
  if (rule.includedMonths && !rule.includedMonths.has(date.getMonth())) return false;
  if (rule.excludedMonths?.has(date.getMonth())) return false;
  if (rule.monthParity === "even" && (date.getMonth() + 1) % 2 !== 0) return false;
  if (rule.monthParity === "odd" && (date.getMonth() + 1) % 2 !== 1) return false;
  if (rule.evenWeek && getIsoWeekNumber(date) % 2 !== 0) return false;

  if (rule.weekly) return true;

  if (rule.ordinal) {
    return Math.floor((date.getDate() - 1) / 7) + 1 === rule.ordinal;
  }

  if (rule.last) {
    const nextWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
    return nextWeek.getMonth() !== date.getMonth();
  }

  return false;
};

const startTimeFromDate = (date: Date) => getAgendaTime(date);

const getPeriod = (now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + 12, 1);

  return { today, firstMonth, end };
};

export const buildAgendaEntries = (
  events: EventEntry[],
  locations: LocationEntry[],
  permanences: PermanenceEntry[] = [],
  now = new Date(),
) => {
  const { today, firstMonth, end } = getPeriod(now);
  const entries: AgendaEntry[] = [];
  const locationMap = new Map(locations.map((location) => [location.id, location]));
  
  for (const event of events) {
    if (event.data.date >= today && event.data.date < end) {
      entries.push({
        id: `event-${event.id}`,
        kind: "event",
        date: event.data.date,
        startsAt: startTimeFromDate(event.data.date),
        title: event.data.title,
        location: event.data.location,
        detailId: detailId("agenda-event", event.id),
        sourceId: event.id,
      });
    }
  }

  for (const permanence of permanences) {
    if (permanence.data.date < today || permanence.data.date >= end) continue;

    const linkedLocation = permanence.data.repairCafe
      ? locationMap.get(permanence.data.repairCafe)
      : undefined;

    entries.push({
      id: `permanence-oneoff-${permanence.id}`,
      kind: "permanence",
      date: permanence.data.date,
      startsAt: startTimeFromDate(permanence.data.date),
      title: permanence.data.title ?? linkedLocation?.data.name ?? "",
      location: permanence.data.location ?? linkedLocation?.data.address,
      detailId: detailId("agenda-permanence", permanence.id),
      sourceId: permanence.id,
    });
  }

  for (const location of locations) {
    const rules = parseLocationRules(location.data.hours);
    for (let cursor = new Date(firstMonth); cursor < end; cursor.setDate(cursor.getDate() + 1)) {
      for (const rule of rules) {
        if (!ruleAppliesToDate(rule, cursor)) continue;

        const date = dateWithTime(cursor, rule.startsAt);
        if (date < today || date >= end) continue;

        entries.push({
          id: `permanence-${location.id}-${date.toISOString()}`,
          kind: "permanence",
          date,
          startsAt: rule.startsAt,
          title: location.data.name,
          location: location.data.address,
          detailId: detailId("agenda-location", location.id),
          sourceId: location.id,
        });
      }
    }
  }

  return entries.sort((a, b) => a.date.valueOf() - b.date.valueOf() || a.title.localeCompare(b.title, "fr"));
};

export const buildAgendaMonths = (entries: AgendaEntry[], now = new Date()) => {
  const { firstMonth } = getPeriod(now);
  const months: AgendaMonth[] = [];

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const firstDay = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + monthIndex, 1);
    const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const days: CalendarDay[] = [
      ...Array.from({ length: mondayOffset }, () => ({ date: null, entries: [] })),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), index + 1);
        return {
          date,
          entries: entries.filter((entry) => isSameDay(entry.date, date)),
        };
      }),
    ];

    while (days.length % 7 !== 0) {
      days.push({ date: null, entries: [] });
    }

    const weeks = Array.from({ length: days.length / 7 }, (_, index) => {
      const weekDays = days.slice(index * 7, index * 7 + 7);
      const weekDate = weekDays.find((day) => day.date)?.date ?? firstDay;

      return {
        weekNumber: getIsoWeekNumber(weekDate),
        days: weekDays,
      };
    });

    months.push({
      key: `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}`,
      titleDate: firstDay,
      days,
      weeks,
    });
  }

  return months;
};

export const getFirstMonthWithEntries = (months: AgendaMonth[]) => {
  const index = months.findIndex((month) =>
    month.weeks.some((week) => week.days.some((day) => day.entries.length > 0)),
  );

  return index === -1 ? 0 : index;
};
