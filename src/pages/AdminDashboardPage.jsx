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
  Trash2,
  ChevronDown,
  ChevronUp,
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

function getResult(data) {
  return Array.isArray(data) ? data[0] : data;
}

function displayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
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

function compareInternIds(a, b) {
  const getId = (item) =>
    String(item?.intern_id ?? item?.certificate_id ?? "").trim();

  const idA = getId(a);
  const idB = getId(b);
  const matchA = idA.match(/\d+/);
  const matchB = idB.match(/\d+/);

  if (matchA && matchB) {
    const numberA = Number(matchA[0]);
    const numberB = Number(matchB[0]);

    if (numberA !== numberB) return numberA - numberB;
  }

  return idA.localeCompare(idB);
}

function normalStatus(value) {
  const status = String(value || "Pending").trim().toLowerCase();

  if (["pending", "under review", "submitted"].includes(status)) {
    return "Pending";
  }

  if (["approved", "complete", "completed"].includes(status)) {
    return "Approved";
  }

  if (
    ["needs changes", "changes requested", "rejected"].includes(status)
  ) {
    return "Needs Changes";
  }

  return status;
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
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
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [ceoComments, setCeoComments] = useState([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [expandedInterns, setExpandedInterns] = useState({});
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("All tracks");
  const [status, setStatus] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState("");
  const [deletingTask, setDeletingTask] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingReply, setSendingReply] = useState("");
  const [deletingComment, setDeletingComment] = useState("");
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
        throw new Error(payload.message || "Could not load messages.");
      }

      setCeoComments(
        Array.isArray(payload) ? payload : payload?.comments || []
      );
    } catch (e) {
      setError((previous) =>
        previous
          ? `${previous} | Messages: ${e.message}`
          : `Could not load messages: ${e.message}`
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
          payload?.message || "Admin authorization failed. Sign in again."
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
            return result.ok ? { ...task, file_url: result.url } : task;
          } catch {
            return task;
          }
        })
      );

      setTasks(enrichedTasks);

      // Fetch minimal deletion history from the secure RPC.
      const {
        data: deletedData,
        error: deletedError,
      } = await supabase.rpc("portal_admin_get_deleted_tasks", {
        p_email: s.email || "arslanfayyaz1997@gmail.com",
        p_pin: s.pin,
      });

      if (deletedError) throw deletedError;

      const deletedResult = getResult(deletedData);

      if (deletedResult?.ok === false) {
        throw new Error(
          deletedResult.message || "Could not load deleted task history."
        );
      }

      setDeletedTasks(
        Array.isArray(deletedResult)
          ? deletedResult
          : deletedResult?.deleted_tasks || []
      );
    } catch (e) {
      setError(e.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }

    await loadCeoComments();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tracks = useMemo(
    () => [
      "All tracks",
      ...new Set(rows.map((r) => r.track || r.program).filter(Boolean)),
    ],
    [rows]
  );

  const filteredInterns = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((r) => {
      const searchable = [
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
        searchable.includes(q) &&
        (track === "All tracks" || (r.track || r.program) === track)
      );
    });
  }, [rows, query, track]);

  const taskGroups = useMemo(() => {
    const groups = new Map();

    tasks.forEach((task, index) => {
      const identity = String(
        task.intern_id ||
          task.certificate_id ||
          task.student_email ||
          task.email ||
          `unknown-${index}`
      )
        .trim()
        .toLowerCase();

      if (!groups.has(identity)) {
        groups.set(identity, {
          key: identity,
          intern_id: task.intern_id || task.certificate_id || "",
          intern_name: task.intern_name || task.student_name || "Intern",
          email: task.student_email || task.email || "",
          tasks: [],
        });
      }

      const group = groups.get(identity);
      group.tasks.push(task);

      if (!group.email) {
        group.email = task.student_email || task.email || "";
      }
    });

    return [...groups.values()].map((group) => ({
      ...group,
      tasks: [...group.tasks].sort(
        (a, b) =>
          Number(a.task_number || 999) - Number(b.task_number || 999)
      ),
    }));
  }, [tasks]);

  const filteredTaskGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    return taskGroups
      .map((group) => ({
        ...group,
        tasks: group.tasks.filter((task) => {
          const taskStatus = normalStatus(task.status);
          const statusMatches =
            status === "All statuses" || taskStatus === status;

          const searchable = [
            group.intern_name,
            group.intern_id,
            group.email,
            task.task_title,
            task.description,
            task.submission_url,
            task.github_link,
            task.linkedin_link,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return statusMatches && searchable.includes(q);
        }),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [taskGroups, status, query]);

  const pendingCount = tasks.filter(
    (task) => normalStatus(task.status) === "Pending"
  ).length;

  const approvedCount = tasks.filter(
    (task) => normalStatus(task.status) === "Approved"
  ).length;

  const changesCount = tasks.filter(
    (task) => normalStatus(task.status) === "Needs Changes"
  ).length;

  async function review(taskId, decision) {
    setNotice("");
    setError("");

    const feedback = String(feedbackDrafts[taskId] || "").trim();

    if (decision === "Needs Changes" && !feedback) {
      setError("Please write feedback before requesting changes.");
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
          p_email: session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_task_id: taskId,
          p_decision: decision,
          p_feedback: feedback,
        }
      );

      if (rpcError) throw rpcError;

      const result = getResult(data);

      if (!result?.ok) {
        throw new Error(result?.message || "Could not update task.");
      }

      setNotice(`Task ${decision.toLowerCase()} successfully.`);
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

  // Permanently delete the approved task submission.
  // The SQL RPC stores only minimal deletion history.
  async function deleteTask(task) {
    const taskId = String(task.id || "");

    if (!taskId || !session?.pin) {
      setError("Task ID or CEO session is missing. Please refresh and try again.");
      return;
    }

    if (normalStatus(task.status) !== "Approved") {
      setError("Only approved tasks can be deleted from this dashboard.");
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete this approved task submission for ${
        task.intern_name || task.student_name || task.intern_id || "this intern"
      }? Only a minimal deletion record will remain in Deleted Tasks.`
    );

    if (!confirmed) return;

    setDeletingTask(taskId);
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_delete_task",
        {
          p_email: session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_task_id: taskId,
        }
      );

      if (rpcError) throw rpcError;

      const result = getResult(data);

      if (!result?.ok) {
        throw new Error(result?.message || "Could not delete task.");
      }

      setNotice("Task submission permanently deleted.");
      await load();
    } catch (e) {
      setError(
        `${e.message || "Could not delete task."} Check that the task deletion SQL has been installed in Supabase.`
      );
    } finally {
      setDeletingTask("");
    }
  }

  async function permanentlyDeleteTaskHistory(task) {
    const historyId = String(task.id || "");

    if (!historyId || !session?.pin) {
      setError("Deletion record ID or CEO session is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Permanently remove this deletion record from the database? It will no longer appear in Deleted Tasks."
    );

    if (!confirmed) return;

    setDeletingTask(`history-${historyId}`);
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_admin_purge_deleted_task",
        {
          p_email: session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_history_id: historyId,
        }
      );

      if (rpcError) throw rpcError;

      const result = getResult(data);

      if (!result?.ok) {
        throw new Error(
          result?.message || "Could not permanently delete this record."
        );
      }

      setDeletedTasks((previous) =>
        previous.filter((item) => String(item.id) !== historyId)
      );

      setNotice("Deletion record permanently removed from the database.");
    } catch (e) {
      setError(e.message || "Could not permanently delete the history record.");
    } finally {
      setDeletingTask("");
    }
  }

  async function sendReply(comment) {
    const commentId = String(comment.id || "");
    const message = String(replyDrafts[commentId] || "").trim();

    if (!commentId) {
      setError("This message has no ID, so a reply cannot be linked safely.");
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
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_admin_reply_ceo_feedback",
        {
          p_email: session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_intern_id: String(
            comment.intern_id || comment.certificate_id || ""
          ),
          p_student_email: String(
            comment.student_email || comment.email || ""
          ),
          p_message: message,
        }
      );

      if (rpcError) throw rpcError;

      const result = getResult(data);

      if (result?.ok === false) {
        throw new Error(result.message || "Could not save reply.");
      }

      setReplyDrafts((previous) => ({ ...previous, [commentId]: "" }));
      setReplyOpen((previous) => ({ ...previous, [commentId]: false }));
      setNotice("Reply saved to the portal conversation.");
      await loadCeoComments();
    } catch (e) {
      setError(
        `${e.message || "Could not save reply."} If the reply RPC is not installed yet, send me the SQL step next.`
      );
    } finally {
      setSendingReply("");
    }
  }

  // Existing message deletion system is unchanged.
  async function deleteComment(comment) {
    const commentId = String(comment.id || "");

    if (!commentId) {
      setError("This message has no ID and cannot be deleted safely.");
      return;
    }

    const confirmed = window.confirm(
      "Delete only this message? This action cannot be undone."
    );

    if (!confirmed) return;

    if (!session?.pin) {
      setError("Your CEO session expired. Please sign in again.");
      return;
    }

    setDeletingComment(commentId);
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_admin_delete_ceo_feedback",
        {
          p_email: session.email || "arslanfayyaz1997@gmail.com",
          p_pin: session.pin,
          p_message_id: commentId,
        }
      );

      if (rpcError) throw rpcError;

      const result = getResult(data);

      if (result?.ok === false) {
        throw new Error(result.message || "Could not delete message.");
      }

      setCeoComments((previous) =>
        previous.filter((item) => String(item.id) !== commentId)
      );

      setNotice("Message deleted.");
    } catch (e) {
      setError(
        `${e.message || "Could not delete message."} The secure delete RPC must be installed in Supabase first.`
      );
    } finally {
      setDeletingComment("");
    }
  }

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  const filteredDeletedTasks = deletedTasks.filter((task) => {
    const searchable = [
      task.intern_name,
      task.intern_id,
      task.student_email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(query.trim().toLowerCase());
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
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
            <Button variant="outline" onClick={load} disabled={loading}>
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

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Users />} label="Intern records" value={rows.length} />
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
          <Stat
            icon={<CheckCircle2 />}
            label="Approved tasks"
            value={approvedCount}
          />
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-xl font-bold">Intern directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Intern details stay in this directory; task submissions are hidden
            until you choose a review filter.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search intern name, ID or email"
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

          {loading ? (
            <p className="py-8 text-muted-foreground">Loading interns…</p>
          ) : filteredInterns.length === 0 ? (
            <p className="py-8 text-muted-foreground">No matching interns.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
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
                  {filteredInterns.map((r, index) => (
                    <tr
                      key={r.intern_id || r.certificate_id || r.email || index}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="p-3">
                        <strong>
                          {r.full_name || r.student_name || "Intern"}
                        </strong>
                        <div className="break-all text-xs text-muted-foreground">
                          {r.email || r.student_email || "Email unavailable"}
                        </div>
                      </td>
                      <td className="p-3">
                        {String(r.intern_id ?? r.certificate_id ?? "—")}
                      </td>
                      <td className="p-3">{r.track || r.program || "—"}</td>
                      <td className="p-3">{r.offer_letter_status || "—"}</td>
                      <td className="p-3">
                        {r.certificate_status || r.status || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-bold">Task submissions & review</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Task details are hidden on the dashboard until you select a
              review status.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Dashboard", "Dashboard"],
              ["Pending", `Pending (${pendingCount})`],
              ["Approved", `Approved (${approvedCount})`],
              ["Needs Changes", `Needs Changes (${changesCount})`],
              ["All statuses", "All submissions"],
            ].map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={status === value ? "default" : "outline"}
                onClick={() => setStatus(value)}
              >
                {label}
              </Button>
            ))}
          </div>

          {status === "Dashboard" ? (
            <div className="mt-5 rounded-xl bg-secondary/40 p-5 text-sm text-muted-foreground">
              Choose Pending, Approved, Needs Changes, or All submissions to
              open matching task details. No intern task details are shown here
              by default.
            </div>
          ) : loading ? (
            <p className="py-8 text-muted-foreground">Loading submissions…</p>
          ) : filteredTaskGroups.length === 0 ? (
            <p className="py-8 text-muted-foreground">
              No submissions match this filter.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {filteredTaskGroups.map((group) => {
                const expanded = Boolean(expandedInterns[group.key]);

                return (
                  <article
                    key={group.key}
                    className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <button
                      type="button"
                      className="flex w-full min-w-0 items-center justify-between gap-3 bg-secondary/40 p-4 text-left"
                      onClick={() =>
                        setExpandedInterns((previous) => ({
                          ...previous,
                          [group.key]: !previous[group.key],
                        }))
                      }
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-bold">
                          {group.intern_name}
                        </span>
                        <span className="mt-1 block break-all text-xs text-muted-foreground">
                          {String(group.intern_id || "No ID")} ·{" "}
                          {group.email || "No email"}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {group.tasks.length} matching task
                          {group.tasks.length === 1 ? "" : "s"}
                        </span>
                      </span>
                      {expanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {expanded && (
                      <div className="divide-y divide-border">
                        {group.tasks.map((t, index) => (
                          <div
                            key={t.id || `${group.key}-${t.task_number}-${index}`}
                            className="min-w-0 p-4 sm:p-5"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                                  Task {t.task_number || index + 1}
                                </p>
                                <h3 className="mt-1 break-words font-bold">
                                  {t.task_title ||
                                    `Task ${t.task_number || index + 1}`}
                                </h3>
                              </div>
                              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                                {normalStatus(t.status)}
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
                                value={t.submission_url || t.task_link}
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
                            </div>

                            <div className="mt-3 text-xs text-muted-foreground">
                              Submitted:{" "}
                              {displayDate(t.submitted_at || t.created_at)}
                              {t.reviewed_at
                                ? ` · Reviewed: ${displayDate(t.reviewed_at)}`
                                : ""}
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

                            {normalStatus(t.status) !== "Approved" && (
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
                                  placeholder="Write feedback or corrections..."
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

                            {normalStatus(t.status) === "Approved" && (
                              <div className="mt-4 border-t border-border pt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={deletingTask === String(t.id)}
                                  onClick={() => deleteTask(t)}
                                >
                                  <Trash2 size={15} className="mr-2" />
                                  {deletingTask === String(t.id)
                                    ? "Deleting…"
                                    : "Delete task"}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Minimal history only: no task title, number, or task content. */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Trash2 size={20} />
            <h2 className="text-xl font-bold">Deleted Tasks</h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Only intern identity and the status before deletion are retained.
          </p>

          {loading ? (
            <p className="py-6 text-sm text-muted-foreground">
              Loading deletion history…
            </p>
          ) : filteredDeletedTasks.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No deleted task records found.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {filteredDeletedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold">
                      {task.intern_name || "Name unavailable"}
                    </p>
                    <p className="mt-1 break-all text-sm text-muted-foreground">
                      {task.student_email || "Email unavailable"}
                    </p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      Intern ID: {task.intern_id || "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status before delete:{" "}
                      {task.status_before_delete || "—"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <p className="text-xs text-muted-foreground">
                      Deleted: {displayDate(task.deleted_at)}
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        deletingTask === `history-${String(task.id)}`
                      }
                      onClick={() => permanentlyDeleteTaskHistory(task)}
                    >
                      <Trash2 size={15} className="mr-2" />
                      {deletingTask === `history-${String(task.id)}`
                        ? "Deleting…"
                        : "Delete permanently"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Existing intern messages and CEO replies section kept intact. */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <MessageSquare size={20} />
                Intern messages & Replies by CEO
              </h2>
              <p className="text-sm text-muted-foreground">
                Intern comments and CEO replies in the portal conversation.
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
              Refresh messages
            </Button>
          </div>

          {loadingComments ? (
            <p className="py-6 text-sm text-muted-foreground">
              Loading messages…
            </p>
          ) : ceoComments.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No messages available yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {ceoComments.map((comment) => {
                const commentId = String(comment.id || "");
                const recipient =
                  comment.student_email || comment.email || "";
                const isCeo =
                  String(comment.sender_role || "").toLowerCase() === "ceo";

                return (
                  <article
                    key={
                      commentId ||
                      `${comment.intern_id}-${comment.created_at}`
                    }
                    className="min-w-0 rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-words font-semibold">
                          {isCeo
                            ? "CEO | Arslan Fayyaz | Internlytic Technologies"
                            : comment.intern_name ||
                              comment.student_name ||
                              "Intern"}
                        </p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          ID:{" "}
                          {String(
                            comment.intern_id ||
                              comment.certificate_id ||
                              "—"
                          )}
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!isCeo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReplyOpen((previous) => ({
                              ...previous,
                              [commentId]: !previous[commentId],
                            }))
                          }
                        >
                          <MessageSquare size={15} className="mr-2" />
                          {replyOpen[commentId] ? "Close reply" : "Reply"}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingComment === commentId}
                        onClick={() => deleteComment(comment)}
                      >
                        <Trash2 size={15} className="mr-2" />
                        {deletingComment === commentId
                          ? "Deleting…"
                          : "Delete message"}
                      </Button>
                    </div>

                    {replyOpen[commentId] && (
                      <div className="mt-4 rounded-xl bg-secondary/40 p-3 sm:p-4">
                        <Textarea
                          value={replyDrafts[commentId] || ""}
                          onChange={(e) =>
                            setReplyDrafts((previous) => ({
                              ...previous,
                              [commentId]: e.target.value,
                            }))
                          }
                          placeholder="Write your reply to this intern..."
                          rows={3}
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            disabled={sendingReply === commentId}
                            onClick={() => sendReply(comment)}
                          >
                            <Send size={15} className="mr-2" />
                            {sendingReply === commentId
                              ? "Sending…"
                              : "Send portal reply"}
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
          Existing intern and certificate records are preserved. Task deletion
          and deletion-history removal require the secure Supabase RPC functions.
        </p>
      </main>

      <Footer />
    </div>
  );
}
