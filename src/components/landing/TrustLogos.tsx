import { Reveal } from "./Reveal";

const logos = ["Google", "Google Ads", "Google Maps", "Claude AI"];

export function TrustLogos() {
  return (
    <Reveal>
      <section className="py-10 bg-background border-b border-border/30">
        <div className="container text-center space-y-6">
          <p className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.3em] font-medium">
            Integrado com as melhores plataformas
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center">
            {logos.map((name) => (
              <span
                key={name}
                className="text-base md:text-lg font-heading font-bold text-muted-foreground/25 select-none hover:text-muted-foreground/50 transition-all duration-300"
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
