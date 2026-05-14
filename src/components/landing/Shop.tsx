import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";
import dispensadorImg from "@/assets/dispensador-real.jpg";
import refillImg from "@/assets/lata-real.jpg";
import combo1Img from "@/assets/combo-1.png";
import combo4Img from "@/assets/combo-4.png";
import combo6Img from "@/assets/combo-6.png";

interface Product {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  image: string;
}

const products: Product[] = [
  {
    id: "dispensador",
    name: "Dispensador Aromix Citronela",
    description: "Sistema automático programable diseñado para mantener una ambientación continua en espacios comerciales y residenciales.",
    priceUSD: 22.0,
    image: dispensadorImg,
  },
  {
    id: "refill",
    name: "Lata de Citronela Aromix (Refill)",
    description: "Fórmula de citronela de larga duración compatible con el dispensador Aromix.",
    priceUSD: 23.5,
    image: refillImg,
  },
  {
    id: "combo-1",
    name: "Combo Aromix (Dispensador & Citronela)",
    description: "Dispensador automático Aromix junto con su lata de citronela. Ideal para mantener una ambientación continua en tu negocio o hogar.",
    priceUSD: 44.0,
    image: combo1Img,
  },
  {
    id: "combo-4",
    name: "Combo 4 Aromix (Dispensador & Citronela)",
    description: "4 dispensadores Aromix con sus respectivas latas de citronela. Ideal para negocios con varias áreas de atención o espacios amplios.",
    priceUSD: 168.0,
    image: combo4Img,
  },
  {
    id: "combo-6",
    name: "Combo 6 Aromix (Dispensador & Citronela)",
    description: "6 dispensadores Aromix con sus respectivas latas de citronela. Perfecto para restaurantes, terrazas, cafeterías y espacios comerciales.",
    priceUSD: 234.0,
    image: combo6Img,
  },
];

interface ProductCardProps {
  product: Product;
  tasaBCV: number;
  tasaLoading: boolean;
  onAdd: (product: Product) => void;
}

const ProductCard = memo(({ product, tasaBCV, tasaLoading, onAdd }: ProductCardProps) => {
  const handleAdd = useCallback(() => onAdd(product), [onAdd, product]);
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col w-full max-w-[22rem]">
      <div className="bg-white p-6 md:p-8 flex items-center justify-center h-52 md:h-64">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={200}
          height={200}
          className="max-h-40 md:max-h-48 object-contain mix-blend-multiply"
        />
      </div>
      <div className="p-4 md:p-6 space-y-3 flex flex-col flex-1">
        <h3 className="font-heading text-lg md:text-xl font-bold text-foreground">{product.name}</h3>
        <p className="text-muted-foreground text-sm flex-1">{product.description}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-impact text-2xl text-primary">${product.priceUSD.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">
            / {tasaLoading ? "Cargando..." : `Bs ${(product.priceUSD * tasaBCV).toFixed(2)}`}
          </span>
        </div>
        <Button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-full">
          <ShoppingCart className="mr-2 h-4 w-4" /> Añadir al carrito
        </Button>
      </div>
    </div>
  );
});
ProductCard.displayName = "ProductCard";

const Shop = () => {
  const { addItem, tasaBCV, tasaLoading } = useCart();

  const handleAdd = useCallback(
    (p: Product) => addItem({ id: p.id, name: p.name, priceUSD: p.priceUSD, image: p.image }),
    [addItem],
  );

  return (
    <section id="tienda" className="section-padding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">Compra ahora</h2>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              tasaBCV={tasaBCV}
              tasaLoading={tasaLoading}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;
