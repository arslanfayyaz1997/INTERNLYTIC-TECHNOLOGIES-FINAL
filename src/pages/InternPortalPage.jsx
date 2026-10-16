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
  Github,
  Linkedin,
  X,
  AlertCircle,
} from "lucide-react";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabaseClient";

const BUCKET = "intern-task-files";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const TASK_DEFINITIONS = [
  {
    number: 1,
    title: "Week 1 Task (LinkedIn Offer Letter Post link) ",
    description:
      "Share the URL of your LinkedIn post announcing your internship offer letter.",
    linkLabel: "LinkedIn Post URL",
    linkPlaceholder: "https://www.linkedin.com/posts/...",
    requiredLink: true,
  },
  {
    number: 2,
    title: "Week 2 Task",
    description:
      "Upload your completed weekly task. You may submit documents, screenshots, presentations, or ZIP files.",
    requiredFiles: true,
  },
  {
    number: 3,
    title: "Week 3 Task",
    description:
      "Submit your project work, supporting documents, screenshots, or design deliverables. A shareable Figma or project URL is also accepted.",
    linkLabel: "Project or Figma URL",
    linkPlaceholder: "https://www.figma.com/...",
    allowLinkOrFiles: true,
  },
  {
    number: 4,
    title: " Week Task 4 (Final Project Submission)",
    description:
      "This task is compulsory. Describe your project, upload your work, and provide your GitHub repository and LinkedIn project post.",
    requiredFinal: true,
  },
];

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

function readSession() {
  try {
    return JSON.parse(
      sessionStorage.getItem("internlytic.portal.session") || "null"
    );
  } catch {
    return null;
  }
}

function emptyTask() {
  return {
    description: "",
    task_link: "",
    github_link: "",
    linkedin_link: "",
    files: [],
  };
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || fallback;
}

function normalizeUrl(value) {
  const input = (value || "").trim();

  if (!input) return "";

  return /^https?:\/\//i.test(input)
    ? input
    : `https://${input}`;
}

