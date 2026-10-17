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
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const statusLabel = (value) => String(value || "Pending");

const statusClass = (value) =>
  statusLabel(value).toLowerCase() === "approved"
    ? "bg-emerald-500/15 text-emerald-700"
    : statusLabel(value).toLowerCase() === "needs changes"
      ? "bg-rose-500/15 text-rose-700"
      : "bg-amber-500/15 text-amber-700";

const dateLabel = (value) =>
  value ? new Date(value).toLocaleString() : "—";

function weekFor(task) {
  const text =
    `${task.week_number || ""} ${task.week || ""} ${task.task_title || ""} ${task.description || ""}`.toLowerCase();

  const match =
    text.match(/week\s*[-:#]?\s*([1-4])/i) ||
    text.match(/\bw([1-4])\b/i);

  return match ? Number(match[1]) : 0;
}

function groupTasksByIntern(tasks) {
  const map = new Map();

  tasks.forEach((task) => {
    const key = String(
      task.intern_id ||
        task.student_email ||
        task.email ||
        task.intern_name ||
        "unknown"
    );

    if (!map.has(key)) map.set(key, []);
    map.get(key).push(task);
  });

  return map;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(readSession);
  const [rows, setRows] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openThreads, setOpenThreads] = useState({});
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("All tracks");
  const [status, setStatus] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState("");
  const [savingTask, setSavingTask] = useState("");
  const [taskFeedback, setTaskFeedback] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function loadMessages(s) {
    const { data, error } = await supabase.rpc(
      "portal_admin_get_ceo_feedback",
      {
        p_email: s.email || "arslanfayyaz1997@gmail.com",
        p_pin: s.pin,
      }
    );

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;

    if (result && result.ok === false) {
      throw new Error(
        result.message || "Could not load intern messages."
      );
    }

    setMessages(result?.comments || result?.messages || []);
  }

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
          payload?.message ||
            "Admin authorization failed. Please sign in again."
        );
      }

      setRows(payload.interns || []);

      const enriched = await Promise.all(
        (payload.tasks || []).map(async (task) => {
          if (!task.file_path) return task;

          try {
            const response = await fetch("/api/portal-files", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
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

      setTasks(enriched);
      await loadMessages(s);
    } catch (e) {
      setError(
        e.message ||
          "Unable to load dashboard. Check Supabase portal setup."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser Back takes the CEO out of the protected dashboard.
  useEffect(() => {
    window.history.pushState(
      { internlyticDashboard: true },
      "",
      window.location.href
    );

    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const tracks = useMemo(
    () => [
      "All tracks",
      ...new Set(rows.map((r) => r.track).filter(Boolean)),
    ],
    [rows]
  );

  const filteredRows = rows.filter(
    (r) =>
      `${r.full_name || r.student_name || ""} ${
        r.intern_id || r.certificate_id || ""
      } ${r.email || r.student_email || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (track === "All tracks" || r.track === track)
  );

  const visibleTasks = tasks.filter(
    (t) =>
      (status === "All statuses" ||
        statusLabel(t.status).toLowerCase() === status.toLowerCase()) &&
      `${t.intern_name || ""} ${t.intern_id || ""} ${
        t.task_title || ""
      } ${t.description || ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  const tasksByIntern = groupTasksByIntern(visibleTasks);

  filteredRows.forEach((r) => {
    const key = String(
      r.intern_id ||
        r.certificate_id ||
        r.email ||
        r.student_email ||
        r.full_name ||
        r.student_name ||
        "unknown"
    );

    if (!tasksByIntern.has(key)) tasksByIntern.set(key, []);
  });

  const rowById = useMemo(() => {
    const map = new Map();

    rows.forEach((r) => {
      map.set(
        String(
          r.intern_id ||
            r.certificate_id ||
            r.email ||
            r.student_email ||
            ""
        ),
        r
      );
    });

    return map;
  }, [rows]);

  const threads = useMemo(() => {
    const map = new Map();

    messages.forEach((m) => {
      const key = `${m.intern_id || ""}::${String(
        m.student_email || m.email || ""
      ).toLowerCase()}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });

    return [...map.entries()]
      .map(([key, items]) => ({
        key,
        items: items.sort(
          (a, b) =>
            new Date(a.created_at || 0) -
            new Date(b.created_at || 0)
        ),
        latest: items[items.length - 1],
      }))
      .filter((thread) => {
        const last = thread.latest || {};

        return `${last.student_name || last.full_name || ""} ${
          last.intern_id || ""
        } ${last.student_email || last.email || ""} ${
          last.message || ""
        }`
          .toLowerCase()
          .includes(query.toLowerCase());
      });
  }, [messages, query]);

  async function review(task, decision) {
    const id = String(task.id);

    setSavingTask(id);
    setError("");
    setNotice("");

    try {
      const feedback = String(taskFeedback[id] || "").trim();

      if (decision === "Needs Changes" && !feedback) {
        throw new Error(
          "Please add a short note explaining what needs to change."
        );
      }

      const { data, error } = await supabase.rpc(
        "portal_review_task",
        {
          p_email: session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_task_id: task.id,
          p_decision: decision,
          p_feedback: feedback,
        }
      );

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.ok) {
        throw new Error(result?.message || "Could not update task.");
      }

      setNotice(`Task marked ${decision.toLowerCase()}.`);
      await load();
    } catch (e) {
      setError(e.message || "Could not review task.");
    } finally {
      setSavingTask("");
    }
  }

  async function sendReply(thread) {
    const latest = thread.latest || {};
    const key = thread.key;
    const message = String(replyDrafts[key] || "").trim();

    if (!message) return;

    setSendingReply(key);
    setError("");
    setNotice("");

    try {
      const { data, error } = await supabase.rpc(
        "portal_admin_reply_ceo_feedback",
        {
          p_email: session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_intern_id: String(latest.intern_id || ""),
          p_student_email: String(
            latest.student_email || latest.email || ""
          ),
          p_message: message,
        }
      );

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.ok) {
        throw new Error(
          result?.message || "Reply could not be sent."
        );
      }

      setReplyDrafts((prev) => ({
        ...prev,
        [key]: "",
      }));

      setNotice(
        "Reply sent to the intern's portal conversation."
      );

      await loadMessages(session);
    } catch (e) {
      setError(e.message || "Reply could not be sent.");
    } finally {
      setSendingReply("");
    }
  }

  function logout() {
    setShowLogoutConfirm(false);
    sessionStorage.removeItem("internlytic.portal.session");
    window.alert("You have been logged out successfully!");
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              CEO workspace
            </p>

            <h1 className="mt-2 break-words text-3xl font-extrabold text-brand-ink sm:text-4xl">
              Welcome back, Arslan
            </h1>

            <p className="mt-2 break-words text-sm text-muted-foreground">
              Internlytic Technologies · Admin Dashboard
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={load}>
              <RefreshCw size={16} />
              Refresh data
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={16} />
              Log out
            </Button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 break-words rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-5 break-words rounded-xl border border-primary/30 bg-secondary p-3 text-sm"
          >
            {notice}
          </p>
        )}

        <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-3">
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
              tasks.filter(
                (t) =>
                  statusLabel(t.status).toLowerCase() === "pending"
              ).length
            }
          />
        </div>

        <section className="mt-7 min-w-0 rounded-2xl border border-border bg-card p-3 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Intern records
              </h2>
              <p className="text-sm text-muted-foreground">
                Existing portal records and linked certificate data.
              </p>
            </div>

            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="min-w-0 pl-9"
                  placeholder="Search name, ID, email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select
                className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto"
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
            <p className="py-8 text-center text-muted-foreground">
              Loading Supabase records…
            </p>
          ) : filteredRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No intern records returned. Check the portal setup and
              mapped data sources.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {filteredRows.map((r, i) => (
                <article
                  key={r.intern_id || r.email || i}
                  className="grid min-w-0 gap-2 rounded-xl border border-border p-3 sm:grid-cols-2 lg:grid-cols-5"
                >
                  <div className="min-w-0 lg:col-span-2">
                    <p className="break-words font-semibold">
                      {r.full_name || r.student_name || "Intern"}
                    </p>
                    <p className="break-all text-xs text-muted-foreground">
                      {r.email ||
                        r.student_email ||
                        "Email not available"}
                    </p>
                  </div>

                  <p className="break-words text-sm">
                    <span className="text-muted-foreground">
                      ID:{" "}
                    </span>
                    {r.intern_id || r.certificate_id || "—"}
                  </p>

                  <p className="break-words text-sm">
                    <span className="text-muted-foreground">
                      Track:{" "}
                    </span>
                    {r.track || r.program || "—"}
                  </p>

                  <div className="min-w-0 text-sm">
                    <p className="break-words">
                      Offer: {r.offer_letter_status || "Not configured"}
                    </p>
                    <p className="break-words">
                      Certificate:{" "}
                      {r.certificate_status || r.status || "Pending"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 min-w-0 rounded-2xl border border-border bg-card p-3 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Task submissions & review
              </h2>
              <p className="text-sm text-muted-foreground">
                One compact card per intern, with all four weeks inside.
              </p>
            </div>

            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {[
                "All statuses",
                "Pending",
                "Approved",
                "Needs Changes",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="py-8 text-muted-foreground">
              Loading submissions…
            </p>
          ) : tasksByIntern.size === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No submissions for this filter yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {[...tasksByIntern.entries()].map(([key, items]) => {
                const first = items[0] || {};
                const person =
                  rowById.get(key) ||
                  rows.find(
                    (r) =>
                      String(r.intern_id || r.certificate_id || "") ===
                      String(first.intern_id || "")
                  );

                const name =
                  first.intern_name ||
                  person?.full_name ||
                  person?.student_name ||
                  "Intern";

                const sorted = [...items].sort((a, b) => {
                  const wa = weekFor(a) || 5;
                  const wb = weekFor(b) || 5;

                  return (
                    wa - wb ||
                    new Date(a.created_at || 0) -
                      new Date(b.created_at || 0)
                  );
                });

                const grouped = [1, 2, 3, 4].map((w) => ({
                  week: w,
                  items: sorted.filter((t) => weekFor(t) === w),
                }));

                const other = sorted.filter((t) => weekFor(t) === 0);
                const cardKey = String(key);

                return (
                  <article
                    key={cardKey}
                    className="min-w-0 overflow-hidden rounded-xl border border-border bg-background/60 p-3 sm:p-4"
                  >
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words font-bold">
                          {name}
                        </h3>

                        <p className="break-all text-xs text-muted-foreground">
                          {first.intern_id || "ID unavailable"}
                          {person?.email ? ` · ${person.email}` : ""}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {person?.track || "Internship track"} ·{" "}
                          {items.length} submission
                          {items.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {[
                          "Pending",
                          "Approved",
                          "Needs Changes",
                        ].map((s) => {
                          const count = items.filter(
                            (t) =>
                              statusLabel(t.status).toLowerCase() ===
                              s.toLowerCase()
                          ).length;

                          return count ? (
                            <span
                              key={s}
                              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(s)}`}
                            >
                              {count} {s}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {grouped.map((group) => (
                        <div
                          key={group.week}
                          className="min-w-0 rounded-lg border border-border/80 p-2 sm:p-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold">
                              Week {group.week}
                            </h4>
                            <span className="text-[11px] text-muted-foreground">
                              {group.items.length} task
                              {group.items.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          {group.items.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              No submission identified for this week yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {group.items.map((t) => (
                                <TaskRow
                                  key={t.id}
                                  task={t}
                                  saving={
                                    savingTask === String(t.id)
                                  }
                                  feedback={
                                    taskFeedback[String(t.id)] || ""
                                  }
                                  onFeedback={(value) =>
                                    setTaskFeedback((prev) => ({
                                      ...prev,
                                      [String(t.id)]: value,
                                    }))
                                  }
                                  onReview={(decision) =>
                                    review(t, decision)
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {other.length > 0 && (
                        <div className="min-w-0 rounded-lg border border-border/80 p-2 sm:p-3">
                          <h4 className="mb-2 text-sm font-bold">
                            Other submissions
                          </h4>

                          <div className="space-y-2">
                            {other.map((t) => (
                              <TaskRow
                                key={t.id}
                                task={t}
                                saving={
                                  savingTask === String(t.id)
                                }
                                feedback={
                                  taskFeedback[String(t.id)] || ""
                                }
                                onFeedback={(value) =>
                                  setTaskFeedback((prev) => ({
                                    ...prev,
                                    [String(t.id)]: value,
                                  }))
                                }
                                onReview={(decision) =>
                                  review(t, decision)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-7 min-w-0 rounded-2xl border border-border bg-card p-3 sm:p-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-primary" size={20} />
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Intern messages
              </h2>
              <p className="text-sm text-muted-foreground">
                Reply here; the intern will see your message in their
                portal thread.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="py-6 text-sm text-muted-foreground">
              Loading conversations…
            </p>
          ) : threads.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No intern messages yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {threads.map((thread) => {
                const latest = thread.latest || {};
                const key = thread.key;
                const expanded = Boolean(openThreads[key]);

                return (
                  <article
                    key={key}
                    className="min-w-0 rounded-xl border border-border p-3 sm:p-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="break-words font-semibold">
                          {latest.student_name ||
                            latest.full_name ||
                            latest.intern_name ||
                            "Intern"}
                        </p>

                        <p className="break-all text-xs text-muted-foreground">
                          {latest.intern_id || ""} ·{" "}
                          {latest.student_email ||
                            latest.email ||
                            "Email unavailable"}
                        </p>

                        <p className="mt-2 break-words text-sm">
                          {latest.message || "Message"}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {dateLabel(latest.created_at)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setOpenThreads((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                      >
                        {expanded ? "Hide" : "Reply"}
                        {expanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </Button>
                    </div>

                    {expanded && (
                      <>
                        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg bg-secondary/30 p-2">
                          {thread.items.map((m, i) => (
                            <div
                              key={m.id || `${m.created_at}-${i}`}
                              className={`max-w-[95%] rounded-lg p-2 text-sm ${
                                String(m.sender_role || "intern")
                                  .toLowerCase() === "ceo"
                                  ? "ml-auto bg-primary/10"
                                  : "mr-auto border border-border bg-card"
                              }`}
                            >
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                {String(m.sender_role || "intern")
                                  .toLowerCase() === "ceo"
                                  ? "Admin reply"
                                  : "Intern message"}
                              </p>

                              <p className="break-words [overflow-wrap:anywhere]">
                                {m.message}
                              </p>

                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {dateLabel(m.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex min-w-0 flex-col gap-2">
                          <Textarea
                            className="min-w-0 resize-y break-words"
                            rows={2}
                            placeholder="Write a reply to this intern…"
                            value={replyDrafts[key] || ""}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                          />

                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              disabled={
                                !String(replyDrafts[key] || "").trim() ||
                                sendingReply === key
                              }
                              onClick={() => sendReply(thread)}
                            >
                              <Send size={14} />
                              {sendingReply === key
                                ? "Sending…"
                                : "Send reply"}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-5 break-words text-xs text-muted-foreground">
          Existing intern records are read from Supabase. This page does
          not recreate or delete users or certificate records.
        </p>
      </main>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <LogOut size={24} />
            </div>

            <h2
              id="logout-title"
              className="text-xl font-bold"
            >
              Are you sure you want to log out?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You will be returned to the Internlytic home page.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                onClick={logout}
              >
                Confirm Logout
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Stay in Portal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  saving,
  feedback,
  onFeedback,
  onReview,
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold [overflow-wrap:anywhere]">
            {task.task_title || "Task submission"}
          </p>

          <p className="mt-1 break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {task.description || "No extra notes provided."}
          </p>

          <p className="mt-2 break-words text-[11px] text-muted-foreground">
            Submitted: {dateLabel(task.created_at)} ·{" "}
            <span className={`font-semibold ${statusClass(task.status)}`}>
              {statusLabel(task.status)}
            </span>
          </p>

          {task.review_feedback && (
            <p className="mt-2 break-words rounded-md bg-secondary/70 p-2 text-xs [overflow-wrap:anywhere]">
              <strong>Previous feedback:</strong>{" "}
              {task.review_feedback}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap gap-1.5 sm:max-w-48 sm:justify-end">
          {task.file_url && (
            <a
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-semibold"
              href={task.file_url}
              target="_blank"
              rel="noreferrer"
            >
              <FileText size={13} />
              Open file
              <ExternalLink size={11} />
            </a>
          )}

          {task.file_path && !task.file_url && (
            <span className="break-all text-[11px] text-muted-foreground">
              Private file uploaded
            </span>
          )}

          {task.submission_url && (
            <a
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-semibold"
              href={task.submission_url}
              target="_blank"
              rel="noreferrer"
            >
              Open link
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {statusLabel(task.status).toLowerCase() !== "approved" && (
        <div className="mt-3 grid min-w-0 gap-2">
          <Textarea
            className="min-w-0 resize-y break-words text-sm"
            rows={2}
            placeholder="Feedback for this task (required for Request Changes)"
            value={feedback}
            onChange={(e) => onFeedback(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={saving}
              onClick={() => onReview("Approved")}
            >
              <CheckCircle2 size={14} />
              {saving ? "Saving…" : "Approve"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => onReview("Needs Changes")}
            >
              <XCircle size={14} />
              {saving ? "Saving…" : "Request changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 text-primary">
        {icon}
        <span className="text-3xl font-extrabold text-foreground">
          {value}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
