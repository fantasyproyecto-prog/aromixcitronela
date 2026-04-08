import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import Benefits from "@/components/landing/Benefits";
import Uses from "@/components/landing/Uses";
import Characteristics from "@/components/landing/Characteristics";
import Shop from "@/components/landing/Shop";
import Distributors from "@/components/landing/Distributors";
import DistributorForms from "@/components/landing/DistributorForms";
import ClosingFooter from "@/components/landing/ClosingFooter";
import CartDrawer from "@/components/CartDrawer";
import CheckoutForm from "@/components/CheckoutForm";
import { CartProvider } from "@/contexts/CartContext";

const Index = () => (
  <CartProvider>
    <Navbar />
    <Hero />
    <Problem />
    <Solution />
    <Benefits />
    <Uses />
    <Characteristics />
    <Shop />
    <Distributors />
    <DistributorForms />
    <ClosingFooter />
    <CartDrawer />
    <CheckoutForm />
  </CartProvider>
);

export default Index;
