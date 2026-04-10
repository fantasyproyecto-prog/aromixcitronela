import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => (
  <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBg} alt="Parque verde con luz natural" className="w-full h-full object-cover" width={1920} height={900} />
      <div className="absolute inset-0 bg-foreground/65" />
    </div>

    <div className="relative container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-2xl space-y-6 animate-fade-in-up">
        <p className="font-impact text-primary-foreground text-lg md:text-xl tracking-wide">
          Menos insectos. Más clientes felices.
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-primary-foreground">
          Protección efectiva contra moscas y zancudos
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/85 max-w-lg">
          Mantén tus espacios limpios, agradables y libres de insectos con Aromix Citronela
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold text-base px-8 rounded-full">
            <a href="#tienda">Comprar ahora</a>
          </Button>
          <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white border-0 font-semibold text-base px-8 rounded-full">
            <a href="https://wa.me/584121234567" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" /> Escríbenos por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
