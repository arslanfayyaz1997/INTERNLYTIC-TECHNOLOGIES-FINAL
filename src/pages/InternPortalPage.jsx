import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Link2,
  FileText,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Award,
  ExternalLink,
  Github,
  Linkedin,
  X,
  AlertCircle,
  FolderOpen,
  CalendarDays,
  ShieldCheck,
  MessageCircle,
  Send,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabaseClient";

const BUCKET = "intern-task-files";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".zip",
  ".png",
  ".jpg",
  ".jpeg",
  ".txt",
  ".fig",
];

const TASK_TITLES = [
  "Week 1 — Task 1: Offer Letter LinkedIn Post",
  "Week 2 — Task 2: Weekly Task Submission",
  "Week 3 — Task 3: Project Links and Description",
  "Week 4 — Task 4: Final Project Submission",
];

function readSession() {
  try {
    return JSON.parse(
      sessionStorage.getItem("internlytic.portal.session") || "null"
    );
  } catch {
    return null;
  }
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || fallback;
}

function firstAvailable(object, keys) {
  for (const key of keys) {
    const value = object?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

// Formats YYYY-MM-DD without timezone conversion.
function formatDate(value) {
  if (!value) return "Pending";

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function safeHref(value) {
  const input = String(value || "").trim();

  if (!input) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(input) ? input : `https://${input}`
    );

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function statusStyle(status) {
  switch (String(status || "").trim().toLowerCase()) {
    case "approved":
    case "valid":
    case "issued":
    case "completed":
      return "bg-green-100 text-green-800";

    case "rejected":
    case "invalid":
    case "needs changes":
      return "bg-red-100 text-red-800";

    case "under review":
    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-800";

    default:
      return "bg-secondary text-muted-foreground";
  }
}

function StatusBadge({ status }) {
  const value = status || "Under Review";

  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(
        value
      )}`}
    >
      {value}
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 break-words text-xl font-extrabold text-foreground">
        {value}
      </p>
    </div>
  );
}

function DocumentStatusCard({
  title,
  icon: Icon,
  status,
  date,
  identifier,
  downloadUrl,
}) {
  const href = safeHref(downloadUrl);

  return (
    <article className="min-w-0 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-secondary p-3 text-primary">
          <Icon size={23} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{title}</h3>

          <div className="mt-3">
            <StatusBadge status={status || "Pending"} />
          </div>

          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <CalendarDays size={15} className="mt-0.5 shrink-0" />
            <span>Issue date: {formatDate(date)}</span>
          </p>

          {identifier && (
            <p className="mt-2 break-all text-sm text-muted-foreground">
              ID: {identifier}
            </p>
          )}

          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              View / Download
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function SubmittedLink({ label, value }) {
  if (!value) return null;

  const href = safeHref(value);

  return (
    <div className="min-w-0 rounded-xl border border-border p-3">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">
        {label}
      </p>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
        >
          <span className="break-all">{value}</span>
          <ExternalLink size={14} className="shrink-0" />
        </a>
      ) : (
        <p className="break-all text-sm">{value}</p>
      )}
    </div>
  );
}

function uniqueBy(items, keyFunction) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keyFunction(item);

    if (key == null || key === "" || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseProjectDescription(description = "") {
  const nameMatch = description.match(/^Project name:\s*(.+)$/m);

  const detailsMatch = description.match(
    /^Project description:\s*([\s\S]*?)(?=\n\nFigma link:|\n\nGitHub repository:|$)/m
  );

  return {
    name: nameMatch?.[1]?.trim() || "",
    description: detailsMatch?.[1]?.trim() || description,
  };
}

function getRpcResult(data) {
  return Array.isArray(data) ? data[0] : data;
}

export default function InternPortalPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(() => readSession());
  const [profile, setProfile] = useState(null);
  const [publishedTasks, setPublishedTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [offerLink, setOfferLink] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [figmaLink, setFigmaLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [files, setFiles] = useState([]);

  const [editingSubmission, setEditingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [ceoMessage, setCeoMessage] = useState("");
  const [ceoComments, setCeoComments] = useState([]);
  const [sendingCeoMessage, setSendingCeoMessage] = useState(false);
  const [loadingCeoMessages, setLoadingCeoMessages] = useState(false);

  function resetForm() {
    setOfferLink("");
    setProjectName("");
    setProjectDescription("");
    setFigmaLink("");
    setGithubLink("");
    setFiles([]);
    setEditingSubmission(null);
  }

  useEffect(() => {
    const currentSession = readSession();

    if (
      !currentSession ||
      currentSession.role !== "intern" ||
      !currentSession.intern_id ||
      !currentSession.email
    ) {
      navigate("/login", { replace: true });
      return;
    }

    setSession(currentSession);
    resetForm();
    load(currentSession);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCeoComments(currentSession = session) {
    if (!currentSession?.intern_id || !currentSession?.email) return;

    setLoadingCeoMessages(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_get_my_ceo_feedback",
        {
          p_intern_id: currentSession.intern_id,
          p_email: currentSession.email,
        }
      );

      if (rpcError) throw rpcError;

      const result = getRpcResult(data);

      if (!result?.ok) {
        throw new Error(
          result?.message || "Unable to load your messages."
        );
      }

      setCeoComments(
        Array.isArray(result.comments) ? result.comments : []
      );
    } catch (e) {
      console.error("Unable to load portal messages:", e);
      setError(
        getErrorMessage(e, "Unable to load your messages.")
      );
    } finally {
      setLoadingCeoMessages(false);
    }
  }

  async function load(currentSession = session, isRefresh = false) {
    if (!currentSession?.intern_id || !currentSession?.email) {
      navigate("/login", { replace: true });
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    resetForm();

    try {
      const { data: loginData, error: loginError } =
        await supabase.rpc("portal_intern_login", {
          p_intern_id: currentSession.intern_id,
          p_email: currentSession.email,
        });

      if (loginError) throw loginError;

      const loginResult = getRpcResult(loginData);

      if (!loginResult?.ok || !loginResult.intern) {
        throw new Error(
          loginResult?.message ||
            "Unable to load your internship profile."
        );
      }

      setProfile(loginResult.intern);

      setPublishedTasks(
        Array.isArray(loginResult.tasks) ? loginResult.tasks : []
      );

      const {
        data: submissionData,
        error: submissionError,
      } = await supabase.rpc("portal_get_my_task_submissions", {
        p_intern_id: currentSession.intern_id,
        p_email: currentSession.email,
      });

      if (submissionError) throw submissionError;

      const submissionResult = getRpcResult(submissionData);

      if (submissionResult && !submissionResult.ok) {
        throw new Error(
          submissionResult.message ||
            "Unable to retrieve your submissions."
        );
      }

      setSubmissions(
        Array.isArray(submissionResult?.submissions)
          ? submissionResult.submissions
          : []
      );

      await loadCeoComments(currentSession);
    } catch (e) {
      setError(
        getErrorMessage(
          e,
          "Unable to load your internship dashboard."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function selectFiles(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selected.length) return;

    const accepted = [];
    const rejected = [];

    for (const file of selected) {
      const extension = `.${file.name.split(".").pop().toLowerCase()}`;

      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        rejected.push(`${file.name}: Unsupported file format.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejected.push(
          `${file.name}: Maximum file size is 10 MB.`
        );
        continue;
      }

      const duplicate = [...files, ...accepted].some(
        (item) =>
          item.name === file.name && item.size === file.size
      );

      if (!duplicate) accepted.push(file);
    }

    setError(rejected.join(" "));
    setFiles((previous) => [...previous, ...accepted]);
  }

  function removeFile(indexToRemove) {
    setFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  }

  function editSubmission(item) {
    setError("");
    setNotice("");
    setEditingSubmission(item);

    const taskNumber = Number(item.task_number);

    if (taskNumber === 1) {
      setOfferLink(item.task_link || item.linkedin_link || "");
      setProjectName("");
      setProjectDescription("");
      setFigmaLink("");
      setGithubLink("");
      setFiles([]);
    } else {
      const parsed = parseProjectDescription(item.description || "");

      setOfferLink("");
      setProjectName(parsed.name);
      setProjectDescription(parsed.description);
      setFigmaLink(item.task_link || "");
      setGithubLink(item.github_link || "");

      const savedFiles = Array.isArray(item.files)
        ? item.files
        : [];

      setFiles(
        savedFiles.map((file) => ({
          ...file,
          saved: true,
        }))
      );
    }

    document.getElementById("intern-task-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function uploadFiles() {
    const uploaded = [];

    for (const file of files) {
      if (file.saved && file.path) {
        uploaded.push({
          name: file.name,
          path: file.path,
          size: file.size || 0,
          type: file.type || "",
        });

        continue;
      }

      if (!(file instanceof File)) continue;

      const safeName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      const folder = encodeURIComponent(session.intern_id);

      const path = `${folder}/final-project/${uniqueId}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType:
            file.type || "application/octet-stream",
        });

      if (uploadError) throw uploadError;

      uploaded.push({
        name: file.name,
        path,
        size: file.size,
        type: file.type || "",
      });
    }

    return uploaded;
  }

  function validateForm() {
    if (editingSubmission) {
      const taskNumber = Number(editingSubmission.task_number);

      if (taskNumber === 1) {
        if (!offerLink.trim()) {
          return "Please enter your LinkedIn offer letter post link.";
        }

        return "";
      }

      if (!projectName.trim()) {
        return "Please enter your project name.";
      }

      if (!projectDescription.trim()) {
        return "Please describe your project.";
      }

      if (!figmaLink.trim()) {
        return "Please enter your Figma link.";
      }

      if ([3, 4].includes(taskNumber) && !githubLink.trim()) {
        return "Please enter your GitHub repository link.";
      }

      if (taskNumber === 4 && !files.length) {
        return "Please keep or upload at least one final project file.";
      }

      return "";
    }

    if (!offerLink.trim()) {
      return "Please enter your LinkedIn offer letter post link.";
    }

    if (!projectName.trim()) {
      return "Please enter your project name.";
    }

    if (!projectDescription.trim()) {
      return "Please describe your project.";
    }

    if (!figmaLink.trim()) {
      return "Please enter your Figma link.";
    }

    if (!githubLink.trim()) {
      return "Please enter your GitHub repository link.";
    }

    if (!files.length) {
      return "Please upload at least one project file.";
    }

    return "";
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!session?.intern_id || !session?.email) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setSubmitting(true);

    try {
      const uploadedFiles = await uploadFiles();

      const projectDetails =
        `Project name: ${projectName.trim()}\n\n` +
        `Project description: ${projectDescription.trim()}`;

      if (editingSubmission) {
        const taskNumber = Number(editingSubmission.task_number);
        const isOfferTask = taskNumber === 1;

        const { data, error: updateError } = await supabase.rpc(
          "portal_update_my_task_submission",
          {
            p_intern_id: session.intern_id,
            p_email: session.email,
            p_task_id: editingSubmission.id,
            p_task_title:
              editingSubmission.task_title ||
              TASK_TITLES[taskNumber - 1],
            p_description: isOfferTask
              ? "Link to the LinkedIn post where the intern shared their offer letter."
              : projectDetails,
            p_task_link: isOfferTask
              ? offerLink.trim()
              : figmaLink.trim(),
            p_github_link: [3, 4].includes(taskNumber)
              ? githubLink.trim()
              : "",
            p_linkedin_link: isOfferTask
              ? offerLink.trim()
              : "",
            p_files: [2, 4].includes(taskNumber)
              ? uploadedFiles
              : [],
          }
        );

        if (updateError) throw updateError;

        const result = getRpcResult(data);

        if (!result?.ok) {
          throw new Error(
            result?.message ||
              "Unable to update your submission."
          );
        }

        resetForm();

        setNotice(
          "Submission updated successfully and returned to Under Review."
        );
      } else {
        const submissionsToSave = [
          {
            task_number: 1,
            task_title: TASK_TITLES[0],
            description:
              "Link to the LinkedIn post where the intern shared their offer letter.",
            task_link: offerLink.trim(),
            github_link: "",
            linkedin_link: offerLink.trim(),
            files: [],
          },
          {
            task_number: 2,
            task_title: TASK_TITLES[1],
            description: projectDetails,
            task_link: figmaLink.trim(),
            github_link: "",
            linkedin_link: "",
            files: uploadedFiles,
          },
          {
            task_number: 3,
            task_title: TASK_TITLES[2],
            description: projectDetails,
            task_link: figmaLink.trim(),
            github_link: githubLink.trim(),
            linkedin_link: "",
            files: [],
          },
          {
            task_number: 4,
            task_title: TASK_TITLES[3],
            description: projectDetails,
            task_link: figmaLink.trim(),
            github_link: githubLink.trim(),
            linkedin_link: "",
            files: uploadedFiles,
          },
        ];

        const { data, error: submitError } = await supabase.rpc(
          "portal_submit_intern_tasks",
          {
            p_intern_id: session.intern_id,
            p_email: session.email,
            p_submissions: submissionsToSave,
          }
        );

        if (submitError) throw submitError;

        const result = getRpcResult(data);

        if (!result?.ok) {
          throw new Error(
            result?.message ||
              "Unable to save your task submissions."
          );
        }

        resetForm();

        setNotice(
          "Your new task submissions have been saved. They are awaiting review."
        );
      }

      await load(session, true);
    } catch (e) {
      setError(
        getErrorMessage(
          e,
          "Submission failed. Please check your connection and try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteSubmission(item) {
    if (!item?.id) {
      setError(
        "This submission has no record ID and cannot be deleted."
      );
      return;
    }

    const taskName =
      TASK_TITLES[Number(item.task_number) - 1] ||
      "this submission";

    if (
      !window.confirm(
        `Delete ${taskName} from your submission history? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingTaskId(item.id);
    setError("");
    setNotice("");

    try {
      const { data, error: deleteError } = await supabase.rpc(
        "portal_delete_my_task_submission",
        {
          p_intern_id: session.intern_id,
          p_email: session.email,
          p_task_id: item.id,
        }
      );

      if (deleteError) throw deleteError;

      const result = getRpcResult(data);

      if (!result?.ok) {
        throw new Error(
          result?.message || "Unable to delete this submission."
        );
      }

      if (editingSubmission?.id === item.id) {
        resetForm();
      }

      setNotice("Your submission has been deleted.");

      await load(session, true);
    } catch (e) {
      setError(
        getErrorMessage(e, "Unable to delete this submission.")
      );
    } finally {
      setDeletingTaskId(null);
    }
  }

  async function sendCeoMessage(event) {
    event.preventDefault();

    const message = ceoMessage.trim();

    if (!message) {
      setError("Please write a message before sending it to the CEO.");
      return;
    }

    if (message.length > 3000) {
      setError("Your message must be 3000 characters or fewer.");
      return;
    }

    setSendingCeoMessage(true);
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_submit_ceo_feedback",
        {
          p_intern_id: session.intern_id,
          p_email: session.email,
          p_message: message,
        }
      );

      if (rpcError) throw rpcError;

      const result = getRpcResult(data);

      if (!result?.ok) {
        throw new Error(
          result?.message || "Unable to send your message."
        );
      }

      setCeoMessage("");
      setNotice("Your message has been sent to the CEO.");

      await loadCeoComments(session);
    } catch (e) {
      setError(
        getErrorMessage(e, "Unable to send your message.")
      );
    } finally {
      setSendingCeoMessage(false);
    }
  }

  async function deleteOwnMessage(comment) {
    if (
      !comment?.id ||
      String(comment.sender_role || "").toLowerCase() === "ceo"
    ) {
      setError("You can delete your own messages only.");
      return;
    }

    if (
      !window.confirm(
        "Delete your message from this conversation?"
      )
    ) {
      return;
    }

    setDeletingMessageId(comment.id);
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "portal_delete_my_ceo_feedback",
        {
          p_intern_id: session.intern_id,
          p_email: session.email,
          p_message_id: comment.id,
        }
      );

      if (rpcError) throw rpcError;

      const result = getRpcResult(data);

      if (!result?.ok) {
        throw new Error(
          result?.message || "Unable to delete this message."
        );
      }

      setNotice("Your message has been deleted.");

      await loadCeoComments(session);
    } catch (e) {
      setError(
        getErrorMessage(e, "Unable to delete this message.")
      );
    } finally {
      setDeletingMessageId(null);
    }
  }

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  // Find the newest submission for each week.
  const latestByTask = [1, 2, 3, 4].map((taskNumber) =>
    submissions
      .filter(
        (item) => Number(item.task_number) === taskNumber
      )
      .sort(
        (a, b) =>
          new Date(b.submitted_at || 0) -
          new Date(a.submitted_at || 0)
      )[0]
  );

  const approved = latestByTask.filter(
    (item) =>
      String(item?.status || "").toLowerCase() === "approved"
  ).length;

  const progress =
    profile?.progress_percent != null
      ? Math.max(
          0,
          Math.min(100, Number(profile.progress_percent) || 0)
        )
      : Math.round((approved / 4) * 100);

  const offerStatus = firstAvailable(profile, [
    "offer_letter_status",
    "offer_status",
    "offer_letter_state",
  ]);

  // Use the exact Offer Letter issue-date field.
  const offerDate = profile?.offer_letter_issue_date ?? null;

  const offerDownload = firstAvailable(profile, [
    "offer_letter_url",
    "offer_letter_file_url",
    "offer_letter_path",
    "offer_download_url",
  ]);

  const certificateStatus = firstAvailable(profile, [
    "certificate_status",
    "certificate_state",
  ]);

  // Use the exact Certificate issue-date field.
  const certificateDate = profile?.certificate_issue_date ?? null;

  const certificateId = firstAvailable(profile, [
    "certificate_id",
    "certificate_number",
  ]);

  const certificateDownload = firstAvailable(profile, [
    "certificate_url",
    "certificate_file_url",
    "certificate_download_url",
  ]);

  const sortedSubmissions = [...submissions].sort(
    (a, b) =>
      new Date(b.submitted_at || 0) -
      new Date(a.submitted_at || 0)
  );

  const submittedFiles = uniqueBy(
    submissions.flatMap((item) =>
      Array.isArray(item.files) ? item.files : []
    ),
    (file) => file.path || `${file.name}-${file.size}`
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary via-card to-background p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">
                Internlytic Technologies
              </p>

              <h1 className="mt-3 break-words text-3xl font-extrabold text-brand-ink sm:text-4xl">
                Welcome to Internlytic,{" "}
                {profile?.full_name ||
                  profile?.student_name ||
                  session?.full_name ||
                  "Intern"}
                !
              </h1>

              <p className="mt-3 max-w-2xl text-muted-foreground">
                View your internship details, submit your work, and
                track your review and certificate status from one
                dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => load(session, true)}
                disabled={refreshing || loading}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "mr-2 animate-spin" : "mr-2"}
                />
                Refresh
              </Button>

              <Button variant="outline" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-5 flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-900"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <RefreshCw
              size={28}
              className="mx-auto mb-3 animate-spin"
            />
            Loading your internship dashboard...
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Intern ID"
                value={profile?.intern_id || session?.intern_id || "—"}
              />

              <Metric
                label="Internship Track"
                value={profile?.track || profile?.program || "—"}
              />

              <Metric label="Approved Tasks" value={`${approved}/4`} />

              <Metric
                label="Completion Progress"
                value={`${progress}%`}
              />
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-secondary p-3 text-primary">
                  <Award size={24} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold">
                    Internship Overview
                  </h2>

                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    Registered email:{" "}
                    {profile?.email ||
                      profile?.student_email ||
                      session?.email}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Your dashboard displays information for your own
                    account. Refresh to load the latest saved status.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  My Offer Letter and Certificate
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Check your document status and issue dates.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DocumentStatusCard
                  title="Offer Letter"
                  icon={FileText}
                  status={offerStatus || "Pending"}
                  date={offerDate}
                  downloadUrl={offerDownload}
                />

                <DocumentStatusCard
                  title="Internship Certificate"
                  icon={ShieldCheck}
                  status={certificateStatus || "Pending"}
                  date={certificateDate}
                  identifier={certificateId}
                  downloadUrl={certificateDownload}
                />
              </div>

              {!offerStatus &&
                !offerDate &&
                !certificateStatus &&
                !certificateDate &&
                !certificateId && (
                  <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Document details will appear when the profile
                    provides the relevant database fields.
                  </p>
                )}
            </section>

            <form
              id="intern-task-form"
              onSubmit={submit}
              noValidate
              className="mt-8 space-y-6"
            >
              {editingSubmission && (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">
                      Editing previous submission
                    </p>

                    <p className="mt-1 text-sm">
                      {TASK_TITLES[
                        Number(editingSubmission.task_number) - 1
                      ]}{" "}
                      — saving will return this record to Under Review.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    <RotateCcw size={15} className="mr-2" />
                    Cancel Edit
                  </Button>
                </div>
              )}

              {(!editingSubmission ||
                Number(editingSubmission.task_number) === 1) && (
                <section className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="border-b border-border p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-bold text-primary">
                        01
                      </div>

                      <div>
                        <h2 className="text-lg font-bold">
                          Week 1 — Offer Letter LinkedIn Post
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Paste the link to the post where you shared
                          your offer letter.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 p-5 sm:p-6">
                    <Label htmlFor="offer-link">
                      <Linkedin size={15} className="mr-2 inline" />
                      LinkedIn Post Link
                    </Label>

                    <Input
                      id="offer-link"
                      value={offerLink}
                      onChange={(e) => setOfferLink(e.target.value)}
                      placeholder="Paste your LinkedIn post link"
                      required
                    />
                  </div>
                </section>
              )}

              {(!editingSubmission ||
                Number(editingSubmission.task_number) !== 1) && (
                <section className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="border-b border-border p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-bold text-primary">
                        02
                      </div>

                      <div>
                        <h2 className="text-lg font-bold">
                          Project Details and Files
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Enter your project information and relevant
                          links. Existing uploaded files are kept when
                          editing unless removed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 sm:p-6">
                    <div className="grid gap-2">
                      <Label htmlFor="project-name">
                        Project Name
                      </Label>

                      <Input
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter your project name"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="project-description">
                        Project Description
                      </Label>

                      <Textarea
                        id="project-description"
                        value={projectDescription}
                        onChange={(e) =>
                          setProjectDescription(e.target.value)
                        }
                        placeholder="Describe your project, technologies, and main features."
                        rows={5}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="figma-link">
                        <Link2 size={15} className="mr-2 inline" />
                        Figma Link
                      </Label>

                      <Input
                        id="figma-link"
                        value={figmaLink}
                        onChange={(e) => setFigmaLink(e.target.value)}
                        placeholder="Paste your Figma link"
                        required
                      />
                    </div>

                    {(!editingSubmission ||
                      [3, 4].includes(
                        Number(editingSubmission.task_number)
                      )) && (
                      <div className="grid gap-2">
                        <Label htmlFor="github-link">
                          <Github size={15} className="mr-2 inline" />
                          GitHub Repository Link
                        </Label>

                        <Input
                          id="github-link"
                          value={githubLink}
                          onChange={(e) =>
                            setGithubLink(e.target.value)
                          }
                          placeholder="Paste your GitHub repository link"
                          required
                        />
                      </div>
                    )}

                    {(!editingSubmission ||
                      [2, 4].includes(
                        Number(editingSubmission.task_number)
                      )) && (
                      <div className="grid gap-3">
                        <Label htmlFor="project-files">
                          <FolderOpen
                            size={15}
                            className="mr-2 inline"
                          />
                          Upload Project Files
                        </Label>

                        <label
                          htmlFor="project-files"
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-8 text-center transition hover:border-primary hover:bg-secondary/60"
                        >
                          <UploadCloud
                            size={32}
                            className="mb-3 text-primary"
                          />

                          <span className="font-semibold">
                            Choose Project Files
                          </span>

                          <span className="mt-2 text-xs leading-5 text-muted-foreground">
                            PDF, Word, PowerPoint, ZIP, PNG, JPG, TXT
                            and Figma files
                          </span>

                          <span className="mt-2 text-xs font-medium text-primary">
                            Multiple files · Maximum 10 MB per file
                          </span>
                        </label>

                        <Input
                          id="project-files"
                          type="file"
                          multiple
                          accept={ACCEPTED_EXTENSIONS.join(",")}
                          className="sr-only"
                          onChange={selectFiles}
                        />

                        {files.length > 0 && (
                          <div className="grid gap-2">
                            {files.map((file, index) => (
                              <div
                                key={`${file.path || file.name}-${index}`}
                                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border p-3"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <FileText
                                    size={20}
                                    className="shrink-0 text-primary"
                                  />

                                  <div className="min-w-0">
                                    <p className="break-all text-sm font-medium">
                                      {file.name}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      {file.saved
                                        ? "Previously uploaded"
                                        : `${(
                                            file.size /
                                            1024 /
                                            1024
                                          ).toFixed(2)} MB`}
                                    </p>
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Remove ${file.name}`}
                                  onClick={() => removeFile(index)}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="break-words">{error}</p>
                </div>
              )}

              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="font-bold">
                    {editingSubmission
                      ? "Update this submission?"
                      : "Ready to submit your tasks?"}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {editingSubmission
                      ? "Only the selected historical record will be updated."
                      : "A new submission creates a new history record. Existing submissions are not overwritten."}
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  className="w-full shrink-0 sm:w-auto"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="mr-2 animate-spin"
                      />
                      Saving...
                    </>
                  ) : editingSubmission ? (
                    <>
                      Update & Resubmit
                      <CheckCircle2 size={16} className="ml-2" />
                    </>
                  ) : (
                    <>
                      Submit Your Tasks
                      <UploadCloud size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </section>
            </form>

            <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="text-xl font-bold">
                Published Internship Tasks
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Additional instructions published by your internship
                team.
              </p>

              {publishedTasks.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No additional instructions have been published yet.
                </p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {publishedTasks.map((task, index) => (
                    <article
                      key={task.id || task.task_id || index}
                      className="rounded-xl border border-border p-4"
                    >
                      <h3 className="font-bold">
                        {task.title ||
                          task.task_title ||
                          `Published Task ${index + 1}`}
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {task.description || task.instructions || ""}
                      </p>

                      {(task.due_date || task.deadline) && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Deadline: {formatDate(task.due_date || task.deadline)}
                        </p>
                      )}

                      {task.task_link && safeHref(task.task_link) && (
                        <a
                          href={safeHref(task.task_link)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                        >
                          Open Task Instructions
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    My Task Submission History
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Each submission is shown separately. Editing updates
                    only that record.
                  </p>
                </div>

                <div className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold">
                  {submissions.length} total records
                </div>
              </div>

              {submissions.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  You have not submitted any tasks yet.
                </p>
              ) : (
                <div className="mt-5 grid gap-4">
                  {sortedSubmissions.map((item, index) => {
                    const taskNumber = Number(item.task_number);

                    const itemFiles = Array.isArray(item.files)
                      ? item.files
                      : [];

                    const isEditing =
                      editingSubmission?.id === item.id;

                    return (
                      <article
                        key={
                          item.id ||
                          `${item.task_number}-${item.submitted_at}-${index}`
                        }
                        className="min-w-0 rounded-2xl border border-border p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Task {taskNumber} · Submission #{index + 1}
                            </p>

                            <h3 className="mt-1 break-words font-bold">
                              {TASK_TITLES[taskNumber - 1] ||
                                item.task_title ||
                                `Task ${taskNumber}`}
                            </h3>

                            {item.submitted_at && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Submitted:{" "}
                                {new Date(
                                  item.submitted_at
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <StatusBadge status={item.status} />
                        </div>

                        {item.description && (
                          <div className="mt-4 rounded-xl bg-secondary/50 p-3">
                            <p className="mb-1 text-xs font-semibold text-muted-foreground">
                              Description
                            </p>

                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {item.description}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <SubmittedLink
                            label={
                              taskNumber === 1
                                ? "LinkedIn offer letter post"
                                : "Project / Figma link"
                            }
                            value={item.task_link}
                          />

                          <SubmittedLink
                            label="GitHub repository"
                            value={item.github_link}
                          />

                          {taskNumber === 1 && (
                            <SubmittedLink
                              label="LinkedIn post"
                              value={item.linkedin_link}
                            />
                          )}
                        </div>

                        {itemFiles.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-2 text-sm font-semibold">
                              Files in this submission
                            </p>

                            <div className="grid gap-2">
                              {itemFiles.map((file, fileIndex) => (
                                <div
                                  key={
                                    file.path ||
                                    `${file.name}-${fileIndex}`
                                  }
                                  className="flex min-w-0 items-center gap-2 rounded-lg border border-border p-3"
                                >
                                  <FileText
                                    size={17}
                                    className="shrink-0 text-primary"
                                  />

                                  <span className="break-all text-sm">
                                    {file.name || "Uploaded file"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.admin_feedback && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm font-semibold text-amber-950">
                              Admin Feedback
                            </p>

                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-amber-900">
                              {item.admin_feedback}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => editSubmission(item)}
                            disabled={
                              submitting || deletingTaskId === item.id
                            }
                          >
                            <Pencil size={14} className="mr-2" />
                            {isEditing
                              ? "Editing This Record"
                              : "Edit & Resubmit"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSubmission(item)}
                            disabled={
                              deletingTaskId === item.id || submitting
                            }
                          >
                            {deletingTaskId === item.id ? (
                              <RefreshCw
                                size={14}
                                className="mr-2 animate-spin"
                              />
                            ) : (
                              <Trash2 size={14} className="mr-2" />
                            )}

                            Delete Submission
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {submittedFiles.length > 0 && (
                <div className="mt-6 rounded-xl bg-secondary/40 p-4">
                  <p className="font-semibold">
                    Total unique uploaded files: {submittedFiles.length}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-8 rounded-2xl border border-primary/20 bg-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-secondary p-3 text-primary">
                  <MessageCircle size={24} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold">Message the CEO</h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Ask questions about your internship, tasks, or
                    certificates. Messages and replies appear in this
                    portal thread.
                  </p>
                </div>
              </div>

              <form
                onSubmit={sendCeoMessage}
                className="mt-5 space-y-3"
              >
                <Label htmlFor="ceo-message">Your Message</Label>

                <Textarea
                  id="ceo-message"
                  value={ceoMessage}
                  onChange={(e) => setCeoMessage(e.target.value)}
                  placeholder="Write your message to the CEO..."
                  rows={4}
                  maxLength={3000}
                  required
                />

                <p className="text-xs text-muted-foreground">
                  {ceoMessage.length}/3000 characters
                </p>

                <Button
                  type="submit"
                  variant="brand"
                  disabled={
                    sendingCeoMessage || !ceoMessage.trim()
                  }
                >
                  {sendingCeoMessage ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="mr-2 animate-spin"
                      />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Message to CEO
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Conversation with CEO</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Replies are displayed here; no email reply is
                      required.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadCeoComments(session)}
                    disabled={loadingCeoMessages}
                  >
                    <RefreshCw
                      size={14}
                      className={
                        loadingCeoMessages
                          ? "mr-2 animate-spin"
                          : "mr-2"
                      }
                    />
                    Refresh Messages
                  </Button>
                </div>

                {loadingCeoMessages ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Loading messages...
                  </p>
                ) : ceoComments.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No messages in this conversation yet.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {ceoComments.map((comment, index) => {
                      const isCeo =
                        String(comment.sender_role || "").toLowerCase() ===
                        "ceo";

                      return (
                        <article
                          key={
                            comment.id ||
                            `${comment.created_at}-${index}`
                          }
                          className={`min-w-0 rounded-xl border p-4 ${
                            isCeo
                              ? "border-primary/30 bg-secondary/40"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="font-bold">
                              {isCeo
                                ? "CEO | Arslan Fayyaz | Internlytic Technologies"
                                : "You (Intern)"}
                            </p>

                            {comment.created_at && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  comment.created_at
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
                            {comment.message}
                          </p>

                          {!isCeo && (
                            <div className="mt-3 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteOwnMessage(comment)
                                }
                                disabled={
                                  deletingMessageId === comment.id
                                }
                              >
                                {deletingMessageId === comment.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="mr-2 animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={14}
                                    className="mr-2"
                                  />
                                )}

                                Delete My Message
                              </Button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
              Internlytic Technologies · Internship Portal
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
