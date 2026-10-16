import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Link2,
  FileText,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Award,
  ExternalLink,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabaseClient";

function readSession() {
  try {
    return JSON.parse(
      sessionStorage.getItem("internlytic.portal.session") || "null"
    );
  } catch {
    return null;
  }
}

export default function InternPortalPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(readSession);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const s = readSession();

      if (!s || s.role !== "intern" || !s.intern_id || !s.email) {
        navigate("/login", { replace: true });
        return;
      }

      setSession(s);

      // Login and dashboard data use the saved Intern ID + registered email.
      const { data, error: rpcError } = await supabase.rpc(
        "portal_intern_login",
        {
          p_intern_id: s.intern_id,
          p_email: s.email,
        }
      );

      if (rpcError) throw rpcError;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.ok || !result.intern) {
        throw new Error(
          result?.message || "Could not load your portal data."
        );
      }

      setProfile(result.intern);
      setTasks(result.tasks || []);
    } catch (e) {
      setError(e?.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Load the current intern's portal data on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (!title.trim()) {
        throw new Error("Please enter a task title.");
      }

      // This project’s existing upload and submission RPCs still require a PIN.
      // Do not send an empty or fabricated PIN; avoid a misleading success.
      if (file) {
        throw new Error(
          "File submission needs its upload endpoint updated for ID + email login. You can submit a task link without a file for now."
        );
      }

      if (!url.trim()) {
        throw new Error(
          "Enter your task link. File upload and task submission still need their Supabase functions updated for PIN-free login."
        );
      }

      throw new Error(
        "Your dashboard login is updated, but task submission still uses the old PIN-based function. Please share the SQL for portal_submit_task so it can be updated safely."
      );
    } catch (e) {
      setError(e?.message || "Task submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  const approved = tasks.filter(
    (t) => String(t.status || "").toLowerCase() === "approved"
  ).length;

  const progress =
    profile?.progress_percent ??
    (tasks.length
      ? Math.round(
          (approved / Math.max(Number(profile?.required_tasks || 1), 1)) *
            100
        )
      : 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary via-card to-background p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">
                Your internship journey
              </p>
              <h1 className="mt-3 text-3xl font-extrabold text-brand-ink sm:text-4xl">
                Welcome to Internlytic,{" "}
                {profile?.full_name || session?.full_name || "Intern"}!
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Your dashboard brings your internship details, task progress,
                and available documents together in one place.
              </p>
            </div>

            <Button variant="outline" onClick={logout}>
              <LogOut size={16} /> Log out
            </Button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-primary/30 bg-secondary p-4 text-sm"
          >
            {notice}
          </p>
        )}

        {loading ? (
          <p className="py-12 text-center text-muted-foreground">
            Loading your Supabase data…
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Intern ID" value={profile?.intern_id || "—"} />
              <Metric
                label="Internship track"
                value={profile?.track || profile?.program || "—"}
              />
              <Metric
                label="Approved tasks"
                value={`${approved}/${profile?.required_tasks || tasks.length || 0}`}
              />
              <Metric
                label="Completion progress"
                value={`${Math.max(0, Math.min(100, Number(progress) || 0))}%`}
              />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.85fr]">
              <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Submit your task</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submit your project link and notes for review.
                    </p>
                  </div>
                  <UploadCloud className="text-primary" />
                </div>

                <form onSubmit={submit} className="mt-5 grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="task-title">Task title</Label>
                    <Input
                      id="task-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Week 1 project"
                      required
                      maxLength={120}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="task-description">
                      Task details / notes
                    </Label>
                    <Textarea
                      id="task-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you completed…"
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="task-url">Task link</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input
                        id="task-url"
                        type="url"
                        className="pl-9"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://github.com/…"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="task-file">Upload file (temporarily unavailable)</Label>
                    <Input
                      id="task-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.txt"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      File uploads need the existing upload endpoint updated
                      for PIN-free login.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : <>Submit task <UploadCloud size={16} /></>}
                  </Button>
                </form>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Your documents</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Available files from your existing records.
                    </p>
                  </div>
                  <FileText className="text-primary" />
                </div>

                <div className="mt-5 grid gap-3">
                  {(profile?.documents || []).length ? (
                    profile.documents.map((d, i) => (
                      <div
                        key={d.id || i}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                      >
                        <div>
                          <strong className="text-sm">
                            {d.title || d.type || "Document"}
                          </strong>
                          <p className="text-xs text-muted-foreground">
                            {d.status || "Available"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {d.url && (
                            <>
                              <a
                                href={d.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md border border-border p-2"
                                aria-label="Preview document"
                              >
                                <ExternalLink size={16} />
                              </a>
                              <a
                                href={d.url}
                                download
                                className="rounded-md border border-border p-2"
                                aria-label="Download document"
                              >
                                <FileText size={16} />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                      Offer letters and other documents will appear here when
                      their links are connected to your Supabase records.
                    </p>
                  )}
                </div>

                <div className="mt-6 rounded-xl bg-secondary/70 p-4">
                  <div className="flex items-center gap-2 font-bold">
                    <Award className="text-primary" size={18} />
                    Progress is approval-based
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Progress updates after the team approves the required work.
                  </p>
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">My task submissions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your task history will appear here when connected to the
                    submission records.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={load}>
                  <RefreshCw size={15} /> Refresh
                </Button>
              </div>

              {tasks.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No published tasks or submissions are available yet.
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {tasks.map((t, i) => (
                    <article
                      key={t.id || i}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-bold">
                            {t.title || t.task_title || "Internship task"}
                          </h3>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                            {t.description || ""}
                          </p>
                          {t.deadline && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Deadline: {t.deadline}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold">
                          <Clock3 size={14} /> Published
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-xl font-extrabold text-foreground">
        {value}
      </p>
    </div>
  );
}
