import { Bug, Cog, Smile, Sparkles, Wrench, DollarSign } from "lucide-react";

const benefits = [
  { icon: Bug, title: "Eliminación efectiva de moscas y zancudos" },
  { icon: Cog, title: "Funcionamiento automático sin intervención constante" },
  { icon: Smile, title: "Mejora la experiencia del cliente" },
  { icon: Sparkles, title: "Mantiene espacios limpios y agradables" },
  { icon: Wrench, title: "Fácil instalación y uso" },
  { icon: DollarSign, title: "Solución económica y de alta eficiencia" },
];

const Benefits = () => (
  <section id="beneficios" className="section-padding section-alt-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">¿Por qué elegir Aromix Citronela?</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((b) => (
          <div key={b.title} className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
              <b.icon className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="font-semibold text-foreground">{b.title}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Benefits;
