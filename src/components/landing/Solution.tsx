import dispensadorImg from "@/assets/dispensador-sa2000.png";

const Solution = () => (
  <section className="section-padding bg-primary">
    <div className="max-w-7xl mx-auto grid items-center gap-8 bg-transparent px-4 sm:px-6 md:grid-cols-2 md:gap-12 lg:px-8">
      <div className="bg-transparent p-0 m-0 border-none shadow-none flex justify-center">
        <img
          src={dispensadorImg}
          alt="Dispensador SA 2000"
          loading="lazy"
          width={400}
          height={400}
          className="w-full max-w-md mx-auto h-auto object-contain drop-shadow-2xl"
        />
      </div>
      <div className="space-y-5">
        <span className="text-sm font-semibold text-primary-foreground/80 uppercase tracking-wider">La solución</span>
        <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground">Ambientación automática y continua</h2>
        <p className="text-base md:text-lg text-primary-foreground/90 leading-relaxed">
          Aromix libera su fórmula de citronela en intervalos programados para ayudar a mantener espacios más confortables y agradables en áreas donde suelen presentarse moscas y zancudos. Ideal para negocios que desean ofrecer una mejor experiencia ambiental sin complicaciones.
        </p>
      </div>
    </div>
  </section>
);

export default Solution;
