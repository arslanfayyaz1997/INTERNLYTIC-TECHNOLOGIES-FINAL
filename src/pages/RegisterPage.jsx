import { useState } from "react";
import { ArrowRight, Eye, EyeOff, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/auth";
import authVisual from "@/assets/education-career-luxury.jpg";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Both passwords must match.");
      return;
    }

    const result = registerUser({
      fullName: String(data.get("fullName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      password
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    navigate("/profile");
  }

  return <AuthShell image={authVisual} imageAlt="A student starting an internship at Internlytic">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-surface-coral text-brand-coral">
          <UserPlus className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">Register</h1>
          <p className="text-sm text-muted-foreground">Create your account — it takes less than two minutes.</p>
        </div>
      </div>

      <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="register-name">Full name</Label>
          <Input id="register-name" name="fullName" placeholder="Your full name" autoComplete="name" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-email">Email address</Label>
          <Input id="register-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="register-password">Password</Label>
            <div className="relative">
              <Input id="register-password" name="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" autoComplete="new-password" required className="pr-11" />
              <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="register-confirm">Confirm password</Label>
            <Input id="register-confirm" name="confirm" type={showPassword ? "text" : "password"} placeholder="Repeat password" autoComplete="new-password" required />
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm font-medium text-muted-foreground">
          <input type="checkbox" name="agree" required className="mt-1 size-4 accent-[var(--primary)]" />
          I agree to the Internlytic Technologies terms and privacy policy.
        </label>

        {error && <p role="alert" className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </p>}

        <Button type="submit" variant="brand" size="xl" className="w-full">
          Create account <ArrowRight />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Log in instead
        </Link>
      </p>
    </AuthShell>;
}
