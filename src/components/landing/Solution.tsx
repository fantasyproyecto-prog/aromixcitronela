import dispensadorImg from "@/assets/dispensador-real.jpg";

const Solution = () => (
  <section className="section-padding bg-lime-50">
    <div className="max-w-7xl mx-auto grid items-center gap-8 bg-transparent px-4 sm:px-6 md:grid-cols-2 md:gap-12 lg:px-8">
      <div className="bg-transparent p-0 m-0 border-none shadow-none flex justify-center">
        <img
          src={dispensadorImg}
          alt="Dispensador SA 2000"
          loading="lazy"
          width={400}
          height={400}
          className="w-full max-w-md h-auto object-contain mix-blend-multiply"
          style={{ mixBlendMode: 'multiply', backgroundColor: 'transparent' }}
        />
      </div>
      <div className="space-y-5">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">La solución</span>
        <h2 className="text-2xl md:text-4xl font-bold text-foreground">La solución automática</h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
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
