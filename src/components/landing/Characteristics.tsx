import { CalendarDays, Repeat, Timer, ShieldCheck } from "lucide-react";

const specs = [
  { icon: CalendarDays, value: "30 días", label: "de duración por lata (configurado a 30 min)" },
  { icon: Repeat, value: "3,200", label: "aplicaciones por unidad" },
  { icon: Timer, value: "7.5 / 15 / 30", label: "minutos — intervalos ajustables" },
  { icon: ShieldCheck, value: "24/7", label: "cobertura continua sin interrupciones" },
];

const Characteristics = () => (
  <section className="section-padding section-alt-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Rendimiento y eficiencia</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {specs.map((s) => (
          <div key={s.value} className="bg-card rounded-xl p-6 text-center border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <s.icon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-muted-foreground mt-10 text-sm">
        Diseñado para brindar protección constante con el menor esfuerzo.
      </p>
    </div>
  </section>
);

export default Characteristics;
