import { Reveal } from "./Reveal";

const logos = ["Google", "Google Ads", "Google Maps", "Claude AI"];

export function TrustLogos() {
  return (
    <Reveal>
      <section className="py-10 border-b border-border/40">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center">
            {logos.map((name) => (
              <span
                key={name}
                className="text-sm md:text-base font-heading font-semibold text-muted-foreground/25 select-none tracking-wide uppercase"
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
