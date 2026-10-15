import { ArrowRight, Award, BadgeCheck, BarChart3, Blocks, BrainCircuit, Calendar, Check, Cloud, Code2, Cpu, Database, GraduationCap, LineChart, Mail, Palette, PenTool, Rocket, Server, Sparkles, Terminal, UserCheck, Wand2, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { ApplyButton } from "@/components/InternshipApply";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import workflowConsultation from "@/assets/workflow-consultation.jpg";
import workflowDevelopment from "@/assets/workflow-development.jpg";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import { ApplyFormLink } from "@/components/InternshipApply";
import { siteConfig, isConfiguredEmail } from "@/lib/siteConfig";

const topicImage = {
  ai: "https://images.unsplash.com/photo-1655635643617-72e0b62b9278?auto=format&fit=crop&w=800&q=80",
  dev: "https://images.unsplash.com/photo-1630524274689-2950ac0fc91e?auto=format&fit=crop&w=800&q=80",
  design: "https://images.unsplash.com/photo-1629752187687-3d3c7ea3a21b?auto=format&fit=crop&w=800&q=80",
  circuit: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  data: "https://images.unsplash.com/photo-1686061593213-98dad7c599b9?auto=format&fit=crop&w=800&q=80"
};

const heroSlides = [{
  title: "Applications open.",
  highlight: "Start this month.",
  text: "Fill out one short form, tell us your goals, and a mentor will place you on a track and a live project within days.",
  image: heroTeamCutout,
  alt: "A student filling out an internship application",
  icon: Calendar,
  statValue: "5–7 days",
  statLabel: "average response time"
}, {
  title: "No experience?",
  highlight: "That's the point.",
  text: "Our tracks are built for motivated beginners as much as working developers — mentors meet you at your current level.",
  image: workflowConsultation,
  alt: "A mentor talking through an application with a candidate",
  icon: UserCheck,
  statValue: "0",
  statLabel: "prior internships required"
}, {
  title: "Real seats,",
  highlight: "limited every cohort.",
  text: "Each cohort takes a limited number of interns per track so every mentor can actually review your code and your growth.",
  image: workflowDevelopment,
  alt: "Interns working together on a live project",
  icon: Rocket,
  statValue: "50+",
  statLabel: "projects delivered so far"
}];

const internshipTracks = [{
  accent: "violet",
  title: "AI & Data",
  blurb: "Best for students aiming at AI engineer, data analyst, and ML-enabled software roles.",
  stats: [{
    label: "Duration",
    value: "4 Weeks"
  }, {
    label: "Tools",
    value: "Python + ML Stack"
  }, {
    label: "Weekly Time",
    value: "8–10 Hours"
  }, {
    label: "Live Projects",
    value: "3+"
  }],
  badge: "Hands-on portfolio",
  checklist: ["3+ live projects", "Weekly mentor check-ins", "Completion certificate"],
  ctaLabel: "Get AI Roadmap",
  programs: [{
    icon: BrainCircuit,
    image: topicImage.ai,
    title: "Artificial Intelligence (AI)",
    text: "Build applied AI foundations with practical model workflows and evaluation methods.",
    highlights: ["Model training & evaluation", "Real dataset walkthroughs", "Portfolio-ready outcome"]
  }, {
    icon: Code2,
    image: topicImage.circuit,
    title: "Python Programming",
    text: "Strengthen Python problem-solving, automation, and production-grade coding practice.",
    highlights: ["Scripting & automation", "Clean, tested code reviews", "Production-style tasks"]
  }, {
    icon: BarChart3,
    image: topicImage.dev,
    title: "Data Science",
    text: "Apply data science workflows for modeling, validation, and business insight generation.",
    highlights: ["Feature engineering practice", "Model validation checkpoints", "Mentor code reviews"]
  }, {
    icon: Database,
    image: topicImage.data,
    title: "Data Analytics",
    text: "Translate raw business data into decision-ready reports and actionable dashboards.",
    highlights: ["Live dashboard building", "Stakeholder-ready reporting", "SQL & ETL practice"]
  }]
}, {
  accent: "blue",
  title: "Software & Cloud",
  blurb: "Ideal for building strong development fundamentals with deployment and cloud practices.",
  stats: [{
    label: "Duration",
    value: "4 Weeks"
  }, {
    label: "Focus",
    value: "Build + Deploy"
  }, {
    label: "Weekly Time",
    value: "9–11 Hours"
  }, {
    label: "Live Projects",
    value: "3+"
  }],
  badge: "Placement track",
  checklist: ["3+ live projects", "Deployment walkthroughs", "Peer + mentor review"],
  ctaLabel: "Get Dev Roadmap",
  programs: [{
    icon: Workflow,
    image: topicImage.dev,
    title: "Full Stack Development",
    text: "Develop end-to-end web applications using modern frontend and backend tooling.",
    highlights: ["Frontend + backend ownership", "Live deployment practice", "Code review feedback"]
  }, {
    icon: Terminal,
    image: topicImage.design,
    title: "Frontend Development",
    text: "Build performant interfaces with responsive design, accessibility, and component systems.",
    highlights: ["Component-driven UI builds", "Accessibility-first patterns", "Responsive layout practice"]
  }, {
    icon: Server,
    image: topicImage.circuit,
    title: "Backend Development",
    text: "Engineer backend services with APIs, databases, authentication, and deployment practices.",
    highlights: ["REST API design", "Auth & database practice", "Deployment walkthroughs"]
  }, {
    icon: Cloud,
    image: topicImage.data,
    title: "Java Programming",
    text: "Master Java fundamentals and build scalable applications and backend services.",
    highlights: ["Core Java fundamentals", "Scalable service design", "Hands-on backend tasks"]
  }]
}, {
  accent: "coral",
  title: "Design & Business",
  blurb: "Suited for students interested in UI/UX, product thinking, and business-facing outcomes.",
  stats: [{
    label: "Duration",
    value: "4 Weeks"
  }, {
    label: "Deliverables",
    value: "Case + Prototype"
  }, {
    label: "Weekly Time",
    value: "7–9 Hours"
  }, {
    label: "Live Projects",
    value: "3+"
  }],
  badge: "Creative + product",
  checklist: ["3+ live projects", "Portfolio case-study support", "Mentor design critique"],
  ctaLabel: "Get Design Roadmap",
  programs: [{
    icon: Palette,
    image: topicImage.design,
    title: "UI/UX Design",
    text: "Create user-centered digital experiences through research, prototyping, and testing.",
    highlights: ["User research & wireframes", "Usability testing rounds", "Portfolio case study"]
  }, {
    icon: LineChart,
    image: topicImage.data,
    title: "Digital Marketing",
    text: "Plan and execute measurable digital campaigns across channels and audience segments.",
    highlights: ["Multi-channel campaigns", "Performance reporting", "Audience segmentation practice"]
  }, {
    icon: BarChart3,
    image: topicImage.ai,
    title: "Stock Market Trading & Analysis",
    text: "Understand market behavior, technical analysis, and risk-aware trading strategies.",
    highlights: ["Technical analysis practice", "Risk-aware strategy design", "Market behavior study"]
  }, {
    icon: PenTool,
    image: topicImage.dev,
    title: "AutoCAD",
    text: "Develop drafting precision with industry-standard CAD tools for design projects.",
    highlights: ["Precision drafting drills", "Real project blueprints", "Industry-standard tools"]
  }]
}, {
  accent: "cyan",
  title: "Emerging Tech",
  blurb: "For learners exploring frontier domains and future-ready engineering skill sets.",
  stats: [{
    label: "Duration",
    value: "4 Weeks"
  }, {
    label: "Mode",
    value: "Mentor + Labs"
  }, {
    label: "Weekly Time",
    value: "8–10 Hours"
  }, {
    label: "Live Projects",
    value: "3+"
  }],
  badge: "Future skills",
  checklist: ["3+ live projects", "Innovation-first tasks", "Mentored experimentation"],
  ctaLabel: "Get Future Track Plan",
  programs: [{
    icon: Cpu,
    image: topicImage.circuit,
    title: "Internet of Things (IoT)",
    text: "Build connected-device solutions using sensors, edge integration, and data pipelines.",
    highlights: ["Sensor & edge integration", "Connected data pipelines", "Hands-on device labs"]
  }, {
    icon: Blocks,
    image: topicImage.dev,
    title: "Blockchain Technology",
    text: "Explore blockchain architecture, smart contracts, and decentralized application design.",
    highlights: ["Smart contract basics", "Decentralized app design", "Guided blockchain labs"]
  }, {
    icon: Wand2,
    image: topicImage.ai,
    title: "Prompt Engineering",
    text: "Design robust prompt systems for reliable AI outputs and real-world task execution.",
    highlights: ["Reliable prompt systems", "Real-world task testing", "AI agent experiments"]
  }, {
    icon: BrainCircuit,
    image: topicImage.design,
    title: "Robotics & Automation",
    text: "Apply automation logic and robotics concepts to control and workflow systems.",
    highlights: ["Automation logic practice", "Control system basics", "Guided robotics labs"]
  }]
}];

const eligibility = ["Currently a student, recent graduate, or self-taught and motivated to learn", "Comfortable committing a few focused hours per week to your project", "Basic familiarity with your chosen track is helpful, but not required", "A laptop and a stable internet connection to join mentor sessions", "Willingness to take and act on code review feedback", "English proficiency sufficient for written and video mentor sessions"];

export default function ApplyPage() {
  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <PageHero eyebrow="Apply for internship" slides={heroSlides} primaryCta={<Button asChild variant="brand" size="xl">
              <ApplyFormLink>Start your application <ArrowRight /></ApplyFormLink>
            </Button>} secondaryCta={<Button asChild variant="brandOutline" size="xl">
              <Link to="/courses">Browse courses</Link>
            </Button>} />

        <section className="services-section px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">Choose your track</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Internship programs across every track
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Every track pairs verified, mentor-led programs with live projects — pick a field
                below and apply directly to the internship that fits you.
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-8">
              {internshipTracks.map(track => <article key={track.title} data-accent={track.accent} className="apply-track">
                  <div className="apply-track-grid">
                    <div className="apply-track-panel">
                      <div className="apply-track-panel-head">
                        <h3>{track.title}</h3>
                        <span className="apply-track-count">{track.programs.length} Programs</span>
                      </div>
                      <p className="apply-track-blurb">{track.blurb}</p>
                      <dl className="apply-track-stats">
                        {track.stats.map(stat => <div key={stat.label} className="apply-track-stat">
                            <dt>{stat.label}</dt>
                            <dd>{stat.value}</dd>
                          </div>)}
                      </dl>
                      <span className="apply-track-pill">{track.badge}</span>
                      <ul className="apply-track-checklist">
                        {track.checklist.map(item => <li key={item}>
                            <Check aria-hidden="true" /> {item}
                          </li>)}
                      </ul>
                      <Button asChild variant="brandOutline" size="sm" className="apply-track-cta">
                        <Link to="/courses">{track.ctaLabel}</Link>
                      </Button>
                    </div>

                    <div className="apply-track-scroll">
                      {track.programs.map(({
                    icon: Icon,
                    image,
                    title,
                    text,
                    highlights
                  }) => <div key={title} className="program-card">
                          <div className="program-card-media">
                            <Icon aria-hidden="true" className="program-card-media-icon" />
                            {image && <img src={image} alt={`${title} internship topic`} loading="lazy" className="program-card-media-image" onError={e => {
                          e.currentTarget.style.display = "none";
                        }} />}
                            <span className="program-card-badge">
                              <BadgeCheck aria-hidden="true" /> Verified internship
                            </span>
                          </div>
                          <div className="program-card-body">
                            <h4>{title}</h4>
                            <span className="program-card-meta">Remote · Mentor-led · Industry-aligned</span>
                            <p>{text}</p>
                            {highlights && <ul className="program-card-highlights">
                                {highlights.map(item => <li key={item}>
                                    <Check aria-hidden="true" /> {item}
                                  </li>)}
                              </ul>}
                            <ApplyButton title={title} className="program-card-cta" fullWidth chipPlacement="top" />
                          </div>
                        </div>)}
                    </div>
                  </div>
                </article>)}
            </div>
          </div>
        </section>

        <section className="eligibility-section px-5 py-14 lg:px-8 lg:py-16">
          <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="eligibility-kicker">Before you apply</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight text-brand-ink sm:text-4xl">
                What you need to be eligible
              </h2>
              <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
                We keep the bar practical — motivation and consistency matter far more than
                a perfect resume.
              </p>
              <div className="eligibility-note">
                <span className="eligibility-note-icon">
                  <Award className="size-5" />
                </span>
                <p>Every accepted intern gets a dedicated mentor and a portfolio-ready outcome.</p>
              </div>
            </div>
            <div className="eligibility-list">
              {eligibility.map((item, index) => {
              const accent = ["violet", "blue", "coral", "cyan"][index % 4];
              return <div key={item} data-accent={accent} className="eligibility-item">
                    <span className="eligibility-item-icon">
                      <Check className="size-3.5" />
                    </span>
                    <p>{item}</p>
                  </div>;
            })}
            </div>
          </div>
        </section>

        <section className="section-grad-green px-5 py-16 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 border border-brand-coral/25 bg-surface-coral p-10 text-center sm:p-14">
            <span className="grid size-14 place-items-center rounded-md bg-card text-brand-coral">
              <Sparkles className="size-6" />
            </span>
            <h2 className="max-w-2xl text-balance text-3xl font-extrabold text-brand-ink sm:text-4xl">
              Ready to build something real?
            </h2>
            <p className="max-w-xl leading-7 text-muted-foreground">
              Applications are reviewed on a rolling basis — the sooner you apply, the sooner
              you're matched to a track and a mentor.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="brand" size="xl">
                <a href={isConfiguredEmail() ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.contactEmail)}` : "/contact"}>
                  <Mail /> Email us your interest
                </a>
              </Button>
              <Button asChild variant="brandOutline" size="xl">
                <Link to="/faq">
                  <GraduationCap /> Read the FAQs
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
