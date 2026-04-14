import { AlertTriangle } from "lucide-react";

const Problem = () => (
  <section className="section-padding section-alt-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 mb-2">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">¿Moscas en tu negocio?</h2>
      <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
        La presencia de insectos afecta directamente la higiene, la experiencia del cliente y la reputación de tu negocio. Una sola mosca puede arruinar por completo la percepción de tu local, generando incomodidad y pérdida de confianza.
      </p>
    </div>
  </section>
);

export default Problem;
