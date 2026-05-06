import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setStatus(session ? "in" : "out");
    });
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "in" : "out");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }
  if (status === "out") return <Navigate to="/auth" replace />;
  return <>{children}</>;
};
