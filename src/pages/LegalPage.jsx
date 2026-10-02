import { ShieldCheck, FileText } from "lucide-react";
import { Header, Footer } from "@/components/layout";

const sections = {
  privacy: {
    icon: ShieldCheck,
    title: "Privacy Policy",
    intro: "This policy explains what information Internlytic Technologies collects when you use this site and how it's used.",
    blocks: [{
      heading: "Information we collect",
      text: "When you register or apply for an internship, we store the details you submit yourself — your name, email, phone number, education, skills, links and any resume file you upload. This is saved to your account so you and our team can review it."
    }, {
      heading: "How we use it",
      text: "Your profile information is used to match you to internship tracks, evaluate applications and keep you updated on your progress. We do not sell your information to third parties."
    }, {
      heading: "Your control over your data",
      text: "You can update or remove your personal details, resume and links from your profile at any time, and you can withdraw an application whenever you like."
    }, {
      heading: "Contact",
      text: "Questions about this policy can be sent to the contact email configured in src/lib/siteConfig.js."
    }]
  },
  terms: {
    icon: FileText,
    title: "Terms of Service",
    intro: "By creating an account or applying for an internship on this site, you agree to the terms below.",
    blocks: [{
      heading: "Accounts",
      text: "You're responsible for keeping your password confidential and for the accuracy of the information in your profile."
    }, {
      heading: "Applications",
      text: "Submitting an internship application does not guarantee acceptance. Tracks, durations and availability may change."
    }, {
      heading: "Acceptable use",
      text: "Don't misuse this site — that includes uploading harmful files, impersonating someone else, or attempting to access another user's account."
    }, {
      heading: "Changes",
      text: "We may update these terms from time to time; continued use of the site after a change means you accept the updated terms."
    }]
  }
};

function Section({ id, data }) {
  const Icon = data.icon;
  return <section id={id} className="border-b border-border px-5 py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-surface-mint text-primary">
            <Icon className="size-5" />
          </span>
          <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">{data.title}</h2>
        </div>
        <p className="mt-4 leading-7 text-muted-foreground">{data.intro}</p>
        <div className="mt-8 grid gap-6">
          {data.blocks.map(block => <div key={block.heading}>
              <h3 className="text-sm font-bold uppercase text-brand-ink">{block.heading}</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{block.text}</p>
            </div>)}
        </div>
      </div>
    </section>;
}

export default function LegalPage() {
  return <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-surface-mint/40 px-5 py-10 text-center lg:px-8">
          <p className="text-sm font-bold uppercase text-brand-ink">Legal</p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-ink sm:text-4xl">Privacy &amp; Terms</h1>
        </div>
        <Section id="privacy" data={sections.privacy} />
        <Section id="terms" data={sections.terms} />
      </main>
      <Footer />
    </div>;
}
