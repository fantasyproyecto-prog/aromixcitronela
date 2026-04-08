import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => (
  <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroBg} alt="Restaurante limpio y moderno" className="w-full h-full object-cover" width={1920} height={900} />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
    </div>

    <div className="relative container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-2xl space-y-6 animate-fade-in-up">
        <Badge className="bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full border-0">
          Menos insectos. Más clientes felices.
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-background">
          Protección efectiva contra moscas y zancudos
        </h1>
        <p className="text-lg md:text-xl text-background/85 max-w-lg">
          Mantén tus espacios limpios, agradables y libres de insectos con Aromix Citronela
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button asChild size="lg" className="bg-primary hover:bg-citric-dark text-primary-foreground font-semibold text-base px-8 rounded-full">
            <a href="#tienda">Comprar ahora</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-background/40 text-background hover:bg-background/10 font-semibold text-base px-8 rounded-full">
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
