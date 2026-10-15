import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, BadgeCheck, Bell, Briefcase, CalendarDays, Check, Download, Eye, EyeOff, FileText, Github, GraduationCap, Globe, KeyRound, LayoutDashboard, LifeBuoy, Linkedin, LogOut, Mail, MapPin, MessageCircleQuestion, Pencil, Phone, Save, Send, Trash2, UserRound, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { changePassword, getCurrentUser, logoutUser, profileCompletion, updateCurrentUser, withdrawApplication } from "@/lib/auth";

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const courseOptions = ["Artificial Intelligence", "Full Stack Web Development", "AI & Machine Learning", "Machine Learning", "Python Programming", "Data & Analytics", "UI/UX Design"];

const tabs = [{
  id: "dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  id: "personal",
  label: "Personal info",
  icon: UserRound
}, {
  id: "education",
  label: "Education",
  icon: GraduationCap
}, {
  id: "internship",
  label: "Internship",
  icon: Briefcase
}, {
  id: "documents",
  label: "Skills & documents",
  icon: FileText
}, {
  id: "security",
  label: "Password & security",
  icon: KeyRound
}, {
  id: "notifications",
  label: "Notifications",
  icon: Bell
}, {
  id: "support",
  label: "Support",
  icon: LifeBuoy
}];

const applicationStages = [{
  label: "Account created",
  note: "Your Internlytic profile is live."
}, {
  label: "Profile completed",
  note: "Fill every section so mentors can review you."
}, {
  label: "Track matched",
  note: "We pair you with a course and a mentor."
}, {
  label: "Internship started",
  note: "You join a live project team."
}];

const notifications = [{
  title: "Welcome to Internlytic Technologies",
  text: "Your account is ready. Complete your profile to unlock applications.",
  time: "Just now",
  unread: true
}, {
  title: "Complete your education details",
  text: "Mentors review your degree and graduation year before matching a track.",
  time: "Today",
  unread: true
}, {
  title: "Attach your resume",
  text: "A PDF resume makes your application review much faster.",
  time: "Yesterday",
  unread: false
}];

const supportTopics = [{
  icon: MessageCircleQuestion,
  title: "Read the FAQs",
  text: "Most questions about tracks, duration and certificates are answered there.",
  to: "/faq",
  cta: "Open FAQs"
}, {
  icon: Mail,
  title: "Email the program team",
  text: "Write to us and a real person replies, usually within 48 hours.",
  to: "/contact",
  cta: "Contact us"
}, {
  icon: Briefcase,
  title: "Browse the courses",
  text: "Not sure which track fits you? Compare every course before applying.",
  to: "/courses",
  cta: "View courses"
}];

function Field({ label, name, value, onChange, editing, type = "text", placeholder, icon: Icon }) {
  return <div className="grid gap-2">
      <Label htmlFor={`profile-${name}`}>{label}</Label>
      {editing ? <Input id={`profile-${name}`} name={name} type={type} value={value} placeholder={placeholder} onChange={event => onChange(name, event.target.value)} /> : <div className="flex min-h-9 items-center gap-2 border-b border-border/70 pb-2 text-sm font-medium text-brand-ink">
          {Icon && <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />}
          {value ? value : <span className="font-normal text-muted-foreground">Not added yet</span>}
        </div>}
    </div>;
}

function SelectField({ label, name, value, onChange, editing, options }) {
  return <div className="grid gap-2">
      <Label htmlFor={`profile-${name}`}>{label}</Label>
      {editing ? <select id={`profile-${name}`} name={name} value={value} className={selectClass} onChange={event => onChange(name, event.target.value)}>
          <option value="">Select an option</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select> : <div className="flex min-h-9 items-center border-b border-border/70 pb-2 text-sm font-medium text-brand-ink">
          {value ? value : <span className="font-normal text-muted-foreground">Not selected yet</span>}
        </div>}
    </div>;
}

