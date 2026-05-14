import LegalPage from "@/components/legal/LegalPage";

const Terms = () => (
  <LegalPage
    title="Términos y Condiciones"
    subtitle="Términos y condiciones básicos de uso – Aromix"
    documentTitle="Términos y Condiciones | Aromix"
  >
    <section>
      <h2>1. Aceptación</h2>
      <p>
        Al acceder y utilizar este sitio web, el usuario acepta los presentes Términos y Condiciones.
      </p>
    </section>

    <section>
      <h2>2. Productos</h2>
      <p>
        Las imágenes y descripciones de productos son referenciales y pueden presentar variaciones menores.
      </p>
    </section>

    <section>
      <h2>3. Pedidos y pagos</h2>
      <p>Los pedidos estarán sujetos a verificación y disponibilidad.</p>
    </section>

    <section>
      <h2>4. Envíos</h2>
      <p>Los tiempos de entrega pueden variar según ubicación y disponibilidad logística.</p>
    </section>

    <section>
      <h2>5. Limitación de responsabilidad</h2>
      <p>Aromix no garantiza resultados específicos derivados del uso de los productos.</p>
    </section>

    <section>
      <h2>6. Contacto</h2>
      <p>Para consultas relacionadas con pedidos o soporte:</p>
      <ul>
        <li>
          WhatsApp:{" "}
          <a href="https://wa.me/584144141188" target="_blank" rel="noopener noreferrer">
            +58 414 414 1188
          </a>
        </li>
        <li>
          Correo: <a href="mailto:aromix.pa@gmail.com">aromix.pa@gmail.com</a>
        </li>
      </ul>
    </section>
  </LegalPage>
);

export default Terms;
