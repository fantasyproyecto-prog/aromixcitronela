import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

const Distributors = () => (
  <section id="distribuidores" className="section-padding section-alt-bg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
        <Handshake className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold">¿Quieres ser distribuidor?</h2>
      <p className="text-lg text-muted-foreground leading-relaxed">
        Forma parte de nuestra red de aliados comerciales y ofrece una solución práctica para negocios y espacios comerciales.
      </p>
      <Button asChild size="lg" className="bg-primary hover:bg-citric-dark text-primary-foreground font-semibold px-10 rounded-full">
        <a href="#formularios-mayorista">Quiero ser Distribuidor</a>
      </Button>
    </div>
  </section>
);

export default Distributors;
