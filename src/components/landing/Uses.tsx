import { UtensilsCrossed, CakeSlice, Coffee, Store, Home } from "lucide-react";

const uses = [
  { icon: UtensilsCrossed, label: "Restaurantes" },
  { icon: CakeSlice, label: "Panaderías" },
  { icon: Coffee, label: "Cafés" },
  { icon: Store, label: "Comercios en general" },
  { icon: Home, label: "Hogares" },
];

const Uses = () => (
  <section className="section-padding">
    <div className="container mx-auto max-w-4xl text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-12">Ideal para:</h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {uses.map((u) => (
          <div key={u.label} className="flex items-center gap-3 bg-accent/60 rounded-full px-6 py-3 border border-primary/20">
            <u.icon className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Uses;
