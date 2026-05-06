import { useEffect, useRef, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Settings, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";
import { Link } from "react-router-dom";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";

type Profile = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  provider: string | null;
};

interface TopBarProps {
  title?: ReactNode;
  subtitle?: ReactNode;
}

export const TopBar = ({ title, subtitle }: TopBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(getStoredTheme());

  useEffect(() => {
    const handler = (e: Event) => setTheme((e as CustomEvent).detail as Theme);
    window.addEventListener("themechange", handler);
    return () => window.removeEventListener("themechange", handler);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url, provider")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          full_name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || null,
          email: user.email ?? null,
          avatar_url: (user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture || null,
          provider: (user.app_metadata as any)?.provider ?? "email",
        });
      }
    };
    loadProfile();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadProfile());
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Account";
  const initials = (displayName || "U")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();


  return (
    <header className="flex items-center gap-3 mb-6 animate-fade-in">
      {/* Page heading */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="font-display text-2xl font-bold truncate">{title}</h1>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="h-10 w-10 grid place-items-center rounded-full glass-card border border-border/60 hover:bg-secondary/70 transition-colors shrink-0"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <NotificationBell />

      {/* User pill with menu */}
      <div ref={menuRef} className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-3 h-12 pl-1.5 pr-4 rounded-full glass-card border border-border/60 hover:bg-secondary/70 transition-colors"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 grid place-items-center text-white font-semibold text-xs shadow-sm">
              {initials}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold leading-tight">{displayName}</p>
            <p className="text-[11px] text-muted-foreground leading-tight capitalize">
              {profile?.provider === "google" ? "Google account" : profile?.email || "Member"}
            </p>
          </div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl glass-card border border-border/60 shadow-[var(--shadow-elevated)] overflow-hidden z-50">
            <div className="p-4 border-b border-border/40 flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 grid place-items-center text-white font-semibold text-xs">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>
            <div className="p-2">
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary/70 transition-colors">
                <UserIcon className="h-4 w-4 text-muted-foreground" /> Profile
              </Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary/70 transition-colors">
                <Settings className="h-4 w-4 text-muted-foreground" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>

    </header>
  );
};
