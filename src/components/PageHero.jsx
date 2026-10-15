import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const AUTOPLAY_MS = 5500;

/* Shared slide navigation (dots + arrows) used by every hero variant. */
function SliderControls({ slides, active, goTo, className = "" }) {
  return <div className={`page-slider-controls ${className}`}>
      <div className="page-slider-dots">
        {slides.map((item, index) => <button key={item.title} type="button" aria-label={`Show slide ${index + 1}`} aria-pressed={active === index} className={`page-slider-dot ${active === index ? "is-active" : ""}`} onClick={() => goTo(index)}>
            {active === index && <span className="page-slider-dot-progress" key={`progress-${active}`} style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />}
          </button>)}
      </div>
      <div className="page-slider-arrows">
        <button type="button" aria-label="Previous slide" className="page-slider-arrow" onClick={() => goTo(active - 1)}>
          <ChevronLeft className="size-4" />
        </button>
        <button type="button" aria-label="Next slide" className="page-slider-arrow" onClick={() => goTo(active + 1)}>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>;
}

/**
 * Sub-page hero slider.
 *
 * `variant` controls the layout so different sections of the site don't all
 * look identical. All variants keep a light background.
 *   - "blueprint" (default) : original split layout with the blueprint frame
 *   - "spotlight"           : centred copy above a wide cinematic image band
 *   - "showcase"            : arch-framed image on the left, copy on the right
 *   - "stack"               : copy on the left, stacked/tilted photo cards right
 *   - "ribbon"              : compact band with a circular portrait and orbit ring
 */
