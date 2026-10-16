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
  FolderOpen,
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

function normalizeUrl(value) {
  const input = (value || "").trim();
  if (!input) return "";

  return /^https?:\/\//i.test(input)
    ? input
    : `https://${input}`;
}

function validateUrl(value, allowedDomains = []) {
  if (!value?.trim()) return false;

  try {
    const url = new URL(normalizeUrl(value));

    if (!["https:", "http:"].includes(url.protocol)) return false;

    if (allowedDomains.length > 0) {
      const host = url.hostname.toLowerCase();

      return allowedDomains.some(
        (domain) =>
          host === domain || host.endsWith(`.${domain}`)
      );
    }

    return true;
  } catch {
    return false;
  }
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || fallback;
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
  const [publishedTasks, setPublishedTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [offerLink, setOfferLink] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [figmaLink, setFigmaLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

      const loginResult = Array.isArray(loginData)
        ? loginData[0]
        : loginData;

      if (!loginResult?.ok || !loginResult.intern) {
        throw new Error(
          loginResult?.message ||
            "Unable to load your internship profile."
        );
      }

      setProfile(loginResult.intern);
      setPublishedTasks(
        Array.isArray(loginResult.tasks)
          ? loginResult.tasks
          : []
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

        const first = saved.find(
          (item) => Number(item.task_number) === 1
        );
        const second = saved.find(
          (item) => Number(item.task_number) === 2
        );
        const third = saved.find(
          (item) => Number(item.task_number) === 3
        );
        const fourth = saved.find(
          (item) => Number(item.task_number) === 4
        );

        if (first?.task_link) setOfferLink(first.task_link);

        const projectRecord = fourth || third || second;

        if (projectRecord) {
          const description = projectRecord.description || "";

          // Restore project name and description saved by this form.
          const nameMatch = description.match(/^Project name:\s*(.+)$/m);
          const detailsMatch = description.match(
            /^Project description:\s*([\s\S]*?)(?=\n\nFigma link:|\n\nGitHub repository:|$)/m
          );

          if (nameMatch) setProjectName(nameMatch[1].trim());
          if (detailsMatch) {
            setProjectDescription(detailsMatch[1].trim());
          }

          if (projectRecord.task_link?.includes("figma.com")) {
            setFigmaLink(projectRecord.task_link);
          } else if (third?.task_link?.includes("figma.com")) {
            setFigmaLink(third.task_link);
          }

          if (fourth?.github_link) {
            setGithubLink(fourth.github_link);
          } else if (third?.github_link) {
            setGithubLink(third.github_link);
          }
        }

        const savedFiles = [
          ...(Array.isArray(second?.files) ? second.files : []),
          ...(Array.isArray(fourth?.files) ? fourth.files : []),
        ];

        const uniqueFiles = savedFiles.filter(
          (file, index, array) =>
            array.findIndex(
              (item) => item.path && item.path === file.path
            ) === index
        );

        if (uniqueFiles.length) {
          setFiles(
            uniqueFiles.map((file) => ({
              ...file,
              saved: true,
            }))
          );
        }
      } else if (submissionResult && !submissionResult.ok) {
        throw new Error(
          submissionResult.message ||
            "Unable to retrieve your submissions."
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
        rejected.push(`${file.name}: Maximum file size is 10 MB.`);
        continue;
      }

      const duplicate = [...files, ...accepted].some(
        (item) =>
          item.name === file.name &&
          item.size === file.size
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

  function validateForm() {
    if (!validateUrl(offerLink, ["linkedin.com"])) {
      return "Please enter a valid LinkedIn URL for your existing offer letter post.";
    }

    if (!projectName.trim()) {
      return "Please enter your project name.";
    }

    if (!projectDescription.trim()) {
      return "Please describe what you built for your project.";
    }

    if (!validateUrl(figmaLink, ["figma.com"])) {
      return "Please enter a valid Figma URL from figma.com.";
    }

    if (!validateUrl(githubLink, ["github.com"])) {
      return "Please enter a valid GitHub repository URL from github.com.";
    }

    if (!files.length) {
      return "Please upload at least one project file.";
    }

    return "";
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

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const folder = encodeURIComponent(session.intern_id);
      const path = `${folder}/final-project/${uniqueId}-${safeName}`;

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

      const submissionsToSave = [
        {
          task_number: 1,
          task_title: TASK_TITLES[0],
          description:
            "Link to the LinkedIn post where the intern already shared their offer letter.",
          task_link: normalizeUrl(offerLink),
          github_link: "",
          linkedin_link: normalizeUrl(offerLink),
          files: [],
        },
        {
          task_number: 2,
          task_title: TASK_TITLES[1],
          description: projectDetails,
          task_link: normalizeUrl(figmaLink),
          github_link: "",
          linkedin_link: "",
          files: uploadedFiles,
        },
        {
          task_number: 3,
          task_title: TASK_TITLES[2],
          description: projectDetails,
          task_link: normalizeUrl(figmaLink),
          github_link: normalizeUrl(githubLink),
          linkedin_link: "",
          files: [],
        },
        {
          task_number: 4,
          task_title: TASK_TITLES[3],
          description: projectDetails,
          task_link: normalizeUrl(figmaLink),
          github_link: normalizeUrl(githubLink),
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

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.ok) {
        throw new Error(
          result?.message || "Unable to save your task submissions."
        );
      }

      setNotice(
        "Your submission has been saved successfully and is awaiting review."
      );

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

  function logout() {
    sessionStorage.removeItem("internlytic.portal.session");
    navigate("/login", { replace: true });
  }

  const approved = [1, 2, 3, 4].filter((number) => {
    const saved = submissions.find(
      (item) => Number(item.task_number) === number
    );

    return String(saved?.status || "").toLowerCase() === "approved";
  }).length;

  const progress =
    profile?.progress_percent != null
      ? Math.max(0, Math.min(100, Number(profile.progress_percent) || 0))
      : Math.round((approved / 4) * 100);

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
                Submit your offer letter post and project work, and track
                your internship review progress from one dashboard.
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
              <Metric label="Approved Tasks" value={`${approved}/4`} />
              <Metric label="Completion Progress" value={`${progress}%`} />
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-secondary p-3 text-primary">
                  <Award size={24} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold">Internship Overview</h2>
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    Registered email:{" "}
                    {profile?.email ||
                      profile?.student_email ||
                      session?.email}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Submit your existing offer letter LinkedIn post and
                    project information below. Your submission will be
                    reviewed by the internship team.
                  </p>
                </div>
              </div>
            </section>

            <form onSubmit={submit} className="mt-8 space-y-6">
              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-bold text-primary">
                      01
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        Week 1 — Task 1: Offer Letter LinkedIn Post
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Paste the link to the LinkedIn post where you have
                        already shared your Internlytic Technologies offer
                        letter. Do not upload the offer letter again.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 p-5 sm:p-6">
                  <Label htmlFor="offer-link">
                    <Linkedin size={15} className="mr-2 inline" />
                    Your Uploaded Offer Letter LinkedIn Post Link
                  </Label>
                  <Input
                    id="offer-link"
                    type="url"
                    required
                    value={offerLink}
                    onChange={(event) => setOfferLink(event.target.value)}
                    placeholder="https://www.linkedin.com/posts/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    A valid LinkedIn URL is required.
                  </p>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-bold text-primary">
                      02
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        Upload Your Week 2, Week 3 and Final Project Files Here
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Enter your project details and upload the files for
                        your weekly work and final project.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">
                  <div className="grid gap-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      required
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                      placeholder="Enter your project name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="project-description">
                      Project Description — What Did You Build?
                    </Label>
                    <Textarea
                      id="project-description"
                      required
                      value={projectDescription}
                      onChange={(event) =>
                        setProjectDescription(event.target.value)
                      }
                      placeholder="Describe what you built, the technologies you used, and the main features you implemented."
                      rows={5}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="figma-link">
                      <Link2 size={15} className="mr-2 inline" />
                      Figma Link
                    </Label>
                    <Input
                      id="figma-link"
                      type="url"
                      required
                      value={figmaLink}
                      onChange={(event) => setFigmaLink(event.target.value)}
                      placeholder="https://www.figma.com/design/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a link from figma.com. Invalid links will be
                      rejected.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="github-link">
                      <Github size={15} className="mr-2 inline" />
                      GitHub Repository Link
                    </Label>
                    <Input
                      id="github-link"
                      type="url"
                      required
                      value={githubLink}
                      onChange={(event) => setGithubLink(event.target.value)}
                      placeholder="https://github.com/username/repository"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a repository link from github.com. Invalid links
                      will be rejected.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="project-files">
                      <FolderOpen size={15} className="mr-2 inline" />
                      Upload Files
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
                        PDF, Word, PowerPoint, ZIP, PNG, JPG, TXT and Figma
                        files
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
                              onClick={() => removeFile(index)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="font-bold">Ready to submit your tasks?</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Check your links and attachments before submitting.
                    All required fields must be completed.
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
              <h2 className="text-xl font-bold">Published Internship Tasks</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Additional instructions published by your internship team.
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
                Review the latest status and feedback for your submissions.
              </p>

              {submissions.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  You have not submitted any tasks yet.
                </p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {submissions.map((item) => (
                    <article
                      key={item.id || item.task_number}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-bold">
                            {TASK_TITLES[Number(item.task_number) - 1] ||
                              item.task_title ||
                              `Task ${item.task_number}`}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Submitted:{" "}
                            {item.submitted_at
                              ? new Date(item.submitted_at).toLocaleString()
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
                            Open Link <ExternalLink size={14} />
                          </a>
                        )}
                        {item.github_link && (
                          <a
                            href={normalizeUrl(item.github_link)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            GitHub Repository <ExternalLink size={14} />
                          </a>
                        )}
                        {item.linkedin_link && (
                          <a
                            href={normalizeUrl(item.linkedin_link)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            LinkedIn Post <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      {Array.isArray(item.files) && item.files.length > 0 && (
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
                                <span className="break-all">{file.name}</span>
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
                  ))}
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
