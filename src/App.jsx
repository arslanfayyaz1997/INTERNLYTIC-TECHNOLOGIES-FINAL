import { ArrowRight, BadgeCheck, Bug, CloudCog, ClipboardCheck, Code2, GraduationCap, Headphones, Layers3, ListChecks, MonitorCog, Play, Rocket, Smartphone, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { SiCoursera, SiFresh, SiGithub, SiGooglecloud, SiCisco, SiPaytm, SiSentry, SiSupabase, SiUdemy, SiZoho, SiReact, SiTensorflow, SiOpencv } from "react-icons/si";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import partnerArslan from "@/assets/partner-arslan.jpg";
import arslanFounderPhoto from "@/assets/arslan-founder-photo.jpg";
import workflowConsultation from "@/assets/workflow-consultation.jpg";
import workflowPlanning from "@/assets/workflow-planning.jpg";
import workflowDevelopment from "@/assets/workflow-development.jpg";
import workflowDeployment from "@/assets/workflow-deployment.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/layout";
import { ApplyButton, ApplyFormLink } from "@/components/InternshipApply";
const partnerGroups = ["All partners", "Technology", "Learning", "Campus network"];
const partners = [{
  name: "Google Cloud",
  category: "Technology",
  icon: SiGooglecloud,
  color: "partner-google"
}, {
  name: "Supabase",
  category: "Technology",
  icon: SiSupabase,
  color: "partner-supabase"
}, {
  name: "GitHub",
  category: "Technology",
  icon: SiGithub,
  color: "partner-github"
}, {
  name: "Sentry",
  category: "Technology",
  icon: SiSentry,
  color: "partner-sentry"
}, {
  name: "Freshworks",
  category: "Technology",
  icon: SiFresh,
  color: "partner-freshworks"
}, {
  name: "Zoho",
  category: "Technology",
  icon: SiZoho,
  color: "partner-zoho"
}, {
  name: "Cisco Networking Academy",
  category: "Learning",
  icon: SiCisco,
  color: "partner-ibm"
}, {
  name: "Coursera",
  category: "Learning",
  icon: SiCoursera,
  color: "partner-coursera"
}, {
  name: "Udemy",
  category: "Learning",
  icon: SiUdemy,
  color: "partner-udemy"
}, {
  name: "Paytm",
  category: "Campus network",
  icon: SiPaytm,
  color: "partner-paytm"
}];
const services = [{
  icon: SiReact,
  title: "Full Stack Web Development",
  text: "Intern on live web products end-to-end — from React and Next.js interfaces to Node.js APIs and databases — with a senior engineer reviewing every pull request.",
  tags: ["React", "Next.js", "Node.js", "APIs", "Mentorship", "MongoDB", "Deployment"]
}, {
  icon: SiTensorflow,
  title: "AI & Machine Learning",
  text: "Work alongside our AI team to design, train, and ship real machine learning features — building the kind of portfolio that gets interviews.",
  tags: ["ML Pipelines", "Training", "MLOps", "Real Projects", "Data Cleaning", "Deployment"]
}, {
  icon: SiOpencv,
  title: "Artificial Intelligence",
  text: "Go deeper into applied AI — computer vision, NLP, and intelligent automation — through guided, project-based internship sprints.",
  tags: ["Computer Vision", "NLP", "Automation", "Research", "Prompt Engineering", "AI Agents"]
}];
const workflowSteps = [{
  icon: ClipboardCheck,
  title: "Application & needs analysis",
  text: "We learn your goals and current skill level so we can match you to the right internship track and mentor.",
  image: workflowConsultation
}, {
  icon: ListChecks,
  title: "Planning & personalized roadmap",
  text: "Your mentor maps out a clear learning roadmap for your internship, with milestones and timelines you can track.",
  image: workflowPlanning
}, {
  icon: MonitorCog,
  title: "Design & hands-on development",
  text: "You design, build and ship real features on live projects — guided by senior engineers every step of the way.",
  image: workflowDevelopment
}, {
  icon: Bug,
  title: "Testing & quality review",
  text: "You rigorously test your own work for quality and performance, with code review feedback before anything ships.",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85"
}, {
  icon: Headphones,
  title: "Launch & career support",
  text: "Smooth project launch, a portfolio-ready outcome, and ongoing mentorship and career support after you finish.",
  image: workflowDeployment
}];
const foundingPartners = [{
  name: "Arslan Fayyaz",
  position: "Founder | CEO",
  image: partnerArslan,
  imagePosition: "center 20%",
  linkedin: "https://www.linkedin.com/in/arslan-fayyaz-3a4781214"
}];
const journeySteps = [{
  icon: Sparkles,
  label: "E-Commerce",
  title: "Full-Stack E-Commerce Platform",
  text: "Built and shipped a complete online store with cart, checkout and an admin dashboard — one of 50+ live projects our interns have delivered.",
  image: workflowConsultation,
  alt: "A completed e-commerce platform project built by Internlytic interns"
}, {
  icon: Users,
  label: "AI Agent",
  title: "AI-Powered Support Agent",
  text: "Designed and deployed a machine learning model that automates real customer replies — a production feature, not a classroom exercise.",
  image: workflowPlanning,
  alt: "An AI support agent project built by Internlytic interns"
}, {
  icon: Code2,
  label: "Mobile App",
  title: "Cross-Platform Mobile App",
  text: "Took a client mobile app from wireframe to app-store-ready release, with interns owning the UI, API integration and testing end-to-end.",
  image: workflowDevelopment,
  alt: "A cross-platform mobile app project built by Internlytic interns"
}, {
  icon: Rocket,
  label: "Dashboard",
  title: "Real-Time Analytics Dashboard",
  text: "Shipped a live analytics dashboard processing real user data — the kind of project that goes straight into a portfolio and a resume.",
  image: workflowDeployment,
  alt: "A real-time analytics dashboard project built by Internlytic interns"
}];
function JourneyShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;
    const timer = window.setInterval(() => {
      setActiveStep(current => (current + 1) % journeySteps.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeStep]);
  const activeJourney = journeySteps[activeStep];
  if (!activeJourney) return null;
  const ActiveIcon = activeJourney.icon;
  return <section id="courses" className="journey-showcase border-b border-border px-5 py-14 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="journey-heading">
          <p>Our project portfolio</p>
          <h2>
            50+ real projects, <span>built and shipped</span>
          </h2>
        </div>

        <div className="journey-stage">
          <div className="journey-copy" key={`copy-${activeStep}`}>
            <div className="journey-step-meta">
              <span>{String(activeStep + 1).padStart(2, "0")}</span>
              <span>{activeJourney.label}</span>
            </div>
            <span className="journey-icon" aria-hidden="true">
              <ActiveIcon />
            </span>
            <h3>{activeJourney.title}</h3>
            <p>{activeJourney.text}</p>
            <Button asChild variant="brand" size="lg" className={`journey-cta${activeStep === journeySteps.length - 1 ? " is-visible" : ""}`}>
              <Link to="/courses" tabIndex={activeStep === journeySteps.length - 1 ? 0 : -1} aria-hidden={activeStep !== journeySteps.length - 1}>
                View past projects <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="journey-visual" key={`visual-${activeStep}`}>
            <img src={activeJourney.image} width={1200} height={800} loading="lazy" alt={activeJourney.alt} />
            <div className="journey-image-label" aria-hidden="true">
              <span>Live project</span>
              <strong>{activeJourney.label}</strong>
            </div>
            <span className="journey-image-index" aria-hidden="true">
              0{activeStep + 1}
            </span>
          </div>
        </div>

        <div className="journey-nav" role="tablist" aria-label="Project journey stages">
          {journeySteps.map((step, index) => <button key={step.label} type="button" role="tab" aria-selected={activeStep === index} className={activeStep === index ? "is-active" : ""} onClick={() => setActiveStep(index)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.label}</strong>
              <i aria-hidden="true" />
            </button>)}
        </div>
      </div>
    </section>;
}
export default function HomePage() {
  const [partnerGroup, setPartnerGroup] = useState("All partners");
  const visiblePartners = partnerGroup === "All partners" ? partners : partners.filter(partner => partner.category === partnerGroup);
  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <section id="home" className="hero-section hero-purple relative overflow-hidden border-b border-border/60">
          <div className="hero-blob-shape absolute -left-24 top-16 size-72 rounded-[44%_56%_64%_36%/50%_42%_58%_50%]" aria-hidden="true" />
          <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-5 py-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/70 px-4 py-2 text-xs font-bold uppercase text-brand-ink">
                <Sparkles className="size-4" aria-hidden="true" /> World-Class Internship Platform
              </div>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.12] text-brand-ink sm:text-5xl lg:text-[3.4rem]">
                Global Internships Designed for <span className="text-primary">Practical Mastery,</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Empowering students and developers globally through hands-on project execution,
                expert mentorship, and industry-recognized credentials that recruiters trust.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="brand" size="xl">
                  <Link to="/apply">
                    Explore internships <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="brandOutline" size="xl">
                  <Link to="/how-it-works">
                    <Play /> See how it works
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hero-blueprint relative mx-auto w-full max-w-2xl overflow-hidden border border-primary/20 p-5 sm:p-8 lg:justify-self-end">
              <div className="hero-photo-frame relative mx-auto mt-9 w-[88%] sm:w-[84%]">
                <img src={heroTeamCutout} width={1200} height={1200} alt="Young technology interns collaborating around a laptop" className="aspect-[4/3] w-full object-cover" />
                <span className="hero-photo-cross hero-photo-cross-left" aria-hidden="true" />
                <span className="hero-photo-cross hero-photo-cross-right" aria-hidden="true" />
              </div>
              <div className="hero-connector" aria-hidden="true">
                <span />
              </div>
              <div className="float-blueprint absolute bottom-5 left-4 flex items-center gap-3 border border-primary/20 bg-card/95 p-4 shadow-soft sm:bottom-8 sm:left-7">
                <span className="grid size-11 place-items-center bg-secondary text-primary">
                  <GraduationCap />
                </span>
                <span>
                  <strong className="block font-display text-lg text-brand-ink">200+</strong>
                  <span className="text-xs font-semibold text-muted-foreground">
                    students mentored
                  </span>
                </span>
              </div>
              <div className="float-blueprint absolute right-4 top-6 flex items-center gap-3 border border-primary/20 bg-card/95 p-4 shadow-soft sm:right-7">
                <span className="grid size-11 shrink-0 place-items-center bg-secondary text-primary">
                  <Rocket />
                </span>
                <span>
                  <strong className="block text-xs uppercase text-primary">Live projects</strong>
                  <span className="text-[0.65rem] font-semibold text-muted-foreground">
                    Portfolio-ready work
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="my-portfolio" className="relative overflow-hidden border-b border-border/70 bg-secondary/35 px-5 py-14 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-3xl border border-primary/20 bg-card p-6 shadow-soft sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-primary">Founder portfolio</p>
              <h2 className="max-w-2xl text-balance text-3xl font-extrabold leading-tight text-brand-ink sm:text-4xl">Explore Arslan Fayyaz’s <span className="text-primary">3D Portfolio</span></h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Discover my personal work, featured projects, web development skills, UI/UX designs, and interactive digital experiences in my dedicated 3D portfolio.</p>
              <a href="https://porfolio-arslanfayyaz.vercel.app/" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                View My Portfolio <ArrowRight className="size-5" aria-hidden="true" />
              </a>
            </div>
            <div className="group relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-secondary p-8 text-center transition-transform hover:-translate-y-1 sm:min-h-64">
              <div className="absolute -right-12 -top-12 size-44 rounded-full border border-primary/25 transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />
              <div className="absolute -bottom-16 -left-10 size-48 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
              <div className="relative flex w-full flex-col items-center">
                <img
                  src={arslanFounderPhoto}
                  alt="Arslan Fayyaz — Founder of Internlytic Technologies"
                  className="mb-4 h-36 w-32 rounded-2xl border border-primary/20 object-cover object-top shadow-soft sm:h-40 sm:w-36"
                  loading="lazy"
                />
                <span className="block text-xl font-extrabold text-brand-ink">Arslan Fayyaz</span>
                <span className="mt-2 block text-sm font-semibold text-muted-foreground">Full Stack - MERN Developer</span>
                <span className="mt-1 block text-sm font-semibold text-muted-foreground">UI/UX Designer</span>
                <a href="https://porfolio-arslanfayyaz.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open Arslan Fayyaz's 3D portfolio in a new tab" className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Open My 3D Portfolio <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="internships" className="career-gallery relative overflow-hidden border-b border-border/70 px-5 py-14 sm:py-16 lg:px-8 lg:py-16">
          <div id="career-fields" className="relative mx-auto max-w-7xl">
            <div className="career-gallery-heading mx-auto max-w-4xl text-center">
              <p className="career-gallery-kicker">Internships available</p>
              <h2>Open Positions. Choose Your Track</h2>
              <p className="career-gallery-lead">
                Six focused internship tracks, each built around live projects, expert
                mentors and outcomes recruiters actually recognize.
              </p>
            </div>
            <div className="career-gallery-grid">
              {[{
              image: "https://images.unsplash.com/photo-1655635643617-72e0b62b9278?auto=format&fit=crop&w=800&q=85",
              title: "Artificial Intelligence",
              text: "Build and deploy real AI/ML models under the guidance of working engineers who ship production systems."
            }, {
              image: "https://images.unsplash.com/photo-1630524274689-2950ac0fc91e?auto=format&fit=crop&w=800&q=85",
              title: "Full Stack Web Development",
              text: "Ship production-grade web applications end-to-end, from React interfaces to Node.js APIs and databases."
            }, {
              image: "https://images.unsplash.com/photo-1629752187687-3d3c7ea3a21b?auto=format&fit=crop&w=800&q=85",
              title: "UI/UX Design",
              text: "Design polished, user-centered interfaces backed by real research, wireframing and usability testing."
            }, {
              image: "https://images.unsplash.com/photo-1760548425425-e42e77fa38f1?auto=format&fit=crop&w=800&q=85",
              title: "Front End Development",
              text: "Craft fast, responsive interfaces with React under mentors who ship pixel-perfect, production-ready UI every day."
            }, {
              image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&w=800&q=85",
              title: "Machine Learning",
              text: "Train, evaluate and deploy real ML models — from data prep to production — guided by mentors who ship models for a living."
            }, {
              image: "https://images.unsplash.com/photo-1762330465857-07e4c81c0dfa?auto=format&fit=crop&w=800&q=85",
              title: "Prompt Engineering",
              text: "Master the craft of designing, testing and refining prompts to get reliable, production-grade results from real AI systems."
            }].map(({
              image,
              title,
              text
            }) => <article key={title} className="career-gallery-card">
                  <div className="career-gallery-card-media">
                    <img src={image} alt={`${title} internship track`} loading="lazy" />
                    <span className="career-gallery-card-badge">
                      <BadgeCheck aria-hidden="true" /> Verified
                    </span>
                  </div>
                  <div className="career-gallery-card-body">
                    <span className="career-gallery-card-tag">Internship</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <ApplyButton title={title} className="career-gallery-card-cta" withArrow />
                  </div>
                </article>)}
            </div>
            <div className="career-gallery-action">
              <span aria-hidden="true" />
              <Button asChild variant="brand" size="xl">
                <Link to="/apply">Begin your journey <ArrowRight /></Link>
              </Button>
              <span aria-hidden="true" />
            </div>
          </div>
        </section>
        <section id="services" className="services-section tracks-offer-section px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">Our Services</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Internship Tracks We Offer
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Real internships, real mentors, real projects — pick a track and start building
                a portfolio recruiters actually notice.
              </p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map(({
              icon: Icon,
              title,
              text,
              tags
            }, index) => <article key={title} id={`service-${index + 1}`} className="expertise-card group flex min-h-[350px] flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-coral/40">
                  <div className="flex flex-1 flex-col p-6">
                  <span className="expertise-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className={`grid size-14 shrink-0 place-items-center rounded-md ${index % 3 === 1 ? "bg-surface-coral text-brand-coral" : "bg-surface-mint text-primary"}`}>
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-brand-ink sm:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {tags.map(tag => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground/70">
                        {tag}
                      </span>)}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
                    <Button asChild variant="brand" size="sm">
                      <ApplyFormLink>Apply Now <ArrowRight className="size-4" /></ApplyFormLink>
                    </Button>
                    <a href={`#service-${index + 1}`} className="text-sm font-semibold text-muted-foreground underline decoration-border underline-offset-4 hover:text-brand-coral">
                      View details
                    </a>
                  </div>
                  </div>
                </article>)}
            </div>
            <div className="mt-12 flex justify-center">
              <Button asChild variant="brand" size="xl">
                <Link to="/apply">
                  Explore More Internships <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="workflow" className="workflow-section border-y border-border px-5 py-14 lg:px-14 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div className="max-w-xl text-left lg:sticky lg:top-28">
              <p className="text-sm font-bold uppercase text-brand-ink">How your internship works</p>
              <h2 className="mt-3 text-balance text-4xl font-extrabold leading-tight text-brand-ink sm:text-6xl">
                Our 5-step workflow
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
                From application to launch, every intern follows a clear, mentor-guided path —
                built for real skills and real outcomes.
              </p>
              <div className="mt-8 h-1 w-16 rounded-full bg-brand-coral" aria-hidden="true" />
            </div>
            <div id="workflow-steps" className="relative w-full max-w-[760px] min-w-0 justify-self-end">
              {workflowSteps.map(({
              icon: Icon,
              title,
              text,
              image
            }, index) => <article key={title} className="workflow-card sticky overflow-hidden border border-brand-coral/25 bg-card shadow-workflow">
                  <div className="grid md:grid-cols-[0.9fr_1.1fr]">
                    <div className="relative min-h-56 overflow-hidden md:min-h-80">
                      <img src={image} width={1200} height={720} loading="lazy" alt={`${title} stage of the Internlytic Technologies workflow`} className="absolute inset-0 size-full object-cover" />
                      <span className="absolute left-4 top-4 rounded-sm bg-brand-coral px-3 py-1.5 font-display text-[0.65rem] font-extrabold uppercase text-primary-foreground shadow-coral">
                        Step {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex min-h-64 flex-col justify-center p-7 sm:p-10">
                      <span className="grid size-11 place-items-center rounded-md bg-surface-coral text-brand-coral">
                        <Icon className="size-5" />
                      </span>
                      <p className="mt-7 text-xs font-bold uppercase text-brand-coral">
                        From idea to impact
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold text-brand-ink sm:text-3xl">
                        {title}
                      </h3>
                      <p className="mt-4 leading-7 text-muted-foreground">{text}</p>
                    </div>
                  </div>
                </article>)}
            </div>
          </div>
        </section>


        <JourneyShowcase />

        <section id="founding-partners" className="founders-section relative overflow-hidden px-5 py-14 lg:px-8 lg:py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="founders-heading-grid">
              <p className="founders-kicker">Founder & Leadership</p>
              <h2 className="founders-title">Meet the Founder</h2>
              <p className="founders-intro">Internlytic Technologies was founded by Arslan Fayyaz with a focus on practical learning, meaningful projects, and accessible technology opportunities for aspiring professionals.</p>
            </div>

            <div className="founders-grid founders-grid-single">
              {foundingPartners.map(partner => <article key={partner.name} className="founder-profile group">
                  <div className="founder-portrait-wrap">
                    <div className="founder-portrait">
                      <img src={partner.image} width={640} height={800} loading="lazy" alt={`${partner.name}, ${partner.position} at Internlytic Technologies`} style={partner.imagePosition ? { objectPosition: partner.imagePosition } : undefined} />
                    </div>
                  </div>
                  <div className="founder-details">
                    <div>
                      <h3>{partner.name}</h3>
                      <p className="founder-position">{partner.position}</p>
                    </div>
                    <a href={partner.linkedin} target="_blank" rel="noreferrer" className="founder-linkedin founder-linkedin-real" aria-label={`Open ${partner.name}'s LinkedIn profile`} title={`${partner.name} on LinkedIn`}>
                      <FaLinkedin aria-hidden="true" />
                    </a>
                  </div>
                </article>)}
            </div>
          </div>
        </section>

        <section id="partners" className="partners-section border-y border-border px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">
                The platform behind every internship
              </p>
              <h2 className="mx-auto mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Tools, Partners &amp; Campus Network
              </h2>
              <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">
                Industry platforms and learning partners connected in one practical talent
                platform — the same tools our interns use on real projects.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter partners">
              {partnerGroups.map(group => <Button key={group} type="button" variant={partnerGroup === group ? "orange" : "brandOutline"} size="sm" onClick={() => setPartnerGroup(group)}>
                  {group}
                </Button>)}
            </div>
            <div className="partner-marquee mt-12" aria-live="polite">
              <div className="partner-track">
                {[...visiblePartners, ...visiblePartners].map(({
                name,
                icon: PartnerIcon,
                color
              }, index) => <article key={`${name}-${index}`} aria-hidden={index >= visiblePartners.length} className="partner-logo group flex h-20 w-44 shrink-0 items-center gap-3 border border-border bg-card px-4 shadow-soft">
                      <PartnerIcon className={`size-8 shrink-0 ${color}`} aria-hidden="true" />
                      <h3 className="text-sm font-extrabold leading-tight text-brand-ink">
                        {name}
                      </h3>
                    </article>)}
              </div>
            </div>
            <div className="mt-10 flex items-center justify-center gap-3 text-center text-sm font-semibold text-muted-foreground">
              <span className="h-px w-12 bg-brand-coral/35" aria-hidden="true" />
              One network. Real tools. Career-ready outcomes.
              <span className="h-px w-12 bg-brand-coral/35" aria-hidden="true" />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>;
}
