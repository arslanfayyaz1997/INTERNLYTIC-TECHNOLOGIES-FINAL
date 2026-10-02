import { ArrowRight, Bell, BriefcaseBusiness, ChevronDown, LifeBuoy, LogOut, Menu, Moon, MessageCircleQuestion, Play, Rocket, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { applyTheme, getTheme } from "@/lib/theme";
import internlyticMark from "@/assets/internlytic-mark.png";

export const navItems = ["Home", "My Portfolio", "Internships", "Services", "Courses", "Contact Us", "About Us"];

// Which internships are open, and the Apply form link, live in @/lib/internships.
export { isOpenInternship, internshipApplyFormUrl } from "@/lib/internships";

export const navRoutes = {
  Home: "/",
  Services: "/services",
  Courses: "/courses",
  "Contact Us": "/contact",
  "About Us": "/about"
};

export const internshipLinks = [{
  label: "Apply for Internship",
  href: "/apply",
  icon: BriefcaseBusiness
}, {
  label: "How It Works",
  href: "/how-it-works",
  icon: Play
}, {
  label: "FAQs",
  href: "/faq",
  icon: MessageCircleQuestion
}];

export const socialLinks = [];

export const officeLocations = [{
  name: "United States",
  href: "https://www.openstreetmap.org/search?query=United%20States"
}, {
  name: "United Kingdom",
  href: "https://www.openstreetmap.org/search?query=United%20Kingdom"
}, {
  name: "Pakistan",
  href: "https://www.openstreetmap.org/search?query=Pakistan"
}, {
  name: "Germany",
  href: "https://www.openstreetmap.org/search?query=Germany"
}];

export function LocationsMap() {
  return <div className="location-map-shell">
      <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-132.0%2C5.0%2C83.0%2C63.0&layer=mapnik" className="location-map" title="Internlytic Technologies global locations map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="location-map-links" aria-label="Open office locations on map">
        {officeLocations.map(location => <a key={location.name} href={location.href} target="_blank" rel="noreferrer">
            {location.name}
          </a>)}
      </div>
    </div>;
}

export function Brand({ onDark = false }) {
  return <Link to="/" className="flex items-center gap-3" aria-label="Internlytic Technologies home">
    <img src={internlyticMark} alt="" className="internlytic-brand-mark h-10 w-10 shrink-0 object-contain" aria-hidden="true" />
    <span className="leading-none">
      <span className="block font-display text-[1.05rem] font-extrabold tracking-[0.01em]">
        <span className={onDark ? "text-white" : "text-brand-ink"}>Intern</span><span className="text-primary">lytic</span>
      </span>
      <span className={`mt-1.5 block text-[0.58rem] font-semibold uppercase tracking-[0.28em] ${onDark ? "text-white/75" : "text-muted-foreground"}`}>Technologies</span>
    </span>
  </Link>;
}

function navHref(item) {
  return navRoutes[item] ?? `/#${item.toLowerCase().replaceAll(" ", "-")}`;
}

function isNavItemActive(item, pathname) {
  if (item === "Internships") {
    return internshipLinks.some(link => link.href === pathname);
  }
  return navHref(item) === pathname;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSession(getCurrentUser());
  }, []);

  const sessionInitials = String(session?.fullName || session?.email || "").trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "IT";

  function handleLogout() {
    logoutUser();
    setSession(null);
    navigate("/login");
  }

  return <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
          {navItems.map(item => {
            const active = isNavItemActive(item, location.pathname);
            const linkClass = `relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-primary after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary after:transition-opacity after:content-[''] ${active ? "text-primary after:opacity-100" : "text-foreground/80 after:opacity-0"}`;
            return item === "Internships" ? <div className="group relative" key={item}>
                <button type="button" className={linkClass}>
                  {item}
                  <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />
                </button>
                <div className="invisible absolute left-1/2 top-full w-60 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="rounded-md border border-border bg-card p-2 shadow-soft">
                    {internshipLinks.map(({
                label,
                href,
                icon: Icon
              }) => <Link key={label} to={href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-primary ${location.pathname === href ? "text-primary" : "text-foreground/80"}`}>
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                      </Link>)}
                  </div>
                </div>
              </div> : <Link key={item} to={navHref(item)} className={linkClass}>
                {item}
              </Link>;
          })}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {session ? <div className="group relative">
              <button type="button" className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary" aria-haspopup="menu">
                <span className="grid size-7 place-items-center rounded-full brand-spectrum text-[0.7rem] font-extrabold text-primary-foreground">
                  {sessionInitials}
                </span>
                Profile
                <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />
              </button>
              <div className="invisible absolute right-0 top-full w-56 translate-y-2 pt-3 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="rounded-md border border-border bg-card p-2 shadow-soft" role="menu">
                  <div className="border-b border-border px-3 pb-2.5 pt-1.5">
                    <strong className="block truncate text-sm font-bold text-brand-ink">{session.fullName || "Your account"}</strong>
                    <span className="block truncate text-xs text-muted-foreground">{session.email}</span>
                  </div>
                  {[[UserRound, "Profile", "/profile"], [Bell, "Notifications", "/profile?tab=notifications"], [LifeBuoy, "Support", "/profile?tab=support"]].map(([Icon, label, href]) => {
                    const MenuIcon = Icon;
                    return <Link key={label} to={href} role="menuitem" className="mt-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary">
                        <MenuIcon className="size-4" aria-hidden="true" />
                        {label}
                      </Link>;
                  })}
                  <button type="button" role="menuitem" onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-brand-coral transition-colors hover:bg-surface-coral">
                    <LogOut className="size-4" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              </div>
            </div> : <>
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="brand">
                <Link to="/register">
                  Register <ArrowRight />
                </Link>
              </Button>
            </>}
          <ThemeToggle />
        </div>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(open => !open)}>
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      {menuOpen && <nav className="border-t border-border bg-background px-5 py-5 xl:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {navItems.map(item => {
              const active = isNavItemActive(item, location.pathname);
              return item === "Internships" ? <div key={item} className="rounded-md bg-surface-mint/60 p-2">
                  <span className={`relative inline-block rounded-md px-2 py-2 text-sm font-bold text-primary after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:rounded-full after:bg-primary after:transition-opacity after:content-[''] ${active ? "after:opacity-100" : "after:opacity-0"}`}>
                    Internships
                  </span>
                  <div className="grid grid-cols-2 gap-1 border-t border-primary/10 pt-2">
                    {internshipLinks.map(({
                label,
                href
              }) => <Link key={label} onClick={() => setMenuOpen(false)} to={href} className={`rounded-md px-2 py-2 text-xs font-semibold hover:bg-background hover:text-primary ${location.pathname === href ? "text-primary" : "text-foreground/75"}`}>
                        {label}
                      </Link>)}
                  </div>
                </div> : <Link key={item} onClick={() => setMenuOpen(false)} to={navHref(item)} className={`relative inline-block rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-accent after:absolute after:bottom-1 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary after:transition-opacity after:content-[''] ${active ? "text-primary after:opacity-100" : "after:opacity-0"}`}>
                  {item}
                </Link>;
            })}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <div className="col-span-2 flex items-center justify-between rounded-md bg-surface-mint/60 px-3 py-2">
                <span className="text-sm font-semibold text-foreground/80">Colour theme</span>
                <ThemeToggle />
              </div>
              {session ? <>
                  <Button asChild variant="brandOutline">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                  </Button>
                  <Button asChild variant="brandOutline">
                    <Link to="/profile?tab=notifications" onClick={() => setMenuOpen(false)}>Notifications</Link>
                  </Button>
                  <Button asChild variant="brandOutline">
                    <Link to="/profile?tab=support" onClick={() => setMenuOpen(false)}>Support</Link>
                  </Button>
                  <Button type="button" variant="brand" onClick={() => { setMenuOpen(false); handleLogout(); }}>
                    Log out
                  </Button>
                </> : <>
                  <Button asChild variant="brandOutline">
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
                  </Button>
                  <Button asChild variant="brand">
                    <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
                  </Button>
                </>}
            </div>
          </div>
        </nav>}
    </header>;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme);
  const isForest = theme === "forest";

  function toggle() {
    const next = isForest ? "default" : "forest";
    applyTheme(next, { animate: true });
    setTheme(next);
  }

  return <button type="button" onClick={toggle} className="theme-toggle" aria-pressed={isForest} aria-label={isForest ? "Switch to the Internlytic teal theme" : "Switch to the light blue theme"} title={isForest ? "Switch to teal and green" : "Switch to light blue"}>
      <Moon className="theme-toggle-moon size-[1.1rem]" aria-hidden="true" />
    </button>;
}

export function Footer() {
  return <footer id="about-us" className="site-footer border-t border-border text-primary-foreground">
      <div className="footer-main mx-auto grid max-w-[1440px] border-b border-primary-foreground/15">
        <div className="footer-brand">
          <Brand onDark />
          <p className="mt-6 max-w-md text-sm leading-7 text-primary-foreground/65">
            Building the next generation of technology talent through practical learning,
            meaningful projects and thoughtful mentorship.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {socialLinks.map(({
            label,
            href,
            icon: SocialIcon,
            className
          }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Internlytic Technologies on ${label}`} title={label} className={`footer-social ${className}`}>
                <SocialIcon className="size-[22px]" aria-hidden="true" />
              </a>)}
          </div>
        </div>
        <div className="footer-links-grid">
          <div>
            <h3 className="footer-heading">Explore</h3>
            <div className="footer-link-list">
              <a href="/#home">Home</a>
              <a href="/#internships">Internships</a>
              <Link to="/services">Services</Link>
              <Link to="/how-it-works">How it works</Link>
            </div>
          </div>
          <div>
            <h3 className="footer-heading">Company</h3>
            <div className="footer-link-list">
              <Link to="/about">About us</Link>
              <a href="/#partners">Partners</a>
              <Link to="/courses">Courses</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
        <div id="contact-us" className="footer-locations">
          <div className="flex items-center justify-between gap-4">
            <h3 className="footer-heading">Our locations</h3>
            <span className="rounded-sm bg-primary-foreground/90 px-2 py-1 text-[0.65rem] font-bold uppercase text-brand-ink">
              Global team
            </span>
          </div>
          <LocationsMap />
        </div>
      </div>
      <div className="footer-bottom mx-auto flex max-w-[1440px] flex-col gap-3 text-xs text-primary-foreground/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Internlytic Technologies. All rights reserved.</p>
        <div className="flex gap-5">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>;
}
