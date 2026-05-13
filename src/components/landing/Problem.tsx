import { AlertTriangle } from "lucide-react";

const Problem = () => (
  <section className="section-padding section-alt-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 mb-2">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">La experiencia de tus clientes comienza con el ambiente.</h2>
      <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
        Los espacios agradables, cómodos y bien cuidados generan una mejor percepción de tu negocio. Aromix te ayuda a mantener una experiencia ambiental continua para tus clientes durante todo el día.
      </p>
    </div>
  </section>
);

export default Problem;
