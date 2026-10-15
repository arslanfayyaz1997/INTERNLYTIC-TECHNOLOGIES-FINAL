import { useState } from "react";
import { ArrowRight, ShieldCheck, GraduationCap, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabaseClient";
import authVisual from "@/assets/experience-team-three-waist-up.png";

const ADMIN_EMAIL = String(import.meta.env.VITE_ADMIN_EMAIL || "arslanfayyaz1997@gmail.com").trim().toLowerCase();

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("intern");
  const [internId, setInternId] = useState("");
  const [track, setTrack] = useState("");
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      const args = role === "ceo"
        ? { p_role: "ceo", p_email: email.trim().toLowerCase(), p_intern_id: null, p_track: null, p_pin: pin }
        : { p_role: "intern", p_email: null, p_intern_id: internId.trim(), p_track: track.trim(), p_pin: pin };
      if (role === "ceo" && email.trim().toLowerCase() !== ADMIN_EMAIL) {
        throw new Error("CEO email does not match the authorized admin email.");
      }
      const { data, error: rpcError } = await supabase.rpc("portal_login", args);
      if (rpcError) throw new Error("Portal login setup is not complete in Supabase. Follow SUPABASE-PORTAL-SETUP.md, then try again.");
      const account = Array.isArray(data) ? data[0] : data;
      if (!account || account.ok !== true) throw new Error(account?.message || "ID, internship track, or secret PIN is incorrect.");
      const session = { role: account.role, intern_id: account.intern_id || null, full_name: account.full_name || "Intern", email: account.email || "", track: account.track || "", pin, loginAt: new Date().toISOString() };
      sessionStorage.setItem("internlytic.portal.session", JSON.stringify(session));
      setMessage("Login successful. Opening your secure dashboard…");
      navigate(role === "ceo" ? "/admin" : "/portal", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please check your details.");
    } finally { setLoading(false); }
  }

  return <AuthShell image={authVisual} imageAlt="Internlytic interns collaborating">
    <div className="flex items-center gap-3">
      <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary"><ShieldCheck /></span>
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Internlytic Technologies</p><h1 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">Internship Portal Login</h1><p className="text-sm text-muted-foreground">Secure access for our CEO and interns.</p></div>
    </div>
    <div className="mt-7 grid grid-cols-2 gap-3">
      <button type="button" onClick={() => {setRole("ceo");setEmail(ADMIN_EMAIL);setError("");}} className={`rounded-xl border p-4 text-left transition ${role==="ceo"?"border-primary bg-secondary":"border-border bg-card hover:border-primary/50"}`}>
        <ShieldCheck className="mb-2 text-primary"/><strong className="block">Login as CEO</strong><span className="text-xs text-muted-foreground">Admin dashboard</span>
      </button>
      <button type="button" onClick={() => {setRole("intern");setError("");}} className={`rounded-xl border p-4 text-left transition ${role==="intern"?"border-primary bg-secondary":"border-border bg-card hover:border-primary/50"}`}>
        <GraduationCap className="mb-2 text-primary"/><strong className="block">Login as an Intern</strong><span className="text-xs text-muted-foreground">Personal dashboard</span>
      </button>
    </div>
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      {role === "ceo" ? <div className="grid gap-2"><Label htmlFor="ceo-email">CEO Gmail</Label><Input id="ceo-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></div> : <>
        <div className="grid gap-2"><Label htmlFor="intern-id">Internship Intern ID</Label><Input id="intern-id" value={internId} onChange={e=>setInternId(e.target.value)} placeholder="Enter your assigned intern ID" autoComplete="username" required/></div>
        <div className="grid gap-2"><Label htmlFor="intern-track">Internship Track</Label><Input id="intern-track" value={track} onChange={e=>setTrack(e.target.value)} placeholder="e.g. Front End, UX/UI, Prompt Engineering" required/></div>
      </>}
      <div className="grid gap-2"><Label htmlFor="secret-pin">Secret PIN</Label><div className="relative"><Input id="secret-pin" type={showPin?"text":"password"} value={pin} onChange={e=>setPin(e.target.value)} autoComplete="current-password" className="pr-12" required/><button type="button" onClick={()=>setShowPin(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPin?"Hide PIN":"Show PIN"}>{showPin?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-primary/30 bg-secondary p-3 text-sm font-semibold">{message}</p>}
      <Button type="submit" variant="brand" size="xl" className="w-full" disabled={loading}>{loading?<><LoaderCircle className="animate-spin"/> Checking details…</>:<>Open {role==="ceo"?"Admin":"Intern"} Dashboard <ArrowRight/></>}</Button>
    </form>
    <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">All three intern details must match the existing portal record. <Link to="/verify" className="font-semibold text-primary underline-offset-4 hover:underline">Certificate verification</Link></p>
  </AuthShell>;
}
