import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";
import dispensadorImg from "@/assets/dispensador-real.jpg";
import refillImg from "@/assets/lata-real.jpg";
import combo1Img from "@/assets/combo-1.png";
import combo4Img from "@/assets/combo-4.png";
import combo6Img from "@/assets/combo-6.png";

const products = [
  {
    id: "dispensador",
    name: "Dispensador Aromix Citronela",
    description: "Sistema automático SA 2000 que libera la fragancia en intervalos programados, garantizando protección continua.",
    priceUSD: 22.00,
    image: dispensadorImg,
  },
  {
    id: "refill",
    name: "Lata de Citronela Aromix (Refill)",
    description: "Fórmula natural repelente de larga duración compatible con el dispensador Aromix.",
    priceUSD: 23.50,
    image: refillImg,
  },
  {
    id: "combo-1",
    name: "Combo Aromix (Dispensador & Citronela)",
    description: "Dispensador automático Aromix junto con su lata de citronela. Listo para proteger tu espacio.",
    priceUSD: 44.00,
    image: combo1Img,
  },
  {
    id: "combo-4",
    name: "Combo 4 Aromix (Dispensador & Citronela)",
    description: "4 dispensadores Aromix con sus respectivas latas de citronela. Ideal para hogares y oficinas.",
    priceUSD: 168.00,
    image: combo4Img,
  },
  {
    id: "combo-6",
    name: "Combo 6 Aromix (Dispensador & Citronela)",
    description: "6 dispensadores Aromix con sus respectivas latas de citronela. Perfecto para negocios y eventos.",
    priceUSD: 234.00,
    image: combo6Img,
  },
];

const Shop = () => {
  const { addItem, tasaBCV, tasaLoading } = useCart();

  return (
    <section id="tienda" className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">Compra ahora</h2>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col w-full max-w-[22rem]">
              <div className="bg-white p-6 md:p-8 flex items-center justify-center h-52 md:h-64">
                <img src={p.image} alt={p.name} loading="lazy" width={200} height={200} className="max-h-40 md:max-h-48 object-contain mix-blend-multiply" />
              </div>
              <div className="p-4 md:p-6 space-y-3 flex flex-col flex-1">
                <h3 className="font-heading text-lg md:text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-muted-foreground text-sm flex-1">{p.description}</p>
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
