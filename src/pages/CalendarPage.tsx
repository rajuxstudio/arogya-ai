import { useMemo, useState } from "react";
import { format, isSameDay, parseISO, isAfter, isBefore, startOfToday } from "date-fns";
import {
  Stethoscope,
  Pill,
  Building2,
  BellRing,
  NotebookPen,
  Plus,
  Trash2,
  CalendarDays,
  Clock,
  MapPin,
  UserRound,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  addEvent,
  CalendarEvent,
  deleteEvent,
  EventType,
  loadEvents,
} from "@/lib/calendarStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const typeMeta: Record<EventType, { label: string; icon: any; color: string; chip: string }> = {
  appointment: { label: "Appointment", icon: Stethoscope, color: "text-primary", chip: "bg-primary/10 text-primary border-primary/20" },
  medicine: { label: "Medicine End", icon: Pill, color: "text-warning", chip: "bg-warning/10 text-warning border-warning/20" },
  visit: { label: "Visit History", icon: Building2, color: "text-accent", chip: "bg-accent/10 text-accent border-accent/20" },
  reminder: { label: "Reminder", icon: BellRing, color: "text-success", chip: "bg-success/10 text-success border-success/20" },
  log: { label: "Health Log", icon: NotebookPen, color: "text-muted-foreground", chip: "bg-muted text-foreground border-border" },
};

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const today = startOfToday();

  const refresh = () => setEvents(loadEvents());

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    });
    return map;
  }, [events]);

  const dayDots = useMemo(() => {
    const m: Record<string, EventType[]> = {};
    events.forEach((e) => {
      m[e.date] = m[e.date] || [];
      if (!m[e.date].includes(e.type)) m[e.date].push(e.type);
    });
    return m;
  }, [events]);

  const dayEvents = eventsByDay.get(selectedDate.toISOString().slice(0, 10)) || [];

  const upcomingAppointments = events
    .filter((e) => e.type === "appointment" && !isBefore(parseISO(e.date), today))
    .sort((a, b) => a.date.localeCompare(b.date));

  const medicineEnd = events
    .filter((e) => e.type === "medicine" && !isBefore(parseISO(e.date), today))
    .sort((a, b) => a.date.localeCompare(b.date));

  const visits = events
    .filter((e) => e.type === "visit")
    .sort((a, b) => b.date.localeCompare(a.date));

  const reminders = events.filter((e) => e.type === "reminder");

  const handleDelete = (id: string) => {
    deleteEvent(id);
    refresh();
    toast.success("Event removed");
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto">
        <TopBar
          title={<>Health <span className="text-gradient">Calendar</span></>}
          subtitle="Track appointments, medication, visits and daily wellness logs."
        />

        <div className="flex items-end justify-between gap-4 mb-6">
          <div />

          <AddEventDialog
            open={open}
            setOpen={setOpen}
            defaultDate={selectedDate}
            onCreated={refresh}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatChip icon={Stethoscope} label="Appointments" value={upcomingAppointments.length} tone="primary" />
          <StatChip icon={Pill} label="Medicines ending" value={medicineEnd.length} tone="warning" />
          <StatChip icon={Building2} label="Past visits" value={visits.length} tone="accent" />
          <StatChip icon={BellRing} label="Reminders" value={reminders.length} tone="success" />
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Calendar */}
          <div className="col-span-12 xl:col-span-5 glass-card rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Date selector
              </h3>
              <span className="text-xs text-muted-foreground">
                {format(selectedDate, "EEE, MMM d")}
              </span>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="p-3 pointer-events-auto rounded-2xl bg-background/40"
              modifiers={{
                hasEvent: (date) => !!dayDots[date.toISOString().slice(0, 10)],
              }}
              modifiersClassNames={{
                hasEvent: "relative font-semibold text-primary",
              }}
            />
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              {(Object.keys(typeMeta) as EventType[]).map((t) => {
                const M = typeMeta[t];
                return (
                  <span key={t} className={cn("px-2 py-1 rounded-full border flex items-center gap-1", M.chip)}>
                    <M.icon className="h-3 w-3" /> {M.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Day details */}
          <div className="col-span-12 xl:col-span-7 glass-card rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold">
                  {format(selectedDate, "EEEE, MMMM d")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"} on this day
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Quick add
              </Button>
            </div>

            {dayEvents.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground border border-dashed border-border rounded-2xl">
                No events scheduled. Add a reminder or appointment.
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((e) => (
                  <EventRow key={e.id} event={e} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>

          {/* Tabs of categories */}
          <div className="col-span-12 glass-card rounded-3xl p-5">
            <Tabs defaultValue="appointments">
              <TabsList className="bg-secondary/60">
                <TabsTrigger value="appointments">🩺 Upcoming</TabsTrigger>
                <TabsTrigger value="medicine">💊 Medicine</TabsTrigger>
                <TabsTrigger value="visits">🏥 Visits</TabsTrigger>
                <TabsTrigger value="reminders">📌 Reminders</TabsTrigger>
                <TabsTrigger value="logs">📆 Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="mt-5">
                <EventList events={upcomingAppointments} onDelete={handleDelete} empty="No upcoming appointments." />
              </TabsContent>
              <TabsContent value="medicine" className="mt-5">
                <EventList events={medicineEnd} onDelete={handleDelete} empty="No medicines ending soon." />
              </TabsContent>
              <TabsContent value="visits" className="mt-5">
                <EventList events={visits} onDelete={handleDelete} empty="No visits recorded." />
              </TabsContent>
              <TabsContent value="reminders" className="mt-5">
                <EventList events={reminders} onDelete={handleDelete} empty="No reminders set." />
              </TabsContent>
              <TabsContent value="logs" className="mt-5">
                <EventList
                  events={events.filter((e) => e.type === "log").sort((a, b) => b.date.localeCompare(a.date))}
                  onDelete={handleDelete}
                  empty="No health logs yet."
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
};

const StatChip = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: number;
  tone: "primary" | "warning" | "accent" | "success";
}) => (
  <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
    <div className={cn("h-10 w-10 rounded-xl grid place-items-center", toneClasses[tone])}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  </div>
);

const EventRow = ({ event, onDelete }: { event: CalendarEvent; onDelete: (id: string) => void }) => {
  const M = typeMeta[event.type];
  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl bg-background/40 hover:bg-background/70 transition-colors border border-border/40 group">
      <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", M.chip)}>
        <M.icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm truncate">{event.title}</p>
          <Badge variant="outline" className={cn("text-[10px]", M.chip)}>{M.label}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {format(parseISO(event.date), "MMM d, yyyy")}</span>
          {event.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.time}</span>}
          {event.doctor && <span className="flex items-center gap-1"><UserRound className="h-3 w-3" /> {event.doctor}</span>}
          {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
        </div>
        {event.notes && <p className="text-xs text-muted-foreground mt-1.5 italic">{event.notes}</p>}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={() => onDelete(event.id)}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
};

const EventList = ({
  events,
  onDelete,
  empty,
}: {
  events: CalendarEvent[];
  onDelete: (id: string) => void;
  empty: string;
}) =>
  events.length === 0 ? (
    <div className="py-10 text-center text-sm text-muted-foreground">{empty}</div>
  ) : (
    <div className="grid md:grid-cols-2 gap-3">
      {events.map((e) => (
        <EventRow key={e.id} event={e} onDelete={onDelete} />
      ))}
    </div>
  );

const AddEventDialog = ({
  open,
  setOpen,
  defaultDate,
  onCreated,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  defaultDate: Date;
  onCreated: () => void;
}) => {
  const [type, setType] = useState<EventType>("appointment");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate.toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [doctor, setDoctor] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    addEvent({ type, title, date, time, doctor, location, notes });
    onCreated();
    setOpen(false);
    setTitle(""); setTime(""); setDoctor(""); setLocation(""); setNotes("");
    toast.success("Event added to your calendar");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <Plus className="h-4 w-4" /> Add Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glass-panel">
        <DialogHeader>
          <DialogTitle className="font-display">Add to Health Calendar</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as EventType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment">🩺 Appointment</SelectItem>
                <SelectItem value="medicine">💊 Medicine end date</SelectItem>
                <SelectItem value="visit">🏥 Visit history</SelectItem>
                <SelectItem value="reminder">📌 Reminder</SelectItem>
                <SelectItem value="log">📆 Health log</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Follow-up with Dr. Mehta" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {(type === "appointment" || type === "visit") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Doctor</Label>
                <Input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. Sharma" />
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City Hospital" />
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground" onClick={submit}>Save event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarPage;
