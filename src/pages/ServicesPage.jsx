import { useState } from "react";
import { ArrowRight, Bot, BrainCircuit, Cloud, Code2, Coffee, Compass, Database, FileCode2, LayoutTemplate, Link2, Megaphone, Palette, Server, ShieldCheck, Sparkles, TrendingUp, Wand2, Wifi, Wrench, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import workflowDevelopment from "@/assets/workflow-development.jpg";
import workflowDeployment from "@/assets/workflow-deployment.jpg";
import workflowPlanning from "@/assets/workflow-planning.jpg";
import workflowConsultation from "@/assets/workflow-consultation.jpg";
import { ApplyFormLink } from "@/components/InternshipApply";

const heroSlides = [{
  title: "Services built",
  highlight: "around real mentorship.",
  text: "Beyond internships, our mentors and engineers offer hands-on services that turn learning into shipped, portfolio-ready outcomes.",
  image: heroTeamCutout,
  alt: "Mentors and interns collaborating on a service delivery",
  icon: Wrench,
  statValue: "6",
  statLabel: "core service areas"
}, {
  title: "From roadmap",
  highlight: "to real deployment.",
  text: "Every service pairs structured guidance with a live project, so what you build actually ends up in production, not a sandbox.",
  image: workflowDevelopment,
  alt: "A developer shipping a live feature",
  icon: Zap,
  statValue: "50+",
  statLabel: "projects delivered"
}, {
  title: "Guided by people",
  highlight: "who do this daily.",
  text: "Every service is led by practitioners actively working in that field — not instructors reading from a syllabus.",
  image: workflowDeployment,
  alt: "A senior engineer guiding a team",
  icon: ShieldCheck,
  statValue: "1,200+",
  statLabel: "students mentored"
}];

const serviceOfferings = [{
  icon: Code2,
  title: "Full Stack Development",
  text: "End-to-end web builds — React front ends, Node.js APIs, and databases — delivered with clean, reviewed, production-ready code.",
  image: "https://images.unsplash.com/photo-1630524274689-2950ac0fc91e?auto=format&fit=crop&w=800&q=85",
  alt: "Engineers building a full stack web application",
  tags: ["React", "Node.js", "APIs"]
}, {
  icon: BrainCircuit,
  title: "AI & Machine Learning",
  text: "Model design, training and deployment support for teams and learners who want real, working AI features, not just demos.",
  image: "https://images.unsplash.com/photo-1655635643617-72e0b62b9278?auto=format&fit=crop&w=800&q=85",
  alt: "A team reviewing a machine learning model together",
  tags: ["Python", "Models", "Deployment"]
}, {
  icon: Palette,
  title: "UI/UX & Product Design",
  text: "Research-backed interface design, wireframing and usability testing that turns rough ideas into polished, usable products.",
  image: "https://images.unsplash.com/photo-1629752187687-3d3c7ea3a21b?auto=format&fit=crop&w=800&q=85",
  alt: "Designers reviewing product wireframes",
  tags: ["Figma", "Wireframes", "Testing"]
}, {
  icon: ShieldCheck,
  title: "Cybersecurity Guidance",
  text: "Threat modeling, secure code review and practical defense drills to help teams and learners think like real defenders.",
  image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=85",
  alt: "A security specialist reviewing systems in an office",
  tags: ["Threat models", "Audits", "Defense"]
}, {
  icon: Cloud,
  title: "Cloud & DevOps Setup",
  text: "Infrastructure provisioning, CI/CD pipelines and deployment automation built the way real engineering teams run production.",
  image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=85",
  alt: "An engineer mapping out a deployment pipeline",
  tags: ["CI/CD", "Docker", "Cloud"]
}, {
  icon: Database,
  title: "Data & Analytics",
  text: "Turning messy, real-world data into dashboards, pipelines and models that support clear, confident decisions.",
  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85",
  alt: "An analyst reviewing a live data dashboard",
  tags: ["SQL", "Dashboards", "Pipelines"]
}];

const moreServiceOfferings = [{
  icon: FileCode2,
  title: "Python Programming",
  text: "Core-to-advanced Python guidance — scripting, OOP and libraries — built through real, reviewed mini-projects.",
  image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=85",
  alt: "A screen showing Python code",
  tags: ["Python", "Scripting", "OOP"]
}, {
  icon: LayoutTemplate,
  title: "Frontend Development",
  text: "Interactive, responsive interfaces built with modern React patterns, component libraries and accessible markup.",
  image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=85",
  alt: "A developer building a responsive user interface",
  tags: ["React", "UI", "Responsive"]
}, {
  icon: Server,
  title: "Backend Development",
  text: "Reliable server-side systems — APIs, authentication and databases — designed to scale beyond a demo.",
  image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=85",
  alt: "Server infrastructure powering a backend system",
  tags: ["APIs", "Auth", "Databases"]
}, {
  icon: Coffee,
  title: "Java Programming",
  text: "Object-oriented Java fundamentals through to enterprise patterns, built with hands-on, mentor-reviewed exercises.",
  image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=85",
  alt: "A developer writing Java code on a laptop",
  tags: ["Java", "OOP", "Enterprise"]
}, {
  icon: Megaphone,
  title: "Digital Marketing",
  text: "Campaign strategy, SEO and social growth guidance that turns marketing theory into measurable results.",
  image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=85",
  alt: "A marketer reviewing campaign analytics",
  tags: ["SEO", "Campaigns", "Analytics"]
}, {
  icon: TrendingUp,
  title: "Stock Market Trading & Analysis",
  text: "Practical guidance on market fundamentals, technical analysis and building a disciplined trading approach.",
  image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=85",
  alt: "A trading chart being analyzed on a screen",
  tags: ["Markets", "Charts", "Strategy"]
}, {
  icon: Compass,
  title: "AutoCAD",
  text: "Technical drafting and 2D/3D design guidance for learners moving from sketches to production-ready drawings.",
  image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=85",
  alt: "A technical drawing being drafted",
  tags: ["Drafting", "2D/3D", "Design"]
}, {
  icon: Wifi,
  title: "Internet of Things (IoT)",
  text: "Connected-device projects spanning sensors, microcontrollers and the cloud dashboards that bring them to life.",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85",
  alt: "A circuit board used in an IoT project",
  tags: ["Sensors", "Hardware", "Cloud"]
}, {
  icon: Link2,
  title: "Blockchain Technology",
  text: "Smart contract fundamentals and decentralized app development guided by engineers building on real chains.",
  image: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=800&q=85",
  alt: "An abstract visualization of blockchain technology",
  tags: ["Smart contracts", "Web3", "DApps"]
}, {
  icon: Wand2,
  title: "Prompt Engineering",
  text: "Structured techniques for getting reliable, high-quality output from modern AI models in real applications.",
  image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=85",
  alt: "A person working with an AI chat interface",
  tags: ["LLMs", "AI tools", "Workflows"]
}, {
  icon: Bot,
  title: "Robotics & Automation",
  text: "Hands-on robotics fundamentals — sensors, actuators and control logic — for learners building real automated systems.",
  image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=85",
  alt: "A robotic arm used in an automation project",
  tags: ["Sensors", "Control systems", "Automation"]
}];

const process = [{
  step: "01",
  title: "Tell us the goal",
  text: "Share what you or your team needs — a feature shipped, a skill built, a system deployed."
}, {
  step: "02",
  title: "Get matched to a mentor",
  text: "We pair you with a practitioner already working in that exact field, not a generalist."
}, {
  step: "03",
  title: "Build on something real",
  text: "Work happens on live projects with real review, real feedback and a real outcome at the end."
}];

export default function ServicesPage() {
  const [showMore, setShowMore] = useState(false);
  const visibleOfferings = showMore ? [...serviceOfferings, ...moreServiceOfferings] : serviceOfferings;
  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <PageHero variant="showcase" eyebrow="Our services" slides={heroSlides} primaryCta={<Button asChild variant="brand" size="xl">
              <ApplyFormLink>
                Apply Now <ArrowRight />
              </ApplyFormLink>
            </Button>} secondaryCta={<Button asChild variant="brandOutline" size="xl">
              <Link to="/contact">Talk to us</Link>
            </Button>} />

        <section className="tracks-offer-section px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">What we offer</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Six services, one mentorship-first approach
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Whether you're an aspiring intern or a team that needs hands-on help, every service
                is delivered by people who build this stuff for a living.
              </p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleOfferings.map(({
              icon: Icon,
              title,
              text,
              image,
              alt,
              tags
            }, index) => <article key={title} id={`offering-${index + 1}`} className="expertise-card group flex min-h-[350px] flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-coral/40">
                  <div className="service-card-media">
                    <img src={image} alt={alt} loading="lazy" />
                  </div>
                  <div className="service-card-body flex flex-1 flex-col p-6">
                    <span className="expertise-index" aria-hidden="true">
                      0{index + 1}
                    </span>
                    <span className={`grid size-11 shrink-0 place-items-center rounded-md ${index % 3 === 1 ? "bg-surface-coral text-brand-coral" : "bg-surface-mint text-primary"}`}>
                      <Icon className="size-5" />
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
                        <ApplyFormLink>
                          Apply Now <ArrowRight className="size-4" />
                        </ApplyFormLink>
                      </Button>
                      <a href={`#offering-${index + 1}`} className="text-sm font-semibold text-muted-foreground underline decoration-border underline-offset-4 hover:text-brand-coral">
                        View details
                      </a>
                    </div>
                  </div>
                </article>)}
            </div>
            <div className="mt-12 flex justify-center">
              <Button type="button" variant="brand" size="xl" onClick={() => setShowMore(value => !value)}>
                {showMore ? "Show Fewer Services" : "Explore More Services"} <ArrowRight />
              </Button>
            </div>
          </div>
        </section>

        <section className="section-grad-purple border-t border-border px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">How it works</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Three steps to get started
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {process.map(({ step, title, text }) => <div key={step} className="relative border border-border bg-card p-7">
                  <span className="font-display text-4xl font-extrabold text-secondary">{step}</span>
                  <h3 className="mt-4 text-lg font-extrabold text-brand-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>)}
            </div>
            <div className="mt-12 flex flex-col items-center gap-4 border border-brand-coral/25 bg-surface-coral p-10 text-center sm:p-14">
              <span className="grid size-14 place-items-center rounded-md bg-card text-brand-coral">
                <Sparkles className="size-6" />
              </span>
              <h2 className="max-w-2xl text-balance text-3xl font-extrabold text-brand-ink sm:text-4xl">
                Ready to start building?
              </h2>
              <p className="max-w-xl leading-7 text-muted-foreground">
                Apply for an internship track or reach out about a service — either way, a real
                mentor will get back to you.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="brand" size="xl">
                  <ApplyFormLink>
                    Apply Now <ArrowRight />
                  </ApplyFormLink>
                </Button>
                <Button asChild variant="brandOutline" size="xl">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
