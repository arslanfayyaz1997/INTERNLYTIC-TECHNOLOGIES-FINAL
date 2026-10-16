import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Users,
  ClipboardCheck,
  RefreshCw,
  LogOut,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Sort certificate IDs naturally: 1, 2, 3 ... 10 ... 81.
function compareInternIds(a, b) {
  const idA = String(a.intern_id || a.certificate_id || "");
  const idB = String(b.intern_id || b.certificate_id || "");

  return idA.localeCompare(idB, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(readSession);
  const [rows, setRows] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("All tracks");
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const s = readSession();

      if (!s || s.role !== "ceo") {
        navigate("/login", { replace: true });
        return;
      }

      setSession(s);

      const { data, error } = await supabase.rpc(
        "portal_admin_overview",
        {
          p_email: s.email || "arslanfayyaz1997@gmail.com",
          p_pin: s.pin,
        }
      );

      if (error) throw error;

      const payload = Array.isArray(data) ? data[0] : data;

      if (!payload?.ok) {
        throw new Error(
          payload?.message || "Admin authorization failed. Please sign in again."
        );
      }

      // Sort a copy of the returned records; never change database IDs.
      const internRows = [...(payload.interns || [])].sort(
        compareInternIds
      );

      setRows(internRows);

      // Keep existing private-file URL handling.
      const enrichedTasks = await Promise.all(
        (payload.tasks || []).map(async (task) => {
          if (!task.file_path) return task;

          try {
            const response = await fetch("/api/portal-files", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "signed-url",
                role: "ceo",
                email: s.email || "arslanfayyaz1997@gmail.com",
                pin: s.pin,
                file_path: task.file_path,
              }),
            });

            const result = await response.json();

            return result.ok
              ? { ...task, file_url: result.url }
              : task;
          } catch {
            return task;
          }
        })
      );

      setTasks(enrichedTasks);
    } catch (e) {
      setError(
        e.message || "Unable to load dashboard. Check Supabase portal setup."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const tracks = useMemo(
    () => [
      "All tracks",
      ...new Set(rows.map((r) => r.track).filter(Boolean)),
    ],
    [rows]
  );

  // Sorting is also applied before searching/filtering.
  const sortedRows = useMemo(
    () => [...rows].sort(compareInternIds),
    [rows]
  );

  const filtered = sortedRows.filter((r) => {
    const searchableText = [
      r.full_name,
      r.student_name,
      r.intern_id,
      r.certificate_id,
      r.email,
      r.student_email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      searchableText.includes(query.toLowerCase()) &&
      (track === "All tracks" || (r.track || r.program) === track)
    );
  });

  const visibleTasks = tasks.filter((t) => {
    const taskStatus = String(t.status || "Pending").toLowerCase();

    const statusMatches =
      status === "All statuses" ||
      taskStatus === status.toLowerCase() ||
      (status === "Pending" && taskStatus === "under review");

    const searchableText = [
      t.intern_name,
      t.intern_id,
      t.student_email,
      t.email,
      t.task_title,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return statusMatches && searchableText.includes(query.toLowerCase());
  });

  async function review(taskId, decision) {
    setNotice("");
    setError("");

    try {
      const { data, error } = await supabase.rpc("portal_review_task", {
        p_email: session.email || "arslanfayyaz1997@gmail.com",
        p_pin: session.pin,
        p_task_id: taskId,
        p_decision: decision,
        p_feedback: "",
      });

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.ok) {
        throw new Error(result?.message || "Could not update task.");
      }

      setNotice(`Task ${decision.toLowerCase()} successfully.`);
      await load();
    } catch (e) {
      setError(e.message || "Could not review task.");
    }
  }

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              CEO workspace
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-brand-ink sm:text-4xl">
              Welcome back, Arslan
            </h1>
            <p className="mt-2 text-muted-foreground">
              Internlytic Technologies · Admin Dashboard
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={load}>
              <RefreshCw size={16} /> Refresh data
            </Button>
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

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<Users />}
            label="Intern records loaded"
            value={rows.length}
          />
          <Stat
            icon={<ClipboardCheck />}
            label="Task submissions"
            value={tasks.length}
          />
          <Stat
            icon={<ShieldCheck />}
            label="Pending review"
            value={
              tasks.filter((t) =>
                ["pending", "under review"].includes(
                  String(t.status || "Pending").toLowerCase()
                )
              ).length
            }
          />
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">All interns</h2>
              <p className="text-sm text-muted-foreground">
                Certificate records sorted by intern ID.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search name, ID, email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
              >
                {tracks.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-muted-foreground">
              Loading Supabase records…
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No intern records returned. Check the portal setup and mapped data sources.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="p-3">Intern</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Track</th>
                    <th className="p-3">Offer letter</th>
                    <th className="p-3">Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={r.intern_id || r.certificate_id || r.email || i}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="p-3">
                        <strong>
                          {r.full_name || r.student_name || "Intern"}
                        </strong>
                        <div className="text-xs text-muted-foreground">
                          {r.email || r.student_email || "Email not available"}
                        </div>
                      </td>
                      <td className="p-3">
                        {r.intern_id || r.certificate_id || "—"}
                      </td>
                      <td className="p-3">{r.track || r.program || "—"}</td>
                      <td className="p-3">
                        {r.offer_letter_status || "Not configured"}
                      </td>
                      <td className="p-3">
                        {r.certificate_status || r.status || "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Task submissions & review</h2>
              <p className="text-sm text-muted-foreground">
                Review files and links submitted by interns.
              </p>
            </div>

            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["Pending", "Approved", "Needs Changes", "All statuses"].map(
                (x) => (
                  <option key={x}>{x}</option>
                )
              )}
            </select>
          </div>

          {loading ? (
            <p className="py-8 text-muted-foreground">
              Loading submissions…
            </p>
          ) : visibleTasks.length === 0 ? (
            <p className="py-8 text-muted-foreground">
              No submissions for this filter yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {visibleTasks.map((t) => (
                <article
                  key={t.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">
                        {t.intern_name || "Intern"} · {t.intern_id || ""}
                      </p>
                      <h3 className="mt-1 font-bold">
                        {t.task_title || "Task submission"}
                      </h3>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {t.description || ""}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Submitted:{" "}
                        {(t.submitted_at || t.created_at)
                          ? new Date(
                              t.submitted_at || t.created_at
                            ).toLocaleString()
                          : "—"}{" "}
                        · Status: <strong>{t.status || "Pending"}</strong>
                      </p>
                      {t.admin_feedback && (
                        <p className="mt-2 text-sm">
                          Admin feedback: {t.admin_feedback}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {t.file_url && (
                        <a
                          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-semibold"
                          href={t.file_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText size={15} /> Open file{" "}
                          <ExternalLink size={13} />
                        </a>
                      )}

                      {t.file_path && !t.file_url && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
                          <FileText size={15} /> Private file stored (link may expire)
                        </span>
                      )}

                      {t.submission_url && (
                        <a
                          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-semibold"
                          href={t.submission_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open link <ExternalLink size={13} />
                        </a>
                      )}

                      {["pending", "under review"].includes(
                        String(t.status || "Pending").toLowerCase()
                      ) && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => review(t.id, "Approved")}
                          >
                            <CheckCircle2 size={15} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => review(t.id, "Needs Changes")}
                          >
                            <XCircle size={15} /> Request changes
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Do not recreate existing interns if records are missing. Check the Supabase portal setup and mapped data sources.
        </p>
      </main>

      <Footer />
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-primary">
        {icon}
        <span className="text-3xl font-extrabold text-foreground">
          {value}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
