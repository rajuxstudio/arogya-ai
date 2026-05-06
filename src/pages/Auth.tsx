import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { AuthLayout } from "@/components/login/AuthLayout";


const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created! Check your email to confirm.");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email for password reset instructions");
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: "priya.patel@example.com",
      password: "Password123!",
    });
    setLoading(false);
    if (error) toast.error("Demo login failed: " + error.message);
    else toast.success("Welcome to demo account!");
  };

  return (
    <AuthLayout title="Welcome to ArogyaAI" subtitle="Please sign in to access your health dashboard">
        {!isSignup ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="li-email" className="text-sm font-medium">Email</Label>
              <Input 
                id="li-email" 
                type="email" 
                required 
                placeholder="Enter your email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="li-pw" className="text-sm font-medium">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-xs text-primary hover:underline hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input 
                id="li-pw" 
                type="password" 
                required 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading || !email || !password}>
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Sign in"}
            </Button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-semibold"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setEmail("");
                  setPassword("");
                }}
                disabled={loading}
                className="text-primary hover:underline font-semibold hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create new account
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-semibold mt-2"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Quick Demo Account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="su-name" className="text-sm font-medium">Full name</Label>
              <Input 
                id="su-name" 
                required 
                placeholder="Enter your full name"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-email" className="text-sm font-medium">Email</Label>
              <Input 
                id="su-email" 
                type="email" 
                required 
                placeholder="Enter your email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="su-pw" className="text-sm font-medium">Password</Label>
              <Input 
                id="su-pw" 
                type="password" 
                required 
                minLength={6} 
                placeholder="Minimum 6 characters"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading || !name || !email || !password || password.length < 6}>
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Create account"}
            </Button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-semibold"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setEmail("");
                  setPassword("");
                  setName("");
                }}
                disabled={loading}
                className="text-primary hover:underline font-semibold hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>
        )}
    </AuthLayout>
  );
}
