import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";
import dispensadorImg from "@/assets/dispensador-real.jpg";
import refillImg from "@/assets/lata-real.jpg";

const products = [
  {
    id: "dispensador",
    name: "Dispensador Aromix Citronela + Lata",
    description: "Sistema automático que libera la fragancia en intervalos programados, garantizando protección continua. Incluye una lata de citronela.",
    priceUSD: 25,
    image: dispensadorImg,
  },
  {
    id: "refill",
    name: "Lata Refill Citronela",
    description: "Fórmula natural repelente de larga duración compatible con el dispensador Aromix.",
    priceUSD: 12,
    image: refillImg,
  },
];

const Shop = () => {
  const { addItem, tasaBCV, tasaLoading } = useCart();

  return (
    <section id="tienda" className="section-padding">
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">Compra ahora</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {products.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-accent/40 p-8 flex items-center justify-center h-64">
                <img src={p.image} alt={p.name} loading="lazy" width={200} height={200} className="max-h-48 object-contain drop-shadow-lg" />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-heading text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-muted-foreground text-sm">{p.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-impact text-2xl text-primary">${p.priceUSD.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">/ {tasaLoading ? "Cargando..." : `Bs ${(p.priceUSD * tasaBCV).toFixed(2)}`}</span>
                </div>
                <Button onClick={() => addItem({ id: p.id, name: p.name, priceUSD: p.priceUSD, image: p.image })} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-full">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Añadir al carrito
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;
