import { Reveal } from "./Reveal";

const logos = ["Google", "Google Ads", "Google Maps", "Claude AI"];

export function TrustLogos() {
  return (
    <Reveal>
      <section className="py-14 bg-card border-y border-border">
        <div className="container text-center space-y-6">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">
            Integrado com as melhores plataformas
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center">
            {logos.map((name) => (
              <span key={name} className="text-lg md:text-xl font-heading font-bold text-muted-foreground/40 select-none hover:text-muted-foreground/60 transition-colors">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