function isValidUrl(value) {
  if (!value?.trim()) return false;

  try {
    const parsed = new URL(normalizeUrl(value));
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function statusStyle(status) {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "under review":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-secondary text-muted-foreground";
  }
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

export default function InternPortalPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(() => readSession());
  const [profile, setProfile] = useState(null);
  const [taskForms, setTaskForms] = useState(() =>
    TASK_DEFINITIONS.map(() => emptyTask())
  );
  const [publishedTasks, setPublishedTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

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
    load(currentSession);

    // Load the current intern's portal data on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(currentSession = session, isRefresh = false) {
    if (!currentSession?.intern_id || !currentSession?.email) {
      navigate("/login", { replace: true });
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const { data: loginData, error: loginError } =
        await supabase.rpc("portal_intern_login", {
          p_intern_id: currentSession.intern_id,
          p_email: currentSession.email,
        });

      if (loginError) throw loginError;

      const result = Array.isArray(loginData)
        ? loginData[0]
        : loginData;

      if (!result?.ok || !result.intern) {
        throw new Error(
          result?.message || "Unable to load your internship profile."
        );
      }

      setProfile(result.intern);
      setPublishedTasks(
        Array.isArray(result.tasks) ? result.tasks : []
      );

      const { data: submissionData, error: submissionError } =
        await supabase.rpc("portal_get_my_task_submissions", {
          p_intern_id: currentSession.intern_id,
          p_email: currentSession.email,
        });

      if (submissionError) throw submissionError;

      const submissionResult = Array.isArray(submissionData)
        ? submissionData[0]
        : submissionData;

      if (submissionResult?.ok) {
        const saved = Array.isArray(submissionResult.submissions)
          ? submissionResult.submissions
          : [];

        setSubmissions(saved);

        setTaskForms((previous) =>
          TASK_DEFINITIONS.map((definition) => {
            const existing = saved.find(
              (item) =>
                Number(item.task_number) === definition.number
            );

            if (!existing) {
              return previous[definition.number - 1];
            }

            return {
              description: existing.description || "",
              task_link: existing.task_link || "",
              github_link: existing.github_link || "",
              linkedin_link: existing.linkedin_link || "",
              files: Array.isArray(existing.files)
                ? existing.files.map((file) => ({
                    ...file,
                    saved: true,
                  }))
                : [],
            };
          })
        );
      } else if (submissionResult && !submissionResult.ok) {
        throw new Error(
          submissionResult.message ||
            "Unable to retrieve your task submissions."
        );
      }
    } catch (e) {
      setError(
        getErrorMessage(e, "Unable to load your internship dashboard.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function updateTask(taskNumber, field, value) {
    setTaskForms((previous) =>
      previous.map((task, index) =>
        index === taskNumber - 1
          ? { ...task, [field]: value }
          : task
      )
    );
  }

  function selectFiles(taskNumber, event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selected.length) return;

    const current = taskForms[taskNumber - 1].files;
    const accepted = [];
    const rejected = [];

    for (const file of selected) {
      const extension = `.${file.name.split(".").pop().toLowerCase()}`;

      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        rejected.push(`${file.name}: Unsupported file format.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name}: Maximum file size is 10 MB.`);
        continue;
      }

      const duplicate = [...current, ...accepted].some(
        (item) =>
          item.name === file.name &&
          item.size === file.size
      );

      if (!duplicate) accepted.push(file);
    }

    if (rejected.length) {
      setError(rejected.join(" "));
    } else {
      setError("");
    }

    updateTask(taskNumber, "files", [...current, ...accepted]);
  }

  function removeFile(taskNumber, indexToRemove) {
    const current = taskForms[taskNumber - 1].files;

    updateTask(
      taskNumber,
      "files",
      current.filter((_, index) => index !== indexToRemove)
    );
  }

  function validateTasks() {
    for (const definition of TASK_DEFINITIONS) {
      const task = taskForms[definition.number - 1];

      if (definition.number === 1 && !isValidUrl(task.task_link)) {
        return "Task 1 requires a valid LinkedIn offer letter post URL.";
      }

      if (definition.number === 2 && task.files.length === 0) {
        return "Please upload at least one file for Weekly Task 1.";
      }

      if (
        definition.number === 3 &&
        task.files.length === 0 &&
        !isValidUrl(task.task_link)
      ) {
        return "For Task 3, upload a file or provide a valid project or Figma URL.";
      }

      if (definition.number === 4) {
        if (!task.description.trim()) {
          return "Please describe what you built for the final project.";
        }

        if (task.files.length === 0) {
          return "Please upload at least one file for the compulsory final project.";
        }

        if (!isValidUrl(task.github_link)) {
          return "Please provide a valid GitHub repository URL for the final project.";
        }

        if (!isValidUrl(task.linkedin_link)) {
          return "Please provide a valid LinkedIn project post URL for the final project.";
        }
      }

      for (const field of [
        "task_link",
        "github_link",
        "linkedin_link",
      ]) {
        if (task[field]?.trim() && !isValidUrl(task[field])) {
          return `Please enter a valid URL for Task ${definition.number}.`;
        }
      }
    }

    return "";
  }

  async function uploadFiles(taskNumber, files) {
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

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const folder = encodeURIComponent(session.intern_id);
      const path = `${folder}/task-${taskNumber}/${uniqueId}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
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

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice(null);

    const validationError = validateTasks();

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
      const preparedSubmissions = [];

      for (const definition of TASK_DEFINITIONS) {
        const task = taskForms[definition.number - 1];
        const files = await uploadFiles(
          definition.number,
          task.files
        );

        preparedSubmissions.push({
          task_number: definition.number,
          task_title: definition.title,
          description: task.description.trim(),
          task_link: normalizeUrl(task.task_link),
          github_link: normalizeUrl(task.github_link),
          linkedin_link: normalizeUrl(task.linkedin_link),
          files,
        });
      }

      const { data, error: submitError } = await supabase.rpc(
        "portal_submit_intern_tasks",
        {
          p_intern_id: session.intern_id,
          p_email: session.email,
          p_submissions: preparedSubmissions,
        }
      );

      if (submitError) throw submitError;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.ok) {
        throw new Error(
          result?.message || "Unable to save your task submissions."
        );
      }

      setNotice(
        "Your tasks have been submitted successfully and are awaiting review. Your offer letter will be sent to your registered email address after approval."
      );

      await load(session, true);
    } catch (e) {
      setError(
        getErrorMessage(
          e,
          "Task submission failed. Please check your connection and try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  const approved = TASK_DEFINITIONS.filter((definition) => {
    const saved = submissions.find(
      (item) =>
        Number(item.task_number) === definition.number
    );

    return String(saved?.status || "").toLowerCase() === "approved";
  }).length;

  const progress =
    profile?.progress_percent != null
      ? Math.max(0, Math.min(100, Number(profile.progress_percent) || 0))
      : Math.round((approved / TASK_DEFINITIONS.length) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary via-card to-background p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
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
                Manage your internship tasks, submit your work, and track
                your review progress from one dashboard.
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
            <RefreshCw size={28} className="mx-auto mb-3 animate-spin" />
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

              <Metric
                label="Approved Tasks"
                value={`${approved}/${TASK_DEFINITIONS.length}`}
              />

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
                    Registered email: {profile?.email || profile?.student_email || session?.email}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Complete and submit all four tasks. Your submissions
                    will be reviewed by the internship team. Once the
                    required work is approved, the company can send your
                    offer letter or other relevant documents to your
                    registered email address.
                  </p>
                </div>
              </div>
            </section>

            <form onSubmit={submit} className="mt-8 space-y-6">
              {TASK_DEFINITIONS.map((definition) => {
                const task = taskForms[definition.number - 1];

                const saved = submissions.find(
                  (item) =>
                    Number(item.task_number) === definition.number
                );

                return (
                  <section
                    key={definition.number}
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <div className="border-b border-border p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-bold text-primary">
                            {String(definition.number).padStart(2, "0")}
                          </div>

                          <div className="min-w-0">
                            <h2 className="text-lg font-bold">
                              {definition.title}
                              {definition.number === 4 && (
                                <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                  Compulsory
                                </span>
                              )}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {definition.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(saved?.status)}`}
                        >
                          {String(saved?.status || "").toLowerCase() === "approved" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock3 size={14} />
                          )}
                          {saved?.status || "Not Submitted"}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:p-6">
                      {definition.requiredFinal && (
                        <div className="grid gap-2">
                          <Label htmlFor="final-description">
                            Project Description
                          </Label>

                          <Textarea
                            id="final-description"
                            value={task.description}
                            onChange={(event) =>
                              updateTask(
                                definition.number,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Describe what you built, the technologies you used, and the main features you implemented."
                            rows={4}
                          />
                        </div>
                      )}

                      {definition.linkLabel && (
                        <div className="grid gap-2">
                          <Label htmlFor={`task-link-${definition.number}`}>
                            <Link2 size={15} className="mr-2 inline" />
                            {definition.linkLabel}
                          </Label>

                          <Input
                            id={`task-link-${definition.number}`}
                            type="url"
                            value={task.task_link}
                            onChange={(event) =>
                              updateTask(
                                definition.number,
                                "task_link",
                                event.target.value
                              )
                            }
                            placeholder={definition.linkPlaceholder}
                          />
                        </div>
                      )}

                      {definition.requiredFinal && (
                        <div className="grid gap-5 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="final-github">
                              <Github size={15} className="mr-2 inline" />
                              GitHub Repository URL
                            </Label>

                            <Input
                              id="final-github"
                              type="url"
                              value={task.github_link}
                              onChange={(event) =>
                                updateTask(
                                  definition.number,
                                  "github_link",
                                  event.target.value
                                )
                              }
                              placeholder="https://github.com/username/repository"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="final-linkedin">
                              <Linkedin size={15} className="mr-2 inline" />
                              LinkedIn Project Post URL
                            </Label>

                            <Input
                              id="final-linkedin"
                              type="url"
                              value={task.linkedin_link}
                              onChange={(event) =>
                                updateTask(
                                  definition.number,
                                  "linkedin_link",
                                  event.target.value
                                )
                              }
                              placeholder="https://www.linkedin.com/posts/..."
                            />
                          </div>
                        </div>
                      )}

                      {(definition.requiredFiles ||
                        definition.allowLinkOrFiles ||
                        definition.requiredFinal) && (
                        <div className="grid gap-3">
                          <Label htmlFor={`task-files-${definition.number}`}>
                            <FileText size={15} className="mr-2 inline" />
                            Upload Files
                          </Label>

                          <label
                            htmlFor={`task-files-${definition.number}`}
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 px-4 py-8 text-center transition hover:border-primary hover:bg-secondary/60"
                          >
                            <UploadCloud
                              size={30}
                              className="mb-3 text-primary"
                            />

                            <span className="font-semibold">
                              Choose files to upload
                            </span>

                            <span className="mt-1 text-xs leading-5 text-muted-foreground">
                              PDF, Word, PowerPoint, ZIP, screenshots, text
                              files, and supported project files
                            </span>

                            <span className="mt-2 text-xs font-medium text-primary">
                              Multiple files · Maximum 10 MB per file
                            </span>
                          </label>

                          <Input
                            id={`task-files-${definition.number}`}
                            type="file"
                            multiple
                            accept={ACCEPTED_EXTENSIONS.join(",")}
                            className="sr-only"
                            onChange={(event) =>
                              selectFiles(definition.number, event)
                            }
                          />

                          {task.files.length > 0 && (
                            <div className="grid gap-2">
                              {task.files.map((file, index) => (
                                <div
                                  key={`${file.name}-${index}`}
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
                                          : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                      </p>
                                    </div>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Remove ${file.name}`}
                                    onClick={() =>
                                      removeFile(definition.number, index)
                                    }
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {saved?.admin_feedback && (
                        <div className="rounded-xl border border-primary/20 bg-secondary/50 p-4">
                          <p className="text-sm font-bold">
                            Reviewer Feedback
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {saved.admin_feedback}
                          </p>
                        </div>
                      )}

                      {saved?.submitted_at && (
                        <p className="text-xs text-muted-foreground">
                          Last submitted:{" "}
                          {new Date(saved.submitted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}

              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="font-bold">
                    Ready to submit your tasks?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Check your links and attachments before submitting.
                    Resubmission sends the tasks for review again.
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
                      Submitting Tasks...
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
              <div>
                <h2 className="text-xl font-bold">
                  Published Internship Tasks
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Additional instructions published by your internship team.
                </p>
              </div>

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
                          Deadline: {task.due_date || task.deadline}
                        </p>
                      )}

                      {task.task_link && (
                        <a
                          href={task.task_link}
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
              <h2 className="text-xl font-bold">My Task Submissions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the latest status and feedback for each submitted task.
              </p>

              {submissions.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  You have not submitted any tasks yet.
                </p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {submissions.map((item) => {
                    const definition = TASK_DEFINITIONS.find(
                      (task) =>
                        task.number === Number(item.task_number)
                    );

                    return (
                      <article
                        key={item.id || item.task_number}
                        className="rounded-xl border border-border p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="font-bold">
                              {definition?.title ||
                                item.task_title ||
                                `Task ${item.task_number}`}
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Submitted:{" "}
                              {item.submitted_at
                                ? new Date(
                                    item.submitted_at
                                  ).toLocaleString()
                                : "Date unavailable"}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(item.status)}`}
                          >
                            {item.status || "Under Review"}
                          </span>
                        </div>

                        {item.description && (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-3">
                          {item.task_link && (
                            <a
                              href={normalizeUrl(item.task_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                              Open Task Link
                              <ExternalLink size={14} />
                            </a>
                          )}

                          {item.github_link && (
                            <a
                              href={normalizeUrl(item.github_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                              GitHub Repository
                              <ExternalLink size={14} />
                            </a>
                          )}

                          {item.linkedin_link && (
                            <a
                              href={normalizeUrl(item.linkedin_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                              LinkedIn Post
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>

                        {Array.isArray(item.files) &&
                          item.files.length > 0 && (
                            <div className="mt-4 border-t border-border pt-3">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Attached Files
                              </p>

                              <div className="mt-2 grid gap-2">
                                {item.files.map((file, index) => (
                                  <div
                                    key={`${file.name}-${index}`}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <FileText
                                      size={15}
                                      className="mt-0.5 shrink-0 text-primary"
                                    />
                                    <span className="break-all">
                                      {file.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {item.admin_feedback && (
                          <div className="mt-4 rounded-lg bg-secondary p-3">
                            <p className="text-sm font-semibold">
                              Reviewer Feedback
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                              {item.admin_feedback}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
              Internlytic Technologies · Internship Portal · Keep your
              registered email address active for official updates.
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
