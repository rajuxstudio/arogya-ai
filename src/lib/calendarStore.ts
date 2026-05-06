export type EventType = "appointment" | "medicine" | "visit" | "reminder" | "log";

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time?: string;
  notes?: string;
  doctor?: string;
  location?: string;
}

const KEY = "arogyaai.calendar";

const seed = (): CalendarEvent[] => {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const add = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return iso(d);
  };
  return [
    { id: "1", type: "appointment", title: "Cardiology Consultation", date: add(2), time: "10:30", doctor: "Dr. Mehta", location: "Apollo Clinic" },
    { id: "2", type: "appointment", title: "Annual Physical Checkup", date: add(9), time: "09:00", doctor: "Dr. Sharma", location: "City Hospital" },
    { id: "3", type: "medicine", title: "Vitamin D3 — Course Ends", date: add(5), notes: "Refill prescription" },
    { id: "4", type: "medicine", title: "Atorvastatin — Course Ends", date: add(14), notes: "Consult before continuing" },
    { id: "5", type: "visit", title: "Visited Dr. Rao — Dermatology", date: add(-7), doctor: "Dr. Rao", notes: "Skin rash follow-up" },
    { id: "6", type: "visit", title: "Blood Test — PathLab", date: add(-21), location: "PathLab Diagnostics" },
    { id: "7", type: "reminder", title: "Drink 3L water daily", date: add(0), time: "08:00" },
    { id: "8", type: "log", title: "BP 120/80 · HR 72bpm · Felt great", date: add(-1) },
    { id: "9", type: "log", title: "Mild headache in evening", date: add(-3) },
  ];
};

export const loadEvents = (): CalendarEvent[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return seed();
  }
};

export const saveEvents = (events: CalendarEvent[]) => {
  localStorage.setItem(KEY, JSON.stringify(events));
};

export const addEvent = (e: Omit<CalendarEvent, "id">): CalendarEvent => {
  const all = loadEvents();
  const created = { ...e, id: crypto.randomUUID() };
  const next = [...all, created];
  saveEvents(next);
  return created;
};

export const deleteEvent = (id: string) => {
  const next = loadEvents().filter((e) => e.id !== id);
  saveEvents(next);
};
