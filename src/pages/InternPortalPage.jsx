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
  X,
  Github,
  Linkedin,
  AlertCircle,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/supabaseClient";

const BUCKET = "intern-task-files";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const TASKS = [
  {
    number: 1,
    title: "LinkedIn Offer Letter Post",
    description:
      "Share the link to the LinkedIn post where you published your internship offer letter. Make sure the post is accessible for review.",
    requireLink: true,
    linkLabel: "LinkedIn Post URL",
    linkKey: "task_link",
  },
  {
    number: 2,
    title: "Weekly Task 1",
    description:
      "Upload your completed weekly task. Accepted formats include PDF, Word documents, PowerPoint presentations, ZIP archives, screenshots, and text files.",
    requireFiles: true,
  },
  {
    number: 3,
    title: "Project Submission",
    description:
      "Submit your project work, supporting documents, screenshots, or design files. You may also provide a shareable Figma or project link.",
    requireFilesOrLink: true,
    linkLabel: "Project or Figma URL",
    linkKey: "task_link",
  },
  {
    number: 4,
    title: "Final Project Submission (Compulsory)",
    description:
      "Submit your final project, explain what you built, and provide your GitHub repository and LinkedIn post links. This task is compulsory.",
    requireFinal: true,
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

const emptyTask = () => ({
  description: "",
  task_link: "",
  github_link: "",
  linkedin_link: "",
  files: [],
});

function readSession() {
  try {
    const raw = sessionStorage.getItem("internlytic.portal.session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getInternId(session) {
  return (
    session?.intern_id ||
    session?.certificate_id ||
    session?.intern?.intern_id ||
    session?.intern?.certificate_id ||
    ""
  );
}

function getEmail(session) {
  return (
    session?.email ||
    session?.student_email ||
    session?.intern?.email ||
    session?.intern?.student_email ||
    ""
  );
}

function normalizeUrl(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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

function statusClass(status) {
  const normalized = (status || "Not Submitted").toLowerCase();

  if (normalized === "approved") {
    return "bg-green-100 text-green-800";
  }

  if (normalized === "rejected") {
    return "bg-red-100 text-red-800";
  }

  if (normalized === "under review") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-slate-100 text-slate-700";
}

export default function InternPortalPage() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState(() => TASKS.map(emptyTask));
  const [savedSubmissions, setSavedSubmissions] = useState([]);
  const [publishedTasks, setPublishedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const currentSession = readSession();

    if (!currentSession || !getInternId(currentSession) || !getEmail(currentSession)) {
      navigate("/portal", { replace: true });
      return;
    }

    setSession(currentSession);
    loadPortal(currentSession);
    // Load portal information when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPortal(currentSession = session, showRefresh = false) {
    if (!currentSession) return;

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setNotice(null);

    try {
      const internId = getInternId(currentSession);
      const email = getEmail(currentSession);

      const { data: loginData, error: loginError } = await supabase.rpc(
        "portal_intern_login",
        {
          p_intern_id: internId,
          p_email: email,
        }
      );

      if (loginError) throw loginError;

      if (!loginData?.ok) {
        throw new Error(
          loginData?.message ||
            "Unable to verify your account. Please sign in again."
        );
      }

      const intern = loginData.intern || {};

      setProfile({
        ...intern,
        intern_id: intern.intern_id || internId,
        email: intern.email || intern.student_email || email,
      });

      setPublishedTasks(Array.isArray(loginData.tasks) ? loginData.tasks : []);

      const { data: submissionData, error: submissionError } =
        await supabase.rpc("portal_get_my_task_submissions", {
          p_intern_id: internId,
          p_email: email,
        });

      if (submissionError) throw submissionError;

      if (submissionData?.ok) {
        const submissions = Array.isArray(submissionData.submissions)
          ? submissionData.submissions
          : [];

        setSavedSubmissions(submissions);

        setTasks((previous) =>
          TASKS.map((task) => {
            const saved = submissions.find(
              (item) => Number(item.task_number) === task.number
            );

            if (!saved) return previous[task.number - 1];

            return {
              description: saved.description || "",
              task_link: saved.task_link || "",
              github_link: saved.github_link || "",
              linkedin_link: saved.linkedin_link || "",
              files: Array.isArray(saved.files)
                ? saved.files.map((file) => ({
                    ...file,
                    saved: true,
                  }))
                : [],
            };
          })
        );
      }
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error?.message ||
          "Unable to load your portal. Please refresh and try again.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function updateTask(taskNumber, field, value) {
    setTasks((previous) =>
      previous.map((task, index) =>
        index === taskNumber - 1
          ? { ...task, [field]: value }
          : task
      )
    );
  }

  function handleFileSelection(taskNumber, event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selectedFiles.length) return;

    const currentFiles = tasks[taskNumber - 1].files;
    const newFiles = [];

    for (const file of selectedFiles) {
      const extension = `.${file.name.split(".").pop().toLowerCase()}`;

      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        setNotice({
          type: "error",
          text: `${file.name}: This file format is not supported.`,
        });
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setNotice({
          type: "error",
          text: `${file.name}: Each file must be 10 MB or smaller.`,
        });
        continue;
      }

      const duplicate = [...currentFiles, ...newFiles].some(
        (item) =>
          item.name === file.name &&
          item.size === file.size
      );

      if (!duplicate) newFiles.push(file);
    }

    updateTask(taskNumber, "files", [...currentFiles, ...newFiles]);
  }

  function removeFile(taskNumber, fileIndex) {
    const updated = tasks[taskNumber - 1].files.filter(
      (_, index) => index !== fileIndex
    );

    updateTask(taskNumber, "files", updated);
  }

  function validateTasks() {
    for (const task of TASKS) {
      const data = tasks[task.number - 1];

      if (task.number === 1 && !isValidUrl(data.task_link)) {
        return "Please provide a valid LinkedIn offer letter post URL for Task 1.";
      }

      if (task.number === 2 && data.files.length === 0) {
        return "Please attach at least one file for Task 2.";
      }

      if (
        task.number === 3 &&
        data.files.length === 0 &&
        !isValidUrl(data.task_link)
      ) {
        return "For Task 3, upload at least one file or provide a valid project or Figma URL.";
      }

      if (task.number === 4) {
        if (!data.description.trim()) {
          return "Please describe what you built for the final task.";
        }

        if (data.files.length === 0) {
          return "Please attach at least one file for the compulsory final task.";
        }

        if (!isValidUrl(data.github_link)) {
          return "Please provide a valid GitHub repository URL for the final task.";
        }

        if (!isValidUrl(data.linkedin_link)) {
          return "Please provide a valid LinkedIn post URL for the final task.";
        }
      }

      for (const field of ["task_link", "github_link", "linkedin_link"]) {
        if (data[field]?.trim() && !isValidUrl(data[field])) {
          return `Please enter a valid URL in Task ${task.number}.`;
        }
      }
    }

    return null;
  }

  async function uploadTaskFiles(taskNumber, files) {
    const uploaded = [];

    for (const file of files) {
      if (file.saved && file.path) {
        uploaded.push({
          name: file.name,
          path: file.path,
          size: file.size,
          type: file.type || "",
        });
        continue;
      }

      if (!(file instanceof File)) continue;

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniquePart =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const path = `${encodeURIComponent(getInternId(session))}/task-${taskNumber}/${uniquePart}-${safeName}`;

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

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    const validationError = validateTasks();

    if (validationError) {
      setNotice({ type: "error", text: validationError });
      return;
    }

    if (!session) {
      setNotice({
        type: "error",
        text: "Your session has expired. Please sign in again.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const submissions = [];

      for (const task of TASKS) {
        const data = tasks[task.number - 1];
        const uploadedFiles = await uploadTaskFiles(
          task.number,
          data.files
        );

        submissions.push({
          task_number: task.number,
          task_title: task.title,
          description: data.description.trim(),
          task_link: normalizeUrl(data.task_link),
          github_link: normalizeUrl(data.github_link),
          linkedin_link: normalizeUrl(data.linkedin_link),
          files: uploadedFiles,
        });
      }

      const { data, error } = await supabase.rpc(
        "portal_submit_intern_tasks",
        {
          p_intern_id: getInternId(session),
          p_email: getEmail(session),
          p_submissions: submissions,
        }
      );

      if (error) throw error;

      if (!data?.ok) {
        throw new Error(
          data?.message || "Your task submissions could not be saved."
        );
      }

      setNotice({
        type: "success",
        text:
          "Your tasks have been submitted successfully and are awaiting review. Your offer letter will be sent to your registered email address after approval.",
      });

      await loadPortal(session, true);
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error?.message ||
          "An unexpected error occurred while submitting your tasks.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/portal", { replace: true });
  }

  const approvedCount = TASKS.filter((task) => {
    const saved = savedSubmissions.find(
      (item) => Number(item.task_number) === task.number
    );
    return (saved?.status || "").toLowerCase() === "approved";
  }).length;

  const submittedCount = savedSubmissions.length;
  const progress = Math.round((approvedCount / TASKS.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-600" />
            <p className="text-sm text-slate-600">
              Loading your internship portal...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Internlytic Technologies
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Intern Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Submit your internship tasks, upload your work, and track your
              review status from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => loadPortal(session, true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <p className="text-sm leading-6">{notice.text}</p>
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Intern ID</p>
            <p className="mt-2 break-all text-lg font-bold text-slate-900">
              {profile?.intern_id || getInternId(session) || "Not available"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Internship Track</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {profile?.track || profile?.program || "Not assigned"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tasks Submitted</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {submittedCount} / {TASKS.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Approved Tasks</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {approvedCount} / {TASKS.length}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {progress}% approved
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-sky-50 p-3 text-sky-700">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Welcome, {profile?.full_name || profile?.student_name || "Intern"}
              </h2>
              <p className="mt-1 break-all text-sm text-slate-600">
                Registered email: {profile?.email || getEmail(session)}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Complete all four tasks and submit your work for review. The
                final project is compulsory. Your offer letter will be sent to
                your registered email address after the required approval.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          {TASKS.map((task) => {
            const data = tasks[task.number - 1];
            const saved = savedSubmissions.find(
              (item) => Number(item.task_number) === task.number
            );

            return (
              <section
                key={task.number}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-bold text-sky-700">
                        {String(task.number).padStart(2, "0")}
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {task.title}
                          {task.number === 4 && (
                            <span className="ml-2 inline-block rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                              Compulsory
                            </span>
                          )}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                        saved?.status
                      )}`}
                    >
                      {saved?.status === "Approved" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5" />
                      )}
                      {saved?.status || "Not Submitted"}
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {task.number === 4 && (
                    <div className="space-y-2">
                      <Label htmlFor="final-description">
                        Project Description
                      </Label>
                      <Textarea
                        id="final-description"
                        placeholder="Describe what you built, the technologies you used, and the main features you implemented."
                        rows={4}
                        value={data.description}
                        onChange={(event) =>
                          updateTask(
                            task.number,
                            "description",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  )}

                  {task.linkLabel && (
                    <div className="space-y-2">
                      <Label htmlFor={`task-link-${task.number}`}>
                        <Link2 className="mr-2 inline h-4 w-4" />
                        {task.linkLabel}
                      </Label>
                      <Input
                        id={`task-link-${task.number}`}
                        type="url"
                        placeholder="https://..."
                        value={data.task_link}
                        onChange={(event) =>
                          updateTask(
                            task.number,
                            "task_link",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  )}

                  {task.number === 4 && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="final-github">
                          <Github className="mr-2 inline h-4 w-4" />
                          GitHub Repository URL
                        </Label>
                        <Input
                          id="final-github"
                          type="url"
                          placeholder="https://github.com/username/repository"
                          value={data.github_link}
                          onChange={(event) =>
                            updateTask(
                              task.number,
                              "github_link",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="final-linkedin">
                          <Linkedin className="mr-2 inline h-4 w-4" />
                          LinkedIn Project Post URL
                        </Label>
                        <Input
                          id="final-linkedin"
                          type="url"
                          placeholder="https://www.linkedin.com/posts/..."
                          value={data.linkedin_link}
                          onChange={(event) =>
                            updateTask(
                              task.number,
                              "linkedin_link",
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  {(task.requireFiles ||
                    task.requireFilesOrLink ||
                    task.requireFinal) && (
                    <div className="space-y-3">
                      <Label>
                        <FileText className="mr-2 inline h-4 w-4" />
                        Upload Files
                      </Label>

                      <label
                        htmlFor={`task-files-${task.number}`}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-sky-400 hover:bg-sky-50"
                      >
                        <UploadCloud className="mb-3 h-8 w-8 text-sky-600" />
                        <span className="font-semibold text-slate-800">
                          Choose files to upload
                        </span>
                        <span className="mt-1 text-xs leading-5 text-slate-500">
                          PDF, Word, PowerPoint, ZIP, screenshots, TXT, and
                          supported project files. Maximum 10 MB per file.
                        </span>
                        <span className="mt-2 text-xs text-sky-700">
                          Multiple files are supported
                        </span>
                      </label>

                      <input
                        id={`task-files-${task.number}`}
                        type="file"
                        multiple
                        accept={ACCEPTED_EXTENSIONS.join(",")}
                        className="sr-only"
                        onChange={(event) =>
                          handleFileSelection(task.number, event)
                        }
                      />

                      {data.files.length > 0 && (
                        <div className="space-y-2">
                          {data.files.map((file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <FileText className="h-5 w-5 shrink-0 text-sky-600" />
                                <div className="min-w-0">
                                  <p className="break-all text-sm font-medium text-slate-800">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {file.saved
                                      ? "Previously uploaded"
                                      : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                  </p>
                                </div>
                              </div>

                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={`Remove ${file.name}`}
                                onClick={() => removeFile(task.number, index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {saved?.admin_feedback && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                      <p className="text-sm font-semibold text-sky-900">
                        Reviewer Feedback
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-sky-900">
                        {saved.admin_feedback}
                      </p>
                    </div>
                  )}

                  {saved?.submitted_at && (
                    <p className="text-xs text-slate-500">
                      Last submitted:{" "}
                      {new Date(saved.submitted_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </section>
            );
          })}

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Ready to submit your work?
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Review your links and files before submitting all four tasks.
                Submitting again updates your existing submissions and sends
                them for review again.
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="min-h-12 shrink-0 bg-sky-600 px-6 text-white hover:bg-sky-700"
            >
              {submitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Tasks...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Submit Your Tasks
                </>
              )}
            </Button>
          </div>
        </form>

        {publishedTasks.length > 0 && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Published Internship Tasks
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Additional instructions published by your internship team.
            </p>

            <div className="mt-4 space-y-3">
              {publishedTasks.map((task, index) => (
                <div
                  key={task.id || task.task_id || index}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <h3 className="font-semibold text-slate-900">
                    {task.title || task.task_title || `Task ${index + 1}`}
                  </h3>
                  {(task.description || task.instructions) && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {task.description || task.instructions}
                    </p>
                  )}
                  {task.due_date && (
                    <p className="mt-2 text-xs text-slate-500">
                      Due date: {task.due_date}
                    </p>
                  )}
                  {task.task_link && (
                    <a
                      href={task.task_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:underline"
                    >
                      Open task instructions
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-slate-500">
          Internlytic Technologies · Internship Portal · Keep your registered
          email address active for official updates.
        </p>
      </main>

      <Footer />
    </div>
  );
}
