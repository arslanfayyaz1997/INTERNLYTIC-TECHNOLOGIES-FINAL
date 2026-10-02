import { Link } from "react-router-dom";
import { Header, Footer } from "@/components/layout";

/**
 * Two-column frame for the Login and Register pages.
 * Left side is purely visual (image), all copy sits above the form on the right.
 */
export function AuthShell({ image, imageAlt, children }) {
  return <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-border/60 px-5 py-12 lg:px-8 lg:py-16">
          <div className="absolute -left-24 top-16 size-72 rounded-[44%_56%_64%_36%/50%_42%_58%_50%] bg-surface-mint opacity-70" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-stretch gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div className="hero-blueprint relative order-2 overflow-hidden border border-primary/20 p-4 sm:p-6 lg:order-1">
              <div className="hero-photo-frame relative h-full overflow-hidden">
                <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
                <span className="hero-photo-cross hero-photo-cross-left" aria-hidden="true" />
                <span className="hero-photo-cross hero-photo-cross-right" aria-hidden="true" />
              </div>
            </div>

            <div className="order-1 flex w-full flex-col lg:order-2">
              <div className="flex flex-1 flex-col border border-border bg-card p-6 shadow-soft sm:p-8">
                {children}
              </div>
              <p className="mt-5 text-center text-xs leading-6 text-muted-foreground">
                By continuing you agree to our <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">terms and privacy policy</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
