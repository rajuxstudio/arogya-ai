import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

const typeColor: Record<string, string> = {
  info: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  alert: "bg-destructive/15 text-destructive",
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((i) => !i.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (data) setItems(data as Notification[]);

      // seed welcome notification once if empty
      if (!data || data.length === 0) {
        await supabase.from("notifications").insert([
          { user_id: user.id, title: "Welcome to ArogyaAI 👋", message: "Your AI health dashboard is ready.", type: "success" },
          { user_id: user.id, title: "Daily check-in reminder", message: "Log your wellness for today.", type: "info" },
          { user_id: user.id, title: "New AI insight available", message: "Vitamin D level looks low — tap to review.", type: "warning" },
        ]);
      }

      channel = supabase
        .channel("notifications-" + user.id)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setItems((prev) => [payload.new as Notification, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setItems((prev) => prev.map((n) => (n.id === (payload.new as Notification).id ? (payload.new as Notification) : n)));
            } else if (payload.eventType === "DELETE") {
              setItems((prev) => prev.filter((n) => n.id !== (payload.old as Notification).id));
            }
          },
        )
        .subscribe();
    };
    init();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const markAllRead = async () => {
    if (!userId) return;
    const ids = items.filter((i) => !i.read).map((i) => i.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    toast.success("Notification removed");
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-12 w-12 rounded-full glass-card border border-border/60 grid place-items-center hover:bg-secondary transition-colors"
      >
        <Bell className="h-[18px] w-[18px] text-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center ring-2 ring-background">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl glass-card border border-border/60 shadow-[var(--shadow-elevated)] overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-[11px] text-muted-foreground">{unread} unread</p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] flex items-center gap-1 text-primary font-medium hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">No notifications yet</div>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className={`group p-3 border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-colors ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-0.5 ${typeColor[n.type] || typeColor.info}`}>
                    {n.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{n.title}</p>
                    {n.message && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.message}</p>}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="h-6 w-6 rounded grid place-items-center hover:bg-primary/10 text-primary" title="Mark read">
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <button onClick={() => remove(n.id)} className="h-6 w-6 rounded grid place-items-center hover:bg-destructive/10 text-destructive" title="Remove">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
