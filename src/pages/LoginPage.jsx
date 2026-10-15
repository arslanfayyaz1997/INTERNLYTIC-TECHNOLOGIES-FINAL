import { useEffect, useState } from "react";
import { Mail, ArrowRight, LoaderCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { supabase } from "@/lib/supabase";
import { authVisual } from "@/lib/auth";

const ADMIN_EMAIL = "arslanfayyaz1997@gmail.com";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (session?.user?.email) {
          setSessionEmail(session.user.email);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setSessionEmail(session?.user?.email || "");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleContinue() {
    setError("");

    if (!sessionEmail) {
      setError("Please log in with your email first.");
      return;
    }

    navigate(
      sessionEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        ? "/admin"
        : "/portal"
    );
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (loginError) throw loginError;

      setMessage(
        "Verification link sent! Check your email inbox and spam folder."
      );
    } catch (err) {
      setError(err?.message || "Unable to send the verification link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your Internlytic journey."
      visual={authVisual}
    >
      <div className="space-y-6">
        {checkingSession ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Checking your session...
          </div>
        ) : sessionEmail ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">
                    You are logged in
                  </p>
                  <p className="mt-1 break-all text-sm text-green-700">
                    {sessionEmail}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="button"
              variant="brand"
              size="xl"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={handleContinue}
            >
              Continue to dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <button
              type="button"
              className="w-full text-sm text-gray-500 hover:text-gray-800"
              onClick={async () => {
                await supabase.auth.signOut();
                setSessionEmail("");
                setMessage("");
                setError("");
              }}
            >
              Log out
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="brand"
              size="xl"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Sending verification link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send verification link
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              New to Internlytic?{" "}
              <Link
                to="/"
                className="font-semibold text-green-700 hover:text-green-800"
              >
                Explore our platform
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
