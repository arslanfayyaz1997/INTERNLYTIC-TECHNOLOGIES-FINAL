import { ArrowRight, Bug, ClipboardCheck, Compass, Headphones, ListChecks, MonitorCog, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import workflowPlanning from "@/assets/workflow-planning.jpg";
import workflowDeployment from "@/assets/workflow-deployment.jpg";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import { ApplyFormLink } from "@/components/InternshipApply";

const heroSlides = [{
  title: "From application",
  highlight: "to shipped code.",
  text: "Every internship follows the same clear, mentor-guided path — no guesswork about what happens next.",
  image: heroTeamCutout,
  alt: "An intern following a mentor-guided roadmap",
  icon: Compass,
  statValue: "5",
  statLabel: "guided stages"
}, {
  title: "Real code review,",
  highlight: "every single step.",
  text: "Senior engineers review your pull requests the way a real engineering team would — feedback you can act on immediately.",
  image: workflowPlanning,
  alt: "A senior engineer reviewing a pull request with an intern",
  icon: ShieldCheck,
  statValue: "100%",
  statLabel: "of projects code-reviewed"
}, {
  title: "You finish with",
  highlight: "something to show for it.",
  text: "Every track ends in a launched feature or product, plus career support to help you turn it into your next opportunity.",
  image: workflowDeployment,
  alt: "A completed project ready for launch",
  icon: Trophy,
  statValue: "50+",
  statLabel: "projects launched"
}];

const timeline = [{
  icon: ClipboardCheck,
  title: "Application & needs analysis",
  text: "We learn your goals and current skill level so we can match you to the right internship track and mentor."
}, {
  icon: ListChecks,
  title: "Planning & personalized roadmap",
  text: "Your mentor maps out a clear learning roadmap for your internship, with milestones and timelines you can track."
}, {
  icon: MonitorCog,
  title: "Design & hands-on development",
  text: "You design, build and ship real features on live projects — guided by senior engineers every step of the way."
}, {
  icon: Bug,
  title: "Testing & quality review",
  text: "You rigorously test your own work for quality and performance, with code review feedback before anything ships."
}, {
  icon: Headphones,
  title: "Launch & career support",
  text: "Smooth project launch, a portfolio-ready outcome, and ongoing mentorship and career support after you finish."
}];

const differentiators = [{
  icon: Users,
  title: "Real mentors, not modules",
  text: "You're paired with a working engineer, designer or analyst — not a pre-recorded course."
}, {
  icon: Sparkles,
  title: "Live projects, not exercises",
  text: "Every track ships onto a real product, so your work is judged the way production code is judged."
}, {
  icon: Trophy,
  title: "Outcomes, not just certificates",
  text: "You leave with pull requests, a portfolio and career support — proof recruiters can actually check."
}];

export default function HowItWorksPage() {
  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <PageHero eyebrow="How it works" slides={heroSlides} primaryCta={<Button asChild variant="brand" size="xl">
              <ApplyFormLink>
                Apply Now <ArrowRight />
              </ApplyFormLink>
            </Button>} secondaryCta={<Button asChild variant="brandOutline" size="xl">
              <Link to="/courses">Explore courses</Link>
            </Button>} />

        <section className="border-b border-border px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">The path</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Five stages, one mentor-guided path
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Every intern, on every track, moves through the same clear stages from day one to
                launch day.
              </p>
            </div>
            <div className="howitworks-timeline mt-14">
              {timeline.map(({
              icon: Icon,
              title,
              text
            }, index) => <div key={title} className="howitworks-timeline-item">
                  <div className="howitworks-timeline-marker">
                    <span className="howitworks-timeline-icon">
                      <Icon className="size-5" />
                    </span>
                    {index < timeline.length - 1 && <span className="howitworks-timeline-line" aria-hidden="true" />}
                  </div>
                  <div className="howitworks-timeline-body">
                    <span className="howitworks-timeline-step">Stage {String(index + 1).padStart(2, "0")}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </section>

        <section className="services-section px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">Why it works</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                What makes this different from a course
              </h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {differentiators.map(({
              icon: Icon,
              title,
              text
            }) => <article key={title} className="expertise-card group flex min-h-[260px] flex-col overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-coral/40">
                  <span className="grid size-14 shrink-0 place-items-center rounded-md bg-surface-mint text-primary">
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-brand-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
                </article>)}
            </div>
            <div className="mt-12 flex justify-center">
              <Button asChild variant="brand" size="xl">
                <ApplyFormLink>
                  Start your internship <ArrowRight />
                </ApplyFormLink>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
