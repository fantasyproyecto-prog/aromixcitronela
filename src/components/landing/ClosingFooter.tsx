import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const ClosingFooter = () => (
  <section className="section-padding bg-foreground text-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold">Protege tu negocio hoy</h2>
      <p className="text-background/80 text-lg">
        Mejora la experiencia de tus clientes y mantén tu espacio libre de insectos de forma automática.
      </p>
      <p className="text-primary font-bold text-xl">Menos insectos, más clientes felices.</p>
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <Button asChild size="lg" className="bg-primary hover:bg-citric-dark text-primary-foreground font-semibold px-8 rounded-full">
          <a href="#tienda">Comprar ahora</a>
        </Button>
        <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white border-0 font-semibold px-8 rounded-full">
          <a href="https://wa.me/18136102658?text=Hola%2C%20estoy%20interesado%20en%20Aromix%20Citronela" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-background/10 text-center text-background/50 text-sm">
      © {new Date().getFullYear()} Aromix Citronela. Todos los derechos reservados.
    </div>
  </section>
);

export default ClosingFooter;
