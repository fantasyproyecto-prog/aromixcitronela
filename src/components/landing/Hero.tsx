import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => (
  <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBg} alt="Parque verde con luz natural" className="w-full h-full object-cover" width={1920} height={900} />
      <div className="absolute inset-0 bg-foreground/65" />
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
      <div className="max-w-2xl space-y-6 animate-fade-in-up">
        <p className="font-impact text-primary-foreground text-base md:text-xl tracking-wide">
          Menos insectos. Más clientes felices.
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-primary-foreground">
          Ayuda a mantener tu negocio más agradable frente a moscas y zancudos.
        </h1>
        <p className="text-base md:text-xl text-primary-foreground/85 max-w-lg">
          Sistema automático de citronela diseñado para restaurantes, cafeterías, terrazas y espacios donde los insectos voladores pueden afectar la experiencia de los clientes.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-primary-foreground font-semibold text-base px-8 rounded-full">
            <a href="#tienda">Comprar ahora</a>
          </Button>
          <Button asChild size="lg" className="w-full sm:w-auto bg-whatsapp hover:bg-whatsapp/90 text-white border-0 font-semibold text-base px-8 rounded-full">
            <a href="https://wa.me/18136102658?text=Hola%2C%20estoy%20interesado%20en%20Aromix%20Citronela" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" /> Hablar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
