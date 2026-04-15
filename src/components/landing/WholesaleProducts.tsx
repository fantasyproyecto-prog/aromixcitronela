import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import caja12Img from "@/assets/caja-12.jpg";
import caja72Img from "@/assets/caja-72.jpg";

const wholesaleProducts = [
  {
    id: "caja-12",
    name: "Caja de 12 Unidades",
    description: "Presentación ideal para emprendedores que desean iniciar su negocio con Aromix Citronela.",
    image: caja12Img,
  },
  {
    id: "caja-72",
    name: "Caja Master de 72 Unidades",
    description: "Volumen mayorista para distribuidores y empresas con alta demanda de protección contra insectos.",
    image: caja72Img,
  },
];

const WholesaleProducts = () => {
  const handleScrollToForms = () => {
    document.getElementById("formularios")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="section-padding bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl md:text-4xl font-bold text-center mb-4">
          Presentaciones para Emprendedores y Distribuidores
        </h2>
        <p className="text-center text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
          ¿Quieres revender o distribuir Aromix Citronela? Solicita tu lista de precios al mayor.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {wholesaleProducts.map((p) => (
            <div
              key={p.id}
              className="relative bg-white rounded-2xl border-2 border-amber-500/60 shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Badge className="absolute top-4 right-4 z-10 bg-amber-500 text-amber-950 hover:bg-amber-500">
                Venta al Mayor
              </Badge>
              <div className="bg-white p-6 md:p-8 flex items-center justify-center h-52 md:h-64">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={260}
                  height={260}
                  className="max-h-44 md:max-h-52 object-contain mix-blend-multiply"
                />
              </div>
              <div className="p-4 md:p-6 space-y-3">
                <h3 className="font-heading text-lg md:text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-muted-foreground text-sm">{p.description}</p>
                <Button
                  onClick={handleScrollToForms}
                  variant="outline"
                  className="w-full border-amber-500/60 text-amber-700 hover:bg-amber-50 font-semibold rounded-full"
                >
                  <Package className="mr-2 h-4 w-4" /> Solicitar lista de precios
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WholesaleProducts;
