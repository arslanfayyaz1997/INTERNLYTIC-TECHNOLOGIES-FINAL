import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
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

function displayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function InternPortalPage() {
  const navigate = useNavigate();
  const [session] = useState(readSession);
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadPortal() {
    setLoading(true);
    setError("");

    try {
      const s = readSession();

      if (!s || s.role !== "intern" || !s.intern_id || !s.email) {
        navigate("/login", { replace: true });
        return;
      }

      const { data, error: submissionError } = await supabase.rpc(
        "portal_get_my_task_submissions",
        {
          p_intern_id: s.intern_id,
          p_email: s.email,
        }
      );

      if (submissionError) throw submissionError;

      setSubmissions(Array.isArray(data) ? data : data?.submissions || []);

      await loadMyComments(s);
    } catch (e) {
      setError(e.message || "Unable to load your portal.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMyComments(currentSession = readSession()) {
    if (!currentSession?.intern_id || !currentSession?.email) return;

    const { data, error: rpcError } = await supabase.rpc(
      "portal_get_my_ceo_feedback",
      {
        p_intern_id: currentSession.intern_id,
        p_email: currentSession.email,
      }
    );

    if (rpcError) {
      throw rpcError;
    }

    setComments(Array.isArray(data) ? data : data?.comments || []);
  }

  useEffect(() => {
    if (!session || session.role !== "intern") {
      navigate("/login", { replace: true });
      return;
    }
    loadPortal();
  }, []);

  async function sendComment() {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError("Please write a message before sending.");
      return;
    }

    if (cleanMessage.length > 3000) {
      setError("Please keep your message under 3000 characters.");
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_submit_ceo_feedback",
        {
          p_intern_id: session.intern_id,
          p_email: session.email,
          p_message: cleanMessage,
        }
      );

      if (rpcError) throw rpcError;

      const result = Array.isArray(data) ? data[0] : data;

      if (result?.ok === false) {
        throw new Error(result.message || "Your message could not be sent.");
      }

      setMessage("");
      setNotice("Your message has been sent to the CEO.");
      await loadMyComments(session);
    } catch (e) {
      setError(e.message || "Unable to send your message.");
    } finally {
      setSending(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  const internName = session?.full_name || session?.student_name || "Intern";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              Intern workspace
            </p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Welcome, {internName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Intern ID: {session?.intern_id || "—"} · {session?.email || ""}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadPortal} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut size={16} /> Log out
            </Button>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="mt-5 rounded-xl border border-primary/30 bg-secondary p-4 text-sm">
            {notice}
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-xl font-bold">My task submissions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check the review status and feedback on your submitted tasks.
          </p>

          {loading ? (
            <p className="py-8 text-muted-foreground">Loading submissions…</p>
          ) : submissions.length === 0 ? (
            <p className="py-8 text-muted-foreground">
              No task submissions are available yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {submissions.map((task, index) => (
                <article
                  key={task.id || `${task.task_number}-${index}`}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold">
                        {task.task_title || `Task ${task.task_number || index + 1}`}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Submitted: {displayDate(task.submitted_at)}
                      </p>
                      {task.reviewed_at && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays size={13} />
                          Reviewed: {displayDate(task.reviewed_at)}
                        </p>
                      )}
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-border px-3 py-1 text-xs font-semibold">
                      {task.status || "Pending"}
                    </span>
                  </div>

                  {task.admin_feedback && (
                    <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
                      <p className="font-semibold">Admin feedback</p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {task.admin_feedback}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <MessageSquare size={20} /> Send a comment to the CEO
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask a question, share feedback, or discuss an issue related to your internship.
          </p>

          <div className="mt-4 space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={5}
              maxRows={8}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {message.length}/3000 characters
              </p>
              <Button onClick={sendComment} disabled={sending || !message.trim()}>
                <Send size={16} />
                {sending ? "Sending…" : "Send to CEO"}
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="font-bold">My sent comments</h3>

            {comments.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                You have not sent any comments yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {comments.map((comment, index) => (
                  <article
                    key={comment.id || `${comment.created_at}-${index}`}
                    className="rounded-xl border border-border p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm">
                      {comment.message || comment.comment || ""}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sent: {displayDate(comment.created_at)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
