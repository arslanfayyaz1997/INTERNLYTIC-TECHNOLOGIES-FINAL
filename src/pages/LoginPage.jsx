import { useState } from "react";
import { Mail, ArrowRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabaseClient";
import authVisual from "@/assets/experience-team-three-waist-up.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) throw authError;

      setMessage(
        "Verification link sent! Open your email and tap the link to sign in. Check Spam if needed."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to send the verification link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image={authVisual}
      imageAlt="Internlytic interns working together"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-surface-mint text-primary">
          <Mail className="size-5" />
        </span>

        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
            Internship Login Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in securely using your authorized email address.
          </p>
        </div>
      </div>

      <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
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
          className="w-full"
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
