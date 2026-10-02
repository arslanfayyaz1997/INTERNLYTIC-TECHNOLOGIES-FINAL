import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BrainCircuit, CheckCircle2, Clock3, Cloud, Code2, Database, FileText, GraduationCap, Layers, Palette, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { BuyNowDialog } from "@/components/BuyNowDialog";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import workflowPlanning from "@/assets/workflow-planning.jpg";
import workflowDeployment from "@/assets/workflow-deployment.jpg";
import { ApplyFormLink } from "@/components/InternshipApply";
const storySamina = "https://randomuser.me/api/portraits/women/65.jpg";
const storyZaheer = "https://randomuser.me/api/portraits/men/54.jpg";
const storyHina = "https://randomuser.me/api/portraits/women/21.jpg";

const heroSlides = [{
  title: "Premium courses.",
  highlight: "Real career outcomes.",
  text: "Every course pairs you with a senior mentor and a live product — pick the course you want to master and start shipping from week one.",
  image: heroTeamCutout,
  alt: "Interns collaborating on a live project",
  icon: GraduationCap,
  statValue: "1,200+",
  statLabel: "students mentored"
}, {
  title: "Build proof, not",
  highlight: "just certificates.",
  text: "You'll leave every course with shipped pull requests, a portfolio and recruiter-ready outcomes across AI, web, data, security and design.",
  image: workflowPlanning,
  alt: "A mentor reviewing a course roadmap with an intern",
  icon: Sparkles,
  statValue: "50+",
  statLabel: "live projects delivered"
}, {
  title: "Guided by engineers",
  highlight: "who ship for a living.",
  text: "Every course is led by practitioners currently working in that stack, so what you learn maps directly to what teams hire for.",
  image: workflowDeployment,
  alt: "A senior engineer mentoring an intern",
  icon: Users,
  statValue: "6",
  statLabel: "dedicated courses"
}];

const categories = [{
  label: "All",
  icon: Layers
}, {
  label: "Development",
  icon: Code2
}, {
  label: "Data",
  icon: Database
}, {
  label: "Design",
  icon: Palette
}, {
  label: "Security",
  icon: ShieldCheck
}, {
  label: "AI / Data",
  icon: BrainCircuit
}];

const courses = [{
  icon: Code2,
  category: "Development",
  title: "Full Stack Web Development",
  badge: "Most Popular",
  level: "Beginner to Advanced",
  text: "Master modern web development with the MERN stack. Build production-ready full-stack applications from scratch.",
  duration: "16 Weeks",
  enrolled: "420+ enrolled",
  rating: "4.9",
  bullets: ["Build complete web apps with React & Node.js", "Master MongoDB, Express.js, REST APIs & GraphQL", "Deploy on AWS, Vercel & Heroku"],
  price: "7,999",
  originalPrice: "9,999"
}, {
  icon: Cloud,
  category: "Development",
  title: "Cloud & DevOps Engineering",
  badge: null,
  level: "Intermediate to Advanced",
  text: "Provision real infrastructure and automate deployments. Master AWS, Docker, Kubernetes & CI/CD pipelines.",
  duration: "14 Weeks",
  enrolled: "180+ enrolled",
  rating: "4.8",
  bullets: ["AWS, Azure & GCP core services", "Containers with Docker & Kubernetes", "CI/CD pipelines with GitHub Actions"],
  price: "6,999",
  originalPrice: "8,999"
}, {
  icon: Database,
  category: "Data",
  title: "Data Science & Analytics",
  badge: null,
  level: "Beginner to Intermediate",
  text: "Transform data into actionable insights. Master SQL, Python, Power BI, Excel & statistics for business decisions.",
  duration: "14 Weeks",
  enrolled: "240+ enrolled",
  rating: "4.7",
  bullets: ["SQL for data extraction & analysis", "Interactive dashboards with Power BI & Tableau", "Python: Pandas, NumPy, Matplotlib"],
  price: "5,999",
  originalPrice: "7,999"
}, {
  icon: Palette,
  category: "Design",
  title: "UI/UX & Product Design",
  badge: null,
  level: "Beginner to Advanced",
  text: "Design beautiful, user-centric products. Master Figma, user research, prototyping & design thinking principles.",
  duration: "12 Weeks",
  enrolled: "310+ enrolled",
  rating: "4.9",
  bullets: ["Master Figma, Adobe XD & Framer", "Conduct user research & usability testing", "Wireframes, prototypes & design systems"],
  price: "5,499",
  originalPrice: "6,999"
}, {
  icon: ShieldCheck,
  category: "Security",
  title: "Cyber Security & Ethical Hacking",
  badge: null,
  level: "Intermediate to Advanced",
  text: "Become a certified ethical hacker. Learn penetration testing, vulnerability assessment & cyber defence.",
  duration: "16 Weeks",
  enrolled: "150+ enrolled",
  rating: "4.8",
  bullets: ["Hands-on penetration testing & vulnerability assessment", "OWASP Top 10 & web application security", "Network security, cryptography & secure coding"],
  price: "7,499",
  originalPrice: "9,499"
}, {
  icon: BrainCircuit,
  category: "AI / Data",
  title: "Artificial Intelligence & Machine Learning",
  badge: "Highest Rated",
  level: "Intermediate to Advanced",
  text: "Master AI/ML with Python, Deep Learning & Neural Networks. Deploy intelligent applications that solve real problems.",
  duration: "20 Weeks",
  enrolled: "380+ enrolled",
  rating: "4.9",
  bullets: ["Python, ML algorithms & deep learning mastery", "TensorFlow & PyTorch for predictive models", "Computer Vision, NLP & Generative AI"],
  price: "8,999",
  originalPrice: "9,999"
}];

