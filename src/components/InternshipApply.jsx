import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { internshipApplyFormUrl, isConfiguredGoogleForm } from "@/lib/internships";
import { cn } from "@/lib/utils";

/** Shared application link used by Apply Now buttons throughout the site. */
export function ApplyFormLink({ children, onClick, ...props }) {
  const handleClick = event => {
    if (!isConfiguredGoogleForm()) {
      event.preventDefault();
      window.alert("Add your new Internlytic Google Form URL in src/lib/siteConfig.js first.");
      return;
    }
    onClick?.(event);
  };
  return <a href={isConfiguredGoogleForm() ? internshipApplyFormUrl : "#"} target={isConfiguredGoogleForm() ? "_blank" : undefined} rel="noreferrer" onClick={handleClick} {...props}>{children}</a>;
}

export function ApplyButton({ title, className, fullWidth = false, withArrow = false }) {
  const wrapperClass = cn("relative", fullWidth ? "flex w-full" : "inline-flex", className);
  const buttonClass = fullWidth ? "w-full" : undefined;
  const arrow = withArrow ? <ArrowRight /> : null;

  return <span className={wrapperClass}>
    <Button asChild variant="brand" size="sm" className={buttonClass}>
      <ApplyFormLink>Apply Now {arrow}</ApplyFormLink>
    </Button>
  </span>;
}
