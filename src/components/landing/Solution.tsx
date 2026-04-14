import dispensadorImg from "@/assets/dispensador-real.jpg";

const Solution = () => (
  <section className="section-padding">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
      <div className="flex justify-center">
        <img src={dispensadorImg} alt="Dispensador Automático SA 2000" loading="lazy" width={400} height={400} className="drop-shadow-2xl max-w-xs md:max-w-sm mix-blend-multiply" />
      </div>
      <div className="space-y-5">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">La solución</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">La solución automática</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Aromix Citronela es un sistema automático que libera una fórmula natural repelente en intervalos programados, manteniendo tu espacio protegido durante todo el día sin esfuerzo.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Olvídate de soluciones manuales y mantén un ambiente limpio de forma continua.
        </p>
      </div>
    </div>
  </section>
);

export default Solution;
