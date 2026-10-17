import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ShieldCheck, Users, ClipboardCheck, RefreshCw, LogOut,
  CheckCircle2, XCircle, ExternalLink, FileText, MessageCircle, Send,
  ChevronDown, ChevronUp, Trash2
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
    `${task.week_number || ""} ${task.week || ""} ` +
    `${task.task_title || ""} ${task.description || ""}`.toLowerCase();

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
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openThreads, setOpenThreads] = useState({});
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("All tracks");
  const [status, setStatus] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState("");
  const [savingTask, setSavingTask] = useState("");
  const [deletingTask, setDeletingTask] = useState("");
  const [taskFeedback, setTaskFeedback] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

      setTasks(enriched);
      setDeletedTasks(payload.deleted_tasks || []);

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
  }, []);

  const tracks = useMemo(
    () => [
      "All tracks",
      ...new Set(rows.map((r) => r.track).filter(Boolean)),
    ],
    [rows]
  );

  const filteredRows = rows.filter(
    (r) =>
      (
        `${r.full_name || r.student_name || ""} ` +
        `${r.intern_id || r.certificate_id || ""} ` +
        `${r.email || r.student_email || ""}`
      )
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (track === "All tracks" || r.track === track)
  );

  const activeTasks = tasks.filter(
    (t) => !t.is_archived && !t.archived_at
  );

  const visibleTasks = activeTasks.filter(
    (t) =>
      (
        status === "All statuses" ||
        statusLabel(t.status).toLowerCase() === status.toLowerCase()
      ) &&
      (
        `${t.intern_name || ""} ${t.intern_id || ""} ` +
        `${t.task_title || ""} ${t.description || ""}`
      )
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

    rows.forEach((r
