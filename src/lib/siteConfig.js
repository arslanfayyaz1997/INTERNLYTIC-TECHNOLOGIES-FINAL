/**
 * Internlytic Technologies site settings.
 * Add your own official contact email and Google Form URL here when ready.
 */
export const siteConfig = {
  companyName: "Internlytic Technologies",
  contactEmail: "",
  googleFormUrl: "",
};

export const isConfiguredEmail = () =>
  Boolean(siteConfig.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siteConfig.contactEmail));

export const isConfiguredGoogleForm = () =>
  Boolean(siteConfig.googleFormUrl && /^https?:\/\//i.test(siteConfig.googleFormUrl));
