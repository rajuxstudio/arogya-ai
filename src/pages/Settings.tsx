import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Moon, Sun, Bell, Mail, HeartPulse, KeyRound, Trash2, AlertTriangle } from "lucide-react";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { useNavigate } from "react-router-dom";

type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  country: string | null;
  avatar_url: string | null;
};

type Prefs = {
  theme: Theme;
  email_notifications: boolean;
  push_notifications: boolean;
  health_reminders: boolean;
};

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    country: "",
    avatar_url: "",
  });
  const [prefs, setPrefs] = useState<Prefs>({
    theme: getStoredTheme(),
    email_notifications: true,
    push_notifications: true,
    health_reminders: true,
  });

  // Password
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Push notification permission
  const [pushPerm, setPushPerm] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: p }, { data: pr }] = await Promise.all([
        supabase.from("profiles").select("full_name,email,phone,date_of_birth,gender,country,avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_preferences").select("theme,email_notifications,push_notifications,health_reminders").eq("user_id", user.id).maybeSingle(),
      ]);
      if (p) setProfile((prev) => ({ ...prev, ...p }));
      if (pr) {
        const t: Theme = pr.theme === "light" ? "light" : "dark";
        setPrefs({ ...pr, theme: t });
        applyTheme(t);
      }
      setLoading(false);
    };
    load();
  }, []);

  const setTheme = (t: Theme) => {
    setPrefs((p) => ({ ...p, theme: t }));
    applyTheme(t);
  };

  const requestPushPerm = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported in this browser");
      return;
    }
    const res = await Notification.requestPermission();
    setPushPerm(res);
    if (res === "granted") {
      toast.success("Push notifications enabled");
      new Notification("ArogyaAI", { body: "You'll now receive health updates here." });
    } else {
      toast.warning("Permission not granted");
    }
  };

  const saveAll = async () => {
    if (!userId) return;
    setSaving(true);
    const { error: e1 } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth || null,
        gender: profile.gender,
        country: profile.country,
        avatar_url: profile.avatar_url,
      })
      .eq("user_id", userId);

    const { error: e2 } = await supabase.from("user_preferences").upsert(
      { user_id: userId, ...prefs },
      { onConflict: "user_id" },
    );

    setSaving(false);
    if (e1 || e2) {
      toast.error("Failed to save settings");
    } else {
      applyTheme(prefs.theme);
      toast.success("Settings saved");
    }
  };

  const changePassword = async () => {
    if (newPwd.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPwd !== confirmPwd) return toast.error("Passwords do not match");
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setChangingPwd(false);
    if (error) return toast.error(error.message);
    setNewPwd("");
    setConfirmPwd("");
    toast.success("Password updated");
  };

  const deleteAccount = async () => {
    if (deleteText !== "DELETE") return toast.error('Type "DELETE" to confirm');
    setDeleting(true);
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    try {
      const { error } = await supabase.functions.invoke("delete-account", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Account deleted");
      navigate("/auth");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );

  const inputCls = "w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  const Toggle = ({ checked, onChange, icon: Icon, label, desc }: { checked: boolean; onChange: (v: boolean) => void; icon: typeof Bell; label: string; desc: string }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/40">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary border border-border"}`}
      >
        <span className={`absolute top-0.5 ${checked ? "left-5" : "left-0.5"} h-5 w-5 rounded-full bg-background shadow transition-all`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1200px] mx-auto">
        <TopBar
          title={<>User <span className="text-gradient">Settings</span></>}
          subtitle="Manage your profile, preferences and notifications."
        />

        {loading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-2">
            {/* Profile */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6">
              <h3 className="font-display font-bold text-lg mb-1">Profile</h3>
              <p className="text-xs text-muted-foreground mb-5">Update your personal details.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name">
                  <input className={inputCls} value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input disabled className={inputCls + " opacity-60"} value={profile.email || ""} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </Field>
                <Field label="Date of birth">
                  <input type="date" className={inputCls} value={profile.date_of_birth || ""} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} />
                </Field>
                <Field label="Gender">
                  <select className={inputCls} value={profile.gender || ""} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Country">
                  <input className={inputCls} value={profile.country || ""} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Avatar URL">
                    <input className={inputCls} value={profile.avatar_url || ""} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} placeholder="https://..." />
                  </Field>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-lg">Preferences</h3>
                <p className="text-xs text-muted-foreground">Theme & notifications.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border capitalize ${
                        prefs.theme === t ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-secondary/40"
                      }`}
                    >
                      {t === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Toggle checked={prefs.email_notifications} onChange={(v) => setPrefs({ ...prefs, email_notifications: v })} icon={Mail} label="Email notifications" desc="Updates & weekly digest" />
                <Toggle checked={prefs.push_notifications} onChange={(v) => setPrefs({ ...prefs, push_notifications: v })} icon={Bell} label="Push notifications" desc="In-app real-time alerts" />
                <Toggle checked={prefs.health_reminders} onChange={(v) => setPrefs({ ...prefs, health_reminders: v })} icon={HeartPulse} label="Health reminders" desc="Medication & habit nudges" />
              </div>

              {prefs.push_notifications && pushPerm !== "granted" && (
                <button
                  onClick={requestPushPerm}
                  className="text-xs font-semibold py-2 rounded-lg border border-primary/50 text-primary hover:bg-primary/10"
                >
                  {pushPerm === "denied" ? "Push permission blocked — enable in browser" : "Enable browser push permission"}
                </button>
              )}
            </div>

            <div className="lg:col-span-3 flex justify-end">
              <button
                onClick={saveAll}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
            </div>

            {/* Password */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Password</h3>
                  <p className="text-xs text-muted-foreground">Update your account password.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Field label="New password">
                  <input type="password" className={inputCls} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="At least 8 characters" />
                </Field>
                <Field label="Confirm password">
                  <input type="password" className={inputCls} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={changePassword}
                  disabled={changingPwd || !newPwd}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 disabled:opacity-50"
                >
                  {changingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Update password
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-3xl p-6 border border-destructive/40 bg-destructive/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-destructive/15 grid place-items-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-destructive">Danger zone</h3>
                  <p className="text-xs text-muted-foreground">Permanently delete your account.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                This will erase your profile, preferences, and notifications. This action cannot be undone.
              </p>
              <button
                onClick={() => { setDeleteOpen(true); setDeleteText(""); }}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90"
              >
                <Trash2 className="h-4 w-4" /> Delete my account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Delete confirm modal */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-elevated)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display font-bold text-lg">Delete account</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Type <span className="font-semibold text-foreground">DELETE</span> to confirm. This is permanent.
            </p>
            <input
              autoFocus
              className={inputCls + " mt-3"}
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE"
            />
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-secondary text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting || deleteText !== "DELETE"}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
