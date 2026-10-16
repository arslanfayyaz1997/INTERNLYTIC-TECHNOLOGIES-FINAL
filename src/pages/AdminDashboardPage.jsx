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
  MessageSquare,
  Send,
  Mail,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
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

function compareInternIds(a, b) {
  return String(a.intern_id || a.certificate_id || "").localeCompare(
    String(b.intern_id || b.certificate_id || ""),
    undefined,
    { numeric: true, sensitivity: "base" }
  );
}

function displayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getResult(data) {
  return Array.isArray(data) ? data[0] : data;
}

function safeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(String(value).trim())
        ? String(value).trim()
        : `https://${String(value).trim()}`
    );

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3 text-primary">
        {icon}
        <span className="text-3xl font-extrabold text-foreground">
          {value}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ExternalLinkItem({ label, value }) {
  if (!value) return null;

  const href = safeUrl(value);

  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex max-w-full items-start gap-1 break-all text-sm font-medium text-primary hover:underline"
        >
          <span className="break-all">{String(value)}</span>
          <ExternalLink size={13} className="mt-1 shrink-0" />
        </a>
      ) : (
        <p className="mt-1 break-all text-sm">{String(value)}</p>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(() => readSession());
  const [rows, setRows] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [ceoComments, setCeoComments] = useState([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("All tracks");
  const [status, setStatus] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingReply, setSendingReply] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadCeoComments() {
    const s = readSession();

    if (!s || s.role !== "ceo" || !s.pin) return;

    setLoadingComments(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_admin_get_ceo_feedback",
        {
          p_email: s.email || "arslanfayyaz1997@gmail.com",
          p_pin: s.pin,
        }
      );

      if (rpcError) throw rpcError;

      const payload = getResult(data);

      if (payload?.ok === false) {
        throw new Error(
          payload.message || "Could not load intern comments."
        );
      }

      const comments = Array.isArray(payload)
        ? payload
        : payload?.comments || [];

      setCeoComments(comments);
    } catch (e) {
      setCeoComments([]);
      setError((previous) =>
        previous
          ? `${previous} | CEO comments: ${e.message}`
          : `Could not load CEO comments: ${e.message}`
      );
    } finally {
      setLoadingComments(false);
    }
  }

  async function load() {
    setLoading(true);
    setError("");

    try {
      const s = readSession();

      if (!s || s.role !== "ceo" || !s.pin) {
        navigate("/login", { replace: true });
        return;
      }

      setSession(s);

      const { data, error: overviewError } = await supabase.rpc(
        "portal_admin_overview",
        {
          p_email: s.email || "arslanfayyaz1997@gmail.com",
          p_pin: s.pin,
        }
      );

      if (overviewError) throw overviewError;

      const payload = getResult(data);

      if (!payload?.ok) {
        throw new Error(
          payload?.message ||
            "Admin authorization failed. Please sign in again."
        );
      }

      setRows([...(payload.interns || [])].sort(compareInternIds));

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
      setError(e.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }

    // Comments are separate: a comments issue will not block the dashboard.
    await loadCeoComments();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tracks = useMemo(
    () => [
      "All tracks",
      ...new Set(
        rows.map((r) => r.track || r.program).filter(Boolean)
      ),
    ],
    [rows]
  );

  const filtered = rows.filter((r) => {
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
      (track === "All tracks" ||
        (r.track || r.program) === track)
    );
  });

  // Group all task records belonging to the same intern.
  // Each intern renders as ONE outer task card.
  const taskGroups = useMemo(() => {
    const groups = new Map();

    tasks.forEach((task, index) => {
      const identity =
        task.intern_id ||
        task.certificate_id ||
        task.student_email ||
        task.email ||
        task.intern_name ||
        task.student_name ||
        `unknown-${index}`;

      const key = String(identity).trim().toLowerCase();

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          intern_id: task.intern_id || task.certificate_id || "",
          intern_name:
            task.intern_name || task.student_name || "Intern",
          email: task.student_email || task.email || "",
          tasks: [],
        });
      }

      const group = groups.get(key);

      if (!group.email) {
        group.email = task.student_email || task.email || "";
      }

      if (group.intern_name === "Intern") {
        group.intern_name =
          task.intern_name || task.student_name || "Intern";
      }

      group.tasks.push(task);
    });

    return [...groups.values()].map((group) => ({
      ...group,
      tasks: [...group.tasks].sort(
        (a, b) =>
          Number(a.task_number || 999) -
          Number(b.task_number || 999)
      ),
    }));
  }, [tasks]);

  const visibleTaskGroups = taskGroups
    .map((group) => ({
      ...group,
      tasks: group.tasks.filter((task) => {
        const taskStatus = String(
          task.status || "Pending"
        ).toLowerCase();

        const statusMatches =
          status === "All statuses" ||
          taskStatus === status.toLowerCase() ||
          (status === "Pending" &&
            ["under review", "pending"].includes(taskStatus));

        const searchableText = [
          group.intern_name,
          group.intern_id,
          group.email,
          task.intern_name,
          task.intern_id,
          task.student_email,
          task.email,
          task.task_title,
          task.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          statusMatches &&
          searchableText.includes(query.toLowerCase())
        );
      }),
    }))
    .filter((group) => group.tasks.length > 0)
    .sort((a, b) =>
      String(a.intern_id).localeCompare(
        String(b.intern_id),
        undefined,
        { numeric: true, sensitivity: "base" }
      )
    );

  async function review(taskId, decision) {
    setNotice("");
    setError("");

    const feedback = String(
      feedbackDrafts[taskId] || ""
    ).trim();

    if (decision === "Needs Changes" && !feedback) {
      setError(
        "Please write feedback before requesting changes."
      );
      return;
    }

    if (!session?.pin) {
      setError("Your CEO session expired. Please sign in again.");
      return;
    }

    setSavingTask(String(taskId));

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_review_task",
        {
          p_email:
            session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_task_id: taskId,
          p_decision: decision,
          p_feedback: feedback,
        }
      );

      if (rpcError) throw rpcError;

      const result = getResult(data);

      if (!result?.ok) {
        throw new Error(
          result?.message || "Could not update task."
        );
      }

      setNotice(
        `Task ${decision.toLowerCase()} successfully.`
      );

      setFeedbackDrafts((previous) => {
        const next = { ...previous };
        delete next[taskId];
        return next;
      });

      await load();
    } catch (e) {
      setError(e.message || "Could not review task.");
    } finally {
      setSavingTask("");
    }
  }

  async function sendReply(comment) {
    const commentId = String(
      comment.id ||
        `${comment.intern_id}-${comment.created_at}`
    );

    const recipient = String(
      comment.student_email || comment.email || ""
    ).trim();

    const message = String(
      replyDrafts[commentId] || ""
    ).trim();

    setError("");
    setNotice("");

    if (!recipient || !recipient.includes("@")) {
      setError(
        "This comment does not have a valid intern email address."
      );
      return;
    }

    if (!message) {
      setError("Please write your reply first.");
      return;
    }

    if (!session?.pin) {
      setError("Your CEO session expired. Please sign in again.");
      return;
    }

    setSendingReply(commentId);

    try {
      const response = await fetch("/api/portal-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:
            session.email || "arslanfayyaz1997@gmail.com",
          pin: session.pin,
          to: recipient,
          intern_name:
            comment.intern_name ||
            comment.student_name ||
            "Intern",
          subject: "Reply from Internlytic Technologies",
          message,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ||
            "Email could not be sent. Check the email API and provider settings."
        );
      }

      setNotice(`Reply email sent to ${recipient}.`);
      setReplyDrafts((previous) => ({
        ...previous,
        [commentId]: "",
      }));
      setReplyOpen((previous) => ({
        ...previous,
        [commentId]: false,
      }));
    } catch (e) {
      setError(e.message || "Could not send reply email.");
    } finally {
      setSendingReply("");
    }
  }

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  const pendingCount = tasks.filter((task) =>
    ["pending", "under review"].includes(
      String(task.status || "Pending").toLowerCase()
    )
  ).length;

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
            <Button
              variant="outline"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "mr-2 animate-spin" : "mr-2"}
              />
              Refresh data
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut size={16} className="mr-2" />
              Log out
            </Button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 break-words rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-5 break-words rounded-xl border border-primary/30 bg-secondary p-4 text-sm"
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
            value={pendingCount}
          />
        </div>

        {/* EXISTING INTERN LIST */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">All interns</h2>
              <p className="text-sm text-muted-foreground">
                Existing certificate records sorted by intern ID.
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
                {tracks.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
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
                      key={
                        r.intern_id ||
                        r.certificate_id ||
                        r.email ||
                        i
                      }
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="p-3">
                        <strong>
                          {r.full_name || r.student_name || "Intern"}
                        </strong>
                        <div className="text-xs text-muted-foreground">
                          {r.email ||
                            r.student_email ||
                            "Email not available"}
                        </div>
                      </td>
                      <td className="p-3">
                        {r.intern_id || r.certificate_id || "—"}
                      </td>
                      <td className="p-3">
                        {r.track || r.program || "—"}
                      </td>
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

        {/* ONE OUTER TASK CARD PER INTERN */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Task submissions & review
              </h2>
              <p className="text-sm text-muted-foreground">
                Each intern has one card containing all their submitted tasks.
              </p>
            </div>

            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {[
                "All statuses",
                "Pending",
                "Approved",
                "Needs Changes",
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="py-8 text-muted-foreground">
              Loading submissions…
            </p>
          ) : visibleTaskGroups.length === 0 ? (
            <p className="py-8 text-muted-foreground">
              No submissions for this filter yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-5">
              {visibleTaskGroups.map((group) => (
                <article
                  key={group.key}
                  className="min-w-0 overflow-hidden rounded-2xl border border-primary/25 bg-card"
                >
                  {/* One header for this intern */}
                  <div className="border-b border-border bg-secondary/50 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold">
                          {group.intern_name}
                        </h3>
                        <p className="mt-1 break-all text-sm text-muted-foreground">
                          ID: {group.intern_id || "—"}
                        </p>
                        <p className="break-all text-sm text-muted-foreground">
                          {group.email || "Email unavailable"}
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-background px-3 py-1 text-xs font-semibold">
                        {group.tasks.length} task
                        {group.tasks.length === 1 ? "" : "s"} shown
                      </span>
                    </div>
                  </div>

                  {/* Tasks are sections inside the same card, not separate intern cards */}
                  <div className="divide-y divide-border">
                    {group.tasks.map((t, index) => (
                      <div
                        key={t.id || `${group.key}-${t.task_number}-${index}`}
                        className="min-w-0 p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                              Week {t.task_number || index + 1}
                            </p>
                            <h4 className="mt-1 break-words font-bold">
                              {t.task_title ||
                                `Task ${t.task_number || index + 1}`}
                            </h4>
                          </div>
                          <span className="w-fit shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                            {t.status || "Pending"}
                          </span>
                        </div>

                        {t.description && (
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                            {t.description}
                          </p>
                        )}

                        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                          <ExternalLinkItem
                            label="Submission link"
                            value={
                              t.submission_url ||
                              t.task_link ||
                              t.linkedin_link
                            }
                          />
                          <ExternalLinkItem
                            label="GitHub repository"
                            value={t.github_link}
                          />
                          <ExternalLinkItem
                            label="LinkedIn post"
                            value={t.linkedin_link}
                          />
                          {t.file_url && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">
                                Uploaded file
                              </p>
                              <a
                                href={t.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                              >
                                <FileText size={15} />
                                Open file
                                <ExternalLink size={13} />
                              </a>
                            </div>
                          )}
                          {t.file_path && !t.file_url && (
                            <p className="text-xs text-muted-foreground">
                              Private file stored; refresh to request a new link.
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Submitted:{" "}
                            {displayDate(t.submitted_at || t.created_at)}
                          </span>
                          {t.reviewed_at && (
                            <span>
                              Reviewed: {displayDate(t.reviewed_at)}
                            </span>
                          )}
                        </div>

                        {t.admin_feedback && (
                          <div className="mt-3 rounded-xl bg-secondary/70 p-3">
                            <p className="text-xs font-bold">
                              Previous admin feedback
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                              {t.admin_feedback}
                            </p>
                          </div>
                        )}

                        {["pending", "under review", "needs changes"].includes(
                          String(t.status || "Pending").toLowerCase()
                        ) && (
                          <div className="mt-4 border-t border-border pt-4">
                            <label
                              className="text-sm font-semibold"
                              htmlFor={`feedback-${t.id}`}
                            >
                              Feedback for this task
                            </label>
                            <Textarea
                              id={`feedback-${t.id}`}
                              value={feedbackDrafts[t.id] || ""}
                              onChange={(e) =>
                                setFeedbackDrafts((previous) => ({
                                  ...previous,
                                  [t.id]: e.target.value,
                                }))
                              }
                              placeholder="Write feedback, corrections, or next steps..."
                              rows={3}
                              className="mt-2"
                            />

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                disabled={savingTask === String(t.id)}
                                onClick={() => review(t.id, "Approved")}
                              >
                                <CheckCircle2 size={15} className="mr-1" />
                                {savingTask === String(t.id)
                                  ? "Saving…"
                                  : "Approve task"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={savingTask === String(t.id)}
                                onClick={() =>
                                  review(t.id, "Needs Changes")
                                }
                              >
                                <XCircle size={15} className="mr-1" />
                                Request changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* CEO COMMENTS + REPLY BY EMAIL */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <MessageSquare size={20} />
                Intern comments to CEO
              </h2>
              <p className="text-sm text-muted-foreground">
                Reply to an intern and send the reply to their registered email.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={loadCeoComments}
              disabled={loadingComments}
            >
              <RefreshCw
                size={15}
                className={loadingComments ? "mr-2 animate-spin" : "mr-2"}
              />
              {loadingComments ? "Loading…" : "Refresh comments"}
            </Button>
          </div>

          {loadingComments ? (
            <p className="py-6 text-sm text-muted-foreground">
              Loading comments…
            </p>
          ) : ceoComments.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No comments available yet. Confirm the CEO feedback SQL has been installed.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {ceoComments.map((comment) => {
                const commentId = String(
                  comment.id ||
                    `${comment.intern_id}-${comment.created_at}`
                );
                const recipient =
                  comment.student_email || comment.email || "";

                return (
                  <article
                    key={commentId}
                    className="min-w-0 rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-words font-semibold">
                          {comment.intern_name ||
                            comment.student_name ||
                            "Intern"}
                        </p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          ID:{" "}
                          {comment.intern_id ||
                            comment.certificate_id ||
                            "—"}
                        </p>
                        <p className="break-all text-xs text-muted-foreground">
                          {recipient || "Email unavailable"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {displayDate(comment.created_at)}
                      </p>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
                      {comment.message || comment.comment || ""}
                    </p>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReplyOpen((previous) => ({
                            ...previous,
                            [commentId]: !previous[commentId],
                          }))
                        }
                      >
                        <Mail size={15} className="mr-2" />
                        {replyOpen[commentId]
                          ? "Close reply"
                          : "Reply by email"}
                      </Button>
                    </div>

                    {replyOpen[commentId] && (
                      <div className="mt-4 rounded-xl bg-secondary/40 p-3 sm:p-4">
                        <p className="break-all text-xs text-muted-foreground">
                          To: {recipient || "Email unavailable"}
                        </p>
                        <Textarea
                          className="mt-3"
                          value={replyDrafts[commentId] || ""}
                          onChange={(e) =>
                            setReplyDrafts((previous) => ({
                              ...previous,
                              [commentId]: e.target.value,
                            }))
                          }
                          placeholder="Write your reply to this intern..."
                          rows={4}
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            disabled={
                              sendingReply === commentId ||
                              !recipient
                            }
                            onClick={() => sendReply(comment)}
                          >
                            <Send size={15} className="mr-2" />
                            {sendingReply === commentId
                              ? "Sending email…"
                              : "Send email reply"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={sendingReply === commentId}
                            onClick={() =>
                              setReplyOpen((previous) => ({
                                ...previous,
                                [commentId]: false,
                              }))
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Existing intern records are preserved. If a record is missing, check
          the Supabase portal setup and mapped data sources instead of recreating it.
        </p>
      </main>

      <Footer />
    </div>
  );
}
