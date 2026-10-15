import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyFormLink } from "@/components/InternshipApply";

/** Course enrollment CTA intentionally routes to the official shared application form. */
export function BuyNowDialog({ course, triggerClassName }) {
  return (
    <Button asChild type="button" variant="brandOutline" size="sm" className={triggerClassName}>
      <ApplyFormLink aria-label={`Apply for ${course} using the Internlytic form`}>
        Buy Now <ArrowUpRight className="ml-1 size-4" />
      </ApplyFormLink>
    </Button>
  );
}