export function PageHero({ eyebrow, slides, primaryCta, secondaryCta, variant = "blueprint" }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;
    const timer = window.setInterval(() => {
      setActive(current => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, active]);

  const goTo = index => setActive((index + slides.length) % slides.length);

  const slide = slides[active];
  if (!slide) return null;
  const SlideIcon = slide.icon;

  const eyebrowPill = <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary/70 px-4 py-2 text-xs font-bold uppercase text-brand-ink">
      <Sparkles className="size-4" aria-hidden="true" /> {eyebrow}
    </div>;

  /* ---------------- spotlight : centred copy + wide image band ---------------- */
  if (variant === "spotlight") {
    return <section className="page-slider hero-purple hero-spotlight relative overflow-hidden border-b border-border/60">
        <div className="hero-spotlight-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-5 pt-12 text-center lg:px-8 lg:pt-16">
          {eyebrowPill}
          <div className="page-slider-copy" key={`copy-${active}`}>
            <h1 className="text-balance text-3xl font-extrabold leading-[1.15] text-brand-ink sm:text-4xl lg:text-5xl">
              {slide.title} <span className="text-primary">{slide.highlight}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {slide.text}
            </p>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {primaryCta}
            {secondaryCta}
          </div>
        </div>

        <div className="relative mx-auto mt-10 max-w-6xl px-5 pb-12 lg:px-8 lg:pb-16">
          <div className="hero-spotlight-band">
            {slides.map((item, index) => <img key={item.title} src={item.image} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} className={`page-slider-photo absolute inset-0 size-full object-cover ${index === active ? "is-active" : ""}`} aria-hidden={index !== active} />)}
            {SlideIcon && <div className="hero-spotlight-stat" key={`stat-${active}`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                  <SlideIcon className="size-5" />
                </span>
                <span>
                  <strong className="block font-display text-lg leading-none text-brand-ink">{slide.statValue}</strong>
                  <span className="text-xs font-semibold text-muted-foreground">{slide.statLabel}</span>
                </span>
              </div>}
          </div>
          <SliderControls slides={slides} active={active} goTo={goTo} className="hero-spotlight-controls" />
        </div>
      </section>;
  }

  /* ---------------- showcase : arch image left, copy right ---------------- */
  if (variant === "showcase") {
    return <section className="page-slider hero-purple hero-showcase relative overflow-hidden border-b border-border/60">
        <span className="hero-showcase-stripe" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[460px] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-8 lg:py-16">
          <div className="hero-showcase-media order-2">
            <div className="hero-showcase-arch">
              {slides.map((item, index) => <img key={item.title} src={item.image} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} className={`page-slider-photo absolute inset-0 size-full object-cover ${index === active ? "is-active" : ""}`} aria-hidden={index !== active} />)}
            </div>
            {SlideIcon && <div className="hero-showcase-stat" key={`stat-${active}`}>
                <SlideIcon className="size-5 text-primary" />
                <strong className="font-display text-lg text-brand-ink">{slide.statValue}</strong>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{slide.statLabel}</span>
              </div>}
          </div>

          <div className="order-1 max-w-xl">
            {eyebrowPill}
            <div className="page-slider-copy" key={`copy-${active}`}>
              <h1 className="text-balance text-3xl font-extrabold leading-[1.15] text-brand-ink sm:text-4xl lg:text-5xl">
                {slide.title} <span className="text-primary">{slide.highlight}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                {slide.text}
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {primaryCta}
              {secondaryCta}
            </div>
          </div>
        </div>
      </section>;
  }

  /* ---------------- stack : copy left, tilted photo cards right ---------------- */
  if (variant === "stack") {
    return <section className="page-slider hero-purple hero-stack relative overflow-hidden border-b border-border/60">
        <span className="hero-stack-grid" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[500px] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div className="max-w-xl">
            {eyebrowPill}
            <div className="page-slider-copy" key={`copy-${active}`}>
              <h1 className="text-balance text-3xl font-extrabold leading-[1.15] text-brand-ink sm:text-4xl lg:text-5xl">
                {slide.title} <span className="text-primary">{slide.highlight}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                {slide.text}
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {primaryCta}
              {secondaryCta}
            </div>
            <SliderControls slides={slides} active={active} goTo={goTo} className="mt-9" />
          </div>

          <div className="hero-stack-deck">
            {slides.map((item, index) => {
              const offset = (index - active + slides.length) % slides.length;
              return <figure key={item.title} className={`hero-stack-card hero-stack-card-${offset}`} aria-hidden={offset !== 0}>
                  <img src={item.image} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} />
                  {offset === 0 && SlideIcon && <figcaption className="hero-stack-caption">
                      <SlideIcon className="size-4 text-primary" />
                      <strong className="font-display text-base text-brand-ink">{slide.statValue}</strong>
                      <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">{slide.statLabel}</span>
                    </figcaption>}
                </figure>;
            })}
          </div>
        </div>
      </section>;
  }

  /* ---------------- ribbon : compact band with rounded portrait ----------------
     "ribbonAlt" is the same family, mirrored (media on the left) with a squircle
     frame and a solid ring, so About and Contact feel related but not identical. */
  if (variant === "ribbon" || variant === "ribbonAlt") {
    const isAlt = variant === "ribbonAlt";
    return <section className={`page-slider hero-purple hero-ribbon ${isAlt ? "hero-ribbon-alt" : ""} relative overflow-hidden border-b border-border/60`}>
        <span className="hero-ribbon-wave" aria-hidden="true" />
        <div className={`relative mx-auto grid min-h-[420px] max-w-6xl items-center gap-10 px-5 py-12 lg:px-8 lg:py-14 ${isAlt ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-[1.1fr_0.9fr]"}`}>
          <div className="max-w-xl">
            {eyebrowPill}
            <div className="page-slider-copy" key={`copy-${active}`}>
              <h1 className="text-balance text-3xl font-extrabold leading-[1.15] text-brand-ink sm:text-4xl lg:text-[2.9rem]">
                {slide.title} <span className="text-primary">{slide.highlight}</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
                {slide.text}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {primaryCta}
              {secondaryCta}
            </div>
          </div>

          <div className="hero-ribbon-media">
            <div className="hero-ribbon-orbit" aria-hidden="true" />
            <div className="hero-ribbon-circle">
              {slides.map((item, index) => <img key={item.title} src={item.image} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} className={`page-slider-photo absolute inset-0 size-full object-cover ${index === active ? "is-active" : ""}`} aria-hidden={index !== active} />)}
            </div>
            {SlideIcon && <div className="hero-ribbon-stat" key={`stat-${active}`}>
                <SlideIcon className="size-4 text-primary" />
                <strong className="font-display text-base text-brand-ink">{slide.statValue}</strong>
                <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">{slide.statLabel}</span>
              </div>}
            <SliderControls slides={slides} active={active} goTo={goTo} className="hero-ribbon-controls" />
          </div>
        </div>
      </section>;
  }

  /* ---------------- blueprint (default) ---------------- */
  return <section className="page-slider hero-purple relative overflow-hidden border-b border-border/60">
      <div className="hero-blob-shape absolute -left-24 top-16 size-72 rounded-[44%_56%_64%_36%/50%_42%_58%_50%]" aria-hidden="true" />

      <div className="mx-auto grid min-h-[500px] max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-14">
        <div className="relative z-10 max-w-xl">
          <div className="page-slider-copy" key={`copy-${active}`}>
            {eyebrowPill}
            <h1 className="text-balance text-3xl font-extrabold leading-[1.15] text-brand-ink sm:text-4xl lg:text-5xl">
              {slide.title} <span className="text-primary">{slide.highlight}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {slide.text}
            </p>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {primaryCta}
            {secondaryCta}
          </div>

          <SliderControls slides={slides} active={active} goTo={goTo} className="mt-9" />
        </div>

        <div className="hero-blueprint relative mx-auto w-full max-w-2xl overflow-hidden border border-primary/20 p-5 sm:p-8 lg:justify-self-end">
          <div className="hero-photo-frame relative mx-auto mt-9 w-[88%] overflow-hidden sm:w-[84%]">
            <div className="relative aspect-[4/3] w-full">
              {slides.map((item, index) => <img key={item.title} src={item.image} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} className={`page-slider-photo absolute inset-0 size-full object-cover ${index === active ? "is-active" : ""}`} aria-hidden={index !== active} />)}
            </div>
            <span className="hero-photo-cross hero-photo-cross-left" aria-hidden="true" />
            <span className="hero-photo-cross hero-photo-cross-right" aria-hidden="true" />
          </div>
          <div className="hero-connector" aria-hidden="true">
            <span />
          </div>
          {SlideIcon && <div className="float-blueprint absolute bottom-5 left-4 flex items-center gap-3 border border-primary/20 bg-card/95 p-4 shadow-soft sm:bottom-8 sm:left-7" key={`stat-${active}`}>
              <span className="grid size-11 shrink-0 place-items-center bg-secondary text-primary">
                <SlideIcon className="size-5" />
              </span>
              <span>
                <strong className="block font-display text-lg text-brand-ink">{slide.statValue}</strong>
                <span className="text-xs font-semibold text-muted-foreground">{slide.statLabel}</span>
              </span>
            </div>}
        </div>
      </div>
    </section>;
}
