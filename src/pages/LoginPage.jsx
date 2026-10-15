import { useEffect, useState } from "react";
import {
  Mail,
  ArrowRight,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabaseClient";
import authVisual from "@/assets/experience-team-three-waist-up.png";

const ADMIN_EMAIL = String(
  import.meta.env.VITE_ADMIN_EMAIL ||
    "arslanfayyaz1997@gmail.com"
).trim().toLowerCase();

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [internshipEmail, setInternshipEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (active && data.session?.user) {
          const user = data.session.user;
          setVerifiedUser(user);
          setInternshipEmail(user.email || "");
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to verify your login session."
          );
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (
        ["SIGNED_IN", "USER_UPDATED", "TOKEN_REFRESHED"].includes(event) &&
        session?.user
      ) {
        setVerifiedUser(session.user);
        setInternshipEmail(session.user.email || "");
        setMessage("");
        setError("");
      }

      if (event === "SIGNED_OUT") {
        setVerifiedUser(null);
        setInternshipEmail("");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error: authError } =
        await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

      if (authError) throw authError;

      setMessage(
        "Login link sent! Open the email and click the link. After verification, return to this page. Check Spam if needed."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to send the login link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const user = data.session?.user;

      if (!user?.email) {
        setVerifiedUser(null);
        throw new Error(
          "Your session has expired. Please request a new login link."
        );
      }

      const verifiedEmail = user.email.trim().toLowerCase();
      const enteredEmail = internshipEmail.trim().toLowerCase();

      if (!enteredEmail || enteredEmail !== verifiedEmail) {
        throw new Error(
          "Enter the same email address that you verified through the email link and used for your internship application."
        );
      }

      if (verifiedEmail === ADMIN_EMAIL) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/portal", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setVerifiedUser(null);
    setInternshipEmail("");
    setMessage("");
    setError("");
  }

  return (
    <AuthShell
      image={authVisual}
      imageAlt="Internlytic interns working together"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-surface-mint text-primary">
          {verifiedUser ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <Mail className="size-5" />
          )}
        </span>

        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
            Internship Login Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Secure access to your existing Internlytic account.
          </p>
        </div>
      </div>

      {checkingSession ? (
        <div className="mt-7 flex items-center gap-3 rounded-lg border border-border p-4 text-sm">
          <LoaderCircle className="size-5 animate-spin" />
          Checking your verification status...
        </div>
      ) : verifiedUser ? (
        <>
          <div
            role="status"
            className="mt-7 flex items-start gap-3 border border-green-600/30 bg-green-500/10 px-4 py-4"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
            <div>
              <p className="font-bold text-brand-ink">
                Email verification successful!
              </p>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                Verified email: {verifiedUser.email}
              </p>
            </div>
          </div>

          <form
            className="mt-6 grid gap-5"
            onSubmit={handleContinue}
          >
            <div className="grid gap-2">
              <Label htmlFor="internship-email">
                Enter your existing internship email
              </Label>
              <Input
                id="internship-email"
                name="internshipEmail"
                type="email"
                autoComplete="email"
                placeholder="Email used in your internship application"
                value={internshipEmail}
                onChange={(event) =>
                  setInternshipEmail(event.target.value)
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Use the same email you verified and provided in your
                internship application.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="brand"
              size="xl"
              className="w-full !bg-green-600 !text-white hover:!bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Checking account...
                </>
              ) : (
                <>
                  Continue to dashboard
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-5 w-full text-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign out and use another email
          </button>
        </>
      ) : (
        <form
          className="mt-7 grid gap-5"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="login-email">
              Existing account email
            </Label>
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
            <p
              role="status"
              className="border border-green-600/30 bg-green-500/10 px-4 py-3 text-sm font-semibold"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="brand"
            size="xl"
            className="w-full !bg-green-600 !text-white hover:!bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                Send verification link
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Only existing, authorized accounts can sign in.
      </p>

      <p className="mt-4 text-center text-sm">
        <Link
          to="/"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Back to Internlytic website
        </Link>
      </p>
    </AuthShell>
  );
}
