/**
 * Public site settings. Change these values here; do not put passwords or secret keys in this file.
 */
export const siteConfig = {
  companyName: "Internlytic Technologies",
  contactEmail: "internlytictechnologies@gmail.com",
  googleFormUrl: "https://forms.gle/zNGnQWfTZMxNCuRc9",
};

export const isConfiguredEmail = () =>
  Boolean(siteConfig.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siteConfig.contactEmail));

export const isConfiguredGoogleForm = () =>
  Boolean(siteConfig.googleFormUrl && /^https?:\/\//i.test(siteConfig.googleFormUrl));
