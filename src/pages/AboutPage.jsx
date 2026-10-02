import { ArrowRight, Compass, GraduationCap, Heart, Linkedin, Sparkles, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import experienceTeam from "@/assets/experience-team-three-complete.png";
import workflowPlanning from "@/assets/workflow-planning.jpg";
import partnerArslan from "@/assets/partner-arslan.jpg";
import companyAboutImage from "@/assets/education-career-luxury.jpg";
import { ApplyFormLink } from "@/components/InternshipApply";

const heroSlides = [{
  title: "Built by mentors,",
  highlight: "not a syllabus.",
  text: "Internlytic Technologies started with a simple idea — the fastest way to learn is by shipping real work next to people who do it every day.",
  image: heroTeamCutout,
  alt: "The Internlytic founding team",
  icon: Heart,
  statValue: "2026",
  statLabel: "founded"
}, {
  title: "Proof over",
  highlight: "paperwork.",
  text: "We measure success in pull requests merged, features shipped and portfolios that actually land interviews — not attendance certificates.",
  image: experienceTeam,
  alt: "Interns reviewing a shipped project together",
  icon: Target,
  statValue: "50+",
  statLabel: "live projects shipped"
}, {
  title: "A global team,",
  highlight: "one mission.",
  text: "From Pakistan to the US, UK and Germany, our mentors and interns work as one distributed team building real technology talent.",
  image: workflowPlanning,
  alt: "A mentor planning a roadmap with an intern",
  icon: Compass,
  statValue: "4",
  statLabel: "countries represented"
}];

const stats = [{
  icon: GraduationCap,
  value: "200+",
  label: "Students mentored"
}, {
  icon: Sparkles,
  value: "50+",
  label: "Live projects shipped"
}, {
  icon: Target,
  value: "6",
  label: "Career fields"
}, {
  icon: Users,
  value: "92%",
  label: "Would recommend us"
}];

const founders = [{
  name: "Arslan Fayyaz",
  position: "Founder | CEO",
  image: partnerArslan,
  linkedin: "https://www.linkedin.com/in/arslan-fayyaz-3a4781214"
}];

export default function AboutPage() {
  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <PageHero variant="ribbonAlt" eyebrow="About Internlytic" slides={heroSlides} primaryCta={<Button asChild variant="brand" size="xl">
              <ApplyFormLink>Apply Now <ArrowRight /></ApplyFormLink>
            </Button>} secondaryCta={<Button asChild variant="brandOutline" size="xl">
              <Link to="/contact">Get in touch</Link>
            </Button>} />

        <section className="border-b border-border px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="overflow-hidden rounded-xl border border-border shadow-soft">
                <img
                  src={companyAboutImage}
                  alt="A Internlytic Technologies professional walking through the studio"
                  className="h-full min-h-[320px] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-sm font-bold uppercase text-brand-ink">What we stand for</p>
                <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-4xl">
                  Building technology, and the people behind it
                </h2>
                <p className="mt-5 leading-7 text-muted-foreground">
                  Internlytic Technologies is an internship and technology platform focused on helping aspiring professionals build practical skills through structured learning, guided projects, and hands-on experience.
                </p>
                <p className="mt-4 leading-7 text-muted-foreground">
                  We also empower the next generation of developers through real-world
                  internships, hands-on projects and industry-relevant learning.
                </p>
                <p className="mt-4 font-semibold text-brand-ink">
                  At Internlytic Technologies, we turn ideas into practical experience.
                </p>
              </div>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ icon: Icon, value, label }) => <div key={label} className="flex flex-col items-center gap-3 border border-border bg-card p-7 text-center shadow-soft">
                  <span className="grid size-12 place-items-center rounded-md bg-surface-mint text-primary">
                    <Icon className="size-6" />
                  </span>
                  <strong className="font-display text-3xl text-brand-ink">{value}</strong>
                  <span className="text-sm font-semibold text-muted-foreground">{label}</span>
                </div>)}
            </div>
          </div>
        </section>

        <section className="section-grad-purple px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">Founder & Leadership</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Meet the Founder
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Arslan Fayyaz founded Internlytic Technologies to make practical technology learning more accessible through real projects, clear guidance, and career-focused experience. The vision is simple: help learners turn their curiosity into skills they can demonstrate.
              </p>
            </div>
            <div className="founder-single-card mt-12 grid gap-6">
              {founders.map(({ name, position, image, linkedin }) => <div key={name} className="border border-border bg-card p-6 text-center shadow-soft">
                  <img src={image} alt={name} className="mx-auto size-28 rounded-full object-cover" loading="lazy" style={{ objectPosition: "center 20%" }} />
                  <h3 className="mt-5 text-lg font-extrabold text-brand-ink">{name}</h3>
                  <p className="text-sm font-semibold text-primary">{position}</p>
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} on LinkedIn`}
                    className="mt-4 inline-flex size-9 items-center justify-center rounded-full bg-surface-mint text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Linkedin className="size-4" />
                  </a>
                </div>)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
