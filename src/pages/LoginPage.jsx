import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  LoaderCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
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

  const [role, setRole] = useState("intern");
  const [internId, setInternId] = useState("");
  const [email, setEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [adminPin, setAdminPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      let account;

      if (role === "intern") {
        if (!internId.trim() || !email.trim()) {
          throw new Error("Enter your Intern ID and registered Gmail.");
        }

        const { data, error: rpcError } = await supabase.rpc(
          "portal_intern_login",
          {
            p_intern_id: internId.trim(),
            p_email: email.trim().toLowerCase(),
          }
        );

        if (rpcError) throw new Error(rpcError.message);

        account = Array.isArray(data) ? data[0] : data;

        if (!account || account.ok !== true) {
          throw new Error(
            account?.message || "Intern ID or registered Gmail does not match."
          );
        }
      } else {
        const normalizedEmail = adminEmail.trim().toLowerCase();

        if (normalizedEmail !== ADMIN_EMAIL) {
          throw new Error("CEO email does not match the authorized admin email.");
        }

        if (!adminPin.trim()) {
          throw new Error("Enter the admin PIN.");
        }

        const { data, error: rpcError } = await supabase.rpc(
          "portal_login",
          {
            p_role: "ceo",
            p_email: normalizedEmail,
            p_intern_id: null,
            p_track: null,
            p_pin: adminPin.trim(),
          }
        );

        if (rpcError) throw new Error(rpcError.message);

        account = Array.isArray(data) ? data[0] : data;

        if (!account || account.ok !== true) {
          throw new Error(account?.message || "Admin login failed.");
        }
      }

      const profile = account.intern || account;

      const session = {
        role: role === "ceo" ? "ceo" : "intern",
        intern_id:
          account.intern_id ||
          profile.intern_id ||
          profile.certificate_id ||
          null,
        full_name:
          account.full_name ||
          profile.full_name ||
          profile.student_name ||
          "Intern",
        email:
          account.email ||
          profile.email ||
          profile.student_email ||
          "",
        track:
          account.track ||
          profile.track ||
          profile.program ||
          "",
        loginAt: new Date().toISOString(),
      };

      if (role === "intern" && !session.intern_id) {
        throw new Error("Intern ID was not returned by the server.");
      }

      if (role === "ceo") {
        session.pin = adminPin.trim();
      }

      sessionStorage.setItem(
        "internlytic.portal.session",
        JSON.stringify(session)
      );

      setMessage("Login successful. Opening your dashboard…");

      navigate(role === "ceo" ? "/admin" : "/portal", {
        replace: true,
      });
    } catch (err) {
      setError(err?.message || "Unable to log in. Check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image={authVisual}
      imageAlt="Internlytic interns collaborating"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
          <ShieldCheck />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
            Internlytic Technologies
          </p>
          <h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
            Internship Portal Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Access your personal internship dashboard.
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setRole("ceo");
            setError("");
            setMessage("");
          }}
          className={`rounded-xl border p-4 text-left transition ${
            role === "ceo"
              ? "border-primary bg-secondary"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <ShieldCheck className="mb-2 text-primary" />
          <strong className="block">Login as CEO</strong>
          <span className="text-xs text-muted-foreground">
            Admin dashboard
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("intern");
            setError("");
            setMessage("");
          }}
          className={`rounded-xl border p-4 text-left transition ${
            role === "intern"
              ? "border-primary bg-secondary"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <GraduationCap className="mb-2 text-primary" />
          <strong className="block">Login as an Intern</strong>
          <span className="text-xs text-muted-foreground">
            Personal dashboard
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        {role === "intern" ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="intern-id">Intern ID</Label>
              <Input
                id="intern-id"
                value={internId}
                onChange={(e) => setInternId(e.target.value)}
                placeholder="e.g. INT-2026-000001"
                autoComplete="username"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="intern-email">Registered Gmail address</Label>
              <Input
                id="intern-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the Gmail saved in your application"
                autoComplete="email"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-2">
              <Label htmlFor="ceo-email">CEO Gmail</Label>
              <Input
                id="ceo-email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-pin">Admin PIN</Label>
              <Input
                id="admin-pin"
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="rounded-lg border border-primary/30 bg-secondary p-3 text-sm font-semibold"
          >
            {message}
          </p>
        )}

        <Button
          type="submit"
          variant="brand"
          size="xl"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin" />
              Checking details…
            </>
          ) : (
            <>
              Open {role === "ceo" ? "Admin" : "Intern"} Dashboard
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        Interns: use your assigned ID and registered Gmail.{" "}
        <Link
          to="/verify"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Certificate verification
        </Link>
      </p>
    </AuthShell>
  );
}
