import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ClosingFooter = () => (
  <section className="section-padding bg-foreground text-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold">Mejora la experiencia de tus clientes</h2>
      <p className="text-background/80 text-lg">
        Aromix te ayuda a mantener espacios más agradables y confortables de forma automática y continua. Ambientes más agradables para tus clientes, todos los días.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-background/10 text-center text-background/60 text-sm space-y-3">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <Link to="/privacidad" className="underline hover:text-primary transition-colors">
          Política de Privacidad
        </Link>
        <Link to="/terminos" className="underline hover:text-primary transition-colors">
          Términos y Condiciones
        </Link>
      </div>
      <div className="text-background/50">© 2026 Aromix. Todos los derechos reservados.</div>
    </div>
  </section>
);

export default ClosingFooter;