const successStories = [{
  avatar: storySamina,
  name: "Samina Raza",
  role: "UI/UX Designer @ Northbridge Labs",
  location: "Lahore",
  course: "UI/UX & Product Design",
  package: "PKR 5,499",
  quote: "From a commerce graduate to a UI/UX designer at a product studio — the portfolio I built here got me the interview and the offer."
}, {
  avatar: storyZaheer,
  name: "Zaheer Ahmad",
  role: "Security Analyst @ Cyberun Systems",
  location: "Karachi",
  course: "Cyber Security & Ethical Hacking",
  package: "PKR 7,499",
  quote: "The ethical hacking labs were the real deal. I passed my CEH on the first attempt — Internlytic's prep was thorough and hands-on."
}, {
  avatar: storyHina,
  name: "Hina Tariq",
  role: "Full Stack Developer @ Brightwave Tech",
  location: "Islamabad",
  course: "Full Stack Web Development",
  package: "PKR 7,999",
  quote: "Shipping a real MERN app during the course made the interviews easy. I was building production features from day one."
}];

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCourses = useMemo(() => activeCategory === "All" ? courses : courses.filter(course => course.category === activeCategory), [activeCategory]);

  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <PageHero variant="stack" eyebrow="Our Courses" slides={heroSlides} primaryCta={<Button asChild variant="brand" size="xl">
              <ApplyFormLink>
                Apply Now <ArrowRight />
              </ApplyFormLink>
            </Button>} secondaryCta={<Button asChild variant="brandOutline" size="xl">
              <Link to="/how-it-works">See how it works</Link>
            </Button>} />

        <section className="relative overflow-hidden border-b border-border/70 px-5 py-14 sm:py-16 lg:px-8 lg:py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-primary">All courses</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Our Premium Courses
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Every course includes live projects, mentorship &amp; industry certification.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {categories.map(({
              label,
              icon: Icon
            }) => <button key={label} type="button" onClick={() => setActiveCategory(label)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${activeCategory === label ? "border-primary bg-primary text-primary-foreground shadow-brand" : "border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-primary"}`}>
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>)}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map(({
              icon: Icon,
              title,
              badge,
              level,
              text,
              duration,
              enrolled,
              rating,
              bullets,
              price,
              originalPrice
            }) => <article key={title} className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-brand-lg">
                  {badge && <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-brand-gold px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-brand-ink shadow-soft">
                      <Star className="size-3 fill-current" aria-hidden="true" /> {badge}
                    </span>}

                  <div className="flex items-start gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-surface-mint text-primary">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold leading-tight text-brand-ink">{title}</h3>
                      <span className="mt-1 inline-block text-xs font-semibold text-muted-foreground">{level}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{text}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-border/70 py-3 text-xs font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5 text-primary" aria-hidden="true" /> {duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5 text-primary" aria-hidden="true" /> {enrolled}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="size-3.5 fill-current text-brand-gold" aria-hidden="true" /> {rating}
                    </span>
                  </div>

                  <ul className="mt-4 flex flex-col gap-2">
                    {bullets.map(item => <li key={item} className="flex items-start gap-2 text-sm leading-6 text-foreground/80">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        {item}
                      </li>)}
                  </ul>

                  <Link to="/how-it-works" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                    <FileText className="size-4" aria-hidden="true" /> View Full Syllabus
                  </Link>

                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/70 pt-5">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl font-extrabold text-brand-ink">PKR {price}</span>
                        <span className="text-sm font-semibold text-muted-foreground line-through">PKR {originalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button asChild variant="brand" size="sm">
                      <ApplyFormLink>Apply Now</ApplyFormLink>
                    </Button>
                    <BuyNowDialog course={title} price={price} />
                  </div>
                </article>)}
            </div>
          </div>
        </section>

        <section className="section-grad-green px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-primary">Success Stories</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Students Who Made It
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Real students. Real results. See how our courses changed their careers.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {successStories.map(({
              avatar,
              name,
              role,
              location,
              course,
              package: pkg,
              quote
            }) => <article key={name} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={avatar} alt={name} loading="lazy" className="size-11 shrink-0 rounded-full object-cover" style={name === "Zaheer Ahmad" ? { objectPosition: "center 75%" } : undefined} />
                      <div>
                        <p className="font-bold leading-tight text-brand-ink">{name}</p>
                        <p className="text-xs font-semibold leading-tight text-muted-foreground">{role}</p>
                        <p className="text-xs font-semibold leading-tight text-muted-foreground">@ {location}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface-mint px-3 py-1 text-xs font-extrabold text-primary">
                      {pkg}
                    </span>
                  </div>
                  <p className="mt-4 flex-1 text-sm italic leading-6 text-foreground/80">“{quote}”</p>
                  <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-secondary/60 px-3 py-1 text-xs font-bold text-brand-ink">
                    <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" /> {course}
                  </span>
                </article>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
