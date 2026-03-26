import { Reveal } from "./Reveal";

const logos = ["Google", "Google Ads", "Google Maps", "Claude AI"];

export function TrustLogos() {
  return (
    <Reveal>
      <section className="py-12 bg-background relative section-glow">
        <div className="container text-center space-y-8">
          <p className="text-[11px] text-muted-foreground/50 uppercase tracking-[0.35em] font-medium">
            Integrado com as melhores plataformas
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center">
            {logos.map((name) => (
              <span
                key={name}
                className="text-base md:text-lg font-heading font-bold text-muted-foreground/20 select-none hover:text-primary/40 transition-all duration-500 cursor-default"
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
