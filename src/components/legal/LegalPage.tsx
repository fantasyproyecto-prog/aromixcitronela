import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalPageProps {
  title: string;
  subtitle?: string;
  documentTitle?: string;
  children: ReactNode;
}

const LegalPage = ({ title, subtitle, documentTitle, children }: LegalPageProps) => {
  useEffect(() => {
    if (documentTitle) {
      const prev = document.title;
      document.title = documentTitle;
      return () => {
        document.title = prev;
      };
    }
  }, [documentTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-20">
        <Button asChild variant="outline" className="mb-10 rounded-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la tienda
          </Link>
        </Button>

        <header className="mb-12 border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </header>

        <article className="space-y-8 text-foreground/85 leading-relaxed text-base md:text-lg [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:my-4 [&_a]:text-primary [&_a]:underline">
          {children}
        </article>

        <div className="mt-16 pt-8 border-t flex justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la tienda
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
