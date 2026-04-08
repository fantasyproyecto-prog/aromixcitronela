import dispensadorImg from "@/assets/dispensador.png";

const Solution = () => (
  <section className="section-padding">
    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center max-w-5xl">
      <div className="flex justify-center">
        <img src={dispensadorImg} alt="Dispensador Aromix Citronela" loading="lazy" width={400} height={400} className="drop-shadow-2xl max-w-xs md:max-w-sm" />
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
