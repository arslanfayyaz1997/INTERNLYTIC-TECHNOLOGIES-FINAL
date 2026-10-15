import { ArrowRight, HelpCircle, Mail, MessageCircleQuestion, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import workflowConsultation from "@/assets/workflow-consultation.jpg";
import workflowDevelopment from "@/assets/workflow-development.jpg";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import { ApplyFormLink } from "@/components/InternshipApply";
import { siteConfig, isConfiguredEmail } from "@/lib/siteConfig";

const heroSlides = [{
  title: "Questions before",
  highlight: "you apply?",
  text: "Here's everything students ask us most — about eligibility, cost, timelines and what the internship actually looks like day to day.",
  image: heroTeamCutout,
  alt: "A student reading through internship frequently asked questions",
  icon: HelpCircle,
  statValue: "24/7",
  statLabel: "answers, no waiting"
}, {
  title: "Still unsure?",
  highlight: "Just ask us directly.",
  text: "Can't find your answer below? Our team replies to every email personally — no chatbots, no ticket queues.",
  image: workflowConsultation,
  alt: "A mentor answering a question from a candidate",
  icon: MessageCircleQuestion,
  statValue: "< 48 hrs",
  statLabel: "average email reply time"
}, {
  title: "Real people,",
  highlight: "real answers.",
  text: "Every question below comes from actual applicants — and every answer comes from our mentors and program team.",
  image: workflowDevelopment,
  alt: "The Internlytic team discussing intern questions",
  icon: Sparkles,
  statValue: "50+",
  statLabel: "questions answered monthly"
}];

const faqs = [{
  question: "Is the internship paid or unpaid?",
  answer: "Most tracks are unpaid, project-based internships focused on mentorship, live projects and portfolio outcomes. Some cohorts include performance-based stipends — your mentor will confirm what applies to your track when you're matched."
}, {
  question: "How much time do I need to commit each week?",
  answer: "Plan for a few focused hours per week between coding sessions, mentor check-ins and code review. The exact pace is flexible and set with your mentor based on your track and availability."
}, {
  question: "Do I need prior experience to apply?",
  answer: "No. Some tracks welcome complete beginners who are motivated to learn, while others (like Cloud & DevOps or Data Science) benefit from basic familiarity with the field. Your application will note what's helpful for each track."
}, {
  question: "Is the internship remote?",
  answer: "Yes, every track is fully remote. You'll work with your mentor and team through video calls, async check-ins and the same tools real distributed engineering teams use."
}, {
  question: "Will I get a certificate or reference?",
  answer: "You'll receive a completion certificate, and mentors who see strong, consistent work are happy to provide a LinkedIn recommendation or reference for future applications."
}, {
  question: "What happens after I submit my application?",
  answer: "You'll hear back within 5–7 days for a short mentor conversation, then be matched to a track and a live project. See the How It Works page for the full breakdown of every stage."
}, {
  question: "Can I switch courses after starting?",
  answer: "It's easiest to confirm your track before starting so your mentor can plan your roadmap, but talk to your mentor early if you feel a different field is a better fit — we'd rather you finish in the right track."
}];

export default function FAQPage() {
  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <PageHero eyebrow="Frequently asked questions" slides={heroSlides} primaryCta={<Button asChild variant="brand" size="xl">
              <ApplyFormLink>
                Apply Now <ArrowRight />
              </ApplyFormLink>
            </Button>} secondaryCta={<Button asChild variant="brandOutline" size="xl">
              <a href={isConfiguredEmail() ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.contactEmail)}` : "/contact"}>Ask us directly</a>
            </Button>} />

        <section className="border-b border-border px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">Got questions?</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Everything you're probably wondering
              </h2>
            </div>
            <Accordion type="single" collapsible className="mt-12 border-t border-border">
              {faqs.map((item, index) => <AccordionItem key={item.question} value={`faq-${index}`} className="border-border">
                  <AccordionTrigger className="py-5 text-left text-base font-bold text-brand-ink hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </section>

        <section className="section-grad-purple px-5 py-16 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 border border-brand-coral/25 bg-surface-coral p-10 text-center sm:p-14">
            <span className="grid size-14 place-items-center rounded-md bg-card text-brand-coral">
              <Mail className="size-6" />
            </span>
            <h2 className="max-w-2xl text-balance text-3xl font-extrabold text-brand-ink sm:text-4xl">
              Still have a question?
            </h2>
            <p className="max-w-xl leading-7 text-muted-foreground">
              Email our team directly — a real person from the program reads and replies to every
              message.
            </p>
            <Button asChild variant="brand" size="xl">
              <a href={isConfiguredEmail() ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.contactEmail)}` : "/contact"}>
                <Mail /> {isConfiguredEmail() ? siteConfig.contactEmail : "Contact us"}
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