function PanelHeading({ title, text, action }) {
  return <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-6 sm:px-8">
      <div>
        <h2 className="text-xl font-extrabold text-brand-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
      {action}
    </div>;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const requestedTab = searchParams.get("tab");
  const activeTab = tabs.some(tab => tab.id === requestedTab) ? requestedTab : "dashboard";

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      navigate("/login");
      return;
    }
    setUser(current);
    setForm(current);
  }, [navigate]);

  const completion = useMemo(() => profileCompletion(user), [user]);
  const skillList = useMemo(() => String(user?.skills ?? "").split(",").map(skill => skill.trim()).filter(Boolean), [user]);

  if (!user || !form) return null;

  const initials = String(user.fullName || user.email).trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
  const stageIndex = completion >= 100 ? 2 : completion >= 55 ? 1 : 0;
  const isEditableTab = ["personal", "education", "internship", "documents"].includes(activeTab);

  function selectTab(id) {
    setEditing(false);
    setSearchParams(id === "dashboard" ? {} : { tab: id });
  }

  function change(name, value) {
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function handleSave(event) {
    event.preventDefault();
    const updated = updateCurrentUser(form);
    setUser(updated);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  function handleResumeFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeError("");
    const okType = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!okType) {
      setResumeError("Please upload a PDF or Word document.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("File is larger than 5 MB. Please upload a smaller file.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm(previous => ({
        ...previous,
        resumeName: file.name,
        resumeData: String(reader.result),
        resumeType: file.type,
        resumeSize: file.size,
        resumeUploadedAt: new Date().toISOString()
      }));
    };
    reader.onerror = () => setResumeError("Could not read that file. Please try again.");
    reader.readAsDataURL(file);
  }

  function removeResume() {
    setForm(previous => ({ ...previous, resumeName: "", resumeData: "", resumeType: "", resumeSize: 0, resumeUploadedAt: "" }));
    setResumeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }
    const result = changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
    if (!result.ok) {
      setPasswordError(result.error);
      return;
    }
    setUser(getCurrentUser());
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordSaved(true);
    window.setTimeout(() => setPasswordSaved(false), 2500);
  }

  function handleWithdraw(applicationId) {
    const updated = withdrawApplication(applicationId);
    if (updated) {
      setUser(updated);
      setForm(updated);
    }
  }

  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main className="px-5 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-0">
          {/* ---------------- left : identity + tabs ---------------- */}
          <aside className="grid gap-6 border border-border bg-card p-5 shadow-soft lg:sticky lg:top-24 lg:gap-5 lg:border-r-0">
            <div className="text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-2xl brand-spectrum font-display text-xl font-extrabold text-primary-foreground shadow-brand">
                {initials || "SL"}
              </span>
              <h1 className="mt-4 text-lg font-extrabold text-brand-ink">{user.fullName || "Your name"}</h1>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {user.headline || "Add a short headline"}
              </p>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full brand-spectrum transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                Profile {completion}% complete
              </p>
            </div>

            <nav className="border-t border-border pt-3" aria-label="Profile sections">
              {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => selectTab(id)} aria-current={activeTab === id ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${activeTab === id ? "bg-surface-mint text-primary" : "text-foreground/75 hover:bg-accent hover:text-primary"}`}>
                  <Icon className="size-4 shrink-0" aria-hidden="true" /> {label}
                </button>)}
              <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-brand-coral transition-colors hover:bg-surface-coral">
                <LogOut className="size-4 shrink-0" aria-hidden="true" /> Log out
              </button>
            </nav>
          </aside>

          {/* ---------------- right : active panel ---------------- */}
          <section className="border border-border bg-card shadow-soft">
            {activeTab === "dashboard" && <>
                <PanelHeading title="Dashboard" text="A quick look at your profile, your details and where your application stands." action={<Button asChild variant="brand" size="sm"><Link to="/apply">Apply for an internship</Link></Button>} />
                <div className="grid gap-6 p-6 sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[["Profile strength", `${completion}%`], ["Applications", String((user.applications ?? []).length)], ["Preferred course", user.course || "Not selected"], ["Availability", user.availability ? `${user.availability} hrs / week` : "Not set"]].map(([label, value]) => <div key={label} className="border border-border bg-background p-5">
                        <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
                        <strong className="mt-2 block font-display text-lg text-brand-ink">{value}</strong>
                      </div>)}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="border border-border p-5">
                      <h3 className="text-sm font-bold uppercase text-brand-ink">Quick details</h3>
                      <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2"><Mail className="size-4 text-primary" /> {user.email}</span>
                        <span className="flex items-center gap-2"><Phone className="size-4 text-primary" /> {user.phone || "Phone not added"}</span>
                        <span className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> {[user.city, user.country].filter(Boolean).join(", ") || "Location not added"}</span>
                        <span className="flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> {user.university || "University not added"}</span>
                        <span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /> {user.startDate || "Start date not set"}</span>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {user.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground/70 hover:text-primary"><Linkedin className="size-3.5" /> LinkedIn</a>}
                        {user.github && <a href={user.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground/70 hover:text-primary"><Github className="size-3.5" /> GitHub</a>}
                        {user.portfolio && <a href={user.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground/70 hover:text-primary"><Globe className="size-3.5" /> Portfolio</a>}
                      </div>
                    </div>

                    <div className="border border-border p-5">
                      <h3 className="text-sm font-bold uppercase text-brand-ink">Application status</h3>
                      <ol className="mt-5 grid gap-5">
                        {applicationStages.map((stage, index) => <li key={stage.label} className="flex gap-3">
                            <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold ${index <= stageIndex ? "bg-surface-mint text-primary" : "bg-muted text-muted-foreground"}`}>
                              {index <= stageIndex ? <Check className="size-3.5" /> : index + 1}
                            </span>
                            <span>
                              <strong className="block text-sm font-bold text-brand-ink">{stage.label}</strong>
                              <span className="text-xs leading-5 text-muted-foreground">{stage.note}</span>
                            </span>
                          </li>)}
                      </ol>
                    </div>
                  </div>
                </div>
              </>}

            {activeTab === "notifications" && <>
                <PanelHeading title="Notifications" text="Updates about your profile, your application and your mentor." />
                <div className="grid gap-4 p-6 sm:p-8">
                  {notifications.map(item => <article key={item.title} className={`flex gap-4 border p-5 ${item.unread ? "border-primary/25 bg-surface-mint/40" : "border-border"}`}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-card text-primary">
                        <Bell className="size-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm font-bold text-brand-ink">{item.title}</strong>
                          {item.unread && <span className="rounded-full bg-brand-coral px-2 py-0.5 text-[0.6rem] font-bold uppercase text-primary-foreground">New</span>}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                        <span className="mt-2 block text-xs font-semibold text-muted-foreground">{item.time}</span>
                      </div>
                    </article>)}
                </div>
              </>}

            {activeTab === "support" && <>
                <PanelHeading title="Support" text="Stuck somewhere? Pick the quickest route to an answer." />
                <div className="grid gap-4 p-6 sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {supportTopics.map(({ icon: Icon, title, text, to, cta }) => <article key={title} className="flex flex-col border border-border p-5">
                        <span className="grid size-11 place-items-center rounded-md bg-surface-mint text-primary">
                          <Icon className="size-5" />
                        </span>
                        <h3 className="mt-4 text-base font-extrabold text-brand-ink">{title}</h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{text}</p>
                        <Button asChild variant="brandOutline" size="sm" className="mt-5 w-full">
                          <Link to={to}>{cta}</Link>
                        </Button>
                      </article>)}
                  </div>

                  <form className="border border-border p-6" onSubmit={event => event.preventDefault()}>
                    <h3 className="text-base font-extrabold text-brand-ink">Send a support request</h3>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="support-subject">Subject</Label>
                        <Input id="support-subject" placeholder="What do you need help with?" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="support-priority">Priority</Label>
                        <select id="support-priority" className={selectClass} defaultValue="Normal">
                          {["Low", "Normal", "Urgent"].map(option => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-2">
                      <Label htmlFor="support-message">Message</Label>
                      <Textarea id="support-message" rows={4} placeholder="Describe the issue in a few lines..." />
                    </div>
                    <Button type="submit" variant="brand" className="mt-5">
                      Send request <Send />
                    </Button>
                  </form>
                </div>
              </>}

            {activeTab === "security" && <>
                <PanelHeading title="Password & security" text="Change your password any time. You'll need your current password to confirm it's really you." />
                <div className="grid gap-6 p-6 sm:p-8">
                  <form className="grid max-w-md gap-5" onSubmit={handlePasswordSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <div className="relative">
                        <Input id="current-password" type={showPw.current ? "text" : "password"} autoComplete="current-password" required className="pr-11" value={passwordForm.currentPassword} onChange={event => setPasswordForm(previous => ({ ...previous, currentPassword: event.target.value }))} />
                        <button type="button" onClick={() => setShowPw(previous => ({ ...previous, current: !previous.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" aria-label="Toggle password visibility">
                          {showPw.current ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New password</Label>
                      <div className="relative">
                        <Input id="new-password" type={showPw.next ? "text" : "password"} autoComplete="new-password" required minLength={6} className="pr-11" value={passwordForm.newPassword} onChange={event => setPasswordForm(previous => ({ ...previous, newPassword: event.target.value }))} />
                        <button type="button" onClick={() => setShowPw(previous => ({ ...previous, next: !previous.next }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" aria-label="Toggle password visibility">
                          {showPw.next ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <div className="relative">
                        <Input id="confirm-password" type={showPw.confirm ? "text" : "password"} autoComplete="new-password" required className="pr-11" value={passwordForm.confirmPassword} onChange={event => setPasswordForm(previous => ({ ...previous, confirmPassword: event.target.value }))} />
                        <button type="button" onClick={() => setShowPw(previous => ({ ...previous, confirm: !previous.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary" aria-label="Toggle password visibility">
                          {showPw.confirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    {passwordError && <p role="alert" className="flex items-center gap-2 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                        <AlertTriangle className="size-4 shrink-0" /> {passwordError}
                      </p>}

                    <div className="flex flex-wrap items-center gap-4">
                      <Button type="submit" variant="brand" size="xl">
                        Update password <KeyRound />
                      </Button>
                      {passwordSaved && <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                          <Check className="size-4" /> Password updated
                        </span>}
                    </div>
                  </form>
                </div>
              </>}

            {isEditableTab && <form onSubmit={handleSave}>
                <PanelHeading title={tabs.find(tab => tab.id === activeTab)?.label} text="Keep this section up to date — mentors read it before matching you to a project." action={<Button type="button" variant={editing ? "brandOutline" : "brand"} size="sm" onClick={() => { setForm(user); setEditing(value => !value); }}>
                      {editing ? "Cancel" : <>Edit <Pencil /></>}
                    </Button>} />

                <div className="p-6 sm:p-8">
                  {activeTab === "personal" && <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Full name" name="fullName" value={form.fullName} onChange={change} editing={editing} icon={UserRound} />
                      <Field label="Headline" name="headline" value={form.headline} onChange={change} editing={editing} placeholder="Computer Science student" icon={BadgeCheck} />
                      <Field label="Email address" name="email" value={form.email} onChange={change} editing={false} icon={Mail} />
                      <Field label="Phone number" name="phone" value={form.phone} onChange={change} editing={editing} placeholder="+92 300 0000000" icon={Phone} />
                      <Field label="City" name="city" value={form.city} onChange={change} editing={editing} placeholder="Sargodha" icon={MapPin} />
                      <Field label="Country" name="country" value={form.country} onChange={change} editing={editing} placeholder="Pakistan" icon={Globe} />
                      <Field label="Date of birth" name="dateOfBirth" value={form.dateOfBirth} onChange={change} editing={editing} type="date" icon={CalendarDays} />
                      <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="profile-about">About you</Label>
                        {editing ? <Textarea id="profile-about" rows={4} value={form.about} placeholder="A few lines about your background, interests and what you want from this internship." onChange={event => change("about", event.target.value)} /> : <p className="text-sm leading-7 text-muted-foreground">
                            {form.about || "Not added yet"}
                          </p>}
                      </div>
                    </div>}

                  {activeTab === "education" && <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="University / College" name="university" value={form.university} onChange={change} editing={editing} placeholder="University of Sargodha" icon={GraduationCap} />
                      <Field label="Degree" name="degree" value={form.degree} onChange={change} editing={editing} placeholder="BS Computer Science" />
                      <Field label="Field of study" name="fieldOfStudy" value={form.fieldOfStudy} onChange={change} editing={editing} placeholder="Software Engineering" />
                      <Field label="Graduation year" name="graduationYear" value={form.graduationYear} onChange={change} editing={editing} placeholder="2027" />
                      <Field label="CGPA / Percentage" name="cgpa" value={form.cgpa} onChange={change} editing={editing} placeholder="3.4 / 4.0" />
                    </div>}

                  {activeTab === "internship" && <div className="grid gap-5 sm:grid-cols-2">
                      <SelectField label="Preferred course" name="course" value={form.course} onChange={change} editing={editing} options={courseOptions} />
                      <SelectField label="Duration" name="duration" value={form.duration} onChange={change} editing={editing} options={["1 month", "3 months", "6 months"]} />
                      <SelectField label="Work mode" name="workMode" value={form.workMode} onChange={change} editing={editing} options={["Remote", "On-site", "Hybrid"]} />
                      <Field label="Availability (hours / week)" name="availability" value={form.availability} onChange={change} editing={editing} placeholder="20" />
                      <Field label="Earliest start date" name="startDate" value={form.startDate} onChange={change} editing={editing} type="date" icon={CalendarDays} />
                    </div>}

                  {activeTab === "documents" && <div className="grid gap-5">
                      <div className="grid gap-2">
                        <Label htmlFor="profile-skills">Skills</Label>
                        {editing ? <Input id="profile-skills" value={form.skills} placeholder="React, Python, SQL, Figma" onChange={event => change("skills", event.target.value)} /> : skillList.length ? <div className="flex flex-wrap gap-2">
                              {skillList.map(skill => <span key={skill} className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground/70">{skill}</span>)}
                            </div> : <p className="text-sm text-muted-foreground">Not added yet</p>}
                        {editing && <p className="text-xs text-muted-foreground">Separate each skill with a comma.</p>}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="LinkedIn profile" name="linkedin" value={form.linkedin} onChange={change} editing={editing} placeholder="https://linkedin.com/in/username" icon={Linkedin} />
                        <Field label="GitHub profile" name="github" value={form.github} onChange={change} editing={editing} placeholder="https://github.com/username" icon={Github} />
                        <Field label="Portfolio / website" name="portfolio" value={form.portfolio} onChange={change} editing={editing} placeholder="https://yourportfolio.com" icon={Globe} />
                      </div>

                      <div className="grid gap-2">
                        <Label>Resume / CV</Label>
                        <div className="flex flex-wrap items-center gap-3 border border-dashed border-border bg-muted/40 p-4">
                          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-coral text-brand-coral">
                            <FileText className="size-5" />
                          </span>
                          <span className="text-sm font-medium text-brand-ink">
                            {form.resumeName ? <>
                                {form.resumeName}
                                {form.resumeSize ? <span className="ml-2 font-normal text-muted-foreground">({formatFileSize(form.resumeSize)})</span> : null}
                                {form.resumeUploadedAt && <span className="block font-normal text-muted-foreground">Uploaded {formatDate(form.resumeUploadedAt)}</span>}
                              </> : <span className="font-normal text-muted-foreground">No file attached yet</span>}
                          </span>
                          <div className="ml-auto flex flex-wrap items-center gap-2">
                            {form.resumeData && <a href={form.resumeData} download={form.resumeName || "resume"} className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-bold text-foreground/75 hover:text-primary">
                                <Download className="size-3.5" /> Download
                              </a>}
                            {editing && <>
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeFile} />
                                <Button type="button" variant="brandOutline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                  {form.resumeName ? "Replace file" : "Choose file"}
                                </Button>
                                {form.resumeName && <Button type="button" variant="ghost" size="sm" onClick={removeResume} className="text-brand-coral hover:text-brand-coral">
                                    <Trash2 className="size-3.5" /> Remove
                                  </Button>}
                              </>}
                          </div>
                        </div>
                        {resumeError && <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive"><AlertTriangle className="size-3.5" /> {resumeError}</p>}
                        <p className="text-xs text-muted-foreground">PDF or Word, up to 5 MB. Your file is saved to this profile so mentors and you can download it any time.</p>
                      </div>
                    </div>}
                </div>

                {activeTab === "internship" && <div className="border-t border-border p-6 sm:px-8">
                    <h3 className="text-sm font-bold uppercase text-brand-ink">My applications</h3>
                    {Array.isArray(user.applications) && user.applications.length ? <ul className="mt-4 grid gap-3">
                        {[...user.applications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).map(application => <li key={application.id} className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background p-4">
                            <div>
                              <strong className="block text-sm font-bold text-brand-ink">{application.program}</strong>
                              <span className="text-xs text-muted-foreground">{application.track} track · Applied {formatDate(application.appliedAt)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full bg-surface-mint px-3 py-1 text-[0.7rem] font-bold uppercase text-primary">{application.status}</span>
                              <button type="button" onClick={() => handleWithdraw(application.id)} className="text-xs font-semibold text-muted-foreground hover:text-brand-coral" title="Withdraw application">
                                <X className="size-3.5" />
                              </button>
                            </div>
                          </li>)}
                      </ul> : <p className="mt-3 text-sm text-muted-foreground">
                        You haven't applied to an internship yet. <Link to="/apply" className="font-semibold text-primary underline-offset-4 hover:underline">Browse open tracks</Link> and apply — it takes a minute and shows up here right away.
                      </p>}
                  </div>}

                {(editing || saved) && <div className="flex flex-wrap items-center gap-4 border-t border-border p-6 sm:px-8">
                    {editing && <Button type="submit" variant="brand" size="xl">
                        Save changes <Save />
                      </Button>}
                    {editing && <Button type="button" variant="brandOutline" size="xl" onClick={() => { setForm(user); setEditing(false); }}>
                        Discard
                      </Button>}
                    {saved && <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        <Check className="size-4" /> Profile saved
                      </span>}
                  </div>}
              </form>}
          </section>
        </div>
      </main>
      <Footer />
    </div>;
}
