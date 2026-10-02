/**
 * Internships that are currently open for applications, plus a helper used by
 * the Home page and the Apply page.
 *
 * Every other internship is shown as "Coming soon".
 */

/* Add the new Internlytic application Google Form in src/lib/siteConfig.js. */
import { siteConfig, isConfiguredGoogleForm } from "@/lib/siteConfig";
export const internshipApplyFormUrl = siteConfig.googleFormUrl;
export { isConfiguredGoogleForm };

/**
 * The 6 open internships. `title` is the canonical name stored on the user's
 * profile; `aliases` are the other spellings used on different pages so the
 * same internship is always recognised (and never applied to twice).
 */
const OPEN_INTERNSHIPS = [{
  title: "Artificial Intelligence",
  track: "AI & Data",
  aliases: ["Artificial Intelligence (AI)", "AI"]
}, {
  title: "Full Stack Web Development",
  track: "Software & Cloud",
  aliases: ["Full Stack Development"]
}, {
  title: "UI/UX Design",
  track: "Design & Business",
  aliases: []
}, {
  title: "Front End Development",
  track: "Software & Cloud",
  aliases: ["Frontend Development"]
}, {
  title: "Machine Learning",
  track: "AI & Data",
  aliases: []
}, {
  title: "Prompt Engineering",
  track: "Emerging Tech",
  aliases: []
}];

function findOpenInternship(title) {
  const needle = String(title ?? "").trim().toLowerCase();
  if (!needle) return null;
  return OPEN_INTERNSHIPS.find(item => [item.title, ...item.aliases].some(name => name.toLowerCase() === needle)) ?? null;
}

/** Returns the canonical internship title for any known spelling, or null. */
export function getOpenInternship(title) {
  return findOpenInternship(title)?.title ?? null;
}

export function isOpenInternship(title) {
  return getOpenInternship(title) !== null;
}
