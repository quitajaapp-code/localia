import { Reveal } from "./Reveal";

const logos = ["Google", "Google Ads", "Google Maps", "Claude AI"];

export function TrustLogos() {
  return (
    <Reveal>
      <section className="py-16 bg-card/50 border-y border-border/50">
        <div className="container text-center space-y-8">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.25em] font-medium">
            Integrado com as melhores plataformas
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center">
            {logos.map((name) => (
              <span
                key={name}
                className="text-lg md:text-xl font-heading font-bold text-muted-foreground/30 select-none hover:text-muted-foreground/60 transition-all duration-300 hover:scale-105"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
