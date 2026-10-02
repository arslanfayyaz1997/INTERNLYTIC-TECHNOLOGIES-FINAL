import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/auth";
import authVisual from "@/assets/experience-team-three-waist-up.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = loginUser({
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? "")
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    navigate(location.state?.redirectTo || "/profile");
  }

  return <AuthShell image={authVisual} imageAlt="Internlytic interns working together">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-surface-mint text-primary">
          <LogIn className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">Log in</h1>
          <p className="text-sm text-muted-foreground">Welcome back — use the email you registered with.</p>
        </div>
      </div>

      <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email address</Label>
          <Input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder="Your password" autoComplete="current-password" required className="pr-11" />
            <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 font-medium text-muted-foreground">
            <input type="checkbox" name="remember" className="size-4 accent-[var(--primary)]" />
            Remember me
          </label>
          <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p role="alert" className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </p>}

        <Button type="submit" variant="brand" size="xl" className="w-full">
          Log in <ArrowRight />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>;
}
