import { Bug, Cog, Smile, Sparkles, Wrench, Timer, Eye } from "lucide-react";

const benefits = [
  { icon: Bug, title: "Ayuda a disminuir las molestias ocasionadas por insectos voladores" },
  { icon: Cog, title: "Funcionamiento automático programable" },
  { icon: Smile, title: "Mejora la experiencia del cliente" },
  { icon: Sparkles, title: "Ideal para áreas de atención al público" },
  { icon: Wrench, title: "Fácil instalación y uso" },
  { icon: Timer, title: "Bajo mantenimiento" },
  { icon: Eye, title: "Diseño práctico y discreto" },
];

const Benefits = () => (
  <section id="beneficios" className="section-padding section-alt-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">¿Por qué elegir Aromix Citronela?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {benefits.map((b) => (
          <div key={b.title} className="bg-card rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow border">
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
