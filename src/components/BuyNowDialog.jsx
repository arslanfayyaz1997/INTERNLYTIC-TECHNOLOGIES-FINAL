import { useState } from "react";
import { BadgeCheck, GraduationCap, Loader2, Mail, MessageSquareText, Phone, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const initialForm = { name: "", email: "", phone: "", message: "" };

/**
 * "Buy Now" button used on course cards. Opens a small enrollment form,
 * right on the same page, and emails the details to Internlytic on submit.
 * Kept deliberately separate from the site's main Contact form.
 */
export function BuyNowDialog({ course, price, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, course }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.debug ? `${data.error} (${data.debug})` : (data.error || "Something went wrong. Please try again."));
      }
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  };

  return <Dialog open={open} onOpenChange={next => {
    setOpen(next);
    if (!next) {
      // Reset the form state a beat after the close animation finishes.
      window.setTimeout(() => {
        setStatus("idle");
        setErrorMsg("");
        setForm(initialForm);
      }, 200);
    }
  }}>
      <DialogTrigger asChild>
        <Button type="button" variant="brandOutline" size="sm" className={triggerClassName}>
          Buy Now
        </Button>
      </DialogTrigger>
      <DialogContent className="buy-now-dialog max-w-md gap-0 overflow-hidden p-0">
        <div className="buy-now-dialog-head">
          <span className="buy-now-dialog-badge">
            <Sparkles className="size-3.5" aria-hidden="true" /> Enroll now
          </span>
          <DialogHeader className="mt-3 text-left">
            <DialogTitle className="text-xl font-extrabold text-brand-ink">
              {course}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm">
              Share your details below — our team will personally reach out to confirm your seat
              and payment.
            </DialogDescription>
          </DialogHeader>
          {price && <div className="buy-now-dialog-price">
              <GraduationCap className="size-4" aria-hidden="true" />
              <span>Course fee: <strong>PKR {price}</strong></span>
            </div>}
        </div>

        {status === "success" ? <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-surface-mint text-primary">
              <BadgeCheck className="size-7" aria-hidden="true" />
            </span>
            <p className="text-lg font-extrabold text-brand-ink">You're on the list!</p>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Thanks for your interest in <strong>{course}</strong>. A real person from our team
              will email or call you shortly to finish your enrollment.
            </p>
            <Button type="button" variant="brand" size="sm" className="mt-2" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div> : <form className="buy-now-dialog-form" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="enroll-name" className="buy-now-dialog-label">
                <User className="size-3.5" aria-hidden="true" /> Full name
              </Label>
              <Input id="enroll-name" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="enroll-email" className="buy-now-dialog-label">
                <Mail className="size-3.5" aria-hidden="true" /> Gmail / email address
              </Label>
              <Input id="enroll-email" name="email" type="email" placeholder="you@gmail.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="enroll-phone" className="buy-now-dialog-label">
                <Phone className="size-3.5" aria-hidden="true" /> Phone / WhatsApp number
              </Label>
              <Input id="enroll-phone" name="phone" type="tel" placeholder="03xx-xxxxxxx" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="enroll-message" className="buy-now-dialog-label">
                <MessageSquareText className="size-3.5" aria-hidden="true" /> Message (optional)
              </Label>
              <Textarea id="enroll-message" name="message" rows={3} placeholder="Any questions or preferred timing?" value={form.message} onChange={handleChange} />
            </div>

            <Button type="submit" variant="brand" size="lg" className="mt-1 w-full" disabled={status === "loading"}>
              {status === "loading" ? <>Sending... <Loader2 className="animate-spin" /></> : "Confirm & Send"}
            </Button>
            {status === "error" && <p className="text-sm font-medium text-red-600">{errorMsg}</p>}

            <p className="buy-now-dialog-footnote">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> We'll only use these details to contact you about this course.
            </p>
          </form>}
      </DialogContent>
    </Dialog>;
}
