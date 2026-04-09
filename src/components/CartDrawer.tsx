import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalUSD, totalBs, tasaBCV, tasaLoading, setIsCheckoutOpen } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Tu carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Tu carrito está vacío</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-accent/40 rounded-lg p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">{item.name}</p>
                    <p className="text-sm text-primary font-bold">${item.priceUSD.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-md hover:bg-muted"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-md hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="text-xs text-muted-foreground">{tasaLoading ? "Cargando tasa BCV..." : `Tasa BCV: Bs ${tasaBCV.toFixed(2)}`}</div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <div className="text-right">
                  <span className="text-primary">${totalUSD.toFixed(2)}</span>
                  <span className="block text-sm text-muted-foreground font-normal">Bs {totalBs.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-primary hover:bg-citric-dark text-primary-foreground font-semibold rounded-full" size="lg">
                Pagar
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
