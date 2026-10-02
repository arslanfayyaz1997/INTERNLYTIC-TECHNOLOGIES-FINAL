/**
 * Lightweight front-end auth + profile store.
 *
 * There is no backend in this project yet, so accounts and profile data are
 * kept in localStorage. Swapping this file for real API calls later is enough
 * to make the Login / Register / Profile pages production-ready.
 */

const USERS_KEY = "internlytic.users";
const SESSION_KEY = "internlytic.session";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getUsers() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(USERS_KEY), []);
}

function saveUsers(users) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function emptyProfile(overrides = {}) {
  return {
    fullName: "",
    email: "",
    password: "",
    headline: "",
    phone: "",
    city: "",
    country: "",
    dateOfBirth: "",
    about: "",
    university: "",
    degree: "",
    fieldOfStudy: "",
    graduationYear: "",
    cgpa: "",
    course: "",
    duration: "3 months",
    workMode: "Remote",
    availability: "",
    startDate: "",
    skills: "",
    linkedin: "",
    github: "",
    portfolio: "",
    resumeName: "",
    resumeData: "",
    resumeType: "",
    resumeSize: 0,
    resumeUploadedAt: "",
    applications: [],
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function registerUser({ fullName, email, password }) {
  const users = getUsers();
  const exists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user = emptyProfile({ fullName, email, password });
  saveUsers([...users, user]);
  window.localStorage.setItem(SESSION_KEY, email.toLowerCase());
  return { ok: true, user };
}

export function loginUser({ email, password }) {
  const user = getUsers().find(item => item.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return { ok: false, error: "Email or password is incorrect." };
  }
  window.localStorage.setItem(SESSION_KEY, user.email.toLowerCase());
  return { ok: true, user };
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return getUsers().find(user => user.email.toLowerCase() === email) ?? null;
}

export function updateCurrentUser(patch) {
  const current = getCurrentUser();
  if (!current) return null;
  const users = getUsers().map(user => user.email.toLowerCase() === current.email.toLowerCase() ? { ...user, ...patch } : user);
  saveUsers(users);
  return getCurrentUser();
}

export function logoutUser() {
  window.localStorage.removeItem(SESSION_KEY);
}

/**
 * Verifies the current password and, if correct, saves the new one.
 * Returns { ok, error }.
 */
export function changePassword({ currentPassword, newPassword }) {
  const current = getCurrentUser();
  if (!current) return { ok: false, error: "You need to be logged in." };
  if (current.password !== currentPassword) {
    return { ok: false, error: "Current password is incorrect." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "New password must be at least 6 characters." };
  }
  updateCurrentUser({ password: newPassword });
  return { ok: true };
}

/**
 * Records a real internship application against the logged-in user's
 * profile so it shows up on their dashboard. Prevents duplicate applications
 * to the exact same program.
 */
export function applyToInternship({ track, program }) {
  const current = getCurrentUser();
  if (!current) return { ok: false, error: "You need to be logged in to apply." };
  const applications = Array.isArray(current.applications) ? current.applications : [];
  const alreadyApplied = applications.some(item => item.program === program);
  if (alreadyApplied) {
    return { ok: true, duplicate: true, user: current };
  }
  const application = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    track,
    program,
    status: "Under review",
    appliedAt: new Date().toISOString()
  };
  const updated = updateCurrentUser({ applications: [...applications, application] });
  return { ok: true, duplicate: false, user: updated };
}

export function withdrawApplication(applicationId) {
  const current = getCurrentUser();
  if (!current) return null;
  const applications = Array.isArray(current.applications) ? current.applications : [];
  return updateCurrentUser({ applications: applications.filter(item => item.id !== applicationId) });
}

/* Fields that count towards the profile completion meter. */
const COMPLETION_FIELDS = ["fullName", "email", "headline", "phone", "city", "country", "about", "university", "degree", "fieldOfStudy", "graduationYear", "course", "availability", "startDate", "skills", "linkedin", "github", "resumeName"];

export function profileCompletion(user) {
  if (!user) return 0;
  const filled = COMPLETION_FIELDS.filter(field => String(user[field] ?? "").trim() !== "").length;
  return Math.round(filled / COMPLETION_FIELDS.length * 100);
}
