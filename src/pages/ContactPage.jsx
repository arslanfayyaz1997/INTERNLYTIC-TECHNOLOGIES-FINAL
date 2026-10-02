import { ArrowRight, Clock, Mail, MapPin, MessageCircleQuestion, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header, Footer, LocationsMap } from "@/components/layout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig, isConfiguredEmail } from "@/lib/siteConfig";
import heroTeamCutout from "@/assets/hero-team-cutout.png";
import workflowConsultation from "@/assets/workflow-consultation.jpg";
import educationCareer from "@/assets/education-career-luxury.jpg";

const heroSlides = [{
  title: "Let's talk about",
  highlight: "your next step.",
  text: "Questions about a track, a service, or how the internship works? Our team replies personally — no chatbots, no ticket queues.",
  image: heroTeamCutout,
  alt: "The Internlytic Technologies team ready to answer questions",
  icon: MessageCircleQuestion,
  statValue: "< 48 hrs",
  statLabel: "average reply time"
}, {
  title: "One message,",
  highlight: "a real person replies.",
  text: "Every email lands with our program team directly, so you get a real answer from someone who knows the tracks.",
  image: workflowConsultation,
  alt: "A mentor replying to a message",
  icon: Mail,
  statValue: "24/7",
  statLabel: "inbox monitored"
}, {
  title: "A global team,",
  highlight: "close by wherever you are.",
  text: "With people across four countries, there's almost always someone on our team awake and ready to help.",
  image: educationCareer,
  alt: "A global map showing where Internlytic learners can connect",
  icon: MapPin,
  statValue: "4",
  statLabel: "countries, one team"
}];

const contactMethods = [{
  icon: Mail,
  title: "Email us",
  text: isConfiguredEmail() ? siteConfig.contactEmail : "Add your new Gmail in src/lib/siteConfig.js",
  href: isConfiguredEmail() ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.contactEmail)}` : null
}, {
  icon: Clock,
  title: "Response time",
  text: "Within 48 hours, most days sooner",
  href: null
}];

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    setErrorMsg("");
    if (!isConfiguredEmail()) {
      setStatus("error");
      setErrorMsg("Please add your new Internlytic Gmail in src/lib/siteConfig.js before using the contact form.");
      return;
    }
    const subject = form.subject.trim() || `New website message from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject || "(not provided)"}\n\nMessage:\n${form.message}`;
    const gmailUrl = new URL("https://mail.google.com/mail/");
    gmailUrl.searchParams.set("view", "cm");
    gmailUrl.searchParams.set("fs", "1");
    gmailUrl.searchParams.set("to", siteConfig.contactEmail);
    gmailUrl.searchParams.set("su", subject);
    gmailUrl.searchParams.set("body", body);
    window.open(gmailUrl.toString(), "_blank", "noopener,noreferrer");
    setStatus("success");
  };

  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <PageHero variant="ribbon" eyebrow="Contact us" slides={heroSlides} primaryCta={<Button asChild variant="brand" size="xl">
              <a href="#contact-form">
                Send a message <ArrowRight />
              </a>
            </Button>} secondaryCta={<Button asChild variant="brandOutline" size="xl">
              <Link to="/faq">Read FAQs</Link>
            </Button>} />

        <section id="contact-form" className="border-b border-border px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="flex h-full flex-col lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-brand-ink">Get in touch</p>
                <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                  Send a message to Internlytic
                </h2>
                <p className="mt-5 max-w-md leading-7 text-muted-foreground">
                  Tell us a bit about yourself and what you're looking for — a track, a service, or
                  just a question. Submit the form to open Gmail with your message details already filled in.
                </p>
              </div>
              <div className="mt-9 flex flex-1 flex-col justify-between gap-4 lg:mt-0">
                {contactMethods.map(({ icon: Icon, title, text, href }) => <div key={title} className="flex items-start gap-4 border border-border bg-card p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-surface-mint text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <strong className="block text-sm font-bold text-brand-ink">{title}</strong>
                      {href ? <a href={href} className="text-sm text-muted-foreground hover:text-primary">{text}</a> : <span className="text-sm text-muted-foreground">{text}</span>}
                    </span>
                  </div>)}
              </div>
            </div>

            <form className="border border-border bg-card p-6 shadow-soft sm:p-8" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contact-name">Full name</Label>
                  <Input id="contact-name" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-email">Email address</Label>
                  <Input id="contact-email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input id="contact-subject" name="subject" placeholder="What's this about?" value={form.subject} onChange={handleChange} />
              </div>
              <div className="mt-5 grid gap-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" name="message" rows={5} placeholder="Tell us a bit more..." value={form.message} onChange={handleChange} required />
              </div>
              <Button type="submit" variant="brand" size="xl" className="mt-6 w-full sm:w-auto" >
                Open Gmail & Send Message <Send />
              </Button>
              {status === "success" && (
                <p className="mt-4 text-sm font-medium text-emerald-600">
                  Gmail compose has been opened with your details. Review the message and press Send in Gmail to deliver it.
                </p>
              )}
              {status === "error" && (
                <p className="mt-4 text-sm font-medium text-red-600">{errorMsg}</p>
              )}
            </form>
          </div>
        </section>

        <section className="section-grad-purple px-5 py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase text-brand-ink">Our footprint</p>
              <h2 className="mt-3 text-balance text-3xl font-extrabold text-brand-ink sm:text-5xl">
                Find us around the world
              </h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Internlytic connects learners and mentors through a remote-friendly learning platform — explore where our
                people are based.
              </p>
            </div>
            <div className="mt-10 border border-border bg-card p-4 shadow-soft sm:p-6">
              <LocationsMap />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>;
}
